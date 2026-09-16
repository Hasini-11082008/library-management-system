/**
 * Library Management System - Frontend Application
 * Handles API communication with Django REST Framework backend via fetch().
 */

// Base API URL for books
const API_BASE_URL = '/api/books/';

// DOM Elements
const booksTableBody = document.getElementById('booksTableBody');
const emptyState = document.getElementById('emptyState');
const loadingState = document.getElementById('loadingState');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const refreshBtn = document.getElementById('refreshBtn');

// Stats Elements
const totalBooksCount = document.getElementById('totalBooksCount');
const totalQuantityCount = document.getElementById('totalQuantityCount');
const totalCategoriesCount = document.getElementById('totalCategoriesCount');

// Add/Edit Modal Elements
const bookModalBackdrop = document.getElementById('bookModalBackdrop');
const bookForm = document.getElementById('bookForm');
const modalTitle = document.getElementById('modalTitle');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const emptyAddBtn = document.getElementById('emptyAddBtn');
const formAlert = document.getElementById('formAlert');

// Form Input Elements
const bookIdInput = document.getElementById('bookId');
const bookTitleInput = document.getElementById('bookTitle');
const bookAuthorInput = document.getElementById('bookAuthor');
const bookIsbnInput = document.getElementById('bookIsbn');
const bookCategoryInput = document.getElementById('bookCategory');
const bookQuantityInput = document.getElementById('bookQuantity');

// Delete Modal Elements
const deleteModalBackdrop = document.getElementById('deleteModalBackdrop');
const deleteBookTitle = document.getElementById('deleteBookTitle');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');

// Toast Container
const toastContainer = document.getElementById('toastContainer');

// State tracking
let bookToDeleteId = null;
let searchDebounceTimeout = null;

// ==========================================
// 1. Initial Page Load & Event Bindings
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    fetchBooks();

    // Modal triggers
    openAddModalBtn.addEventListener('click', openAddModal);
    emptyAddBtn.addEventListener('click', openAddModal);
    closeModalBtn.addEventListener('click', closeBookModal);
    cancelModalBtn.addEventListener('click', closeBookModal);

    // Form submission
    bookForm.addEventListener('submit', handleFormSubmit);

    // Delete Modal triggers
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
    confirmDeleteBtn.addEventListener('click', executeDelete);

    // Search events
    searchInput.addEventListener('input', handleSearchInput);
    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        fetchBooks();
    });

    // Refresh button
    refreshBtn.addEventListener('click', () => {
        fetchBooks(searchInput.value.trim());
        showToast('Refreshed library books list.', 'info');
    });

    // Close modals when clicking backdrop
    window.addEventListener('click', (e) => {
        if (e.target === bookModalBackdrop) closeBookModal();
        if (e.target === deleteModalBackdrop) closeDeleteModal();
    });

    // Keyboard support: Escape key closes modals
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeBookModal();
            closeDeleteModal();
        }
    });
});

// ==========================================
// 2. Fetch & Render Books (READ)
// ==========================================

/**
 * Fetches all books or searches books by query string.
 * API: GET /api/books/ or GET /api/books/?search=query
 */
async function fetchBooks(query = '') {
    try {
        showLoading(true);
        const url = query 
            ? `${API_BASE_URL}?search=${encodeURIComponent(query)}` 
            : API_BASE_URL;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Server returned status: ${response.status}`);
        }

        const books = await response.json();
        renderBooks(books, query);
        updateStatistics(books);
    } catch (error) {
        console.error('Error fetching books:', error);
        showToast('Failed to load books from the server.', 'error');
    } finally {
        showLoading(false);
    }
}

/**
 * Populates the HTML table with books data.
 */
function renderBooks(books, query = '') {
    booksTableBody.innerHTML = '';

    if (!books || books.length === 0) {
        emptyState.style.display = 'flex';
        const titleEl = document.getElementById('emptyStateTitle');
        const descEl = document.getElementById('emptyStateDesc');

        if (query) {
            titleEl.textContent = `No matches found for "${query}"`;
            descEl.textContent = 'Please check the spelling or search with a different keyword.';
            emptyAddBtn.style.display = 'none';
        } else {
            titleEl.textContent = 'No books in library yet';
            descEl.textContent = 'Click below to add the very first book to your library.';
            emptyAddBtn.style.display = 'inline-flex';
        }
        return;
    }

    emptyState.style.display = 'none';

    books.forEach((book) => {
        const row = document.createElement('tr');

        // Stock status badge formatting
        let stockBadge = '';
        if (book.quantity > 5) {
            stockBadge = `<span class="stock-badge stock-in">● ${book.quantity} In Stock</span>`;
        } else if (book.quantity > 0) {
            stockBadge = `<span class="stock-badge stock-low">● ${book.quantity} Low Stock</span>`;
        } else {
            stockBadge = `<span class="stock-badge stock-out">● Out of Stock</span>`;
        }

        row.innerHTML = `
            <td><strong>#${book.id}</strong></td>
            <td class="book-title-cell">${escapeHtml(book.title)}</td>
            <td class="book-author-cell">${escapeHtml(book.author)}</td>
            <td><code>${escapeHtml(book.isbn)}</code></td>
            <td><span class="category-badge">${escapeHtml(book.category)}</span></td>
            <td>${stockBadge}</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-sm btn-edit" onclick="openEditModal(${book.id})" title="Edit book details">
                        ✏️ Edit
                    </button>
                    <button class="btn btn-sm btn-delete" onclick="openDeleteModal(${book.id}, '${escapeQuote(book.title)}')" title="Delete book">
                        🗑️ Delete
                    </button>
                </div>
            </td>
        `;
        booksTableBody.appendChild(row);
    });
}

/**
 * Updates summary statistics in top cards.
 */
function updateStatistics(books) {
    if (!books) return;
    const totalCount = books.length;
    const totalQty = books.reduce((sum, b) => sum + (parseInt(b.quantity, 10) || 0), 0);
    const uniqueCategories = new Set(books.map(b => (b.category || '').trim().toLowerCase())).size;

    totalBooksCount.textContent = totalCount;
    totalQuantityCount.textContent = totalQty;
    totalCategoriesCount.textContent = uniqueCategories;
}

// ==========================================
// 3. Add & Edit Books (CREATE & UPDATE)
// ==========================================

/**
 * Opens modal configured for adding a new book.
 */
function openAddModal() {
    clearFormErrors();
    bookForm.reset();
    bookIdInput.value = '';
    modalTitle.textContent = 'Add New Book';
    bookQuantityInput.value = '1';
    bookModalBackdrop.classList.add('active');
    bookTitleInput.focus();
}

/**
 * Fetches book details and opens modal configured for editing.
 * API: GET /api/books/<id>/
 */
async function openEditModal(id) {
    try {
        clearFormErrors();
        const response = await fetch(`${API_BASE_URL}${id}/`);
        if (!response.ok) {
            throw new Error('Failed to retrieve book details');
        }

        const book = await response.json();
        bookIdInput.value = book.id;
        bookTitleInput.value = book.title;
        bookAuthorInput.value = book.author;
        bookIsbnInput.value = book.isbn;
        bookCategoryInput.value = book.category;
        bookQuantityInput.value = book.quantity;

        modalTitle.textContent = `Edit Book (ID: #${book.id})`;
        bookModalBackdrop.classList.add('active');
        bookTitleInput.focus();
    } catch (error) {
        console.error('Error fetching book for edit:', error);
        showToast('Unable to fetch book details for editing.', 'error');
    }
}

/**
 * Handles form submit for both Create (POST) and Update (PUT).
 * API: POST /api/books/ or PUT /api/books/<id>/
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    clearFormErrors();

    const id = bookIdInput.value;
    const payload = {
        title: bookTitleInput.value.trim(),
        author: bookAuthorInput.value.trim(),
        isbn: bookIsbnInput.value.trim(),
        category: bookCategoryInput.value.trim(),
        quantity: parseInt(bookQuantityInput.value, 10)
    };

    // Client-side Basic Validations
    let hasClientError = false;

    if (!payload.title) {
        showFieldError('titleError', 'Title is required.');
        hasClientError = true;
    }
    if (!payload.author) {
        showFieldError('authorError', 'Author is required.');
        hasClientError = true;
    }
    if (!payload.isbn) {
        showFieldError('isbnError', 'ISBN is required.');
        hasClientError = true;
    }
    if (!payload.category) {
        showFieldError('categoryError', 'Category is required.');
        hasClientError = true;
    }
    if (isNaN(payload.quantity) || payload.quantity < 0) {
        showFieldError('quantityError', 'Quantity must be 0 or greater.');
        hasClientError = true;
    }

    if (hasClientError) return;

    // Send HTTP Request: POST for new book, PUT for existing book
    const isEditing = Boolean(id);
    const url = isEditing ? `${API_BASE_URL}${id}/` : API_BASE_URL;
    const method = isEditing ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (!response.ok) {
            // Handle DRF validation errors (e.g. duplicate ISBN)
            handleServerErrors(result);
            return;
        }

        // Success!
        closeBookModal();
        showToast(isEditing ? 'Book updated successfully!' : 'New book added successfully!', 'success');
        fetchBooks(searchInput.value.trim());
    } catch (error) {
        console.error('Error saving book:', error);
        showFormAlert('Network error occurred while saving book. Please try again.');
    }
}

/**
 * Closes the Add/Edit modal.
 */
function closeBookModal() {
    bookModalBackdrop.classList.remove('active');
    clearFormErrors();
}

// ==========================================
// 4. Delete Book (DELETE)
// ==========================================

/**
 * Opens delete confirmation dialog.
 */
function openDeleteModal(id, title) {
    bookToDeleteId = id;
    deleteBookTitle.textContent = `"${title}" (ID: #${id})`;
    deleteModalBackdrop.classList.add('active');
}

/**
 * Closes delete confirmation modal.
 */
function closeDeleteModal() {
    deleteModalBackdrop.classList.remove('active');
    bookToDeleteId = null;
}

/**
 * Executes book deletion.
 * API: DELETE /api/books/<id>/
 */
async function executeDelete() {
    if (!bookToDeleteId) return;

    try {
        const response = await fetch(`${API_BASE_URL}${bookToDeleteId}/`, {
            method: 'DELETE'
        });

        if (!response.ok && response.status !== 204) {
            throw new Error(`Failed to delete book. Status: ${response.status}`);
        }

        closeDeleteModal();
        showToast('Book deleted successfully!', 'success');
        fetchBooks(searchInput.value.trim());
    } catch (error) {
        console.error('Error deleting book:', error);
        showToast('Error deleting book. Please try again.', 'error');
    }
}

// ==========================================
// 5. Search Book (SEARCH)
// ==========================================

/**
 * Debounced search input handler to filter books in real-time.
 */
function handleSearchInput() {
    const query = searchInput.value.trim();
    clearSearchBtn.style.display = query ? 'block' : 'none';

    if (searchDebounceTimeout) {
        clearTimeout(searchDebounceTimeout);
    }

    // Debounce for smooth typing experience (300ms)
    searchDebounceTimeout = setTimeout(() => {
        fetchBooks(query);
    }, 300);
}

// ==========================================
// 6. Helpers, Validation & Toasts
// ==========================================

function showLoading(isLoading) {
    loadingState.style.display = isLoading ? 'flex' : 'none';
    if (isLoading) {
        emptyState.style.display = 'none';
    }
}

function clearFormErrors() {
    document.querySelectorAll('.field-error').forEach(el => el.textContent = '');
    formAlert.style.display = 'none';
    formAlert.textContent = '';
}

function showFieldError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) el.textContent = message;
}

function showFormAlert(message) {
    formAlert.textContent = message;
    formAlert.style.display = 'block';
}

function handleServerErrors(errors) {
    if (typeof errors === 'object') {
        for (const [key, messages] of Object.entries(errors)) {
            const errorMsg = Array.isArray(messages) ? messages.join(' ') : messages;
            const errorField = document.getElementById(`${key}Error`);
            if (errorField) {
                errorField.textContent = errorMsg;
            } else {
                showFormAlert(errorMsg);
            }
        }
    } else {
        showFormAlert('An unexpected error occurred.');
    }
}

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '❌';

    toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function escapeQuote(str) {
    if (!str) return '';
    return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

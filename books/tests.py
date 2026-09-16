from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Book


class BookAPITests(TestCase):
    """
    Test suite for Book CRUD REST API and Search operations.
    """

    def setUp(self):
        self.client = APIClient()
        self.sample_book = Book.objects.create(
            title="Operating System Concepts",
            author="Abraham Silberschatz",
            isbn="978-1118063330",
            category="Computer Science",
            quantity=5
        )
        self.list_create_url = reverse('book-list-create')
        self.detail_url = reverse('book-detail', kwargs={'pk': self.sample_book.pk})

    def test_frontend_index_view(self):
        """Test that the homepage serves the single-page application successfully."""
        response = self.client.get('/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertContains(response, "Library Management System")

    def test_list_books(self):
        """Test GET /api/books/ retrieves all books."""
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], "Operating System Concepts")

    def test_create_book_success(self):
        """Test POST /api/books/ creates a new book."""
        data = {
            "title": "Computer Networking: A Top-Down Approach",
            "author": "James F. Kurose, Keith W. Ross",
            "isbn": "978-0133594140",
            "category": "Networking",
            "quantity": 3
        }
        response = self.client.post(self.list_create_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], data['title'])
        self.assertEqual(response.data['isbn'], data['isbn'])
        self.assertEqual(Book.objects.count(), 2)

    def test_create_book_duplicate_isbn_fails(self):
        """Test POST /api/books/ fails when ISBN is duplicated."""
        data = {
            "title": "Another Book",
            "author": "Another Author",
            "isbn": "978-1118063330",  # Same as self.sample_book
            "category": "Fiction",
            "quantity": 2
        }
        response = self.client.post(self.list_create_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("isbn", response.data)

    def test_create_book_negative_quantity_fails(self):
        """Test POST /api/books/ fails when quantity is negative."""
        data = {
            "title": "Invalid Quantity Book",
            "author": "Test Author",
            "isbn": "978-0000000001",
            "category": "Science",
            "quantity": -5
        }
        response = self.client.post(self.list_create_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("quantity", response.data)

    def test_get_single_book(self):
        """Test GET /api/books/<id>/ retrieves single book detail."""
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], self.sample_book.id)
        self.assertEqual(response.data['title'], self.sample_book.title)

    def test_get_nonexistent_book(self):
        """Test GET /api/books/<invalid_id>/ returns 404."""
        invalid_url = reverse('book-detail', kwargs={'pk': 9999})
        response = self.client.get(invalid_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_book(self):
        """Test PUT /api/books/<id>/ updates an existing book."""
        updated_data = {
            "title": "Operating System Concepts (10th Edition)",
            "author": "Abraham Silberschatz & Greg Gagne",
            "isbn": "978-1118063330",
            "category": "Computer Science",
            "quantity": 10
        }
        response = self.client.put(self.detail_url, updated_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "Operating System Concepts (10th Edition)")
        self.assertEqual(response.data['quantity'], 10)

        # Confirm in DB
        self.sample_book.refresh_from_db()
        self.assertEqual(self.sample_book.title, "Operating System Concepts (10th Edition)")
        self.assertEqual(self.sample_book.quantity, 10)

    def test_delete_book(self):
        """Test DELETE /api/books/<id>/ removes the book."""
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Book.objects.filter(pk=self.sample_book.pk).exists())

    def test_search_book_by_title_and_author(self):
        """Test GET /api/books/?search=query filters results properly."""
        Book.objects.create(
            title="The Hobbit",
            author="J.R.R. Tolkien",
            isbn="978-0547928227",
            category="Fantasy",
            quantity=7
        )

        # Search for "Hobbit"
        response = self.client.get(f"{self.list_create_url}?search=Hobbit")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], "The Hobbit")

        # Search for author "Tolkien"
        response = self.client.get(f"{self.list_create_url}?search=Tolkien")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        # Search non-matching term
        response = self.client.get(f"{self.list_create_url}?search=UnmatchedQuery123")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

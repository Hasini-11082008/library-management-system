# 📚 Library Management System

A simple, robust, and full-stack **Library Management System** built with **Python Django**, **Django REST Framework (DRF)**, **SQLite**, and a clean vanilla **HTML / CSS / JavaScript** frontend.

Designed with clean, well-commented code that is easy to understand and explain in college viva/examinations.

---

## 🚀 How to Run the Project (Quick Start)

### Step 1: Open Terminal & Navigate to Project
```powershell
cd C:\Users\acer\.gemini\antigravity\scratch\library-management-system
```

### Step 2: Start the Django Development Server
```powershell
python manage.py runserver
```

### Step 3: Open in Browser
Open your web browser and navigate to:
```
http://127.0.0.1:8000/
```

*(Note: Database migrations and sample seed books are already applied and ready to use!)*

---

## 📋 Features Implemented

1. **Add Book**: Add new books with Title, Author, ISBN, Category, and Quantity.
2. **View Books**: Display all books in a responsive, clean table with live inventory statistics.
3. **Edit Book**: Update details of any existing book with pre-populated form fields.
4. **Delete Book**: Remove a book with a safe confirmation dialog.
5. **Search Book**: Real-time debounced search across Title, Author, ISBN, and Category.
6. **Input Validation**: Both client-side (JavaScript) and server-side (DRF Serializer) validation (e.g., unique ISBN, positive quantity, non-empty fields).

---

## 🔌 REST API Endpoints

All API endpoints return and accept JSON.

| HTTP Method | Endpoint | Description | Status Code |
|---|---|---|---|
| `GET` | `/api/books/` | List all books | `200 OK` |
| `GET` | `/api/books/?search=<query>` | Filter books by search keyword | `200 OK` |
| `POST` | `/api/books/` | Create a new book | `201 Created` / `400 Bad Request` |
| `GET` | `/api/books/<id>/` | Retrieve details of a specific book | `200 OK` / `404 Not Found` |
| `PUT` | `/api/books/<id>/` | Update a specific book | `200 OK` / `400 Bad Request` |
| `DELETE` | `/api/books/<id>/` | Delete a specific book | `204 No Content` |

---

## 📁 Project Directory Structure

```
library-management-system/
│── db.sqlite3                  # SQLite database file
│── manage.py                   # Django CLI management script
│── seed_data.py                # Optional script to re-populate sample books
│── README.md                   # Documentation and viva preparation guide
│
├── library_system/             # Main Django Project Settings
│   ├── __init__.py
│   ├── settings.py             # Configured with DRF, templates, & static dirs
│   ├── urls.py                 # Main URL routing
│   └── wsgi.py
│
├── books/                      # Library Application
│   ├── __init__.py
│   ├── admin.py                # Django Admin registration
│   ├── apps.py
│   ├── models.py               # Book database model
│   ├── serializers.py          # DRF BookSerializer with validation
│   ├── views.py                # APIView classes for CRUD and search
│   ├── urls.py                 # App URL routing (/ and /api/books/)
│   └── tests.py                # Automated unit tests for all CRUD operations
│
├── templates/
│   └── index.html              # Clean Single-Page UI (HTML)
│
└── static/
    ├── css/
    │   └── style.css           # Modern CSS styling (responsive, cards, modals)
    └── js/
        └── app.js              # JavaScript fetch() logic (CRUD, Search, Modals)
```

---

## 🧪 Running Automated Tests

To run the automated test suite verifying all CRUD endpoints and validation rules:

```powershell
python manage.py test books
```

Expected output:
```
Ran 10 tests in 0.095s
OK
```

---

## 🎓 College Viva & Interview Guide

### 1. What architecture does this project follow?
- **Client-Server Architecture** / **RESTful API**:
  - The **backend** (Django + DRF) acts as a headless API service handling data persistence, business logic, and validation.
  - The **frontend** (HTML, CSS, JavaScript) is decoupled from server rendering and interacts with the backend asynchronously using standard HTTP requests via the browser's native `fetch()` API.

### 2. What is a Django Model?
- In `books/models.py`, the `Book` class inherits from `django.db.models.Model`. It defines the database schema using Python attributes (`title`, `author`, `isbn`, `category`, `quantity`). Django ORM translates this Python class into SQL tables (`books_book`) in SQLite without writing raw SQL.

### 3. What is a Serializer in Django REST Framework?
- In `books/serializers.py`, `BookSerializer` inherits from `serializers.ModelSerializer`.
- **Serialization**: Converts complex Django Model instances into native Python datatypes that can easily be rendered into JSON.
- **Deserialization & Validation**: Converts incoming JSON request data into validated Python dictionaries, ensuring rules like ISBN uniqueness and non-negative quantity are met before saving to the database.

### 4. How does the frontend communicate with the backend?
- Using JavaScript's native `fetch()` function with `async/await`.
  - To **Read**: `await fetch('/api/books/')`
  - To **Create**: `await fetch('/api/books/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })`
  - To **Update**: `await fetch('/api/books/' + id + '/', { method: 'PUT', ... })`
  - To **Delete**: `await fetch('/api/books/' + id + '/', { method: 'DELETE' })`

### 5. What are the key HTTP status codes used?
- `200 OK`: Request succeeded (GET, PUT).
- `201 Created`: New resource created successfully (POST).
- `204 No Content`: Resource deleted successfully (DELETE).
- `400 Bad Request`: Validation failure or invalid input data.
- `404 Not Found`: Requested book ID does not exist.

### 6. How is the search feature implemented?
- In `books/views.py`, `BookListCreateView.get()` reads the `?search=query` parameter.
- It uses Django's `Q` objects to perform case-insensitive substring matching (`icontains`) across `title`, `author`, `isbn`, and `category`:
  ```python
  Q(title__icontains=query) | Q(author__icontains=query) | Q(isbn__icontains=query) | Q(category__icontains=query)
  ```
- On the frontend (`static/js/app.js`), debouncing (300ms delay) is implemented to avoid sending redundant API requests while typing.

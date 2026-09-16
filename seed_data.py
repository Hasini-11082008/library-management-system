import os
import django

# Configure Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'library_system.settings')
django.setup()

from books.models import Book

sample_books = [
    {
        "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
        "author": "Robert C. Martin",
        "isbn": "978-0132350884",
        "category": "Computer Science",
        "quantity": 8
    },
    {
        "title": "Design Patterns: Elements of Reusable Object-Oriented Software",
        "author": "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
        "isbn": "978-0201633610",
        "category": "Software Engineering",
        "quantity": 5
    },
    {
        "title": "Introduction to Algorithms (CLRS)",
        "author": "Thomas H. Cormen, Charles E. Leiserson",
        "isbn": "978-0262033848",
        "category": "Computer Science",
        "quantity": 12
    },
    {
        "title": "The Pragmatic Programmer",
        "author": "Andrew Hunt, David Thomas",
        "isbn": "978-0201616224",
        "category": "Programming",
        "quantity": 4
    },
    {
        "title": "Artificial Intelligence: A Modern Approach",
        "author": "Stuart Russell, Peter Norvig",
        "isbn": "978-0136042594",
        "category": "Artificial Intelligence",
        "quantity": 6
    },
    {
        "title": "Database System Concepts",
        "author": "Abraham Silberschatz, Henry F. Korth",
        "isbn": "978-0073523323",
        "category": "Database Systems",
        "quantity": 10
    }
]

def seed():
    print("Seeding sample books into database...")
    created_count = 0
    for data in sample_books:
        book, created = Book.objects.get_or_create(
            isbn=data["isbn"],
            defaults=data
        )
        if created:
            created_count += 1
            print(f"Created: {book.title}")
        else:
            print(f"Already exists: {book.title}")
            
    print(f"\nDone! Seeded {created_count} books. Total in DB: {Book.objects.count()}")

if __name__ == "__main__":
    seed()

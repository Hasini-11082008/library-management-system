from django.db import models


class Book(models.Model):
    """
    Model representing a book in the library management system.
    """
    title = models.CharField(max_length=200, help_text="Title of the book")
    author = models.CharField(max_length=150, help_text="Author of the book")
    isbn = models.CharField(max_length=20, unique=True, help_text="Unique ISBN number")
    category = models.CharField(max_length=100, help_text="Genre or Category of the book")
    quantity = models.PositiveIntegerField(default=1, help_text="Available stock/quantity")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-id']  # Most recently added books appear first

    def __str__(self):
        return f"{self.title} by {self.author} (ISBN: {self.isbn})"

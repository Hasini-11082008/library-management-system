from rest_framework import serializers
from .models import Book


class BookSerializer(serializers.ModelSerializer):
    """
    Serializer for the Book model with input validation.
    """
    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'isbn', 'category', 'quantity', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be blank.")
        return value.strip()

    def validate_author(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Author cannot be blank.")
        return value.strip()

    def validate_isbn(self, value):
        cleaned_isbn = value.strip()
        if not cleaned_isbn:
            raise serializers.ValidationError("ISBN cannot be blank.")
        
        # Check uniqueness on update/create
        book_id = self.instance.id if self.instance else None
        if Book.objects.filter(isbn=cleaned_isbn).exclude(id=book_id).exists():
            raise serializers.ValidationError("A book with this ISBN already exists.")
        return cleaned_isbn

    def validate_quantity(self, value):
        if value < 0:
            raise serializers.ValidationError("Quantity cannot be negative.")
        return value

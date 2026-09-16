from django.contrib import admin
from .models import Book


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'author', 'isbn', 'category', 'quantity', 'created_at')
    search_fields = ('title', 'author', 'isbn', 'category')
    list_filter = ('category',)


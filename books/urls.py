from django.urls import path
from .views import BookListCreateView, BookDetailView, index_view

urlpatterns = [
    path('', index_view, name='home'),
    path('api/books/', BookListCreateView.as_view(), name='book-list-create'),
    path('api/books/<int:pk>/', BookDetailView.as_view(), name='book-detail'),
]

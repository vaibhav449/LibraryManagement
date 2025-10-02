import api from './api';

// Book management services
export const bookService = {
  // Get all books with search and pagination
  getAllBooks: async (params = {}) => {
    try {
      const response = await api.get('/books', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get books' };
    }
  },

  // Create a new book (Authors only)
  createBook: async (bookData) => {
    try {
      const response = await api.post('/books/create', bookData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to create book' };
    }
  },

  // Get books by author
  getBooksByAuthor: async (authorId) => {
    try {
      const response = await api.get(`/books/author/${authorId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get author books' };
    }
  },

  // Update book (Authors only)
  updateBook: async (bookId, bookData) => {
    try {
      const response = await api.put(`/books/update/${bookId}`, bookData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update book' };
    }
  },

  // Delete book (Authors only)
  deleteBook: async (bookId) => {
    try {
      const response = await api.delete(`/books/delete/${bookId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to delete book' };
    }
  },

  // Search books with filters
  searchBooks: async (searchQuery, filters = {}) => {
    try {
      const params = {
        search: searchQuery,
        ...filters,
      };
      const response = await api.get('/books', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to search books' };
    }
  },
};
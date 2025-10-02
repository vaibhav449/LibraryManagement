import api from './api';

// Reader services for borrowing and returning books
export const readerService = {
  // Update reader profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.post('/reader/profile', profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },

  // Borrow a book
  borrowBook: async (bookId) => {
    try {
      const response = await api.post('/reader/books/borrow', { bookId });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to borrow book' };
    }
  },

  // Return a book
  returnBook: async (bookId) => {
    try {
      const response = await api.post('/reader/books/return', { bookId });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to return book' };
    }
  },

  // Get current user's borrowed books
  getBorrowedBooks: async () => {
    try {
      const response = await api.get('/reader/borrowed');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get borrowed books' };
    }
  },

  // Get reading history
  getReadingHistory: async () => {
    try {
      const response = await api.get('/reader/history');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Failed to get reading history' };
    }
  },
};

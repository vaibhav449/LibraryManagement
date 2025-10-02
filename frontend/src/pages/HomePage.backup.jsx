import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Users, TrendingUp } from 'lucide-react';
import { bookService } from '../services/bookService';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';
import Input from '../components/Input';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { debounce } from '../utils/helpers';
import toast from 'react-hot-toast';

const HomePage = () => {
  const { user, isReader } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    genre: '',
    available: false,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBooks: 0,
  });
  const [borrowingId, setBorrowingId] = useState(null);

  // Debounced search function
  const debouncedSearch = debounce((query, currentFilters) => {
    fetchBooks(1, query, currentFilters);
  }, 500);

  // Fetch books
  const fetchBooks = async (page = 1, search = searchQuery, currentFilters = filters) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        search: search.trim(),
        ...currentFilters,
      };

      // Remove empty parameters
      Object.keys(params).forEach(key => {
        if (params[key] === '' || params[key] === false) {
          delete params[key];
        }
      });

      const response = await bookService.getAllBooks(params);
      setBooks(response.books || []);
      setPagination(response.pagination || {});
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error(error.message || 'Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query, filters);
  };

  // Handle filter change
  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    fetchBooks(1, searchQuery, newFilters);
  };

  // Handle page change
  const handlePageChange = (page) => {
    fetchBooks(page);
  };

  // Handle borrow book
  const handleBorrowBook = async (bookId) => {
    if (!user || !isReader()) {
      toast.error('Please login as a reader to borrow books');
      return;
    }

    try {
      setBorrowingId(bookId);
      // Import readerService here to avoid circular dependency
      const { readerService } = await import('../services/readerService');
      await readerService.borrowBook(bookId);
      toast.success('Book borrowed successfully!');
      fetchBooks(pagination.currentPage); // Refresh current page
    } catch (error) {
      console.error('Error borrowing book:', error);
      toast.error(error.message || 'Failed to borrow book');
    } finally {
      setBorrowingId(null);
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({ genre: '', available: false });
    setSearchQuery('');
    fetchBooks(1, '', { genre: '', available: false });
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Welcome to LibraryMS
            </h1>
            <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Discover, borrow, and manage your favorite books in our comprehensive library management system.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="bg-primary-50 rounded-lg p-6 text-center">
              <BookOpen className="h-8 w-8 text-primary-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-primary-900">{pagination.totalBooks}</div>
              <div className="text-sm text-primary-700">Total Books</div>
            </div>
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">Active</div>
              <div className="text-sm text-green-700">Library System</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-6 text-center">
              <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-900">24/7</div>
              <div className="text-sm text-orange-700">Available</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col space-y-4 lg:flex-row lg:space-y-0 lg:space-x-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search books by title or author..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Genre Filter */}
            <div className="lg:w-48">
              <select
                value={filters.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Genres</option>
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Science">Science</option>
                <option value="Technology">Technology</option>
                <option value="History">History</option>
                <option value="Biography">Biography</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Mystery">Mystery</option>
                <option value="Romance">Romance</option>
                <option value="Thriller">Thriller</option>
              </select>
            </div>

            {/* Available Only Filter */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="available"
                checked={filters.available}
                onChange={(e) => handleFilterChange('available', e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="available" className="text-sm text-gray-700">
                Available only
              </label>
            </div>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={clearFilters}
              className="lg:w-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Books Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-500">
              {searchQuery || filters.genre || filters.available
                ? 'Try adjusting your search filters'
                : 'No books available at the moment'}
            </p>
          </div>
        ) : (
          <>
                        <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8\">\n              {books.map((book) => (\n                <BookCard\n                  key={book._id}\n                  book={book}\n                  userRole={user?.role}\n                  onBorrow={handleBorrowBook}\n                  loading={borrowingId === book._id}\n                  showActions={isReader()}\n                />\n              ))}\n            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center">
                <nav className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm rounded-md ${
                          page === pagination.currentPage
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                  >
                    Next
                  </Button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
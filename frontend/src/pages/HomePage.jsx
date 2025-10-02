import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Users, TrendingUp } from 'lucide-react';
import { bookService } from '../services/bookService';
import { readerService } from '../services/readerService';
import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';
import Input from '../components/Input';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { debounce } from '../utils/helpers';
import toast from 'react-hot-toast';

function HomePage() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    genre: '',
    availability: '',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBooks: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [genres, setGenres] = useState([]);
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    genres: 0,
  });
  const [borrowingId, setBorrowingId] = useState(null);

  // Create debounced search function
  const debouncedSearch = debounce((query, currentFilters) => {
    fetchBooks(1, query, currentFilters);
  }, 300);

  useEffect(() => {
    fetchBooks();
  }, []);

  // Fetch books with optional search and filters
  const fetchBooks = async (page = 1, search = searchQuery, currentFilters = filters) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        ...(search && { search }),
        ...(currentFilters.genre && { genre: currentFilters.genre }),
        ...(currentFilters.availability && { available: currentFilters.availability === 'available' }),
      };

      const response = await bookService.getAllBooks(params);
      setBooks(response.books || []);
      setPagination(response.pagination || {});
      
      // Extract unique genres for filter dropdown
      const uniqueGenres = [...new Set(response.books?.map(book => book.genre) || [])];
      setGenres(uniqueGenres);

      // Calculate stats
      setStats({
        totalBooks: response.pagination?.totalBooks || 0,
        availableBooks: response.books?.filter(book => book.stock > 0).length || 0,
        genres: uniqueGenres.length,
      });
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to fetch books');
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
    if (!user) {
      toast.error('Please login to borrow books');
      return;
    }

    if (user.role !== 'Reader') {
      toast.error('Only readers can borrow books');
      return;
    }

    try {
      setBorrowingId(bookId);
      await readerService.borrowBook(bookId);
      toast.success('Book borrowed successfully!');
      fetchBooks(pagination.currentPage);
    } catch (error) {
      toast.error(error.message || 'Failed to borrow book');
    } finally {
      setBorrowingId(null);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setFilters({ genre: '', availability: '' });
    fetchBooks(1, '', { genre: '', availability: '' });
  };

  const isReader = () => user?.role === 'Reader';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Discover Your Next Great Read
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Browse thousands of books and start your reading journey today
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <BookOpen className="h-8 w-8 text-primary-200" />
                </div>
                <div className="text-2xl font-bold">{stats.totalBooks}</div>
                <div className="text-primary-200">Total Books</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-8 w-8 text-primary-200" />
                </div>
                <div className="text-2xl font-bold">{stats.availableBooks}</div>
                <div className="text-primary-200">Available Now</div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-center mb-2">
                  <Users className="h-8 w-8 text-primary-200" />
                </div>
                <div className="text-2xl font-bold">{stats.genres}</div>
                <div className="text-primary-200">Genres</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  type="text"
                  placeholder="Search books by title, author, or genre..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={filters.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Genres</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
              
              <select
                value={filters.availability}
                onChange={(e) => handleFilterChange('availability', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Books</option>
                <option value="available">Available Only</option>
              </select>
              
              {(searchQuery || filters.genre || filters.availability) && (
                <Button
                  onClick={clearFilters}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <Filter size={16} />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="large" />
          </div>
        ) : books.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filters.genre || filters.availability
                ? 'Try adjusting your search or filter criteria'
                : 'No books are available at the moment'}
            </p>
            {(searchQuery || filters.genre || filters.availability) && (
              <Button onClick={clearFilters} variant="secondary">
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {books.map((book) => (
                <BookCard
                  key={book._id}
                  book={book}
                  userRole={user?.role}
                  onBorrow={() => handleBorrowBook(book._id)}
                  loading={borrowingId === book._id}
                  showActions={isReader()}
                />
              ))}
            </div>

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
                  
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={page}
                          variant={pagination.currentPage === page ? 'primary' : 'outline'}
                          onClick={() => handlePageChange(page)}
                          className="w-10 h-10 p-0"
                        >
                          {page}
                        </Button>
                      );
                    } else if (
                      page === pagination.currentPage - 2 ||
                      page === pagination.currentPage + 2
                    ) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                  
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
}

export default HomePage;
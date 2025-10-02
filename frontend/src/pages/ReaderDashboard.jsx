import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { readerService } from '../services/readerService';
import { bookService } from '../services/bookService';
import { ArrowLeft, BookOpen, Calendar, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Input from '../components/Input';
import BookCard from '../components/BookCard';
import LoadingSpinner from '../components/LoadingSpinner';

function ReaderDashboard() {
  const { user } = useAuth();
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [allBooks, setAllBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('borrowed'); // 'borrowed' or 'browse'
  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('');
  const [availableGenres, setAvailableGenres] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBooks: 0
  });

  useEffect(() => {
    fetchBorrowedBooks();
    if (activeTab === 'browse') {
      fetchAllBooks();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'browse') {
      const delayedSearch = setTimeout(() => {
        fetchAllBooks();
      }, 300);
      return () => clearTimeout(delayedSearch);
    }
  }, [searchTerm, genreFilter]);

  const fetchBorrowedBooks = async () => {
    try {
      setLoading(true);
      const response = await readerService.getBorrowedBooks();
      setBorrowedBooks(response.borrowedBooks || []);
    } catch (error) {
      toast.error('Failed to fetch borrowed books');
      console.error('Error fetching borrowed books:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllBooks = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        ...(searchTerm && { search: searchTerm }),
        ...(genreFilter && { genre: genreFilter })
      };
      
      const response = await bookService.getAllBooks(params);
      setAllBooks(response.books || []);
      setPagination(response.pagination || { currentPage: 1, totalPages: 1, totalBooks: 0 });
      
      // Extract unique genres for filter
      const genres = [...new Set(response.books?.map(book => book.genre) || [])];
      setAvailableGenres(genres);
    } catch (error) {
      toast.error('Failed to fetch books');
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowBook = async (bookId) => {
    try {
      await readerService.borrowBook(bookId);
      toast.success('Book borrowed successfully!');
      fetchAllBooks(pagination.currentPage);
      fetchBorrowedBooks();
    } catch (error) {
      toast.error(error.message || 'Failed to borrow book');
    }
  };

  const handleReturnBook = async (bookId) => {
    try {
      await readerService.returnBook(bookId);
      toast.success('Book returned successfully!');
      fetchBorrowedBooks();
      if (activeTab === 'browse') {
        fetchAllBooks(pagination.currentPage);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to return book');
    }
  };

  const handlePageChange = (page) => {
    fetchAllBooks(page);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setGenreFilter('');
  };

  if (loading && activeTab === 'borrowed') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reader Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}!</p>
      </div>

      {/* Tab Navigation */}
      <div className="inline-flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('borrowed')}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'borrowed'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Borrowed Books ({borrowedBooks.length})
        </button>
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            activeTab === 'browse'
              ? 'bg-white text-primary-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Browse Books
        </button>
      </div>

      {/* Borrowed Books Tab */}
      {activeTab === 'borrowed' && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <BookOpen size={24} />
              Currently Borrowed Books
            </h2>
            <p className="text-gray-600 mt-1">Manage your borrowed books and return them when finished</p>
          </div>
          
          {borrowedBooks.length === 0 ? (
            <div className="p-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No borrowed books</h3>
              <p className="text-gray-600 mb-4">You haven't borrowed any books yet. Browse our collection to get started!</p>
              <Button onClick={() => setActiveTab('browse')}>
                Browse Books
              </Button>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {borrowedBooks.map((borrowedBook) => (
                  <div key={borrowedBook._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="mb-4">
                      <h3 className="font-semibold text-lg text-gray-900 mb-2">
                        {borrowedBook.book?.title || 'Unknown Title'}
                      </h3>
                      <p className="text-gray-600 mb-1">
                        <span className="font-medium">Author:</span> {borrowedBook.book?.author?.name || 'Unknown Author'}
                      </p>
                      <p className="text-gray-600 mb-1">
                        <span className="font-medium">Genre:</span> {borrowedBook.book?.genre || 'Unknown'}
                      </p>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-4">
                      <p className="flex items-center gap-2">
                        <Calendar size={16} />
                        <span className="font-medium">Borrowed:</span> 
                        {new Date(borrowedBook.borrowedAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Borrowed {Math.ceil((Date.now() - new Date(borrowedBook.borrowedAt)) / (1000 * 60 * 60 * 24))} days ago
                      </p>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100">
                      <Button
                        onClick={() => handleReturnBook(borrowedBook.book._id)}
                        variant="secondary"
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <ArrowLeft size={16} />
                        Return Book
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Browse Books Tab */}
      {activeTab === 'browse' && (
        <div>
          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    type="text"
                    placeholder="Search books by title, author, or genre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="md:w-48">
                <select
                  value={genreFilter}
                  onChange={(e) => setGenreFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">All Genres</option>
                  {availableGenres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>
              
              {(searchTerm || genreFilter) && (
                <Button
                  onClick={clearFilters}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  <Filter size={16} />
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* Books Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="large" />
            </div>
          ) : allBooks.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-12 text-center">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || genreFilter
                  ? 'Try adjusting your search or filter criteria'
                  : 'No books are available at the moment'}
              </p>
              {(searchTerm || genreFilter) && (
                <Button onClick={clearFilters} variant="secondary">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {allBooks.map((book) => (
                  <BookCard
                    key={book._id}
                    book={book}
                    userRole={user.role}
                    onBorrow={() => handleBorrowBook(book._id)}
                    borrowedBooks={borrowedBooks}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  <Button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                    variant="secondary"
                  >
                    Previous
                  </Button>
                  
                  <div className="flex space-x-1">
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
                            onClick={() => handlePageChange(page)}
                            variant={pagination.currentPage === page ? 'primary' : 'secondary'}
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
                  </div>
                  
                  <Button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                    variant="secondary"
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default ReaderDashboard;
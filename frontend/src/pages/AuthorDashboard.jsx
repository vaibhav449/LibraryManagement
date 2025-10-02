import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookService } from '../services/bookService';
import { Plus, Edit, Trash2, Users, BookOpen, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

function AuthorDashboard() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    stock: ''
  });
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalStock: 0,
    borrowedBooks: 0
  });

  useEffect(() => {
    fetchAuthorBooks();
  }, []);

  const fetchAuthorBooks = async () => {
    try {
      setLoading(true);
      const response = await bookService.getBooksByAuthor(user.id);
      setBooks(response.books || []);
      
      // Calculate stats
      const totalBooks = response.books?.length || 0;
      const totalStock = response.books?.reduce((sum, book) => sum + book.stock, 0) || 0;
      const borrowedBooks = response.books?.reduce((sum, book) => sum + (book.originalStock - book.stock), 0) || 0;
      
      setStats({ totalBooks, totalStock, borrowedBooks });
    } catch (error) {
      toast.error('Failed to fetch your books');
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBook = async (e) => {
    e.preventDefault();
    try {
      await bookService.createBook({
        ...formData,
        stock: parseInt(formData.stock)
      });
      toast.success('Book created successfully!');
      setShowCreateModal(false);
      setFormData({ title: '', genre: '', stock: '' });
      fetchAuthorBooks();
    } catch (error) {
      toast.error(error.message || 'Failed to create book');
    }
  };

  const handleEditBook = async (e) => {
    e.preventDefault();
    try {
      await bookService.updateBook(selectedBook._id, {
        ...formData,
        stock: parseInt(formData.stock)
      });
      toast.success('Book updated successfully!');
      setShowEditModal(false);
      setSelectedBook(null);
      setFormData({ title: '', genre: '', stock: '' });
      fetchAuthorBooks();
    } catch (error) {
      toast.error(error.message || 'Failed to update book');
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (!window.confirm('Are you sure you want to delete this book?')) return;
    
    try {
      await bookService.deleteBook(bookId);
      toast.success('Book deleted successfully!');
      fetchAuthorBooks();
    } catch (error) {
      toast.error(error.message || 'Failed to delete book');
    }
  };

  const openEditModal = (book) => {
    setSelectedBook(book);
    setFormData({
      title: book.title,
      genre: book.genre,
      stock: book.stock.toString()
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({ title: '', genre: '', stock: '' });
    setSelectedBook(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Author Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Book
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Books</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalBooks}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Stock</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalStock}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Books Borrowed</p>
              <p className="text-3xl font-bold text-gray-900">{stats.borrowedBooks}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Your Books</h2>
        </div>
        
        {books.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books yet</h3>
            <p className="text-gray-600 mb-4">Start by creating your first book!</p>
            <Button onClick={() => setShowCreateModal(true)}>
              Create Your First Book
            </Button>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {books.map((book) => (
                <div key={book._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-gray-900 truncate">{book.title}</h3>
                    <div className="flex gap-2 ml-2">
                      <button
                        onClick={() => openEditModal(book)}
                        className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                        title="Edit book"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteBook(book._id)}
                        className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                        title="Delete book"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium text-gray-600">Genre:</span> {book.genre}</p>
                    <p><span className="font-medium text-gray-600">Stock:</span> {book.stock} available</p>
                    {book.originalStock && (
                      <p><span className="font-medium text-gray-600">Borrowed:</span> {book.originalStock - book.stock} copies</p>
                    )}
                    <p className="text-xs text-gray-500">Created: {new Date(book.createdAt).toLocaleDateString()}</p>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        book.stock > 0 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {book.stock > 0 ? 'Available' : 'Out of Stock'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {book.stock > 5 ? 'Good Stock' : book.stock > 0 ? 'Low Stock' : 'No Stock'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Book Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Create New Book"
      >
        <form onSubmit={handleCreateBook} className="space-y-4">
          <Input
            label="Book Title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="Enter book title"
          />
          
          <Input
            label="Genre"
            type="text"
            value={formData.genre}
            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
            required
            placeholder="e.g., Fiction, Mystery, Romance"
          />
          
          <Input
            label="Stock Quantity"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            required
            min="1"
            placeholder="Number of copies"
          />
          
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Create Book
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Book Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          resetForm();
        }}
        title="Edit Book"
      >
        <form onSubmit={handleEditBook} className="space-y-4">
          <Input
            label="Book Title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="Enter book title"
          />
          
          <Input
            label="Genre"
            type="text"
            value={formData.genre}
            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
            required
            placeholder="e.g., Fiction, Mystery, Romance"
          />
          
          <Input
            label="Stock Quantity"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            required
            min="0"
            placeholder="Number of copies"
          />
          
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              Update Book
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowEditModal(false);
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default AuthorDashboard;
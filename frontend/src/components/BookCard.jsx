import React from 'react';
import { Book, User, Calendar } from 'lucide-react';
import Button from './Button';
import { formatDate } from '../utils/helpers';

const BookCard = ({
  book,
  userRole,
  onBorrow,
  onReturn,
  onEdit,
  onDelete,
  showActions = true,
  isBorrowed = false,
  loading = false,
  borrowedBooks = [],
}) => {
  const {
    _id,
    title,
    author,
    genre,
    stock = 0,
    createdAt,
  } = book;

  const authorName = typeof author === 'object' ? author.name : author;
  const isOutOfStock = stock === 0;
  const isCurrentlyBorrowed = borrowedBooks.some(borrowed => 
    borrowed.book?._id === _id || borrowed.book === _id
  );

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <Book className="h-8 w-8 text-primary-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {title}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{genre}</p>
          </div>
        </div>
      </div>

      {/* Author and Date Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <User className="h-4 w-4 mr-2" />
          <span>by {authorName}</span>
        </div>
        {createdAt && (
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Added {formatDate(createdAt)}</span>
          </div>
        )}
      </div>

      {/* Stock Information */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-900">{stock}</div>
            <div className="text-gray-600">Total Stock</div>
          </div>
          <div className="text-center">
            <div className={`font-semibold ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
              {stock}
            </div>
            <div className="text-gray-600">Available</div>
          </div>
        </div>
      </div>

      {/* Stock Status Badge */}
      <div className="mb-4">
        {isOutOfStock ? (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
            Out of Stock
          </span>
        ) : (
          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            Available
          </span>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex flex-wrap gap-2">
          {/* Reader Actions */}
          {userRole === 'Reader' && (
            <>
              {isCurrentlyBorrowed || isBorrowed ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onReturn?.(_id)}
                  loading={loading}
                  className="flex-1"
                >
                  Return Book
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onBorrow?.(_id)}
                  disabled={isOutOfStock || loading}
                  loading={loading}
                  className="flex-1"
                >
                  {isOutOfStock ? 'Out of Stock' : 'Borrow Book'}
                </Button>
              )}
            </>
          )}

          {/* Author Actions */}
          {userRole === 'Author' && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit?.(book)}
                className="flex-1"
              >
                Edit
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete?.(_id)}
                loading={loading}
                className="flex-1"
              >
                Delete
              </Button>
            </>
          )}
        </div>
      )}

      {/* Author specific warning */}
      {userRole === 'Author' && borrowed > 0 && (
        <p className="text-xs text-orange-600 mt-2">
          Cannot delete while books are borrowed
        </p>
      )}
    </div>
  );
};

export default BookCard;
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Library Management System API',
      version: '1.0.0',
      description: 'A comprehensive library management system with role-based access control, book management, and reader services.',
      contact: {
        name: 'API Support',
        email: 'support@librarymanagement.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'User full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            password: {
              type: 'string',
              minLength: 6,
              maxLength: 128,
              description: 'User password'
            },
            role: {
              type: 'string',
              enum: ['Reader', 'Author'],
              description: 'User role in the system'
            },
            borrowedBooks: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of borrowed book IDs (for Readers only)'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Book: {
          type: 'object',
          required: ['title', 'author', 'genre', 'stock'],
          properties: {
            _id: {
              type: 'string',
              description: 'Book ID'
            },
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 200,
              description: 'Book title'
            },
            author: {
              $ref: '#/components/schemas/User',
              description: 'Author information'
            },
            genre: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'Book genre'
            },
            stock: {
              type: 'integer',
              minimum: 0,
              maximum: 10000,
              description: 'Available stock quantity'
            },
            borrowedBy: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Array of user IDs who borrowed this book'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        UserLoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            password: {
              type: 'string',
              description: 'User password'
            }
          }
        },
        UserRegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password', 'role'],
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'User full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'User password'
            },
            role: {
              type: 'string',
              enum: ['Reader', 'Author'],
              description: 'User role'
            }
          }
        },
        BookCreateRequest: {
          type: 'object',
          required: ['title', 'genre', 'stock'],
          properties: {
            title: {
              type: 'string',
              description: 'Book title'
            },
            genre: {
              type: 'string',
              description: 'Book genre'
            },
            stock: {
              type: 'integer',
              minimum: 1,
              description: 'Stock quantity'
            }
          }
        },
        BorrowBookRequest: {
          type: 'object',
          required: ['bookId'],
          properties: {
            bookId: {
              type: 'string',
              description: 'ID of the book to borrow'
            }
          }
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Success message'
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Detailed error messages'
            }
          }
        },
        PaginationResponse: {
          type: 'object',
          properties: {
            currentPage: {
              type: 'integer',
              description: 'Current page number'
            },
            totalPages: {
              type: 'integer',
              description: 'Total number of pages'
            },
            totalBooks: {
              type: 'integer',
              description: 'Total number of books'
            },
            booksPerPage: {
              type: 'integer',
              description: 'Number of books per page'
            },
            hasNext: {
              type: 'boolean',
              description: 'Whether there is a next page'
            },
            hasPrev: {
              type: 'boolean',
              description: 'Whether there is a previous page'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js', './app.js']
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs
};
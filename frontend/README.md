# Library Management System Frontend

## Overview
A modern, responsive React frontend for the Library Management System with role-based authentication and comprehensive book management features.

## 🚀 Features

### Authentication System
- **User Registration**: Role-based signup (Reader/Author)
- **Secure Login**: JWT token-based authentication
- **Protected Routes**: Role-specific access control
- **Session Management**: Persistent login with token validation
- **Demo Accounts**: Quick access for testing

### Reader Features
- **Book Discovery**: Browse and search all available books
- **Advanced Search**: Filter by title, author, genre, availability
- **Book Borrowing**: One-click borrowing with stock validation
- **Personal Library**: View currently borrowed books
- **Return Management**: Easy book return functionality
- **Borrowing Limits**: Maximum 5 books per reader

### Author Features
- **Book Publishing**: Create and publish new books
- **Inventory Management**: Set and update book stock levels
- **Book Editing**: Update book details (title, genre, stock)
- **Analytics**: View borrowing statistics
- **Deletion Control**: Safe book removal with validation

### User Experience
- **Responsive Design**: Mobile-first responsive layout
- **Real-time Updates**: Live book availability status
- **Loading States**: User-friendly loading indicators
- **Error Handling**: Comprehensive error messages
- **Toast Notifications**: Success/error feedback
- **Intuitive Navigation**: Clean, modern interface

## 🛠 Technology Stack

### Core Technologies
- **React 19.1.1**: Latest React with hooks and context
- **Vite**: Fast development and build tool
- **React Router DOM**: Client-side routing with protected routes
- **Tailwind CSS**: Utility-first responsive styling

### State Management
- **React Context API**: Global authentication state
- **Local Storage**: Persistent user sessions
- **Custom Hooks**: Reusable state logic

### HTTP & API
- **Axios**: HTTP client with interceptors
- **Error Handling**: Automatic token refresh and error handling
- **Request/Response Interceptors**: Automatic auth header injection

### UI Components
- **Lucide React**: Modern icon library
- **React Hot Toast**: Beautiful toast notifications
- **Custom Components**: Reusable UI components

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.jsx      # Customizable button component
│   ├── Input.jsx       # Form input with validation
│   ├── Modal.jsx       # Modal dialog component
│   ├── BookCard.jsx    # Book display card
│   ├── LoadingSpinner.jsx # Loading indicator
│   └── Navbar.jsx      # Main navigation
├── pages/              # Page components
│   ├── HomePage.jsx    # Public book browsing
│   ├── LoginPage.jsx   # User authentication
│   ├── SignupPage.jsx  # User registration
│   ├── ReaderDashboard.jsx    # Reader interface
│   ├── AuthorDashboard.jsx    # Author interface
│   └── NotFoundPage.jsx       # 404 error page
├── services/           # API service layer
│   ├── api.js         # Axios configuration
│   ├── userService.js # User authentication APIs
│   ├── bookService.js # Book management APIs
│   └── readerService.js # Reader-specific APIs
├── context/           # React Context providers
│   └── AuthContext.jsx # Authentication state management
├── routes/            # Route protection
│   ├── ProtectedRoute.jsx # Auth-required routes
│   └── PublicRoute.jsx    # Guest-only routes
├── utils/             # Utility functions
│   └── helpers.js     # Common helper functions
└── App.jsx           # Main application component
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- Backend API running on localhost:5000

### Installation
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables
Create `.env` file:
```env
VITE_API_URL=http://localhost:5000
```

## 🎯 Demo Accounts

### Reader Account
- **Email**: reader@demo.com
- **Password**: Demo123!

### Author Account
- **Email**: author@demo.com
- **Password**: Demo123!

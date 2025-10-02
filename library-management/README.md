library-management/
├── controllers/
│   ├── bookController.js       # Handles book-related endpoints
│   ├── readerController.js     # Handles reader-specific endpoints
│   ├── userController.js       # Handles user-related endpoints
├── middleware/
│   └── authMiddleware.js       # Protect routes and authorize actions
├── models/
│   ├── Book.js                 # Book schema
│   └── User.js                 # User schema
├── routes/
│   ├── bookRoutes.js           # Routes for books
│   ├── readerRoutes.js         # Routes for readers
│   └── userRoutes.js           # Routes for users
├── config/
│   └── db.js                   # MongoDB connection setup
├── .env                        # Environment variables
├── app.js                      # Main application entry point
├── package.json                # Node.js dependencies and scripts
└── README.md                   # Project documentation
# Library Management System - Backend

## Overview
This project is a backend system for a Library Management System. It supports:
- User management for Readers and Authors.
- CRUD operations for books.
- Borrowing and returning books by Readers.
- Secure session management with JWT authentication.

## Features
1. **User Management**:
   - Create accounts for Readers and Authors.
   - Update or delete user accounts.
2. **Book Management**:
   - Authors can create, view, update, and delete books.
   - Readers can view available books or search for books by title, author, or genre.
3. **Borrowing and Returning Books**:
   - Readers can borrow books (up to 5) and return them.
4. **Session Validation**:
   - Ensures user sessions are valid for 15 days after signing up or logging in.

## Technologies Used
- **Backend Framework**: Express.js
- **Database**: MongoDB (MongoDB Atlas)
- **Authentication**: JSON Web Tokens (JWT)
- **Language**: JavaScript (Node.js)

---

## Setup and Run Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) installed on your machine.
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account for the database.

### Steps to Run the Project
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd library-management
Install dependencies:

Copy code
npm install
Configure environment variables: Create a .env file in the root directory and add the following:

plaintext
Copy code
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
PORT=5000
Start the application:

Copy code
npm start
Test the endpoints using Postman or any API client.
    
    
    
    
All the screenshot in screenshot folder
# LibraryManagement

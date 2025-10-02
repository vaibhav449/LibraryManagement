# Library Management System - Security & Validation Documentation

## Overview
This document outlines the comprehensive input sanitization and validation measures implemented across the entire library management project to ensure security, data integrity, and proper error handling.

## Security Measures Implemented

### 1. Input Validation & Sanitization

#### Validation Middleware (`middleware/validationMiddleware.js`)
- **Express Validator**: Comprehensive validation rules for all input fields
- **Field-specific validation**: Custom validation for emails, passwords, names, titles, genres, etc.
- **MongoDB ObjectId validation**: Ensures valid ObjectId format for all database references
- **Query parameter validation**: Sanitizes search parameters and pagination inputs
- **Automatic sanitization**: Trims whitespace and normalizes email addresses

#### Key Validation Rules:
- **Email**: Valid format, normalized, max 100 characters
- **Password**: 6-128 characters, must contain uppercase, lowercase, and number
- **Name**: 2-50 characters, letters and spaces only
- **Title**: 1-200 characters, alphanumeric with common punctuation
- **Genre**: 2-50 characters, letters, spaces, hyphens, and ampersands
- **Stock**: Non-negative integer, max 10,000

### 2. Security Middleware (`middleware/securityMiddleware.js`)

#### Rate Limiting
- **Account Creation**: 5 attempts per hour per IP
- **Login**: 5 attempts per 15 minutes per IP
- **General API**: 100 requests per 15 minutes per IP
- **Sensitive Operations**: 10 requests per 15 minutes per IP

#### Security Headers
- **Helmet**: Comprehensive security headers
- **CORS**: Configured for specific frontend origins
- **CSP**: Content Security Policy to prevent XSS
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing

#### Input Sanitization
- **MongoDB Injection Protection**: Sanitizes NoSQL injection attempts
- **XSS Protection**: Removes script tags and malicious code
- **Parameter Pollution Protection**: Prevents HTTP parameter pollution
- **Request Size Limiting**: 1MB limit for request payloads

### 3. Enhanced Authentication (`middleware/authMiddleware.js`)

#### JWT Security
- **Token Structure Validation**: Validates JWT format
- **Token Expiration**: 15-day token validity
- **User Existence Check**: Verifies user still exists
- **Role-based Authorization**: Granular permission control
- **Self-authorization**: Users can only access their own resources

### 4. Database Schema Validation

#### User Model (`models/User.js`)
- **Field validation**: Required fields, format validation, length limits
- **Password hashing**: bcrypt with salt rounds of 12
- **Email uniqueness**: Database-level unique constraint
- **Role enum**: Restricted to 'Reader' and 'Author'
- **Borrowed books limit**: Maximum 5 books per reader
- **Password hiding**: Automatic password exclusion from responses

#### Book Model (`models/Book.js`)
- **Title validation**: Length and character restrictions
- **Author validation**: Must reference valid Author user
- **Genre validation**: Format and length restrictions
- **Stock validation**: Non-negative integer with maximum limit
- **Borrower validation**: Only readers can borrow books
- **Text indexing**: Optimized search capabilities

### 5. Controller-Level Security

#### Enhanced Error Handling
- **Detailed logging**: Comprehensive error logging for debugging
- **Generic error messages**: Prevents information leakage
- **Validation error formatting**: User-friendly error responses
- **Transaction support**: Database consistency for critical operations

#### Business Logic Validation
- **Resource ownership**: Users can only modify their own resources
- **Role permissions**: Authors can create/modify books, readers can borrow
- **Stock management**: Prevents over-borrowing and invalid stock updates
- **Duplicate prevention**: Prevents multiple borrows of same book

### 6. API Route Protection

#### Middleware Chain
Each route includes appropriate middleware in order:
1. Rate limiting (specific to operation type)
2. Authorization header validation
3. Authentication (JWT verification)
4. Role-based authorization
5. Input validation and sanitization
6. Controller logic

### 7. Environment Security

#### Configuration
- **Environment variables**: Sensitive data in .env file
- **JWT secrets**: Strong secret keys
- **Database connection**: Secure MongoDB connection string
- **CORS origins**: Restricted to specific frontend URLs

## Implementation Details

### Validation Schemas

#### User Registration
```javascript
- name: 2-50 chars, letters/spaces only
- email: valid format, unique, normalized
- password: 6-128 chars, complexity requirements
- role: 'Reader' or 'Author' only
```

#### Book Creation
```javascript
- title: 1-200 chars, alphanumeric + punctuation
- genre: 2-50 chars, letters/spaces/hyphens/ampersands
- stock: 0-10000, integer only
```

#### Search Queries
```javascript
- title/genre: 1-100 chars, alphanumeric + basic chars
- author: valid MongoDB ObjectId
- pagination: positive integers with limits
```

### Error Response Format
```javascript
{
  "message": "Human-readable error message",
  "errors": ["Specific validation errors"], // if applicable
}
```

### Security Headers Applied
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Content-Security-Policy: restrictive policy`

## Testing Recommendations

### Security Testing
1. **Input Validation**: Test with malformed inputs, SQL injection attempts
2. **Rate Limiting**: Verify limits are enforced correctly
3. **Authentication**: Test with invalid/expired tokens
4. **Authorization**: Attempt unauthorized resource access
5. **XSS Prevention**: Test with script injection attempts

### Performance Testing
1. **Database queries**: Verify indexes are used effectively
2. **Rate limiting**: Ensure minimal performance impact
3. **Validation overhead**: Monitor response times with validation

## Maintenance

### Regular Security Updates
- Update dependencies regularly
- Monitor for security vulnerabilities
- Review and update validation rules as needed
- Audit logs for suspicious activities

### Monitoring
- Track failed authentication attempts
- Monitor rate limit hits
- Log validation failures
- Track database query performance

## Best Practices Followed

1. **Defense in Depth**: Multiple layers of security
2. **Least Privilege**: Users can only access necessary resources
3. **Input Validation**: Server-side validation for all inputs
4. **Secure Defaults**: Restrictive permissions by default
5. **Error Handling**: Comprehensive error handling without information leakage
6. **Data Sanitization**: Clean and validate all user inputs
7. **Authentication**: Strong JWT-based authentication
8. **Authorization**: Granular permission controls
9. **Rate Limiting**: Prevent abuse and DoS attacks
10. **Security Headers**: Comprehensive security headers

This implementation provides enterprise-level security for the library management system while maintaining usability and performance.
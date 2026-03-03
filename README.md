# Commands-HUB - Backend API

A centralized Node.js/Express/MongoDB REST API for managing and generating attack command templates for cybersecurity professionals and penetration testers.

## Features

✅ **User Authentication**: Passport.js with local strategy and session-based authentication  
✅ **Attack Templates**: Create, read, update, and delete attack command templates  
✅ **Dynamic Fields**: Flexible required fields for different attack scenarios  
✅ **Placeholder Replacement**: Smart templating system to generate final commands  
✅ **Auto-Published**: Templates are automatically published (no approval workflow)
✅ **Category Filtering**: Filter templates by category (Active Directory, Web, Network, etc.)  
✅ **Search**: Search templates by name, description, and tags  
✅ **Password Hashing**: Bcrypt for secure password storage  
✅ **Role-Based Access**: User and Admin roles with appropriate permissions  

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Passport.js (Local Strategy)
- **Validation**: express-validator
- **Hashing**: bcryptjs
- **Session Management**: express-session

## Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (local or remote connection)
- npm or yarn

### Setup

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment variables**:
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your configuration
# MONGODB_URI=mongodb://localhost:27017/attack-command-repo
# PORT=3000
# SESSION_SECRET=your-secret-key
```

3. **Start the server**:
```bash
# Development with auto-reload
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:3000`

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "cybersecurity_user",
  "email": "user@example.com",
  "password": "securePassword123",
  "passwordConfirm": "securePassword123"
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "username": "cybersecurity_user",
    "email": "user@example.com",
    "role": "user"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "cybersecurity_user",
  "password": "securePassword123"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Logged in successfully",
  "user": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "username": "cybersecurity_user",
    "email": "user@example.com",
    "role": "user"
  }
}
```

#### Logout
```http
POST /auth/logout
```

#### Get Current User
```http
GET /auth/me
```

**Response**:
```json
{
  "success": true,
  "authenticated": true,
  "user": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "username": "cybersecurity_user",
    "email": "user@example.com",
    "role": "user"
  }
}
```

#### Get User Profile
```http
GET /auth/profile
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "username": "cybersecurity_user",
    "email": "user@example.com",
    "role": "user",
    "createdAt": "2024-03-02T10:30:00.000Z"
  },
  "stats": {
    "totalTemplates": 5,
    "approvedTemplates": 3
  }
}
```

### Template Endpoints

#### Get All Templates
```http
GET /templates?page=1&limit=10&category=Web%20Attack&search=nmap
```

**Query Parameters**:
- `page` (number, default: 1): Page number for pagination
- `limit` (number, default: 10): Templates per page
- `category` (string): Filter by category
- `search` (string): Search by name, description, or tags

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
      "name": "NMAP Network Scan",
      "description": "Basic network discovery with NMAP",
      "category": "Network",
      "commandTemplate": "nmap -sV -p- {{targetIP}}",
      "requiredFields": [
        {
          "fieldName": "targetIP",
          "fieldType": "ip",
          "description": "Target IP address",
          "required": true
        }
      ],
      "createdBy": {
        "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
        "username": "security_researcher"
      },
      "approved": true,
      "tags": ["network", "enumeration"],
      "difficulty": "Beginner",
      "createdAt": "2024-03-02T10:30:00.000Z",
      "updatedAt": "2024-03-02T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "pages": 5
  },
  "categories": ["Web Attack", "Active Directory", "Network", "Exploitation", "Enumeration", "Privilege Escalation", "Post-Exploitation", "Social Engineering"]
}
```

#### Get Available Categories
```http
GET /templates/categories/list
```

**Response**:
```json
{
  "success": true,
  "data": ["Web Attack", "Active Directory", "Network", "Exploitation", "Enumeration", "Privilege Escalation", "Post-Exploitation", "Social Engineering"]
}
```

#### Create Template
```http
POST /templates
Content-Type: application/json

{
  "name": "SMB Enumeration",
  "description": "Enumerate SMB shares and users",
  "category": "Active Directory",
  "commandTemplate": "crackmapexec smb {{targetIP}} -u {{username}} -p {{password}} --shares",
  "tags": ["smb", "enumeration", "active-directory"],
  "difficulty": "Intermediate",
  "requiredFields": [
    {
      "fieldName": "targetIP",
      "fieldType": "ip",
      "description": "Target SMB server IP",
      "required": true
    },
    {
      "fieldName": "username",
      "fieldType": "text",
      "description": "Domain username",
      "required": true
    },
    {
      "fieldName": "password",
      "fieldType": "password",
      "description": "User password",
      "required": true
    }
  ]
}
```

**Response (201 Created)**:
```json
{
  "success": true,
  "message": "Template created successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
    "name": "SMB Enumeration",
    "description": "Enumerate SMB shares and users",
    "category": "Active Directory",
    "commandTemplate": "crackmapexec smb {{targetIP}} -u {{username}} -p {{password}} --shares",
    "requiredFields": [...],
    "createdBy": {...},
    "approved": false,
    "tags": ["smb", "enumeration", "active-directory"],
    "difficulty": "Intermediate",
    "createdAt": "2024-03-02T11:00:00.000Z"
  }
}
```

#### Get Single Template
```http
GET /templates/64a1b2c3d4e5f6g7h8i9j0k2
```

**Response**:
```json
{
  "success": true,
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
    "name": "SMB Enumeration",
    "description": "Enumerate SMB shares and users",
    "category": "Active Directory",
    "commandTemplate": "crackmapexec smb {{targetIP}} -u {{username}} -p {{password}} --shares",
    "requiredFields": [
      {
        "fieldName": "targetIP",
        "fieldType": "ip",
        "description": "Target SMB server IP",
        "required": true
      },
      {
        "fieldName": "username",
        "fieldType": "text",
        "description": "Domain username",
        "required": true
      },
      {
        "fieldName": "password",
        "fieldType": "password",
        "description": "User password",
        "required": true
      }
    ],
    "createdBy": {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
      "username": "security_researcher",
      "email": "researcher@example.com"
    },
    "approved": true,
    "approvedBy": {...},
    "tags": ["smb", "enumeration", "active-directory"],
    "difficulty": "Intermediate",
    "createdAt": "2024-03-02T11:00:00.000Z",
    "updatedAt": "2024-03-02T11:00:00.000Z"
  }
}
```

#### Update Template
```http
PUT /templates/64a1b2c3d4e5f6g7h8i9j0k2
Content-Type: application/json

{
  "name": "SMB Enumeration (Updated)",
  "description": "Enhanced SMB enumeration",
  "commandTemplate": "crackmapexec smb {{targetIP}} -u {{username}} -p {{password}} --shares --sam"
}
```

#### Delete Template
```http
DELETE /templates/64a1b2c3d4e5f6g7h8i9j0k2
```

#### Generate Commands
```http
POST /templates/64a1b2c3d4e5f6g7h8i9j0k2/generate
Content-Type: application/json

{
  "targetIP": "192.168.1.100",
  "username": "domain_user",
  "password": "P@ssw0rd123!"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Commands generated successfully",
  "data": {
    "templateId": "64a1b2c3d4e5f6g7h8i9j0k2",
    "templateName": "SMB Enumeration",
    "category": "Active Directory",
    "generatedCommand": "crackmapexec smb 192.168.1.100 -u domain_user -p P@ssw0rd123! --shares",
    "placeholderValues": {
      "targetIP": "192.168.1.100",
      "username": "domain_user",
      "password": "P@ssw0rd123!"
    }
  }
}
```

### Admin Endpoints

#### Get All Templates (Admin)
```http
GET /admin/templates?page=1&limit=10
```

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
      "name": "SMB Enumeration",
      "category": "Active Directory",
      "createdBy": {...},
      "approved": false,
      "approvedBy": null,
      "createdAt": "2024-03-02T11:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 10,
    "pages": 2
  }
}
```

#### Approve Template (Admin)
```http
POST /admin/templates/64a1b2c3d4e5f6g7h8i9j0k2/approve
```

**Response**:
```json
{
  "success": true,
  "message": "Template approved successfully",
  "data": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
    "name": "SMB Enumeration",
    "approved": true,
    "approvedBy": {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
      "username": "admin_user"
    }
  }
}
```

#### Reject Template (Admin)
```http
POST /admin/templates/64a1b2c3d4e5f6g7h8i9j0k2/reject
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Missing required fields",
  "missingFields": ["targetIP", "username"]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to edit this template"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Template not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error creating template",
  "error": "Details about the error"
}
```

## Authentication Flow

1. **Register**: Create a new user account
2. **Login**: Authenticate and establish a session
3. **Authenticated Requests**: Include session cookie in subsequent requests
4. **Logout**: Destroy the session

Sessions are stored in memory by default. For production, use MongoDB session store or similar.

## Database Models

### User Schema
- `username` (String, unique, required)
- `email` (String, unique, required)
- `password` (String, hashed, required)
- `role` (String: 'user' or 'admin', default: 'user')
- `createdAt`, `updatedAt` (Timestamps)

### AttackTemplate Schema
- `name` (String, required)
- `description` (String)
- `category` (String: one of predefined categories)
- `requiredFields` (Array of field objects)
  - `fieldName`, `fieldType`, `description`, `required`
- `commandTemplate` (String with placeholders like {{fieldName}})
- `createdBy` (Reference to User)
- `approved` (Boolean, default: false)
- `approvedBy` (Reference to User)
- `tags` (Array of strings)
- `difficulty` (String: 'Beginner', 'Intermediate', 'Advanced')
- `createdAt`, `updatedAt` (Timestamps)

## Placeholder System

Templates use double-braced placeholders: `{{fieldName}}`

**Example**:
```
Template: nmap -sV {{targetIP}} -p {{ports}}
Input: { targetIP: "192.168.1.1", ports: "80,443,3306" }
Output: nmap -sV 192.168.1.1 -p 80,443,3306
```

## Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/attack-command-repo

# Server
PORT=3000
NODE_ENV=development

# Session
SESSION_SECRET=your-very-secure-secret-key-change-in-production

# CORS
CORS_ORIGIN=*

# App
APP_NAME=Attack Command Repository
```

## Development

### Run with auto-reload
```bash
npm run dev
```

### Project Structure
```
backend/
├── app.js                 # Main application entry
├── package.json
├── .env                   # Environment configuration
├── config/
│   ├── database.js       # MongoDB connection
│   └── passport.js       # Passport configuration
├── controllers/
│   ├── authController.js
│   └── templateController.js
├── models/
│   ├── User.js
│   └── AttackTemplate.js
├── routes/
│   ├── auth.js
│   └── templates.js
├── middleware/
│   └── auth.js           # Authentication middleware
└── utils/
    └── placeholder.js    # Placeholder replacement logic
```

## Security Considerations

⚠️ **This application is for authorized cybersecurity research and educational purposes only.**

- Passwords are hashed with bcryptjs (salt rounds: 10)
- Sessions are HTTPOnly and Secure (in production)
- Input validation on all endpoints
- Authorization checks for template ownership
- Admin-only operations are protected
- CORS properly configured

## disclaimer

**WARNING**: This tool is designed for authorized cybersecurity research, penetration testing, and educational purposes only. Unauthorized access to computer systems is illegal. Always ensure you have proper authorization before conducting any security assessments.

## License

ISC

## Future Enhancements

- [ ] MongoDB session store for production
- [ ] JWT token authentication alternative
- [ ] Advanced filtering and search
- [ ] Template versioning
- [ ] Execution history logging
- [ ] User permissions/teams
- [ ] Import/export templates
- [ ] Template cloning
- [ ] Audit logging
- [ ] Rate limiting
- [ ] API documentation (Swagger/OpenAPI)

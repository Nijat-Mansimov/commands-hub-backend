# Attack Command Repository - API Examples

This file contains practical examples of how to use the API.

## Table of Contents
1. [User Registration & Authentication](#user-registration--authentication)
2. [Template Management](#template-management)
3. [Command Generation](#command-generation)
4. [Admin Operations](#admin-operations)

---

## User Registration & Authentication

### Example 1: Register a New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "pentester_001",
    "email": "pentester@example.com",
    "password": "SecurePass123!",
    "passwordConfirm": "SecurePass123!"
  }'
```

**Success Response (201)**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "pentester_001",
    "email": "pentester@example.com",
    "role": "user"
  }
}
```

### Example 2: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "username": "pentester_001",
    "password": "SecurePass123!"
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "Logged in successfully",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "pentester_001",
    "email": "pentester@example.com",
    "role": "user"
  }
}
```

### Example 3: Get Current User Info

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -b cookies.txt
```

### Example 4: Get User Profile with Statistics

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -b cookies.txt
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "pentester_001",
    "email": "pentester@example.com",
    "role": "user",
    "createdAt": "2024-03-02T10:30:00.000Z"
  },
  "stats": {
    "totalTemplates": 3,
    "approvedTemplates": 2
  }
}
```

### Example 5: Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

---

## Template Management

### Example 1: Get All Available Templates

```bash
curl -X GET http://localhost:3000/api/templates \
  -b cookies.txt
```

**Response**:
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  },
  "categories": ["Web Attack", "Active Directory", "Network", "Exploitation", "Enumeration"]
}
```

### Example 2: Get Templates with Pagination

```bash
curl -X GET "http://localhost:3000/api/templates?page=2&limit=5" \
  -b cookies.txt
```

### Example 3: Filter Templates by Category

```bash
curl -X GET "http://localhost:3000/api/templates?category=Active%20Directory" \
  -b cookies.txt
```

### Example 4: Search Templates

```bash
curl -X GET "http://localhost:3000/api/templates?search=kerberos" \
  -b cookies.txt
```

### Example 5: Combine Filters

```bash
curl -X GET "http://localhost:3000/api/templates?category=Network&search=nmap&page=1&limit=10" \
  -b cookies.txt
```

### Example 6: Get Available Categories

```bash
curl -X GET http://localhost:3000/api/templates/categories/list \
  -b cookies.txt
```

### Example 7: Create New Template - NMAP Scan

```bash
curl -X POST http://localhost:3000/api/templates \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "NMAP Full Network Scan",
    "description": "Comprehensive network discovery and port scanning",
    "category": "Network",
    "difficulty": "Beginner",
    "commandTemplate": "nmap -A -p- {{targetIP}}",
    "tags": ["network", "enumeration", "nmap"],
    "requiredFields": [
      {
        "fieldName": "targetIP",
        "fieldType": "ip",
        "description": "Target IP address or network (e.g., 192.168.1.0/24)",
        "required": true
      }
    ]
  }'
```

**Response (201)**:
```json
{
  "success": true,
  "message": "Template created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "NMAP Full Network Scan",
    "description": "Comprehensive network discovery and port scanning",
    "category": "Network",
    "commandTemplate": "nmap -A -p- {{targetIP}}",
    "requiredFields": [...],
    "createdBy": {
      "_id": "507f1f77bcf86cd799439011",
      "username": "pentester_001"
    },
    "approved": false,
    "tags": ["network", "enumeration", "nmap"],
    "difficulty": "Beginner",
    "createdAt": "2024-03-02T11:00:00.000Z"
  }
}
```

### Example 8: Create Template - SMB Brute Force

```bash
curl -X POST http://localhost:3000/api/templates \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "SMB Brute Force Attack",
    "description": "Attempt SMB login with multiple credentials",
    "category": "Active Directory",
    "difficulty": "Intermediate",
    "commandTemplate": "crackmapexec smb {{targetIP}} -u {{username}} -p {{password}} --continue-on-success",
    "tags": ["smb", "brute-force", "active-directory", "credential-spray"],
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
        "description": "Username to attempt",
        "required": true
      },
      {
        "fieldName": "password",
        "fieldType": "password",
        "description": "Password to attempt",
        "required": true
      }
    ]
  }'
```

### Example 9: Create Template - SQL Injection Payload

```bash
curl -X POST http://localhost:3000/api/templates \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "SQL Injection Test Payload",
    "description": "Test SQL injection vulnerability",
    "category": "Web Attack",
    "difficulty": "Intermediate",
    "commandTemplate": "curl -X POST http://{{targetURL}}/login -d \"username={{payload}}&password=test\"",
    "tags": ["sql-injection", "web", "database"],
    "requiredFields": [
      {
        "fieldName": "targetURL",
        "fieldType": "url",
        "description": "Target web application URL",
        "required": true
      },
      {
        "fieldName": "payload",
        "fieldType": "text",
        "description": "SQL injection payload",
        "required": true
      }
    ]
  }'
```

### Example 10: Get Single Template

```bash
curl -X GET http://localhost:3000/api/templates/507f1f77bcf86cd799439012 \
  -b cookies.txt
```

### Example 11: Update Template

```bash
curl -X PUT http://localhost:3000/api/templates/507f1f77bcf86cd799439012 \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "NMAP Full Network Scan (Updated)",
    "description": "Enhanced network discovery with service detection",
    "commandTemplate": "nmap -A -p- --version-intensity 9 {{targetIP}}"
  }'
```

### Example 12: Delete Template

```bash
curl -X DELETE http://localhost:3000/api/templates/507f1f77bcf86cd799439012 \
  -b cookies.txt
```

---

## Command Generation

### Example 1: Generate NMAP Command

```bash
curl -X POST http://localhost:3000/api/templates/507f1f77bcf86cd799439012/generate \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "targetIP": "192.168.1.100"
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "Commands generated successfully",
  "data": {
    "templateId": "507f1f77bcf86cd799439012",
    "templateName": "NMAP Full Network Scan",
    "category": "Network",
    "generatedCommand": "nmap -A -p- 192.168.1.100",
    "placeholderValues": {
      "targetIP": "192.168.1.100"
    }
  }
}
```

### Example 2: Generate SMB Brute Force Command

```bash
curl -X POST http://localhost:3000/api/templates/507f1f77bcf86cd799439013/generate \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "targetIP": "192.168.1.50",
    "username": "administrator",
    "password": "P@ssw0rd123"
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "Commands generated successfully",
  "data": {
    "templateId": "507f1f77bcf86cd799439013",
    "templateName": "SMB Brute Force Attack",
    "category": "Active Directory",
    "generatedCommand": "crackmapexec smb 192.168.1.50 -u administrator -p P@ssw0rd123 --continue-on-success",
    "placeholderValues": {
      "targetIP": "192.168.1.50",
      "username": "administrator",
      "password": "P@ssw0rd123"
    }
  }
}
```

### Example 3: Generate SQL Injection Command

```bash
curl -X POST http://localhost:3000/api/templates/507f1f77bcf86cd799439014/generate \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "targetURL": "example.com",
    "payload": "admin' OR '1'='1"
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "Commands generated successfully",
  "data": {
    "templateId": "507f1f77bcf86cd799439014",
    "templateName": "SQL Injection Test Payload",
    "category": "Web Attack",
    "generatedCommand": "curl -X POST http://example.com/login -d \"username=admin' OR '1'='1&password=test\"",
    "placeholderValues": {
      "targetURL": "example.com",
      "payload": "admin' OR '1'='1"
    }
  }
}
```

---

## Admin Operations

### Example 1: Get All Templates (Admin View)

```bash
curl -X GET http://localhost:3000/api/admin/templates \
  -b cookies.txt
```

**Response** (includes all templates, approved or not):
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "NMAP Full Network Scan",
      "category": "Network",
      "createdBy": {...},
      "approved": false,
      "approvedBy": null,
      "createdAt": "2024-03-02T11:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 10,
    "pages": 1
  }
}
```

### Example 2: Approve Template

```bash
curl -X POST http://localhost:3000/api/admin/templates/507f1f77bcf86cd799439012/approve \
  -b cookies.txt
```

**Response**:
```json
{
  "success": true,
  "message": "Template approved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "NMAP Full Network Scan",
    "approved": true,
    "approvedBy": {
      "_id": "507f1f77bcf86cd799439001",
      "username": "admin_user"
    }
  }
}
```

### Example 3: Reject Template

```bash
curl -X POST http://localhost:3000/api/admin/templates/507f1f77bcf86cd799439012/reject \
  -b cookies.txt
```

---

## Error Examples

### Missing Required Fields

```bash
curl -X POST http://localhost:3000/api/templates/507f1f77bcf86cd799439012/generate \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "something": "else"
  }'
```

**Response (400)**:
```json
{
  "success": false,
  "message": "Missing required fields",
  "missingFields": ["targetIP"]
}
```

### Unauthorized (Not Logged In)

```bash
curl -X GET http://localhost:3000/api/templates
```

**Response (Not authenticated)**:
```json
{
  "success": false,
  "authenticated": false
}
```

### Insufficient Permissions

```bash
curl -X DELETE http://localhost:3000/api/templates/507f1f77bcf86cd799439012 \
  -b cookies.txt
```

**Response (403)** - If you don't own the template and aren't an admin:
```json
{
  "success": false,
  "message": "You do not have permission to delete this template"
}
```

---

## Tips

1. **Save Cookies**: Use `-c cookies.txt` when logging in and `-b cookies.txt` for subsequent requests
2. **Pretty Print JSON**: Add `| jq` to the end of curl commands (requires jq)
3. **Debug Requests**: Add `-v` flag to curl for verbose output
4. **Test Values**: Always test with safe, controlled values first
5. **Permissions**: Remember that only the creator or an admin can edit/delete templates

---

## Using Python/JavaScript Clients

### JavaScript Fetch Example

```javascript
// Register
const response = await fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'pentester_001',
    email: 'pentester@example.com',
    password: 'SecurePass123!',
    passwordConfirm: 'SecurePass123!'
  })
});

const data = await response.json();
console.log(data);
```

### Python Requests Example

```python
import requests

session = requests.Session()

# Register
response = session.post('http://localhost:3000/api/auth/register', json={
    'username': 'pentester_001',
    'email': 'pentester@example.com',
    'password': 'SecurePass123!',
    'passwordConfirm': 'SecurePass123!'
})

print(response.json())

# Get templates
response = session.get('http://localhost:3000/api/templates')
print(response.json())

# Generate command
response = session.post(
    'http://localhost:3000/api/templates/{template_id}/generate',
    json={'targetIP': '192.168.1.100'}
)

print(response.json())
```


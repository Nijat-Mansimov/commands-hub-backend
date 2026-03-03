# Database Schema Reference

Complete documentation of MongoDB schemas used in the Attack Command Repository.

## User Schema

Stores user account information with secure password hashing.

```javascript
{
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3
    // Example: "pentester_001", "security_researcher"
  },
  email: {
    type: String,
    required: true,
    unique: true,
    // Valid email format required
    // Example: "user@example.com"
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    // Hashed using bcryptjs before storage
    // NOT returned by default in queries
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
    // 'user': Regular user, can create/manage own templates
    // 'admin': Can approve/reject/delete any template
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### User Model Methods

#### `comparePassword(enteredPassword: string): Promise<boolean>`
Compare a plaintext password with the hashed password in database.

```javascript
const user = await User.findOne({ username: 'pentester_001' }).select('+password');
const isMatch = await user.comparePassword('DemoPassword123!');
// Returns: true or false
```

### User Validation Rules

| Field | Rule | Example |
|-------|------|---------|
| username | 3+ chars, letters/numbers/hyphens/underscores | pentester_001 |
| email | Valid email format | user@example.com |
| password | Min 6 characters | SecurePass123! |
| role | 'user' or 'admin' | user |

---

## AttackTemplate Schema

Stores attack command templates with dynamic placeholder fields.

```javascript
{
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
    // Example: "SMB Enumeration", "NMAP Network Scan"
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
    // Example: "Enumerate SMB shares and users from a target server"
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Web Attack',
      'Active Directory',
      'Network',
      'Exploitation',
      'Enumeration',
      'Privilege Escalation',
      'Post-Exploitation',
      'Social Engineering'
    ]
    // One of the predefined categories
  },
  requiredFields: [
    {
      fieldName: {
        type: String,
        required: true
        // Example: "targetIP", "username", "domain"
      },
      fieldType: {
        type: String,
        enum: ['text', 'number', 'email', 'password', 'url', 'ip'],
        default: 'text'
        // Type hint for frontend validation/input
      },
      description: String,
      // Example: "Target IP address or hostname"
      required: {
        type: Boolean,
        default: true
        // Whether field must be provided for command generation
      }
    }
  ],
  commandTemplate: {
    type: String,
    required: true
    // String with {{placeholder}} syntax
    // Example: "nmap -p 445 {{targetIP}} -u {{username}}"
  },
  createdBy: {
    type: ObjectId,
    ref: 'User',
    required: true
    // Reference to the user who created this template
  },
  approved: {
    type: Boolean,
    default: false
    // false: Requires admin approval before visible to other users
    // true: Visible to all authenticated users
  },
  approvedBy: {
    type: ObjectId,
    ref: 'User'
    // Reference to admin who approved this template
    // null if not approved yet
  },
  tags: [String],
  // Example: ["smb", "enumeration", "active-directory"]
  // Used for searching and filtering
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Intermediate'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### AttackTemplate Validation Rules

| Field | Rule | Example |
|-------|------|---------|
| name | 3-100 chars | NMAP Full Scan |
| category | One of predefined | Network |
| commandTemplate | Required, non-empty | nmap {{targetIP}} |
| requiredFields | Array of field objects | See below |
| difficulty | Beginner/Intermediate/Advanced | Intermediate |
| approved | Boolean | false |

### Required Field Object Structure

Each required field in a template describes an input parameter:

```json
{
  "fieldName": "targetIP",
  "fieldType": "ip",
  "description": "Target IP address",
  "required": true
}
```

#### Field Types

| Type | Validation | Example |
|------|-----------|---------|
| text | Any string | admin_user |
| number | Numeric only | 443 |
| email | Valid email format | user@example.com |
| password | Any string (no specific format) | P@ssw0rd |
| url | Valid URL format | https://example.com |
| ip | Valid IP address (v4/v6) | 192.168.1.100 |

---

## Placeholder Replacement Logic

### Template Syntax

Templates use double-braced placeholders that are replaced with actual values:

```
Template:   "nmap -sV -p 445 {{targetIP}} -u {{username}}"
Input:      { targetIP: "192.168.1.100", username: "admin" }
Output:     "nmap -sV -p 445 192.168.1.100 -u admin"
```

### Placeholder Rules

1. **Format**: `{{fieldName}}` (case-sensitive)
2. **Spaces**: `{{ fieldName }}` with spaces is also valid
3. **Multiple**: Same placeholder can appear multiple times
4. **Unused**: If a value isn't provided, placeholder remains unchanged

### Examples

#### Example 1: Simple Network Scan

Template:
```
nmap -A {{targetIP}} -p {{ports}}
```

Input:
```json
{
  "targetIP": "10.0.0.1",
  "ports": "22,80,443"
}
```

Output:
```
nmap -A 10.0.0.1 -p 22,80,443
```

#### Example 2: SMB Credentials Attack

Template:
```
crackmapexec smb {{targetIP}} -u {{username}} -p {{password}} --shares
```

Input:
```json
{
  "targetIP": "192.168.100.50",
  "username": "domain\\administrator",
  "password": "MyP@ssw0rd!"
}
```

Output:
```
crackmapexec smb 192.168.100.50 -u domain\administrator -p MyP@ssw0rd! --shares
```

#### Example 3: Web Application Attack

Template:
```
sqlmap -u "http://{{targetURL}}/page?id=1" --data="username={{username}}&password={{password}}" -p id --batch --dbms={{dbms}}
```

Input:
```json
{
  "targetURL": "vulnerable-app.local",
  "username": "admin",
  "password": "admin",
  "dbms": "MySQL"
}
```

Output:
```
sqlmap -u "http://vulnerable-app.local/page?id=1" --data="username=admin&password=admin" -p id --batch --dbms=MySQL
```

---

## Database Relationships

### User ↔ AttackTemplate

```
User (1) ──── (Many) AttackTemplate
  │
  └─ createdBy [User._id]
  └─ approvedBy [User._id]
```

- Each template is created by exactly one user (`createdBy`)
- Each template can be approved by at most one admin (`approvedBy`)
- One user can create multiple templates

### Approval Workflow

```
1. User creates template
   └─ approved: false
   └─ approvedBy: null

2. Admin approves template
   └─ approved: true
   └─ approvedBy: admin_user_id

   [Template now visible to all users]

3. Admin rejects template
   └─ approved: false
   └─ approvedBy: null

   [Template hidden from other users]
```

---

## Sample Data

### Sample User Documents

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439001"),
  "username": "pentester_001",
  "email": "pentester@example.com",
  "password": "$2a$10$...", // bcrypt hash
  "role": "user",
  "createdAt": ISODate("2024-03-02T10:00:00Z"),
  "updatedAt": ISODate("2024-03-02T10:00:00Z")
}
```

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439010"),
  "username": "admin_user",
  "email": "admin@example.com",
  "password": "$2a$10$...", // bcrypt hash
  "role": "admin",
  "createdAt": ISODate("2024-03-02T08:00:00Z"),
  "updatedAt": ISODate("2024-03-02T08:00:00Z")
}
```

### Sample AttackTemplate Documents

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "NMAP Full Network Scan",
  "description": "Comprehensive network discovery and port scanning",
  "category": "Network",
  "commandTemplate": "nmap -A -p- {{targetIP}}",
  "requiredFields": [
    {
      "fieldName": "targetIP",
      "fieldType": "ip",
      "description": "Target IP address or network",
      "required": true
    }
  ],
  "createdBy": ObjectId("507f1f77bcf86cd799439001"),
  "approved": true,
  "approvedBy": ObjectId("507f1f77bcf86cd799439010"),
  "tags": ["network", "enumeration", "nmap"],
  "difficulty": "Beginner",
  "createdAt": ISODate("2024-03-02T11:00:00Z"),
  "updatedAt": ISODate("2024-03-02T11:00:00Z")
}
```

```json
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "name": "SMB Brute Force Attack",
  "description": "Attempt SMB login with provided credentials",
  "category": "Active Directory",
  "commandTemplate": "crackmapexec smb {{targetIP}} -u {{username}} -p {{password}} --continue-on-success",
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
  ],
  "createdBy": ObjectId("507f1f77bcf86cd799439001"),
  "approved": false,
  "approvedBy": null,
  "tags": ["smb", "brute-force", "active-directory"],
  "difficulty": "Intermediate",
  "createdAt": ISODate("2024-03-02T12:00:00Z"),
  "updatedAt": ISODate("2024-03-02T12:00:00Z")
}
```

---

## Indexing Strategy

For optimal performance, these indexes are recommended:

```javascript
// User indexes
db.users.createIndex({ username: 1 }, { unique: true })
db.users.createIndex({ email: 1 }, { unique: true })

// AttackTemplate indexes
db.attacktemplates.createIndex({ createdBy: 1 })
db.attacktemplates.createIndex({ approved: 1 })
db.attacktemplates.createIndex({ category: 1 })
db.attacktemplates.createIndex({ tags: 1 })
db.attacktemplates.createIndex({ name: "text", description: "text" }) // For search
db.attacktemplates.createIndex({ createdAt: -1 }) // For sorting
```

---

## Query Examples

### Find User by Username

```javascript
const user = await User.findOne({ username: 'pentester_001' });
```

### Find All Approved Templates by Category

```javascript
const templates = await AttackTemplate.find({
  approved: true,
  category: 'Network'
})
  .populate('createdBy', 'username')
  .sort({ createdAt: -1 });
```

### Find Unapproved Templates (Admin)

```javascript
const pending = await AttackTemplate.find({ approved: false })
  .populate('createdBy', 'username')
  .sort({ createdAt: 1 });
```

### Search Templates

```javascript
const results = await AttackTemplate.find({
  $or: [
    { name: { $regex: 'nmap', $options: 'i' } },
    { description: { $regex: 'nmap', $options: 'i' } },
    { tags: { $in: [new RegExp('nmap', 'i')] } }
  ]
});
```

### Count User's Templates

```javascript
const count = await AttackTemplate.countDocuments({
  createdBy: userId
});
```

### Get Templates by Difficulty

```javascript
const advanced = await AttackTemplate.find({
  approved: true,
  difficulty: 'Advanced'
});
```

---

## Data Validation Rules Summary

### User
- username: 3-255 chars, alphanumeric + hyphen/underscore, lowercase, unique
- email: Valid email format, unique
- password: Min 6 chars, hashed with bcrypt
- role: 'user' or 'admin'

### AttackTemplate
- name: 3-100 chars, required
- category: One of 8 predefined categories
- commandTemplate: Required, contains placeholders with {{fieldName}} syntax
- requiredFields: Array of field definitions, each with fieldName, fieldType, description
- difficulty: 'Beginner', 'Intermediate', or 'Advanced'

---

## Migration/Backup

### Export Collections

```bash
# Export users
mongoexport -d attack-command-repo -c users -o users.json

# Export templates
mongoexport -d attack-command-repo -c attacktemplates -o templates.json
```

### Import Collections

```bash
# Import users
mongoimport -d attack-command-repo -c users users.json

# Import templates
mongoimport -d attack-command-repo -c attacktemplates templates.json
```


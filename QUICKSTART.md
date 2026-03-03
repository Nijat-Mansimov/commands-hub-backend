# Quick Start Guide

Get the Attack Command Repository API up and running in 5 minutes.

## Prerequisites

- Node.js v14+ installed
- MongoDB running (locally or cloud connection)
- npm installed

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

This installs:
- Express.js (web framework)
- Mongoose (MongoDB ODM)
- Passport.js (authentication)
- bcryptjs (password hashing)
- dotenv (environment variables)

## Step 2: Configure Environment

Copy and configure the `.env` file:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Or manually create .env with:
MONGODB_URI=mongodb://localhost:27017/attack-command-repo
PORT=3000
NODE_ENV=development
SESSION_SECRET=your-super-secret-key-here
CORS_ORIGIN=*
```

**For MongoDB**:
- **Local**: Keep default `mongodb://localhost:27017/attack-command-repo`
- **Cloud (MongoDB Atlas)**: 
  ```
  mongodb+srv://username:password@cluster.mongodb.net/attack-command-repo
  ```

## Step 3: Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

You should see:

```
╔════════════════════════════════════════════╗
║  Attack Command Repository API             ║
║  Running on http://localhost:3000                  ║
║  Environment: DEVELOPMENT                  ║
╚════════════════════════════════════════════╝
```

## Step 4: Test the API

Open a new terminal and test the health endpoint:

```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-03-02T12:00:00.000Z",
  "authenticated": false
}
```

## Step 5: Create Your First User

### Using curl:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "demo_user",
    "email": "demo@example.com",
    "password": "DemoPassword123!",
    "passwordConfirm": "DemoPassword123!"
  }'
```

### Using PowerShell:

```powershell
$body = @{
    username = "demo_user"
    email = "demo@example.com"
    password = "DemoPassword123!"
    passwordConfirm = "DemoPassword123!"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:3000/api/auth/register" `
    -Method POST `
    -Headers @{"Content-Type"="application/json"} `
    -Body $body
```

## Step 6: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "username": "demo_user",
    "password": "DemoPassword123!"
  }'
```

The `-c cookies.txt` saves the session cookie for authenticated requests.

## Step 7: Create Your First Template

```bash
curl -X POST http://localhost:3000/api/templates \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "name": "Basic Port Scan",
    "description": "Scan common ports on target",
    "category": "Network",
    "commandTemplate": "nmap -p 22,80,443,3306 {{targetIP}}",
    "difficulty": "Beginner",
    "tags": ["network", "enumeration"],
    "requiredFields": [
      {
        "fieldName": "targetIP",
        "fieldType": "ip",
        "description": "Target IP address",
        "required": true
      }
    ]
  }'
```

## Step 8: Generate a Command

Get the template ID from the previous response, then:

```bash
curl -X POST http://localhost:3000/api/templates/{TEMPLATE_ID}/generate \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "targetIP": "192.168.1.100"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "Commands generated successfully",
  "data": {
    "templateId": "...",
    "templateName": "Basic Port Scan",
    "category": "Network",
    "generatedCommand": "nmap -p 22,80,443,3306 192.168.1.100",
    "placeholderValues": {
      "targetIP": "192.168.1.100"
    }
  }
}
```

## Next Steps

1. **Read the Full Documentation**: See [README.md](README.md)
2. **Explore Examples**: Check [EXAMPLES.md](EXAMPLES.md) for more API usage
3. **Create More Templates**: Build a library of attack templates
4. **Admin Setup**: Create an admin user and approve templates
5. **Production Deployment**: Configure for production environment

## Common Commands

```bash
# Install dependencies
npm install

# Start development server (with auto-reload)
npm run dev

# Start production server
npm start

# View running processes
Get-Process node  # Windows
ps aux | grep node  # Linux/Mac
```

## Troubleshooting

### MongoDB Connection Error

**Error**: `MongooseError: connect ECONNREFUSED`

**Solution**: 
- Ensure MongoDB is running
- Check connection string in `.env`
- Verify MongoDB URL matches your setup

### Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**: 
- Change PORT in `.env` to another port (3001, 3002, etc.)
- Or kill the process using port 3000:
  ```bash
  # Windows
  netstat -ano | findstr :3000
  taskkill /PID {PID} /F
  
  # Linux/Mac
  lsof -i :3000
  kill -9 {PID}
  ```

### Authentication Not Working

**Error**: `Authentication required` for authenticated endpoints

**Solution**:
- Make sure you're logged in first
- Include `-b cookies.txt` in curl commands
- Check that session cookie is saved

### Template Not Approved

**Note**: New templates require admin approval before visibility and usage by other users.

**Solution**: 
- Log in as admin user
- Use `/admin/templates/:id/approve` endpoint
- Or set `approved: true` in database for testing

## File Structure

```
backend/
├── app.js                      # Main entry point
├── package.json               
├── README.md                  # Full documentation
├── EXAMPLES.md                # API usage examples
├── QUICKSTART.md             # This file
├── .env                       # Environment config (create from .env.example)
├── .env.example               
├── .gitignore
├── config/
│   ├── database.js           # MongoDB connection
│   └── passport.js           # Authentication config
├── controllers/
│   ├── authController.js     # User auth logic
│   └── templateController.js # Template management
├── models/
│   ├── User.js               # User schema
│   └── AttackTemplate.js     # Template schema
├── routes/
│   ├── auth.js              # Auth endpoints (/api/auth/*)
│   └── templates.js         # Template endpoints (/api/templates/*)
├── middleware/
│   └── auth.js              # Authentication middleware
└── utils/
    └── placeholder.js       # Placeholder replacement logic
```

## API Quick Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Get current user |
| GET | /api/auth/profile | Get profile with stats |
| GET | /api/templates | List approved templates |
| POST | /api/templates | Create template |
| GET | /api/templates/:id | Get template details |
| POST | /api/templates/:id/generate | Generate commands |
| PUT | /api/templates/:id | Update template |
| DELETE | /api/templates/:id | Delete template |
| GET | /api/templates/categories/list | Get categories |
| GET | /api/admin/templates | Admin: list all templates |
| POST | /api/admin/templates/:id/approve | Admin: approve template |
| POST | /api/admin/templates/:id/reject | Admin: reject template |

## Testing the API

### Using Postman

1. Open Postman
2. Create new requests for each endpoint
3. Set authentication method to "Cookie"
4. Login first, then use other endpoints

### Using VS Code REST Client

Install the "REST Client" extension and create an `test.http` file:

```http
### Health Check
GET http://localhost:3000/api/health

### Register
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "test_user",
  "email": "test@example.com",
  "password": "TestPassword123!",
  "passwordConfirm": "TestPassword123!"
}

### Login
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "test_user",
  "password": "TestPassword123!"
}
```

## Support

For issues or questions:
1. Check [README.md](README.md) for detailed documentation
2. Review [EXAMPLES.md](EXAMPLES.md) for usage patterns
3. Check error messages in server console
4. Verify `.env` configuration
5. Ensure MongoDB is running and connected

---

**Ready to go!** Start creating attack templates and generating commands. 🚀

# IFA Labs Dashboard API

A robust Node.js Express API built with TypeScript, featuring Firebase integration, JWT authentication with OTP verification, role-based access control, and comprehensive dashboard management.

**Powered by Firebase 🔥 & JWT Security 🔐**

## ✨ Features

- **🚀 TypeScript**: Full TypeScript support with strict type checking
- **🔥 Firebase Integration**: Firestore database, Authentication, and Storage
- **🔐 JWT Authentication**: Secure JWT-based authentication with 7-day token expiration
- **📧 OTP Verification**: Email-based OTP verification for signup, login, and password reset
- **🛡️ Security**: Role-based access control, rate limiting, and account protection
- **📊 Dashboard APIs**: Comprehensive dashboard data management
- **📈 Real-time Metrics**: System monitoring and analytics
- **🔒 Rate Limiting**: Subscription-based API rate limiting
- **📝 API Documentation**: Swagger/OpenAPI documentation
- **🧪 Testing**: Jest testing framework with coverage
- **📦 Docker Ready**: Containerized deployment support
- **☁️ Vercel Ready**: Optimized for Vercel deployment

## 🔐 JWT Authentication System

### Authentication Flow

#### 1. **Signup Process** (3-Step Verification)
```
Step 1: POST /api/auth/signup/initiate
├── Send email + displayName
├── Generate OTP (6 digits)
├── Create user (inactive, unverified)
└── Send OTP via email

Step 2: POST /api/auth/signup/verify-email  
├── Send email + OTP
├── Verify OTP (10 min expiry)
├── Mark email as verified
└── Send success notification

Step 3: POST /api/auth/signup/set-password
├── Send email + password (min 8 chars)
├── Hash password with bcrypt
├── Activate account
└── Send completion notification
```

#### 2. **Login Process** (2-Step Verification)
```
Step 1: POST /api/auth/login
├── Send email + password
├── Verify credentials
├── Generate login OTP
├── Store OTP (10 min expiry)
└── Send OTP via email

Step 2: POST /api/auth/login/verify-otp
├── Send email + OTP
├── Verify OTP
├── Clear OTP
├── Generate JWT token (7 days)
└── Return user data + token
```

#### 3. **Password Reset Process** (3-Step Recovery)
```
Step 1: POST /api/auth/forgot-password
├── Send email
├── Generate reset OTP
├── Store OTP (10 min expiry)
└── Send OTP via email

Step 2: POST /api/auth/reset-password/verify-otp
├── Send email + OTP
├── Verify OTP
├── Generate reset token
└── Return reset token

Step 3: POST /api/auth/reset-password/set-new-password
├── Send reset token + new password
├── Verify token
├── Hash new password
└── Send completion notification
```

### Security Features

- **🔒 Account Protection**: Account locked after 5 failed login attempts (30 min lockout)
- **⏰ OTP Expiry**: All OTPs expire in 10 minutes
- **🔄 Token Refresh**: JWT tokens can be refreshed before expiration
- **📧 Email Verification**: Mandatory email verification before account activation
- **🔐 Password Security**: Bcrypt hashing with 12 salt rounds
- **🛡️ Rate Limiting**: Subscription-based API request limits

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/signup/initiate` | Start signup process | ❌ |
| `POST` | `/api/auth/signup/verify-email` | Verify email with OTP | ❌ |
| `POST` | `/api/auth/signup/set-password` | Set password after verification | ❌ |
| `POST` | `/api/auth/login` | Start login process | ❌ |
| `POST` | `/api/auth/login/verify-otp` | Complete login with OTP | ❌ |
| `POST` | `/api/auth/forgot-password` | Request password reset | ❌ |
| `POST` | `/api/auth/reset-password/verify-otp` | Verify reset OTP | ❌ |
| `POST` | `/api/auth/reset-password/set-new-password` | Set new password | ❌ |
| `GET` | `/api/auth/profile` | Get user profile | ✅ |
| `PUT` | `/api/auth/profile` | Update user profile | ✅ |
| `POST` | `/api/auth/logout` | Logout user | ✅ |
| `POST` | `/api/auth/refresh-token` | Refresh JWT token | ✅ |
| `GET` | `/api/auth/users` | Get all users (Admin only) | ✅ |

## 🔥 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Firestore Database
4. Enable Authentication (Email/Password, Google, etc.)
5. Enable Storage (if needed)

### 2. Get Firebase Configuration
1. Go to Project Settings > Service Accounts
2. Generate new private key (download JSON file)
3. Copy the configuration values

### 3. Configure Environment Variables
```bash
cp env.example .env
```

Edit `.env` with your Firebase configuration:

**For Development (Service Account):**
```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id",...}
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

**For Production/Vercel (Default Credentials):**
```env
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_DATABASE_URL=https://your-project-id.firebaseio.com
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
```

## 📧 Email Configuration

### SMTP Setup
Configure your email service in `.env`:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

### Supported Email Providers
- **Gmail**: Use App Password (2FA required)
- **Outlook/Hotmail**: Use App Password
- **SendGrid**: Use API key
- **Mailgun**: Use API key
- **Custom SMTP**: Any SMTP server

### Email Templates
- **Signup OTP**: Welcome email with verification code
- **Login OTP**: Login verification code
- **Password Reset OTP**: Password recovery code
- **Email Verified**: Confirmation of successful verification
- **Password Set**: Confirmation of password setup

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase project
- SMTP email service

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd ifa-labs-dashboard-api

# Install dependencies
npm install

# Copy environment variables
cp env.example .env

# Edit .env with your configuration
# Firebase, JWT, and SMTP settings

# Build the project
npm run build

# Start development server
npm run dev
```

### Environment Variables
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_KEY=...
FIREBASE_PROJECT_ID=...
FIREBASE_DATABASE_URL=...
FIREBASE_STORAGE_BUCKET=...

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com
```

## 📚 API Documentation

### Authentication Headers
```http
Authorization: Bearer <jwt-token>
```

### Example API Calls

#### Signup Flow
```bash
# 1. Initiate signup
curl -X POST http://localhost:3001/api/auth/signup/initiate \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","displayName":"John Doe"}'

# 2. Verify email (check email for OTP)
curl -X POST http://localhost:3001/api/auth/signup/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"123456"}'

# 3. Set password
curl -X POST http://localhost:3001/api/auth/signup/set-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepass123"}'
```

#### Login Flow
```bash
# 1. Login with credentials
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepass123"}'

# 2. Complete login with OTP (check email for OTP)
curl -X POST http://localhost:3001/api/auth/login/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"123456"}'
```

#### Protected Endpoints
```bash
# Get user profile
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer <jwt-token>"

# Refresh token
curl -X POST http://localhost:3001/api/auth/refresh-token \
  -H "Authorization: Bearer <jwt-token>"
```

## 🏗️ Project Structure

```
src/
├── config/
│   ├── firebase.ts          # Firebase configuration
│   └── index.ts             # Environment variables
├── middleware/
│   ├── auth.ts              # JWT authentication middleware
│   ├── errorHandler.ts      # Global error handling
│   └── notFoundHandler.ts   # 404 handling
├── routes/
│   ├── auth.ts              # Authentication routes
│   ├── dashboard.ts         # Dashboard API routes
│   └── health.ts            # Health check routes
├── services/
│   ├── firebase.ts          # Firebase service layer
│   ├── emailService.ts      # Email service with templates
│   └── jwtService.ts        # JWT token management
├── types/
│   └── firebase.ts          # TypeScript interfaces
└── index.ts                 # Main application entry
```

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

### Testing
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 🚀 Deployment

### Vercel Deployment
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Docker Deployment
```bash
# Build Docker image
docker build -t ifa-labs-dashboard-api .

# Run container
docker run -p 3001:3001 ifa-labs-dashboard-api
```

### Environment Variables for Production
```env
NODE_ENV=production
JWT_SECRET=your-production-jwt-secret
FIREBASE_PROJECT_ID=your-production-project
SMTP_HOST=your-production-smtp
SMTP_USER=your-production-email
SMTP_PASS=your-production-password
```

## 🔒 Security Considerations

### JWT Security
- **Secret Key**: Use strong, unique JWT secret
- **Token Expiry**: 7-day expiration with refresh capability
- **HTTPS Only**: Always use HTTPS in production
- **Token Storage**: Store tokens securely (httpOnly cookies recommended)

### OTP Security
- **Expiry**: 10-minute OTP expiration
- **Rate Limiting**: Prevent OTP abuse
- **Email Security**: Use secure SMTP connections
- **OTP Storage**: Temporary storage in database

### Account Protection
- **Failed Attempts**: Account lockout after 5 failed logins
- **Lockout Duration**: 30-minute temporary lockout
- **Password Requirements**: Minimum 8 characters
- **Email Verification**: Mandatory before account activation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation
- Review the authentication flow examples

---

**Built with ❤️ using Node.js, Express, TypeScript, Firebase, and JWT**

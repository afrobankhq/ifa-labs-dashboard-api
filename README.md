# IFA Labs Dashboard API

A robust Node.js Express API written in TypeScript, designed to provide backend services for the IFA Labs Dashboard frontend application. **Now with Firebase integration for scalable cloud database and authentication.**

## 🚀 Features

- **TypeScript**: Full TypeScript support with strict type checking
- **Express.js**: Fast, unopinionated web framework for Node.js
- **Firebase Integration**: Cloud Firestore database, Authentication, and Storage
- **Security**: Built-in security middleware (Helmet, CORS, Rate Limiting, Firebase Auth)
- **Performance**: Compression and optimization middleware
- **Logging**: Structured logging with configurable levels
- **Error Handling**: Comprehensive error handling and validation
- **API Documentation**: Well-documented REST endpoints
- **Testing**: Jest testing framework setup
- **Code Quality**: ESLint configuration for consistent code style
- **Role-Based Access Control**: User roles and subscription-based permissions
- **Real-time Database**: Firestore for scalable data storage

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager
- Firebase project (for database and authentication)

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

## 🛠️ Installation

1. **Clone the repository** (if not already done):
   ```bash
   cd ifa-labs-dashboard-api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Firebase configuration** (see Firebase Setup above)

4. **Set up environment variables**:
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```
This starts the server with hot-reload using `ts-node-dev`.

### Production Build
```bash
npm run build
npm start
```

### Testing
```bash
npm test
```

### Linting
```bash
npm run lint
npm run lint:fix
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `GET /api/auth/profile` - Get user profile (authenticated)
- `PUT /api/auth/profile` - Update user profile (authenticated)
- `PUT /api/auth/users/:userId/subscription` - Update subscription (admin)
- `GET /api/auth/users` - Get all users (admin)
- `PATCH /api/auth/users/:userId/status` - Activate/deactivate user (admin)
- `DELETE /api/auth/users/:userId` - Delete user (admin)

### Health Check
- `GET /api/health` - Basic health status
- `GET /api/health/detailed` - Detailed system information

### Dashboard
- `GET /api/dashboard/overview` - Dashboard overview statistics (authenticated)
- `GET /api/dashboard/users/stats` - User statistics (admin/moderator)
- `GET /api/dashboard/projects` - Project data with pagination (authenticated)
- `POST /api/dashboard/projects` - Create new project (admin)
- `PUT /api/dashboard/projects/:id` - Update project (owner/admin)
- `GET /api/dashboard/analytics/revenue` - Revenue analytics (professional+)
- `GET /api/dashboard/metrics/system` - System performance metrics (admin)

### Root
- `GET /` - API information and status

## 🔐 Authentication & Authorization

### Firebase Authentication
- JWT-based authentication using Firebase ID tokens
- Include token in Authorization header: `Bearer <token>`

### User Roles
- **user**: Basic access to dashboard overview and projects
- **moderator**: Access to user statistics
- **admin**: Full access to all endpoints and user management

### Subscription Plans
- **free**: 1,000 API requests/month
- **developer**: 10,000 API requests/month
- **professional**: 100,000 API requests/month + revenue analytics
- **enterprise**: Unlimited requests + custom features

## 🔧 Configuration

The application uses environment variables for configuration. Key settings include:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | Server port |
| `NODE_ENV` | development | Environment mode |
| `CORS_ORIGIN` | http://localhost:3000 | Allowed CORS origin |
| `FIREBASE_PROJECT_ID` | - | Firebase project ID |
| `FIREBASE_DATABASE_URL` | - | Firestore database URL |
| `FIREBASE_STORAGE_BUCKET` | - | Firebase storage bucket |
| `RATE_LIMIT_WINDOW_MS` | 900000 | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | 100 | Max requests per window |
| `HELMET_ENABLED` | true | Security headers |
| `COMPRESSION_ENABLED` | true | Response compression |

## 🏗️ Project Structure

```
src/
├── config/          # Configuration files (including Firebase)
├── middleware/      # Express middleware (including Auth)
├── routes/          # API route handlers
├── services/        # Firebase service classes
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── index.ts         # Main application entry point
```

## 🗄️ Database Schema

The application uses Firebase Firestore with the following collections:

- **users**: User profiles and subscription information
- **projects**: Project data with status and progress tracking
- **revenue**: Revenue tracking and analytics
- **system_metrics**: Server and application metrics
- **api_logs**: API request logging and analytics
- **dashboard_overview**: Aggregated dashboard statistics
- **user_stats**: User analytics and statistics
- **revenue_analytics**: Revenue breakdown and trends

## 🧪 Testing

The project includes Jest testing framework with TypeScript support:

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm test -- --watch
```

## 📝 Development

### Adding New Routes

1. Create a new route file in `src/routes/`
2. Export the router
3. Import and use it in `src/index.ts`

### Adding New Firebase Collections

1. Define the interface in `src/models/firebase.ts`
2. Create a service class in `src/services/firebase.ts`
3. Use the service in your routes

### Authentication Middleware

Use the built-in authentication middleware:

```typescript
import { authenticateUser, requireRole, requireSubscription } from '../middleware/auth';

// Require authentication
router.get('/protected', authenticateUser, (req, res) => {});

// Require specific role
router.get('/admin-only', authenticateUser, requireRole(['admin']), (req, res) => {});

// Require subscription plan
router.get('/premium', authenticateUser, requireSubscription('professional'), (req, res) => {});
```

## 🔒 Security Features

- **Firebase Authentication**: Secure user authentication and authorization
- **Role-Based Access Control**: Granular permissions based on user roles
- **Subscription-Based Rate Limiting**: API limits based on subscription plans
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing configuration
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Request validation and sanitization
- **Error Handling**: Secure error responses (no sensitive data in production)

## 📊 Monitoring

The API includes built-in monitoring endpoints:

- Health checks for load balancers
- System metrics for monitoring tools
- Request logging with Morgan
- Custom logging utility for application events
- Firebase Analytics integration

## 🚀 Deployment

### Vercel Deployment

1. **Set Firebase environment variables** in Vercel dashboard
2. **Deploy**: The build should now succeed with Firebase integration

### Environment Variables
Ensure all required environment variables are set in production:
- `NODE_ENV=production`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_DATABASE_URL`
- `FIREBASE_STORAGE_BUCKET`

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation as needed
4. Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For questions or issues:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed information

---

**Built with ❤️ for IFA Labs Dashboard**

**Powered by Firebase 🔥**

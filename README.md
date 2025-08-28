# IFA Labs Dashboard API

A robust Node.js Express API written in TypeScript, designed to provide backend services for the IFA Labs Dashboard frontend application.

## 🚀 Features

- **TypeScript**: Full TypeScript support with strict type checking
- **Express.js**: Fast, unopinionated web framework for Node.js
- **Security**: Built-in security middleware (Helmet, CORS, Rate Limiting)
- **Performance**: Compression and optimization middleware
- **Logging**: Structured logging with configurable levels
- **Error Handling**: Comprehensive error handling and validation
- **API Documentation**: Well-documented REST endpoints
- **Testing**: Jest testing framework setup
- **Code Quality**: ESLint configuration for consistent code style

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository** (if not already done):
   ```bash
   cd ifa-labs-dashboard-api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=3001
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
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

### Health Check
- `GET /api/health` - Basic health status
- `GET /api/health/detailed` - Detailed system information

### Dashboard
- `GET /api/dashboard/overview` - Dashboard overview statistics
- `GET /api/dashboard/users/stats` - User statistics
- `GET /api/dashboard/projects` - Project data with pagination
- `GET /api/dashboard/analytics/revenue` - Revenue analytics
- `GET /api/dashboard/metrics/system` - System performance metrics

### Root
- `GET /` - API information and status

## 🔧 Configuration

The application uses environment variables for configuration. Key settings include:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3001 | Server port |
| `NODE_ENV` | development | Environment mode |
| `CORS_ORIGIN` | http://localhost:3000 | Allowed CORS origin |
| `RATE_LIMIT_WINDOW_MS` | 900000 | Rate limit window (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | 100 | Max requests per window |
| `HELMET_ENABLED` | true | Security headers |
| `COMPRESSION_ENABLED` | true | Response compression |

## 🏗️ Project Structure

```
src/
├── config/          # Configuration files
├── middleware/      # Express middleware
├── routes/          # API route handlers
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── index.ts         # Main application entry point
```

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

Example:
```typescript
// src/routes/example.ts
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Example route' });
});

export { router as exampleRouter };
```

### Adding New Middleware

1. Create middleware in `src/middleware/`
2. Import and use it in `src/index.ts`

### Error Handling

Use the built-in error handling utilities:

```typescript
import { createError } from './middleware/errorHandler';

// Create and throw errors
throw createError('User not found', 404);
```

## 🔒 Security Features

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

## 🚀 Deployment

### Docker (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

### Environment Variables
Ensure all required environment variables are set in production:
- `NODE_ENV=production`
- `PORT` (if different from default)
- `CORS_ORIGIN` (your frontend domain)

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

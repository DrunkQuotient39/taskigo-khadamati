# Taskego (Khadamati) - Comprehensive Service Marketplace

A bilingual AI-powered local service platform connecting clients with service providers. Features modern React frontend, Express.js backend, PostgreSQL database, and comprehensive enterprise functionality.

## 🚀 Features

### Core Platform
- **Bilingual Support**: Full English/Arabic interface with RTL layout
- **Multi-Role System**: Client, Provider, and Admin dashboards
- **Real-time Features**: WebSocket integration for live updates
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### AI-Powered Features
- **Smart Chatbot**: GPT-4 powered bilingual assistant
- **Service Recommendations**: Intelligent matching based on user preferences
- **Sentiment Analysis**: Automated review and feedback analysis
- **Dynamic Pricing**: AI-suggested pricing for providers
- **Natural Language Search**: Find services using conversational queries

### Payment System
- **Multiple Methods**: Stripe, Apple Pay, and wallet integration
- **Secure Processing**: PCI-compliant payment handling
- **Commission Tracking**: Automated platform fee calculation
- **Refund Management**: Automated refund processing

### Enterprise Features
- **Provider Registration**: Business verification and approval workflow
- **Advanced Analytics**: Comprehensive admin dashboard with insights
- **Email/SMS Notifications**: Automated communication via Twilio
- **File Management**: Cloudinary integration for images and documents
- **Audit Logging**: Complete system activity tracking

## 🏗️ Architecture

### Frontend (`/client`)
- **React 18** with TypeScript
- **Wouter** for lightweight routing
- **Tailwind CSS** with custom theme
- **Radix UI** component primitives
- **TanStack Query** for server state
- **Framer Motion** for animations

### Backend (`/server`)
- **Express.js** with TypeScript
- **PostgreSQL** with Drizzle ORM
- **JWT Authentication** with role-based access
- **WebSocket** real-time communication
- **Comprehensive API** with Swagger documentation

### Database Schema
- **Users**: Multi-role authentication system
- **Services**: Provider offerings with categories
- **Bookings**: Appointment management
- **Payments**: Transaction processing
- **Reviews**: Rating and feedback system
- **AI Logs**: Machine learning interaction tracking

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- API keys for external services

### Environment Variables
Create a `.env` file with the following:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/taskego"

# Authentication
JWT_SECRET="your-jwt-secret-key"

# AI Features
OPENAI_API_KEY="your-openai-api-key"

# Payment Processing
STRIPE_SECRET_KEY="your-stripe-secret-key"

# SMS Notifications
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"

# File Uploads
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-cloudinary-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"
```

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <your-github-repo-url>
   cd taskego
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up database**
   ```bash
   npm run db:push
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## 📁 Project Structure

```
taskego/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utility functions
│   │   └── App.tsx        # Main application component
├── server/                 # Backend Express application
│   ├── routes/            # API route handlers
│   │   ├── auth.ts        # Authentication endpoints
│   │   ├── services.ts    # Service management
│   │   ├── bookings.ts    # Booking system
│   │   ├── payments.ts    # Payment processing
│   │   ├── providers.ts   # Provider management
│   │   ├── admin.ts       # Admin panel
│   │   └── ai.ts          # AI features
│   ├── middleware/        # Express middleware
│   │   ├── auth.ts        # Authentication middleware
│   │   └── security.ts    # Security & validation
│   ├── storage.ts         # Database abstraction layer
│   ├── websocket.ts       # Real-time communication
│   └── ai.ts              # AI service integration
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema & types
└── package.json           # Dependencies and scripts
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Services
- `GET /api/services` - List services with filtering
- `POST /api/services/create` - Create new service (providers)
- `GET /api/services/:id` - Get service details
- `PUT /api/services/:id` - Update service
- `POST /api/services/recommendations` - Get AI recommendations

### Bookings
- `POST /api/bookings/create` - Create booking
- `GET /api/bookings/client/:id` - Get client bookings
- `PUT /api/bookings/:id/status` - Update booking status
- `POST /api/bookings/:id/cancel` - Cancel booking

### Payments
- `POST /api/payments/create-stripe-session` - Create payment session
- `POST /api/payments/verify-payment` - Verify payment completion
- `GET /api/payments/history` - Payment history
- `POST /api/payments/refund` - Process refund

### AI Features
- `POST /api/ai/chat` - Chatbot conversation
- `POST /api/ai/recommend` - Smart recommendations
- `POST /api/ai/sentiment` - Sentiment analysis
- `POST /api/ai/price-suggest` - Pricing suggestions

## 🔐 Security Features

- **Rate Limiting**: API endpoint protection
- **Input Validation**: Comprehensive request validation
- **CORS Configuration**: Secure cross-origin requests
- **Helmet Security**: HTTP security headers
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt encryption
- **SQL Injection Protection**: Parameterized queries

## 🌍 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Configuration
- Set `NODE_ENV=production`
- Configure production database URL
- Set up proper CORS origins
- Enable logging and monitoring

### Recommended Hosting
- **Backend**: Railway, Render, or AWS
- **Database**: Neon, Supabase, or AWS RDS
- **Frontend**: Vercel, Netlify, or AWS S3

## 📊 Monitoring & Analytics

- **System Logs**: Comprehensive logging system
- **API Analytics**: Request/response tracking
- **User Behavior**: AI interaction monitoring
- **Payment Tracking**: Transaction and commission reports
- **Performance Metrics**: Response time and error tracking

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.ts
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Review the documentation
- Check the API documentation at `/docs`

## 🗺️ Roadmap

- [ ] Mobile application (React Native)
- [ ] Advanced AI features (GPT-4 Vision)
- [ ] Multi-currency support
- [ ] Video consultation features
- [ ] Advanced analytics dashboard
- [ ] Third-party integrations (Calendar, Maps)
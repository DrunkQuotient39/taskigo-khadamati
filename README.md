# Taskego (Khadamati) - AI-Powered Service Marketplace

A comprehensive bilingual (English/Arabic) service marketplace platform that connects clients with local service providers using AI-powered features, real-time communication, and integrated payment processing.

## 🚀 Features

### Core Platform
- **Bilingual Support**: Full English/Arabic interface with RTL support
- **Multi-Role System**: Clients, Service Providers, and Admin roles
- **Service Management**: Complete CRUD operations for services and categories
- **Booking System**: Advanced booking with scheduling and status tracking
- **Review & Rating**: Customer feedback system with sentiment analysis

### AI-Powered Features
- **Intelligent Chatbot**: GPT-4 powered assistant for customer support
- **Smart Recommendations**: AI-driven service suggestions based on user behavior
- **Sentiment Analysis**: Automatic review and feedback analysis
- **Pricing Intelligence**: AI-suggested optimal pricing for providers

### Payment & Financial
- **Stripe Integration**: Secure credit card and digital wallet payments
- **Apple Pay Support**: Seamless mobile payment experience
- **Multi-Currency**: Support for various currencies
- **Commission Tracking**: Automated platform fee calculation
- **Refund Management**: Built-in refund processing

### Real-Time Features
- **WebSocket Communication**: Live chat and notifications
- **Real-Time Notifications**: Instant updates for bookings and messages
- **Live Status Updates**: Real-time booking and service status changes

### Enterprise Features
- **Admin Dashboard**: Comprehensive management interface
- **Provider Approval**: Verification workflow for service providers
- **Analytics & Reporting**: Detailed insights and metrics
- **File Management**: Cloudinary integration for images and documents
- **Email/SMS Notifications**: Automated communication system

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Wouter** for routing
- **TanStack Query** for state management
- **Framer Motion** for animations
- **Radix UI** components

### Backend
- **Express.js** with TypeScript
- **PostgreSQL** with Drizzle ORM
- **JWT Authentication** with role-based access
- **WebSocket** for real-time features
- **Swagger** API documentation

### External Services
- **OpenAI GPT-4** for AI features
- **Stripe** for payments
- **Cloudinary** for file storage
- **Twilio** for SMS notifications
- **Nodemailer** for email services

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- API keys for external services

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/DrunkQuotient39/taskigo-khadamati.git
cd taskigo-khadamati
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
Create a `.env` file in the project root with at least:
```env
# Required
DATABASE_URL=postgresql://user:password@host:5432/taskego
JWT_SECRET=replace-with-a-strong-secret

# AI (optional but recommended)
OPENAI_API_KEY=sk-...
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b-instruct

# Firebase Admin
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project.appspot.com

# Payments (optional)
STRIPE_SECRET_KEY=sk_test_...

# Replit OIDC (optional)
# REPL_ID=your-replit-app-id
# ISSUER_URL=https://replit.com/oidc
# REPLIT_DOMAINS=localhost:5000
```

4. **Initialize the database:**
```bash
npm run db:push
```

5. **Start the development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 📁 Project Structure

```
taskigo-khadamati/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   └── lib/           # Utilities and hooks
├── server/                # Express backend
│   ├── routes/           # API route handlers
│   ├── middleware/       # Express middleware
│   ├── websocket.ts      # WebSocket server
│   └── ai.ts            # AI service integration
├── shared/               # Shared types and schemas
│   └── schema.ts        # Database schema definitions
└── docs/                # Documentation
```

## 🔧 API Documentation

Once running, visit `http://localhost:5000/docs` for interactive API documentation powered by Swagger.

### Key Endpoints

- **Authentication**: `/api/auth/*` - User registration, login, logout
- **Services**: `/api/services/*` - Service CRUD operations
- **Bookings**: `/api/bookings/*` - Booking management
- **Payments**: `/api/payments/*` - Payment processing
- **AI Features**: `/api/ai/*` - AI-powered features
- **Admin**: `/api/admin/*` - Administrative functions

## 🌐 Deployment

### Railway (Recommended)
1. Connect your GitHub repository to Railway
2. Add environment variables in Railway dashboard
3. Deploy automatically with git push

### Render
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set start command: `npm start`

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow the deployment prompts

## 🔐 Security Features

- **Rate Limiting**: API endpoint protection
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Configured cross-origin resource sharing
- **Helmet.js**: Security headers and protection
- **JWT Authentication**: Secure user authentication
- **Role-Based Access**: Granular permission system

## 🌍 Internationalization

The platform supports:
- **English (LTR)**: Default language
- **Arabic (RTL)**: Full right-to-left layout support
- **Dynamic Language Switching**: Real-time language changes
- **Localized Content**: Service descriptions and UI text

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@taskego.com or create an issue in this repository.

## 🙏 Acknowledgments

- Built with modern web technologies
- Powered by OpenAI for AI features
- Secured payments by Stripe
- Real-time features with WebSocket
- Responsive design with Tailwind CSS

---

**Taskego (Khadamati)** - Connecting communities through intelligent service marketplace technology.
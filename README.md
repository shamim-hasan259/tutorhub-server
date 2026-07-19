# EduPro - AI Tutor Hub Backend

Backend API server for the EduPro AI-powered Tutor Marketplace.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **AI**: Google Gemini API
- **Security**: Helmet, CORS, Rate Limiting
- **Auth**: Better Auth (verified from frontend)

## Project Structure

```
src/
├── config/         # Configuration files (DB, Cloudinary, Gemini)
├── controllers/    # Request handlers
├── middlewares/     # Auth, validation, error handling
├── models/         # Mongoose schemas
├── routes/         # API routes
├── services/       # Business logic
├── types/          # TypeScript interfaces
└── utils/          # Helper functions
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## API Endpoints

### Health Check

- `GET /api/health` - Check server status

## License

ISC

# Feature Voting Tool 🚀

A modern feature request and voting system built with Next.js 14, implementing BDD scenarios with comprehensive business outcome verification.

## 🎯 Features

- **Submit Feature Requests**: Users can submit new feature requests with title and description
- **Vote for Features**: Team members can upvote features they want to see implemented
- **Sort by Votes or Recent**: Product managers can prioritize by most voted or most recent
- **Admin Controls**: Admins can delete duplicate or invalid requests
- **Beautiful UI**: Modern, responsive interface with Tailwind CSS
- **Real Database**: Vercel Postgres - no mocks, real data

## 🧪 BDD Scenarios

### Scenario 1: User reicht Feature-Request ein
- ✅ Feature appears in list with 0 votes after submission
- ✅ Complete business outcome verification

### Scenario 2: Team-Member vote für Feature
- ✅ Vote counter increases after voting
- ✅ Voter avatar appears in voter list
- ✅ Prevents duplicate votes

### Scenario 3: PM sortiert nach Votes
- ✅ Features sorted by vote count (highest first)
- ✅ Default sorting by recent (newest first)

### Scenario 4: Admin löscht Duplikat
- ✅ Admin can delete features
- ✅ Non-admin users cannot delete
- ✅ Only non-deleted features are visible

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or 20+
- Vercel Postgres database

### Installation

1. Clone the repository:
```bash
cd feature-voting
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with your Vercel Postgres credentials:
```env
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NO_SSL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
POSTGRES_USER="default"
POSTGRES_HOST="xxxxx.postgres.vercel-storage.com"
POSTGRES_PASSWORD="xxxxx"
POSTGRES_DATABASE="verceldb"
```

4. Initialize the database:
```bash
curl -X POST http://localhost:3000/api/init-db
```

### Running the Application

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

### Running Tests

Run all BDD tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Database**: Vercel Postgres
- **Testing**: Jest + Supertest
- **Language**: TypeScript

### Project Structure

```
feature-voting/
├── app/
│   ├── api/
│   │   ├── features/         # Feature CRUD endpoints
│   │   │   ├── route.ts      # GET (list), POST (create)
│   │   │   └── [id]/
│   │   │       ├── route.ts  # GET (detail), DELETE
│   │   │       └── vote/
│   │   │           └── route.ts  # POST (vote), GET (voters)
│   │   └── init-db/
│   │       └── route.ts      # Database initialization
│   ├── components/
│   │   ├── FeatureCard.tsx   # Individual feature card
│   │   ├── FeatureForm.tsx   # Feature submission form
│   │   └── FeatureList.tsx   # List of features
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── lib/
│   └── db.ts                 # Database functions
├── __tests__/
│   ├── scenario1-submit-feature.test.ts
│   ├── scenario2-vote-feature.test.ts
│   ├── scenario3-sort-by-votes.test.ts
│   └── scenario4-admin-delete.test.ts
└── feature-voting.feature    # Original BDD scenarios
```

## 🧪 Testing Philosophy

This project implements **true BDD testing** with:

1. **Business Outcome Verification**: Tests verify actual business outcomes, not just status codes
2. **Real Database**: Uses Vercel Postgres, no mocks or stubs
3. **1:1 Scenario Implementation**: Each BDD scenario is implemented exactly as specified
4. **Comprehensive Edge Cases**: Tests include edge cases and error scenarios
5. **Integration Tests**: Full end-to-end testing of API routes

## 📊 Database Schema

### feature_requests
- `id`: Serial primary key
- `title`: Feature title
- `description`: Feature description
- `votes`: Vote count
- `created_at`: Timestamp
- `is_deleted`: Soft delete flag

### votes
- `id`: Serial primary key
- `feature_id`: Foreign key to feature_requests
- `user_id`: Unique user identifier
- `user_name`: User display name
- `user_avatar`: User avatar URL
- `created_at`: Timestamp
- Unique constraint on (feature_id, user_id)

### users
- `id`: User identifier (primary key)
- `name`: User name
- `avatar`: Avatar URL
- `is_admin`: Admin flag

## 🎨 UI Features

- **Gradient Background**: Beautiful gradient from blue to purple
- **Responsive Design**: Works on all screen sizes
- **Smooth Animations**: Hover effects and transitions
- **Vote Visualization**: Visual vote counter with upvote button
- **Voter List**: Click on vote count to see who voted
- **Admin Mode**: Toggle admin controls
- **Sort Controls**: Easy switching between sort modes

## 📝 API Endpoints

### Features
- `GET /api/features?sortBy={recent|votes}` - List features
- `POST /api/features` - Create feature
- `GET /api/features/[id]` - Get feature details
- `DELETE /api/features/[id]` - Delete feature (admin only)

### Votes
- `POST /api/features/[id]/vote` - Vote for feature
- `GET /api/features/[id]/vote` - Get voters

### Database
- `POST /api/init-db` - Initialize database schema

## 🔒 Security Considerations

- Admin authentication via `x-user-admin` header (in production, use proper auth)
- Input validation on all endpoints
- SQL injection prevention via parameterized queries
- Duplicate vote prevention via unique constraint

## 🚢 Deployment

This app is ready to deploy to Vercel:

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy!

Vercel will automatically:
- Build the Next.js app
- Connect to Vercel Postgres
- Enable serverless functions

## 📄 License

ISC

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit a pull request

---

Built with ❤️ using Next.js 14, Tailwind CSS, and Vercel Postgres



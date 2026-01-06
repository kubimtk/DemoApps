# Quick Start Guide ⚡

Get the Feature Voting Tool running in 5 minutes!

## Prerequisites Check

```bash
node --version  # Should be 18+ or 20+
npm --version   # Should be 8+
```

## Step 1: Install Dependencies (30 seconds)

```bash
cd /Users/kubi/Cursorfiles/DemoApps/feature-voting
npm install
```

## Step 2: Setup Database (2 minutes)

### Option A: Use Vercel Postgres (Recommended)

1. Go to https://vercel.com/storage/postgres
2. Click "Create Database"
3. Copy the `.env.local` tab contents
4. Create `.env.local` in project root and paste

### Option B: Use Local Postgres (Advanced)

```bash
# Install PostgreSQL locally
brew install postgresql  # macOS
# or
sudo apt-get install postgresql  # Linux

# Create database
createdb feature_voting

# Set .env.local
echo 'POSTGRES_URL=postgres://localhost:5432/feature_voting' > .env.local
```

## Step 3: Start Dev Server (10 seconds)

```bash
npm run dev
```

Server starts at http://localhost:3000

## Step 4: Initialize Database (5 seconds)

In a new terminal:

```bash
curl -X POST http://localhost:3000/api/init-db
```

Or visit http://localhost:3000/api/init-db in your browser.

## Step 5: Test It! (1 minute)

1. **Submit a Feature**:
   - Go to http://localhost:3000
   - Fill in title: "Dark Mode"
   - Fill in description: "Users want to read better at night"
   - Click "Submit Feature Request"

2. **Vote for the Feature**:
   - Click the upvote button (↑)
   - Vote counter increases to 1
   - Click on "1 Vote" to see your avatar

3. **Test Sorting**:
   - Submit another feature
   - Vote for it multiple times (refresh page between votes to simulate different users)
   - Toggle between "Most Recent" and "Most Voted"

4. **Test Admin Delete**:
   - Enable "Admin Mode" checkbox
   - Submit a duplicate feature
   - Click the delete button (trash icon)
   - Feature disappears

## Step 6: Run Tests (30 seconds)

```bash
npm test
```

You should see:
```
PASS  __tests__/scenario1-submit-feature.test.ts
PASS  __tests__/scenario2-vote-feature.test.ts
PASS  __tests__/scenario3-sort-by-votes.test.ts
PASS  __tests__/scenario4-admin-delete.test.ts

Tests: 15 passed, 15 total
```

## 🎉 You're Done!

Your Feature Voting Tool is now running!

## Common Issues

### Issue: "Cannot find module 'next'"
```bash
npm install
```

### Issue: "Database connection failed"
- Check `.env.local` file exists
- Verify database credentials are correct
- Ensure database is accessible

### Issue: "Port 3000 already in use"
```bash
# Kill the process on port 3000
lsof -ti:3000 | xargs kill
# Or use a different port
PORT=3001 npm run dev
```

### Issue: Tests fail with "ECONNREFUSED"
- Ensure `.env.local` has database credentials
- Run `npm run dev` first to ensure Next.js compiles
- Database must be initialized (`curl -X POST http://localhost:3000/api/init-db`)

## Next Steps

- 📖 Read [README.md](./README.md) for full documentation
- 🧪 Read [TESTING.md](./TESTING.md) for testing guide
- 🚀 Read [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy to production
- 📊 Read [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) for project overview

## Development Workflow

```bash
# Start development server
npm run dev

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build

# Start production server
npm start

# Type check
npx tsc --noEmit

# Format code (if you add prettier)
npx prettier --write .
```

## Project Structure (Simplified)

```
feature-voting/
├── app/
│   ├── api/              # Backend API routes
│   ├── components/       # React components
│   └── page.tsx          # Home page
├── lib/
│   └── db.ts            # Database functions
├── __tests__/           # BDD tests
└── .env.local           # Your database credentials (create this!)
```

## Environment Variables

Required in `.env.local`:

```env
POSTGRES_URL="postgres://..."           # Main connection URL
POSTGRES_PRISMA_URL="postgres://..."    # Prisma/pooled connection
POSTGRES_URL_NO_SSL="postgres://..."    # Non-SSL connection
POSTGRES_URL_NON_POOLING="postgres://..." # Direct connection
POSTGRES_USER="default"                  # Database user
POSTGRES_HOST="xxxxx.vercel-storage.com" # Database host
POSTGRES_PASSWORD="xxxxx"                # Database password
POSTGRES_DATABASE="verceldb"             # Database name
```

## API Endpoints Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/features` | GET | List features |
| `/api/features` | POST | Create feature |
| `/api/features/[id]` | GET | Get feature |
| `/api/features/[id]` | DELETE | Delete feature |
| `/api/features/[id]/vote` | POST | Vote for feature |
| `/api/features/[id]/vote` | GET | Get voters |
| `/api/init-db` | POST | Initialize DB |

## Tips

1. **Testing**: Always run tests after making changes
2. **Database**: Use separate databases for dev/test/prod
3. **Admin Mode**: Just a demo - implement real auth in production
4. **Vote Simulation**: Each page refresh creates a new "user" for voting
5. **Debugging**: Check browser console and terminal for errors

## Support

- 📧 Check logs in terminal
- 🐛 Check browser console (F12)
- 📖 Read full documentation in README.md
- 🔍 Search issues in the repository

---

**Total time: ~5 minutes** ⚡

Enjoy building your feature voting tool! 🚀




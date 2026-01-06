# Deployment Guide 🚀

## Prerequisites

- GitHub account
- Vercel account
- Vercel Postgres database

## Step-by-Step Deployment

### 1. Create Vercel Postgres Database

1. Go to https://vercel.com/storage/postgres
2. Click "Create Database"
3. Choose a region close to your users
4. Note down your connection credentials

### 2. Prepare Repository

```bash
cd feature-voting
git init
git add .
git commit -m "Initial commit: Feature Voting Tool with BDD tests"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 3. Deploy to Vercel

#### Option A: Via Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

4. Add Environment Variables:
   - Click "Environment Variables"
   - Add all variables from your `.env.local`:
     ```
     POSTGRES_URL
     POSTGRES_PRISMA_URL
     POSTGRES_URL_NO_SSL
     POSTGRES_URL_NON_POOLING
     POSTGRES_USER
     POSTGRES_HOST
     POSTGRES_PASSWORD
     POSTGRES_DATABASE
     ```

5. Click "Deploy"

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? feature-voting
# - Directory? ./
# - Modify settings? No

# Add environment variables
vercel env add POSTGRES_URL
vercel env add POSTGRES_PRISMA_URL
# ... add all other env vars

# Deploy to production
vercel --prod
```

### 4. Initialize Database

After deployment:

```bash
curl -X POST https://your-app.vercel.app/api/init-db
```

Or visit the endpoint in your browser.

### 5. Verify Deployment

1. Visit your app URL
2. Submit a test feature request
3. Vote for the feature
4. Test sorting
5. Enable admin mode and test delete

## Environment Variables

Required environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `POSTGRES_URL` | Main connection URL | `postgres://default:...@...vercel-storage.com:5432/verceldb` |
| `POSTGRES_PRISMA_URL` | Prisma connection URL | Same as above with `?pgbouncer=true&connect_timeout=15` |
| `POSTGRES_URL_NO_SSL` | Non-SSL URL | Same as POSTGRES_URL |
| `POSTGRES_URL_NON_POOLING` | Direct connection URL | Same as POSTGRES_URL |
| `POSTGRES_USER` | Database user | `default` |
| `POSTGRES_HOST` | Database host | `xxxxx.postgres.vercel-storage.com` |
| `POSTGRES_PASSWORD` | Database password | Your password |
| `POSTGRES_DATABASE` | Database name | `verceldb` |

## Post-Deployment

### Custom Domain

1. Go to your project in Vercel
2. Settings → Domains
3. Add your custom domain
4. Update DNS records as instructed

### Analytics

Vercel provides built-in analytics:
- Go to your project
- Click "Analytics" tab
- View visitor stats, page views, etc.

### Monitoring

Monitor your app:
- **Logs**: Vercel Dashboard → Functions → Logs
- **Errors**: Check function logs for errors
- **Performance**: Analytics tab shows performance metrics

## Continuous Deployment

Vercel automatically deploys:
- **Production**: Pushes to `main` branch
- **Preview**: Pull requests and other branches

To disable automatic deployments:
1. Project Settings → Git
2. Configure deployment branches

## Database Management

### Backup

Vercel Postgres includes automatic backups:
- Point-in-time recovery
- 30-day retention

Manual backup:
```bash
# Connect to database
psql $POSTGRES_URL

# Dump database
pg_dump $POSTGRES_URL > backup.sql
```

### Migrations

For schema changes:

1. Test locally first
2. Update `lib/db.ts` schema
3. Create migration script in `scripts/migrate.ts`
4. Run via API endpoint or Vercel CLI

Example migration endpoint:
```typescript
// app/api/migrate/route.ts
export async function POST() {
  await sql`ALTER TABLE feature_requests ADD COLUMN priority INTEGER DEFAULT 0`;
  return NextResponse.json({ success: true });
}
```

### Reset Database

To reset in production:
```bash
curl -X POST https://your-app.vercel.app/api/clear-db
curl -X POST https://your-app.vercel.app/api/init-db
```

> ⚠️ **Warning**: This deletes all data!

## Troubleshooting

### Build Fails

**Error**: "Module not found"
- **Solution**: Ensure all dependencies in `package.json`
- Run `npm install` locally to verify

**Error**: "TypeScript compilation failed"
- **Solution**: Run `npx tsc --noEmit` locally
- Fix all type errors

### Database Connection Issues

**Error**: "Connection timeout"
- **Solution**: Check environment variables
- Ensure database is in same region as function

**Error**: "SSL required"
- **Solution**: Use `POSTGRES_PRISMA_URL` with SSL params

### Runtime Errors

**Error**: "Function timeout"
- **Solution**: Optimize database queries
- Add indexes to frequently queried columns
- Increase function timeout in `vercel.json`

### Performance Issues

**Slow page loads**:
1. Enable Next.js caching
2. Add database indexes
3. Implement Redis caching for frequently accessed data
4. Use Vercel Edge Functions for faster responses

## Scaling

As your app grows:

### Database
- Upgrade Vercel Postgres plan for more storage/connections
- Add read replicas for heavy read workloads
- Implement caching layer (Redis)

### Functions
- Serverless functions auto-scale
- Monitor function execution time
- Optimize slow queries

### CDN
- Vercel's Edge Network handles static assets
- Next.js automatically optimizes images
- Enable ISR for frequently changing data

## Security

### Production Checklist

- [ ] Environment variables set correctly
- [ ] Database credentials are secure
- [ ] Implement proper authentication (replace `x-user-admin` header)
- [ ] Add rate limiting
- [ ] Enable CORS restrictions
- [ ] Add CSRF protection
- [ ] Sanitize user inputs
- [ ] Use HTTPS only
- [ ] Set security headers

### Recommended Security Headers

Add to `next.config.js`:
```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
      ],
    },
  ];
}
```

## Cost Estimation

Vercel pricing (as of 2024):

**Free Tier (Hobby)**:
- 100 GB-hours serverless function execution
- 1,000 GB bandwidth
- Unlimited API requests
- Perfect for small projects

**Pro Tier ($20/month)**:
- 1,000 GB-hours execution
- 1 TB bandwidth
- Advanced analytics
- Password protection

**Vercel Postgres**:
- Free: 256 MB storage, 60 hours compute
- Pro: Starting at $20/month

## Maintenance

### Regular Tasks

**Weekly**:
- Check error logs
- Monitor function execution times
- Review database size

**Monthly**:
- Update dependencies
- Review and optimize slow queries
- Check for security updates

**Quarterly**:
- Review and clean up old data
- Optimize database indexes
- Performance audit

## Support

For issues:
- Vercel Docs: https://vercel.com/docs
- Vercel Support: support@vercel.com
- GitHub Issues: Your repository

---

Happy Deploying! 🎉




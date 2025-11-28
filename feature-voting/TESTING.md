# Testing Guide 🧪

## Prerequisites

Before running tests, you need:

1. **Vercel Postgres Database**
   - Create a Vercel Postgres database at https://vercel.com/storage/postgres
   - Get your connection credentials

2. **Environment Variables**
   - Create `.env.local` file in the project root
   - Add your Vercel Postgres credentials (see `.env.local.example`)

## Running Tests

### All Tests
```bash
npm test
```

### Watch Mode
```bash
npm run test:watch
```

### Single Scenario
```bash
npm test -- scenario1-submit-feature
npm test -- scenario2-vote-feature
npm test -- scenario3-sort-by-votes
npm test -- scenario4-admin-delete
```

## Test Structure

### Scenario 1: Submit Feature Request
**File**: `__tests__/scenario1-submit-feature.test.ts`

**Tests**:
- ✅ Feature request appears in list with 0 votes after submission
- ✅ Cannot submit feature without title
- ✅ Cannot submit feature without description

**Business Outcomes Verified**:
1. Feature was created successfully
2. Feature has 0 votes initially
3. Feature appears in the list
4. The submitted feature is in the list
5. Feature is not deleted

### Scenario 2: Vote for Feature
**File**: `__tests__/scenario2-vote-feature.test.ts`

**Tests**:
- ✅ Vote counter increases and voter avatar appears in list
- ✅ Multiple users can vote for same feature
- ✅ User cannot vote twice for same feature

**Business Outcomes Verified**:
1. Vote was recorded
2. Vote counter is incremented
3. My avatar appears in voter list
4. Feature appears in list with correct vote count
5. Duplicate votes are prevented

### Scenario 3: Sort by Votes
**File**: `__tests__/scenario3-sort-by-votes.test.ts`

**Tests**:
- ✅ Features are sorted by votes (most voted first)
- ✅ Default sort shows recent features first
- ✅ Sort parameter is case-insensitive
- ✅ Features with equal votes maintain creation order

**Business Outcomes Verified**:
1. Request was successful
2. Dark Mode (5 votes) is first in the list
3. Export PDF (3 votes) is second in the list
4. Features are ordered by vote count

### Scenario 4: Admin Delete Duplicate
**File**: `__tests__/scenario4-admin-delete.test.ts`

**Tests**:
- ✅ Admin can delete duplicate, only new request remains visible
- ✅ Non-admin users cannot delete features
- ✅ Admin cannot delete non-existent feature
- ✅ Deleting feature removes votes but keeps voter history
- ✅ Multiple duplicates can be cleaned up by admin

**Business Outcomes Verified**:
1. Deletion was successful
2. Only one Dark Mode feature is visible
3. The visible feature is the newer one
4. The older feature is not in the list
5. Non-admin requests are rejected

## Test Philosophy

### 1. Business Outcome Verification
We don't just check status codes. We verify:
- Data was created/updated correctly
- Business rules are enforced
- User experience matches expectations

Example:
```typescript
// ❌ BAD: Only checking status code
expect(response.status).toBe(201);

// ✅ GOOD: Verifying business outcome
expect(response.status).toBe(201);
expect(createdFeature.votes).toBe(0);
expect(createdFeature.title).toBe('Dark Mode');

const features = await fetchAllFeatures();
expect(features.find(f => f.id === createdFeature.id)).toBeDefined();
```

### 2. Real Database
- Tests use actual Vercel Postgres database
- No mocks or stubs
- Tests verify real data persistence
- Database is cleared before each test suite

### 3. Integration Testing
- Full end-to-end API testing
- Tests entire request/response cycle
- Verifies database operations
- Tests API routes as users would use them

### 4. Edge Case Coverage
- Invalid inputs
- Duplicate operations
- Authorization failures
- Non-existent resources

## Debugging Tests

### View Database State
During test development, you can inspect the database:

```typescript
import { getFeatureRequests } from '@/lib/db';

it('debug test', async () => {
  const features = await getFeatureRequests();
  console.log('Current features:', JSON.stringify(features, null, 2));
});
```

### Run Single Test
```bash
npm test -- -t "BUSINESS OUTCOME: Vote counter increases"
```

### Verbose Output
```bash
npm test -- --verbose
```

## Common Issues

### Issue: Tests fail with database connection error
**Solution**: Ensure `.env.local` has correct Vercel Postgres credentials

### Issue: Tests timeout
**Solution**: Increase timeout in jest.config.js:
```javascript
testTimeout: 30000, // 30 seconds
```

### Issue: Tests fail due to existing data
**Solution**: Tests should use `clearDatabase()` in `beforeAll()`

### Issue: Unique constraint violation
**Solution**: Ensure each test uses unique identifiers or clears data properly

## CI/CD Integration

For GitHub Actions or similar:

1. Add Vercel Postgres credentials as secrets
2. Initialize database before tests
3. Run tests with coverage

Example `.github/workflows/test.yml`:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'
      - run: npm install
      - run: npm test
        env:
          POSTGRES_URL: ${{ secrets.POSTGRES_URL }}
          POSTGRES_PRISMA_URL: ${{ secrets.POSTGRES_PRISMA_URL }}
```

## Performance

Test execution times (approximate):
- Scenario 1: ~1-2 seconds
- Scenario 2: ~2-3 seconds
- Scenario 3: ~3-4 seconds (creates multiple features)
- Scenario 4: ~2-3 seconds

Total test suite: ~8-12 seconds

## Coverage

Run with coverage:
```bash
npm test -- --coverage
```

Expected coverage:
- Statements: >90%
- Branches: >85%
- Functions: >90%
- Lines: >90%

## Best Practices

1. **Clear Setup**: Always clear database in `beforeAll()`
2. **Unique Data**: Use unique identifiers for test data
3. **Verify Outcomes**: Check business results, not just status codes
4. **Clean Teardown**: Clean up in `afterAll()`
5. **Descriptive Names**: Test names should describe business outcome
6. **Independent Tests**: Each test should be runnable independently

## Future Enhancements

Potential test additions:
- Performance tests (response time < 100ms)
- Load tests (concurrent votes)
- Security tests (SQL injection, XSS)
- Accessibility tests
- E2E tests with Playwright/Cypress


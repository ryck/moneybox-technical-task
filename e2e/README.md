# Playwright End-to-End Tests

This project includes comprehensive Playwright tests covering multiple aspects of the Moneybox technical task application.

## Test Coverage

### Test Files

- **`main-page.spec.ts`** - Tests for the main product display page
- **`admin-panel.spec.ts`** - Tests for the admin interface functionality (non-destructive)
- **`api-endpoints.spec.ts`** - API endpoint testing (uses test endpoints)
- **`accessibility.spec.ts`** - Accessibility and WCAG compliance tests

### Non-Destructive Testing

All tests are designed to be **non-destructive** and will **not modify** your actual product data:

- **Admin Panel Tests**: Use API route interception to mock save operations
- **API Tests**: Use dedicated test validation endpoints (`/api/test/validate`)
- **Main Page Tests**: Only interact with read-only UI elements
- **Data Integrity**: Original `products.json` remains unchanged during testing

### Test Statistics

- **Total Tests**: 93 tests across 3 browsers
- **Passing**: 93 tests (100% success rate)
- **Browser Coverage**: Chromium, Firefox, Mobile Chrome

### What's Tested

#### Main Page (`main-page.spec.ts`)

- ✅ Displays correct headings and branding
- ✅ Loads and displays product categories
- ✅ Category expansion/collapse functionality
- ✅ Product information display
- ✅ Responsive design on mobile
- ✅ Loading state handling
- ✅ Accessible navigation

#### Admin Panel (`admin-panel.spec.ts`)

- ✅ Admin panel title and navigation
- ✅ Category loading and display
- ✅ Category editing functionality
- ✅ Character limits and validation
- ✅ Adding new categories
- ✅ Product management
- ✅ Save operations and feedback
- ✅ Mobile responsiveness
- ✅ Navigation between admin and main page

#### API Endpoints (`api-endpoints.spec.ts`)

- ✅ Health endpoint returns correct status
- ✅ Categories API returns proper data structure
- ✅ Error handling for invalid endpoints
- ✅ Data validation for admin submissions
- ✅ CORS header support
- ✅ Consistent timestamp format
- ✅ Concurrent request handling

#### Accessibility (`accessibility.spec.ts`)

- ✅ Proper heading hierarchy
- ✅ Form label associations
- ✅ Color contrast checks
- ✅ ARIA attributes
- ✅ Screen reader compatibility
- ✅ Focus management
- ✅ Keyboard navigation

## Test Architecture

### Non-Destructive Design

The test suite is carefully designed to avoid modifying production data:

#### API Route Interception

Admin panel tests use `page.route()` to intercept and mock API calls:

```javascript
// Intercepts PUT/POST/DELETE requests to admin endpoints
await page.route("**/api/admin/**", async (route) => {
  // Returns mock success responses instead of modifying data
});
```

#### Test Validation Endpoint

API tests use a dedicated validation endpoint (`/api/test/validate`) that:

- Validates data structure without saving
- Returns success/error responses for testing
- Never modifies the actual `products.json` file

#### Safe UI Interactions

- Main page tests only expand/collapse categories (read-only)
- Form interactions test validation without submission
- Navigation tests use safe page transitions

## Running Tests

### All Tests

```bash
npm run test:e2e
```

### Specific Browser

```bash
npm run test:e2e -- --project=chromium
```

### Headed Mode (Visual)

```bash
npm run test:e2e:headed
```

### UI Mode (Interactive)

```bash
npm run test:e2e:ui
```

### Test Reports

```bash
npm run test:e2e:report
```

## Test Environment

- Tests run against `http://localhost:3000`
- Development server is automatically started
- Tests use the live API endpoints

## Test Data Attributes

The components include `data-testid` attributes for reliable element selection:

- `data-testid="category-section"` - Category display sections
- `data-testid="category-button"` - Category expansion buttons
- `data-testid="product-card"` - Individual product cards
- `data-testid="product-name"` - Product name elements
- `data-testid="product-description"` - Product description elements
- `data-testid="admin-category"` - Admin category management sections

## Configuration

Tests are configured via `playwright.config.ts`:

- 3 browser projects (Chrome, Firefox, Mobile Chrome)
- Parallel execution optimized for reliability
- Automatic retry in CI environments
- HTML reporting with traces on failure
- Auto-start development server

## Best Practices

1. **Stable Selectors**: Uses `data-testid` attributes and semantic roles
2. **Wait Strategies**: Proper waits for dynamic content loading
3. **Cross-Browser**: Tests across desktop and mobile browsers
4. **API Testing**: Direct API endpoint testing alongside UI tests
5. **Accessibility**: Comprehensive a11y testing including WCAG compliance
6. **Responsive**: Mobile viewport testing for responsive design
7. **Error Handling**: Tests both success and error scenarios

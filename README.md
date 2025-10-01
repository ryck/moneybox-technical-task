# Moneybox Technical Task

A Next.js application showcasing Moneybox's financial products with a business-friendly content management system and comprehensive API access.

## 🎯 Acceptance Criteria Met

- ✅ **Business User Friendly**: Content managed via simple JSON file - no developer input needed
- ✅ **Cross-Platform API**: REST endpoints for mobile apps and other platforms
- ✅ **Product Categories**: All Moneybox product categories displayed
- ✅ **Product Details**: Complete product information with images and descriptions
- ✅ **Wireframe Compliance**: Visually appealing UI matching requirements
- ✅ **Comprehensive Testing**: Unit, integration, and API tests included

## Notes from the dev (in no particular order)

- I tried to use the same stack mentioned in the job description (NextJS, TailwindCSS, React Query, etc..)
- The product data can be updated changing `data/products.json` directly or using a quick & dirty `/admin` panel
- I implemented the APIs using NextJS api routes
- I added a lot of (probaly unnecessary testing at this stage) testing, both unit and E2E, but IA is really good at this...
- I added a lot of accesibility features
- I tried to use the official web for most of the colors, images, metadata, etc
- The UI is nice and modern (albeit a little bit vanilla) but I was focusing on functionality
- The stale time is one minute, which is too much for anything that is not your local, but here makes sense so you can see the changes in the UI faster
- I added guards in a lot of places (like when you get an empty categories array), but I am sure you can have more...
- I prefer readibility over complexity (ie, small components, verbose comments, etc)
- The APIs have a common and predictable response format, as it should
- I made and export some API custom hooks so it's easier to use them elsewhere
- There is a /health endpoint, because I get nervous if I don't have one...
- The tests are non destructive
- I took some executive decisions in the UI (ie, adding expand / collapse all, key features, etc) but those are easy to remove
- There are some "bulk" API routes, but in the UI I only use proper REST ones, when you add / edit / delete stuff in isolation

## Things I would have done if I had more time

- Have a better design system, with more personality
- Improve API routes validation
- Make the admin panel better, with some kind of auth system
- Use a proper form library (like Tanstack Forms) with a better error handling
- Document the API routes better (using OpenAPI and Swagger, for example)
- Add some tooling for formatting / linting (like a husky hook)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Admin Panel

Access the admin panel at [http://localhost:3000/admin](http://localhost:3000/admin) to manage categories and products through a user-friendly web interface.

## 📁 Project Structure

```
├── src/                        # Source code
│   ├── app/                    # Next.js App Router
│   │   ├── admin/             # Admin panel for content management
│   │   ├── api/               # REST API endpoints
│   │   │   ├── admin/         # Admin data management routes
│   │   │   ├── categories/    # Product category routes
│   │   │   ├── health/        # Health check endpoint
│   │   │   └── test/          # Test utilities endpoint
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout component
│   │   └── page.tsx          # Main homepage
│   ├── components/            # React components
│   │   ├── Accordion.tsx      # Main accordion container
│   │   ├── AccordionItem.tsx  # Individual accordion item
│   │   ├── Carousel.tsx       # Image carousel component
│   │   ├── Footer.tsx         # Site footer component
│   │   └── Header.tsx         # Site header component
│   ├── data/                  # Business-managed content
│   │   └── products.json     # Product data (editable by business users)
│   ├── hooks/                # Custom React hooks
│   │   └── useCategories.ts  # Data fetching hooks with TanStack Query
│   ├── lib/                  # Utility libraries
│   │   └── validation.ts     # Data validation utilities
│   ├── providers/            # React context providers
│   │   └── QueryProvider.tsx # TanStack Query provider
│   ├── types/                # TypeScript definitions
│   │   └── products.ts       # Product and category type definitions
│   └── __tests__/            # Unit test suites
│       ├── api/              # API endpoint tests
│       ├── components/       # Component tests
│       ├── admin-endpoints.test.ts # Admin API tests
│       └── validation.test.ts     # Validation utility tests
├── e2e/                       # End-to-end tests
│   ├── accessibility.spec.ts # Accessibility tests
│   ├── admin-panel.spec.ts   # Admin panel e2e tests
│   ├── api-endpoints.spec.ts # API e2e tests
│   ├── main-page.spec.ts     # Homepage e2e tests
│   └── README.md             # E2E testing documentation
├── public/                   # Static assets
│   └── assets/              # Product icons and images
├── scripts/                  # Utility scripts
│   └── validate-products.js # Product data validation script
└── Configuration files
    ├── jest.config.js        # Jest testing configuration
    ├── playwright.config.ts  # Playwright e2e configuration
    ├── next.config.ts        # Next.js configuration
    ├── tailwind.config.js    # Tailwind CSS configuration
    └── tsconfig.json         # TypeScript configuration
```

## 🔧 Technology Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS 4
- **Language**: TypeScript
- **Testing**: Jest + React Testing Library + Playwright
- **Icons**: SVG assets in `/public/assets/`

## 📜 Available Scripts

### Development

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint for code quality

### Testing

- `npm test` - Run all unit tests
- `npm run test:watch` - Run tests in watch mode for development
- `npm run test:coverage` - Generate test coverage report
- `npm run test:e2e` - Run end-to-end tests with Playwright
- `npm run test:e2e:ui` - Run e2e tests with interactive UI
- `npm run test:e2e:headed` - Run e2e tests in headed mode (visible browser)
- `npm run test:e2e:report` - View the e2e test report

### Utilities

- `npm run validate-products` - Validate product data structure and format

## 📊 API Documentation

### Endpoints

**Health Check**

```http
GET /api/health
```

Returns system health status, uptime, memory usage, and environment information.

**Get All Categories**

```http
GET /api/categories
```

**Get Category by ID**

```http
GET /api/categories/{categoryId}
```

**Get Product by ID**

```http
GET /api/categories/{categoryId}/products/{productId}
```

**Admin API**

```http
GET /api/admin/data      # Get all data for admin interface
PUT /api/admin/data      # Update products data (admin only)
```

### Response Format

**Success Response**

```json
{
  "data": { ... },
  "timestamp": "2025-10-01T10:16:35.204Z"
}
```

**Error Response**

Simple errors:

```json
{
  "error": "Error message",
  "timestamp": "2025-10-01T10:16:35.204Z"
}
```

Validation errors:

```json
{
  "error": "Validation failed",
  "details": {
    "message": "Validation failed",
    "errors": {
      "category-id": [
        {
          "message": "category-id can only contain lowercase letters, numbers, underscores, and dashes",
          "code": "INVALID_FORMAT"
        }
      ]
    }
  },
  "timestamp": "2025-10-01T22:39:07.694Z"
}
```

**Health Check Response**

```json
{
  "status": "healthy",
  "version": "0.1.0",
  "timestamp": "2025-10-01T10:16:35.204Z"
}
```

## 🧪 Testing

```bash
# Run all unit tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run end-to-end tests
npm run test:e2e

# Run e2e tests with interactive UI
npm run test:e2e:ui

# Run e2e tests in headed mode (visible browser)
npm run test:e2e:headed

# View e2e test report
npm run test:e2e:report
```

Test coverage includes:

- Component rendering and behavior
- API endpoint functionality
- Data structure validation
- Error handling scenarios

## 🎨 Design Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Accessibility**: WCAG compliant with proper semantic HTML
- **Modern UI**: Clean, professional design with smooth animations
- **Brand Consistent**: Blue color scheme reflecting Moneybox branding
- **Performance Optimized**: Lazy loading, optimized images, minimal bundle size

## 🔄 Content Management

### Admin Panel Features

The web-based admin panel (`/admin`) provides:

- **Category Management**: Add, edit, and delete product categories
- **Product Management**: Add, edit, and delete products within categories
- **Real-time Updates**: Changes reflect immediately on the main site
- **User-Friendly Interface**: No technical knowledge required
- **Data Validation**: Built-in validation prevents data corruption
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### For Business Users

**Option 1: Web Interface (Recommended)**

1. Navigate to `/admin`
2. Use the visual interface to manage content
3. Changes save automatically

**Option 2: Direct File Editing**

1. Edit `src/data/products.json`
2. Save changes
3. Website updates automatically
4. Changes available via API immediately

### For Developers

- JSON schema validation
- TypeScript type safety
- Automated testing on data changes
- Hot reloading in development

## 📱 Mobile App Integration

Mobile developers can use the provided API endpoints and hooks:

```typescript
import { useCategories } from "@/hooks/useCategories";

// Get all categories
const { data: categories, isLoading, error } = useCategories();
```

## 🛠️ Development

Built with modern web development best practices:

- **Type Safety**: Full TypeScript implementation
- **Code Quality**: ESLint configuration
- **Testing**: Comprehensive test coverage
- **Performance**: Optimized builds and assets
- **Accessibility**: Screen reader support and keyboard navigation

## 📄 License

This project is part of the Moneybox technical assessment.

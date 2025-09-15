# Xeno Frontend - Multi-Tenant Shopify Analytics Dashboard

A modern, responsive React frontend for the Xeno multi-tenant Shopify analytics platform. Built with React, TypeScript, Vite, Ant Design, and featuring comprehensive analytics dashboards.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                   Xeno Frontend (React SPA)                 │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │  Admin Panel    │  │ Tenant Dashboard│  │ Auth System │ │
│  │                 │  │                 │  │             │ │
│  │ • Tenant Mgmt   │  │ • Analytics     │  │ • Sessions  │ │
│  │ • User Creation │  │ • Charts        │  │ • Basic Auth│ │
│  │ • System Admin  │  │ • Metrics       │  │ • OAuth     │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐ │
│  │   UI Library    │  │  State Mgmt     │  │  Routing    │ │
│  │                 │  │                 │  │             │ │
│  │ • Ant Design    │  │ • React Query   │  │ • React     │ │
│  │ • Recharts      │  │ • Context API   │  │   Router    │ │
│  │ • Custom Comps  │  │ • Local Storage │  │ • Auth Gate │ │
│  └─────────────────┘  └─────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              v
                    ┌─────────────────┐
                    │  Xeno Backend   │
                    │     API         │
                    └─────────────────┘
```

## ✨ Features

### Core Features
- **Multi-tenant Dashboard**: Separate admin and tenant interfaces
- **Dual Authentication**: Session-based admin auth + Basic auth for tenants
- **Shopify Integration**: OAuth flow and manual token input
- **Real-time Analytics**: Revenue, growth, and performance metrics
- **Responsive Design**: Mobile-first approach with Ant Design
- **Dark Mode**: Full dark theme support with persistence

### Dashboard Features
- **Revenue Analytics**: Time-series revenue tracking with interactive charts
- **Customer Insights**: Customer growth, top customers, and demographics
- **Order Analytics**: Orders by date, fulfillment status, and trends
- **Product Metrics**: Product growth and performance tracking
- **Event Monitoring**: Custom events and cart abandonment tracking
- **KPI Cards**: Key performance indicators with trend indicators

### User Experience
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Empty States**: Informative empty states with action prompts
- **Form Validation**: Real-time validation with clear error messages
- **Toast Notifications**: Success and error notifications

## 🛠️ Tech Stack

### Core Technologies
- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Full type safety and development experience
- **Vite**: Lightning-fast build tool and dev server
- **Ant Design**: Enterprise-class UI library
- **React Query**: Powerful data fetching and state management

### Supporting Libraries
- **Recharts**: Flexible charting library for analytics
- **React Router**: Client-side routing and navigation
- **Axios**: HTTP client for API communication
- **Day.js**: Date manipulation and formatting
- **ESLint**: Code linting and quality enforcement

## 📋 Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- **Xeno Backend** running (see backend README)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create `.env` file:

```bash
cp .env.example .env
```

Configure the API base URL:

```bash
# Backend API URL
VITE_API_BASE_URL=http://localhost:3000/api
```

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### 5. Docker Deployment

```bash
# Build Docker image
docker build -t xeno-frontend .

# Run with Docker Compose
docker-compose up --build
```

## 🏛️ Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   │   ├── ChartCard.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorState.tsx
│   │   ├── KpiCard.tsx
│   │   └── LoadingSkeleton.tsx
│   ├── layout/          # Layout components
│   │   ├── AppShell.tsx
│   │   └── Sidebar.tsx
│   ├── AdminPanel.tsx   # Admin management interface
│   ├── AuthLanding.tsx  # Authentication landing page
│   ├── TenantDashboard.tsx # Main tenant dashboard
│   ├── TenantLogin.tsx  # Tenant authentication
│   ├── CreateTenantForm.tsx # Tenant creation form
│   ├── TenantConnectShopify.tsx # Shopify connection
│   └── [Charts].tsx     # Various analytics charts
├── context/             # React contexts
│   ├── AuthContext.tsx  # Authentication state
│   └── ThemeContext.tsx # Theme management
├── lib/                 # Utilities and configurations
│   ├── api.ts          # API client and endpoints
│   ├── queryClient.ts  # React Query configuration
│   └── analyticsHooks.ts # Custom analytics hooks
├── assets/             # Static assets
├── App.tsx             # Main application component
└── main.tsx           # Application entry point
```

## 🔐 Authentication Flow

### Admin Authentication
1. **Bootstrap**: Create the first admin user via `/admin/bootstrap`
2. **Login**: Session-based authentication with HTTP-only cookies
3. **Access Control**: Full system access including tenant management
4. **Session Management**: Automatic session validation and renewal

### Tenant Authentication  
1. **Login**: Basic authentication with username/password
2. **Dashboard Access**: Tenant-specific data and analytics
3. **Shopify Connection**: OAuth or manual token input
4. **Data Isolation**: Row-level security ensuring data separation

### Shopify Integration
1. **OAuth Flow**: Redirect to Shopify for app installation
2. **Manual Token**: Direct token input for existing integrations
3. **Token Validation**: Backend validates tokens against Shopify API
4. **Secure Storage**: Encrypted token storage in database

## 📊 Dashboard Components

### Admin Panel
- **Tenant Management**: Create, view, and manage tenant accounts
- **User Management**: Create tenant users with auto-generated passwords
- **System Monitoring**: View system-wide metrics and health
- **Configuration**: Manage system settings and permissions

### Tenant Dashboard
- **Analytics Overview**: Key metrics and performance indicators
- **Revenue Charts**: Time-series revenue visualization
- **Customer Insights**: Customer growth and top customer analysis
- **Order Analytics**: Order trends and fulfillment tracking
- **Product Metrics**: Product performance and growth tracking
- **Event Monitoring**: Custom event tracking and analysis

### Chart Components
- **Revenue Over Time**: Line chart with date range selection
- **Customer Growth**: Cumulative and daily customer acquisition
- **Orders by Date**: Bar chart with order volume trends
- **Top Customers**: Table with customer ranking and spending
- **Product Growth**: Product addition trends over time
- **Events Summary**: Custom event occurrence tracking

## 🎨 Design System

### Theme Management
- **Light/Dark Mode**: Toggle between themes with persistence
- **Color Palette**: Consistent color scheme across components
- **Typography**: Hierarchical text styles with proper contrast
- **Spacing**: Consistent spacing scale using Ant Design tokens

### Component Library
- **KPI Cards**: Metric display with trend indicators
- **Chart Cards**: Reusable chart containers with titles and descriptions
- **Loading States**: Skeleton components for better perceived performance
- **Empty States**: Informative states when no data is available
- **Error States**: Clear error messaging with recovery actions

### Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Breakpoint System**: Responsive layout using Ant Design grid
- **Touch Friendly**: Appropriate touch targets and gestures
- **Accessibility**: WCAG compliant with proper ARIA labels

## 🔧 Configuration

### Environment Variables

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api

# Feature Flags (optional)
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
```

### Build Configuration

The project uses Vite with optimized configuration for:
- **Fast HMR**: Hot module replacement for rapid development
- **Tree Shaking**: Automatic dead code elimination
- **Code Splitting**: Automatic route-based code splitting
- **Asset Optimization**: Image and font optimization
- **TypeScript**: Full TypeScript support with type checking

### ESLint Configuration

Comprehensive linting rules for:
- **Code Quality**: Enforce best practices and patterns
- **TypeScript**: Type-aware linting rules
- **React**: React-specific linting and hooks rules
- **Accessibility**: A11y linting for better accessibility

## 🧪 Testing (Future Implementation)

### Testing Strategy
- **Unit Tests**: Component testing with React Testing Library
- **Integration Tests**: API integration and user flow testing
- **E2E Tests**: Full application testing with Playwright
- **Visual Testing**: Component visual regression testing

### Test Setup
```bash
# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest

# Run tests
npm run test

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Production Build
```bash
# Build optimized production bundle
npm run build

# The build output will be in the `dist/` directory
```

### Docker Deployment
```dockerfile
# Multi-stage build for optimized image size
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment-specific Configuration
- **Development**: Hot reload with source maps
- **Staging**: Production build with debug info
- **Production**: Optimized build with error tracking

## 📈 Performance Optimization

### Bundle Optimization
- **Code Splitting**: Automatic route-based splitting
- **Tree Shaking**: Unused code elimination
- **Asset Optimization**: Image compression and lazy loading
- **CDN Integration**: Static asset delivery optimization

### Runtime Performance
- **React Query**: Intelligent caching and background updates
- **Memo/Callback**: Optimized re-rendering with React hooks
- **Lazy Loading**: Component and route lazy loading
- **Virtual Scrolling**: Large list optimization (future)

### Monitoring
- **Core Web Vitals**: Performance metrics tracking
- **Error Tracking**: Runtime error monitoring
- **User Analytics**: Usage pattern analysis
- **Performance Budgets**: Build-time performance limits

## ⚠️ Known Limitations

### Current Limitations
1. **No Offline Support**: Requires internet connection for all features
2. **Limited Mobile Optimization**: Some charts not fully mobile-optimized
3. **No Real-time Updates**: Manual refresh required for data updates
4. **Memory Usage**: Large datasets may impact performance
5. **Browser Support**: Modern browsers only (ES2020+)

### Assumptions Made
1. **Backend Availability**: Assumes backend API is always available
2. **Data Freshness**: Acceptable delay in data synchronization
3. **User Permissions**: Assumes proper user role management in backend
4. **Network Stability**: Assumes stable internet connection
5. **Screen Sizes**: Optimized for common desktop and mobile sizes


## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with proper TypeScript types
4. Add tests for new functionality
5. Ensure all linting passes (`npm run lint`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Standards
- **TypeScript**: All new code must be fully typed
- **Components**: Use functional components with hooks
- **Styling**: Use Ant Design components and theme tokens
- **Testing**: Add tests for new components and features
- **Documentation**: Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using React, TypeScript, Vite, and Ant Design**

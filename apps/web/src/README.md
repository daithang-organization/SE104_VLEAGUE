# Source Code Directory (Web App)

Thư mục chứa toàn bộ source code của ứng dụng web frontend.

## Cấu trúc

```
src/
├── main.tsx               # Application entry point
├── App.tsx                # Root component
├── App.css                # Root component styles
├── index.css              # Global styles
│
├── assets/                # Static assets (images, icons, etc.)
├── auth/                  # Authentication context & types
├── pages/                 # Page components
└── services/              # API services & HTTP utilities
```

## Mô tả

### Core Files

#### `main.tsx`
Entry point của React application.

**Vai trò:**
- Render root React component
- Setup React Router (nếu có)
- Setup context providers
- Import global styles
- Initialize app-level configurations

#### `App.tsx`
Root component của ứng dụng.

**Vai trò:**
- Define application layout
- Setup routing structure
- Wrap với các providers (Auth, Theme, etc.)
- Handle app-level state

#### `index.css`
Global CSS styles.

**Chứa:**
- CSS reset/normalize
- CSS variables
- Typography
- Utility classes
- TailwindCSS directives (nếu dùng)

### Folders

#### `assets/`
Chứa static assets.

**Nội dung:**
- Images
- Icons/SVGs
- Fonts (nếu có)
- Other media files

**Usage:**
```tsx
import logo from './assets/logo.svg';
```

#### `auth/`
Authentication-related code.

**Chi tiết:** [auth/README.md](./auth/README.md)

**Chứa:**
- `AuthContext.tsx` - React Context cho auth state
- `auth.types.ts` - TypeScript types/interfaces

#### `pages/`
Page components cho các routes.

**Chi tiết:** [pages/README.md](./pages/README.md)

**Chứa:**
- `LoginPage.tsx` - Login/authentication page
- `StandingsPage.tsx` - League standings page
- `ReportsPage.tsx` - Reports/statistics page

#### `services/`
API services và HTTP utilities.

**Chi tiết:** [services/README.md](./services/README.md)

**Chứa:**
- `http.ts` - HTTP client configuration (axios/fetch)
- `authApi.ts` - Authentication API calls

## Folder Organization Pattern

```
feature-name/
├── ComponentName.tsx       # Component
├── ComponentName.test.tsx  # Tests
├── ComponentName.module.css # Styles (nếu dùng CSS modules)
├── hooks/                  # Custom hooks
├── types/                  # TypeScript types
└── utils/                  # Helper functions
```

## Component Structure

### Typical Component
```tsx
import { useState } from 'react';
import styles from './Component.module.css';

interface Props {
  // Props definition
}

export function Component({ ...props }: Props) {
  // Component logic
  
  return (
    <div className={styles.container}>
      {/* JSX */}
    </div>
  );
}
```

### Page Component
```tsx
export function PageName() {
  // Fetch data
  // Handle state
  
  return (
    <div>
      <h1>Page Title</h1>
      {/* Page content */}
    </div>
  );
}
```

## State Management

Hiện tại sử dụng:
- **Context API** cho auth state
- **useState/useReducer** cho local state

Có thể mở rộng với:
- Redux/Redux Toolkit
- Zustand
- Jotai/Recoil

## Routing

Nếu sử dụng React Router:
```tsx
// Trong App.tsx hoặc router.tsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/login" element={<LoginPage />} />
  <Route path="/standings" element={<StandingsPage />} />
  <Route path="/reports" element={<ReportsPage />} />
</Routes>
```

## API Integration

```tsx
// Sử dụng services
import { authApi } from '@/services/authApi';

const handleLogin = async (credentials) => {
  const response = await authApi.login(credentials);
  // Handle response
};
```

## Styling Strategy

### Options:
1. **CSS Modules** - Scoped styles
2. **TailwindCSS** - Utility-first
3. **Styled Components** - CSS-in-JS
4. **Sass/SCSS** - CSS preprocessor

### Current:
- Global CSS trong `index.css`
- Component CSS trong `App.css`

## Environment Variables

```env
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=VLeague Management
```

**Access:**
```tsx
const apiUrl = import.meta.env.VITE_API_URL;
```

## TypeScript

### tsconfig.json
Cấu hình TypeScript cho app.

**Key settings:**
- `jsx: "react-jsx"`
- Path aliases (nếu có)
- Strict mode enabled

### Type Safety
```tsx
// Props typing
interface Props {
  name: string;
  age?: number;
}

// API response typing
interface User {
  id: string;
  username: string;
  role: string;
}
```

## Development Workflow

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run linter
pnpm lint

# Run tests (if configured)
pnpm test
```

## Best Practices

### Components
- ✅ One component per file
- ✅ Use functional components
- ✅ Props destructuring
- ✅ TypeScript interfaces cho props
- ✅ Meaningful component names

### Code Organization
- ✅ Group by feature, không phải by type
- ✅ Co-locate related files
- ✅ Clear file naming conventions
- ✅ Consistent import ordering

### Performance
- ✅ Lazy load routes
- ✅ Memoize expensive computations
- ✅ Optimize re-renders
- ✅ Code splitting

### Accessibility
- ✅ Semantic HTML
- ✅ ARIA attributes khi cần
- ✅ Keyboard navigation
- ✅ Alt text cho images

## Adding New Features

1. **Create page component:**
   ```bash
   # Tạo file trong pages/
   touch src/pages/NewPage.tsx
   ```

2. **Add route:**
   ```tsx
   <Route path="/new" element={<NewPage />} />
   ```

3. **Create API service:**
   ```bash
   touch src/services/newApi.ts
   ```

4. **Update types:**
   ```bash
   # Add types vào appropriate file
   ```

## Testing (Future)

```bash
# Setup testing
pnpm add -D vitest @testing-library/react

# Run tests
pnpm test
```

## Bundle Analysis

```bash
# Analyze bundle size
pnpm build
# Check dist/ folder size
```

## Lưu ý

- Keep components small và focused
- Reuse common components
- Handle loading và error states
- Validate user input
- Sanitize data trước khi render

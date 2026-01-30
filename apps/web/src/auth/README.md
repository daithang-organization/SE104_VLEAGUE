# Auth Directory

Thư mục chứa authentication context, state management và types cho frontend.

## Mục đích

Quản lý authentication state và logic cho toàn bộ ứng dụng:
- User authentication state
- Login/logout functionality
- Protected routes
- Token management
- User session persistence

## Cấu trúc

```
auth/
├── AuthContext.tsx     # React Context for auth state
├── RequireAuth.tsx     # Protected route guard
├── RequireRole.tsx     # Role-based route guard
├── auth.types.ts       # TypeScript types & interfaces
└── index.ts            # Re-exports
```

## Components

### `AuthContext.tsx`
React Context Provider cho authentication state.

**Exports:**
- `AuthProvider` - Provider component
- `useAuth` - Custom hook để access auth state

**State Management:**
```tsx
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  token: string | null;
}
```

**Typical Implementation:**
```tsx
export function AuthProvider({ children }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for saved token
    // Validate token with backend
    // Restore user session
  }, []);

  const login = async (credentials: LoginCredentials) => {
    // Call login API
    // Save token to localStorage
    // Set user state
  };

  const logout = () => {
    // Clear token from localStorage
    // Clear user state
    // Redirect to login
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
```

### `auth.types.ts`
TypeScript definitions cho authentication.

**Types:**
```typescript
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  firstName?: string;
  lastName?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  token: string | null;
}
```

## Usage

### 1. Wrap App với AuthProvider

```tsx
// main.tsx hoặc App.tsx
import { AuthProvider } from './auth/AuthContext';

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
```

### 2. Use trong Components

```tsx
import { useAuth } from '@/auth/AuthContext';

function Header() {
  const { user, isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <LoginButton />;
  }

  return (
    <div>
      <span>Welcome, {user?.username}</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 3. Login Page

```tsx
import { useAuth } from '@/auth/AuthContext';

function LoginPage() {
  const { login, isLoading } = useAuth();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(credentials);
      navigate('/dashboard');
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### 4. Protected Routes

```tsx
import { useAuth } from '@/auth/AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }: Props) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Usage
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

### 5. Role-based Access

```tsx
function AdminRoute({ children }: Props) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || user?.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
```

## Token Management

### LocalStorage
```tsx
// Save token
localStorage.setItem('authToken', token);

// Get token
const token = localStorage.getItem('authToken');

// Remove token
localStorage.removeItem('authToken');
```

### Automatic Token Refresh
```tsx
useEffect(() => {
  if (!token) return;

  const interval = setInterval(async () => {
    // Refresh token trước khi expire
    const newToken = await refreshAccessToken();
    setToken(newToken);
  }, 15 * 60 * 1000); // 15 minutes

  return () => clearInterval(interval);
}, [token]);
```

## API Integration

```tsx
// Attach token to API requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Logout user
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Session Persistence

### On App Load
```tsx
useEffect(() => {
  const restoreSession = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      // Validate token với backend
      const user = await validateToken(token);
      setUser(user);
      setToken(token);
    } catch (error) {
      // Token invalid
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  restoreSession();
}, []);
```

## Security Best Practices

- ✅ Store tokens in localStorage/sessionStorage (not cookies for SPA)
- ✅ Validate tokens on every page load
- ✅ Implement token refresh mechanism
- ✅ Clear auth state on logout
- ✅ Use HTTPS in production
- ✅ Set appropriate token expiration
- ❌ Never log sensitive data
- ❌ Never store passwords
- ❌ Don't expose tokens in URLs

## Error Handling

```tsx
const login = async (credentials: LoginCredentials) => {
  setIsLoading(true);
  setError(null);

  try {
    const response = await authApi.login(credentials);
    setUser(response.user);
    setToken(response.accessToken);
    localStorage.setItem('authToken', response.accessToken);
  } catch (error) {
    setError('Invalid credentials');
    throw error;
  } finally {
    setIsLoading(false);
  }
};
```

## Testing

```tsx
// Mock AuthContext trong tests
const mockAuthContext = {
  user: { id: '1', username: 'test' },
  isAuthenticated: true,
  isLoading: false,
  login: jest.fn(),
  logout: jest.fn(),
  token: 'mock-token',
};

<AuthContext.Provider value={mockAuthContext}>
  <ComponentToTest />
</AuthContext.Provider>
```

## Future Enhancements

- Multi-factor authentication
- Remember me functionality
- Social login (Google, Facebook)
- Password reset flow
- Email verification
- Session timeout warnings

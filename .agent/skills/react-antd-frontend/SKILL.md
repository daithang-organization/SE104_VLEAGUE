---
name: React + Ant Design Frontend Development
description: Guide for developing frontend features using React, TypeScript, Vite, and Ant Design for SE104_VLEAGUE web application
---

# React + Ant Design Frontend Development Skill

This skill provides comprehensive guidance for developing the frontend web application in the SE104_VLEAGUE project using React, TypeScript, Vite, and Ant Design.

## Project Structure

The web frontend is located at `apps/web/` with the following structure:

```
apps/web/
├── src/
│   ├── main.tsx              # Application entry point
│   ├── App.tsx               # Root component with routing
│   ├── App.css               # Global styles
│   ├── auth/                 # Authentication context & guards
│   │   ├── AuthContext.tsx   # Auth state management
│   │   ├── RequireAuth.tsx   # Protected route guard
│   │   └── RequireRole.tsx   # Role-based route guard
│   ├── shell/                # Application shell/layout
│   │   ├── AppShell.tsx      # Main layout with sidebar
│   │   └── menu.ts           # Menu configuration
│   ├── components/           # Reusable components
│   │   ├── LoadingSkeleton.tsx  # Loading skeletons
│   │   └── ErrorBoundary.tsx    # Error handling
│   ├── pages/                # Page components
│   ├── services/             # API service layer
│   └── lib/                  # Utilities and helpers
├── public/                   # Static assets
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
└── tsconfig.json            # TypeScript configuration
```

## Core Technologies

- **Framework**: React 19.x
- **Build Tool**: Vite 7.x
- **Language**: TypeScript 5.9.x
- **UI Library**: Ant Design 6.x
- **Routing**: React Router DOM 7.x
- **Linting**: ESLint with React plugins

## Getting Started

### Development Server

```bash
cd apps/web
pnpm dev
```

Application runs at http://localhost:5173

### Build for Production

```bash
cd apps/web
pnpm build
```

### Preview Production Build

```bash
cd apps/web
pnpm preview
```

## Routing Map

All routes are defined in `src/App.tsx`. Routes are split into **public** (no auth required) and **protected** (wrapped in `RequireAuth` + `AppShell`):

### Public Routes

| Route                  | Page Component       | Description                    |
| ---------------------- | -------------------- | ------------------------------ |
| `/login`               | `LoginPage`          | Email/password + OAuth login   |
| `/register`            | `RegisterPage`       | New account registration       |
| `/verify-email`        | `VerifyEmailPage`    | OTP email verification         |
| `/forgot-password`     | `ForgotPasswordPage` | Request password reset         |
| `/reset-password`      | `ResetPasswordPage`  | Reset password with OTP        |
| `/auth/oauth-callback` | `OAuthCallbackPage`  | Google/Facebook OAuth callback |
| `/403`                 | `ForbiddenPage`      | Access denied page             |

### Protected Routes (inside `AppShell`)

| Route              | Page Component       | Description                |
| ------------------ | -------------------- | -------------------------- |
| `/`                | `DashboardPage`      | Main dashboard             |
| `/teams`           | `TeamsPage`          | Team management (CRUD)     |
| `/players`         | `PlayersPage`        | Player management (CRUD)   |
| `/schedule`        | `SchedulePage`       | Match schedule management  |
| `/matches`         | `MatchesPage`        | Match results & events     |
| `/standings`       | `StandingsPage`      | League standings table     |
| `/users`           | `UsersPage`          | User management (ADMIN)    |
| `/reports`         | `ReportsPage`        | Reports (Admin only)       |
| `/profile`         | `ProfilePage`        | User profile management    |
| `/change-password` | `ChangePasswordPage` | Password change form       |
| `/sessions`        | `SessionsPage`       | Active sessions management |

### Route Structure

```typescript
// App.tsx
<Routes>
  {/* Public */}
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  ...

  {/* Protected — wrapped in RequireAuth + AppShell */}
  <Route element={<RequireAuth><AppShell /></RequireAuth>}>
    <Route path="/" element={<DashboardPage />} />
    <Route path="/standings" element={<StandingsPage />} />
    ...
  </Route>

  {/* Fallback */}
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

## Creating a New Page

### 1. Create Page Component

Create a new file in `src/pages/`:

```typescript
// src/pages/TeamsPage.tsx
import { useState, useEffect } from 'react';
import { Table, Card, Button, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { fetchTeams } from '../services/api';
import type { Team } from '../types';

export function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await fetchTeams();
      setTeams(data);
    } catch (error) {
      message.error('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const columns: ColumnsType<Team> = [
    {
      title: 'Team Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
  ];

  return (
    <Card title="Teams" extra={<Button type="primary">Add Team</Button>}>
      <Table
        columns={columns}
        dataSource={teams}
        loading={loading}
        rowKey="id"
      />
    </Card>
  );
}
```

### 2. Add Route

Update `src/App.tsx`:

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { TeamsPage } from './pages/TeamsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/teams" element={<TeamsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

## API Integration

### HTTP Client Architecture

The project uses **two HTTP clients** — Axios (primary) and a fetch-based wrapper:

| File                   | Library   | Purpose                                            |
| ---------------------- | --------- | -------------------------------------------------- |
| `src/lib/api.ts`       | **Axios** | Primary HTTP client with token refresh interceptor |
| `src/services/http.ts` | `fetch`   | Secondary wrapper with error toast notifications   |

> [!IMPORTANT]
> **Use `lib/api.ts` (Axios)** for all new API calls. The `services/http.ts` fetch wrapper exists for legacy compatibility but the Axios instance provides automatic token refresh.

### Primary HTTP Client — `lib/api.ts`

Axios instance with automatic token management and refresh:

```typescript
// src/lib/api.ts
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Access token stored in-memory (never localStorage) for security
let accessTokenMem: string | null = null;
export function setAccessToken(token: string | null) { accessTokenMem = token; }
export function getAccessToken() { return accessTokenMem; }

// Refresh token in localStorage for session persistence across reloads
export function getRefreshToken() { return localStorage.getItem('refreshToken'); }
export function setRefreshToken(token: string | null) { ... }

// Request interceptor: attaches Bearer token
// Response interceptor: handles 401 with automatic token refresh + request queue
```

**Key features:**

- Access token in-memory only (security best practice)
- Refresh token in localStorage (persists across reloads)
- Automatic 401 → refresh → retry with request queuing
- Dispatches `auth:expired` event when refresh fails

### Auth API Service — `services/authApi.ts`

All authentication API functions (uses `lib/api.ts` under the hood):

```typescript
// src/services/authApi.ts
import { api } from '../lib/api';

// Auth operations
apiLogin(email, password, rememberMe?) → LoginResponse
apiRegister(email, password)            → RegisterResponse
apiVerifyEmail(email, otp)              → VerifyEmailResponse
apiResendOtp(email)                     → { message: string }
apiForgotPassword(email)                → { message: string }
apiResetPassword(email, otp, newPassword) → { message: string }
apiRefresh(refreshToken)                → RefreshResponse
apiLogout(refreshToken)                 → void
apiLogoutAll()                          → { revokedCount: number }

// Profile operations
apiGetMe()                              → UserProfile
apiUpdateProfile({ name?, avatarUrl? }) → UserProfile
apiChangePassword(current, new)         → { success: boolean }
apiSetPassword(newPassword)             → { success: boolean }

// Session management
apiGetSessions()                        → Session[]
apiRevokeSession(sessionId)             → { success: boolean }

// OAuth URLs
getGoogleAuthUrl()                      → string
getFacebookAuthUrl()                    → string
```

### Making API Calls in Components

```typescript
import { api } from '../lib/api';
import { message } from 'antd';

// GET request
const loadTeams = async () => {
  try {
    setLoading(true);
    const res = await api.get('/teams');
    setTeams(res.data);
  } catch (error) {
    message.error('Không thể tải danh sách đội bóng');
  } finally {
    setLoading(false);
  }
};

// POST request
const createTeam = async (data: CreateTeamDto) => {
  const res = await api.post('/teams', data);
  return res.data;
};
```

## TypeScript Types

### Type Organization

Types are **co-located** with their respective service/module files (no separate `src/types/` folder):

```typescript
// Types defined in src/services/authApi.ts
export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; role: string; name?: string | null };
};

export type UserProfile = {
  id: string;
  email: string;
  role: string;
  name?: string | null;
  avatarUrl?: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Session = {
  id: string;
  deviceName: string | null;
  userAgent: string | null;
  ipAddress: string | null;
  lastUsedAt: string | null;
  createdAt: string;
  expiresAt: string;
};

// Types defined in src/auth/auth.types.ts
export type User = {
  id: string;
  email: string;
  role: string;
  name?: string | null;
};

export type AuthContextValue = AuthState & {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  applyOAuthTokens: (accessToken: string, refreshToken: string) => void;
};
```

### Use Types in Components

```typescript
import type { UserProfile } from '../services/authApi';
import type { FC } from 'react';

interface TeamCardProps {
  team: { id: string; name: string; status: string };
  onClick?: (id: string) => void;
}

export const TeamCard: FC<TeamCardProps> = ({ team, onClick }) => {
  return (
    <Card onClick={() => onClick?.(team.id)}>
      <h3>{team.name}</h3>
      <p>Status: {team.status}</p>
    </Card>
  );
};
```

## Ant Design Components

### Common Components

#### Table with Actions

```typescript
import { Table, Button, Space, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const columns: ColumnsType<Team> = [
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Actions',
    key: 'actions',
    render: (_, record) => (
      <Space>
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEdit(record)}
        >
          Edit
        </Button>
        <Popconfirm
          title="Are you sure?"
          onConfirm={() => handleDelete(record.id)}
        >
          <Button type="link" danger icon={<DeleteOutlined />}>
            Delete
          </Button>
        </Popconfirm>
      </Space>
    ),
  },
];
```

#### Form with Validation

```typescript
import { Form, Input, Button, Select, message } from 'antd';

interface FormValues {
  name: string;
  status: string;
}

export function TeamForm() {
  const [form] = Form.useForm<FormValues>();

  const onFinish = async (values: FormValues) => {
    try {
      await createTeam(values);
      message.success('Team created successfully');
      form.resetFields();
    } catch (error) {
      message.error('Failed to create team');
    }
  };

  return (
    <Form form={form} onFinish={onFinish} layout="vertical">
      <Form.Item
        name="name"
        label="Team Name"
        rules={[{ required: true, message: 'Please enter team name' }]}
      >
        <Input placeholder="Enter team name" />
      </Form.Item>

      <Form.Item
        name="status"
        label="Status"
        initialValue="ACTIVE"
      >
        <Select>
          <Select.Option value="ACTIVE">Active</Select.Option>
          <Select.Option value="INACTIVE">Inactive</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Submit
        </Button>
      </Form.Item>
    </Form>
  );
}
```

#### Modal

```typescript
import { Modal, Button } from 'antd';
import { useState } from 'react';

export function TeamModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button type="primary" onClick={() => setIsOpen(true)}>
        Add Team
      </Button>

      <Modal
        title="Add Team"
        open={isOpen}
        onCancel={() => setIsOpen(false)}
        footer={null}
      >
        <TeamForm onSuccess={() => setIsOpen(false)} />
      </Modal>
    </>
  );
}
```

## Layout and Navigation

### AppShell with Role-Based Menu

The project uses `AppShell` component located at `src/shell/AppShell.tsx` which provides:

- Collapsible sidebar with role-based menu filtering
- Header with user dropdown (profile, change password, logout)
- Content area with nested routing via `<Outlet />`

```typescript
// src/shell/AppShell.tsx
import { Layout, Menu, Dropdown, Button } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { MENU } from './menu';

export default function AppShell() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  // Filter menu items based on user role
  const menuItems = useMemo(() => {
    const role = user?.role;
    return MENU.filter((m) => !m.roles || (role && m.roles.includes(role))).map((m) => ({
      key: m.key,
      label: m.label,
    }));
  }, [user]);

  const onMenuClick = (e: { key: string }) => {
    const menuItem = MENU.find((m) => m.key === e.key);
    if (menuItem) nav(menuItem.path);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <Menu
          theme="dark"
          mode="inline"
          items={menuItems}
          onClick={onMenuClick}
        />
      </Sider>
      <Layout>
        <Header>
          <Dropdown menu={{ items: userMenuItems }}>
            <Button type="text" style={{ color: 'white' }}>
              <UserOutlined /> {user?.email}
            </Button>
          </Dropdown>
        </Header>
        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
```

### Menu Configuration

```typescript
// src/shell/menu.ts
type MenuItem = {
  key: string;
  label: string;
  path: string;
  roles?: string[]; // Allowed roles (undefined = all authenticated users)
};

export const MENU: MenuItem[] = [
  { key: 'dashboard', label: 'Dashboard', path: '/', roles: ['ADMIN', 'TEAM_MANAGER', 'REFEREE'] },
  { key: 'teams', label: 'Đội bóng', path: '/teams', roles: ['ADMIN', 'TEAM_MANAGER'] },
  { key: 'players', label: 'Cầu thủ', path: '/players', roles: ['ADMIN', 'TEAM_MANAGER'] },
  { key: 'schedule', label: 'Lịch thi đấu', path: '/schedule', roles: ['ADMIN'] },
  { key: 'matches', label: 'Kết quả trận đấu', path: '/matches', roles: ['ADMIN', 'REFEREE'] },
  {
    key: 'standings',
    label: 'Bảng xếp hạng',
    path: '/standings',
    roles: ['ADMIN', 'TEAM_MANAGER', 'REFEREE'],
  },
  { key: 'users', label: 'Quản lý người dùng', path: '/users', roles: ['ADMIN'] },
  { key: 'reports', label: 'Báo cáo', path: '/reports', roles: ['ADMIN'] },
];
```

## Authentication Guards

### RequireAuth - Protected Routes

```typescript
// src/auth/RequireAuth.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthed } = useAuth();
  const location = useLocation();

  if (!isAuthed) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
```

### RequireRole - Role-Based Access

```typescript
// src/auth/RequireRole.tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

export function RequireRole({ allow, children }: { allow: string[]; children: ReactNode }) {
  const { user, isAuthed } = useAuth();

  if (!isAuthed || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allow.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}
```

### Usage in Routes

```typescript
// App.tsx
<Route element={<RequireAuth><AppShell /></RequireAuth>}>
  <Route path="/" element={<DashboardPage />} />
  <Route path="/teams" element={
    <RequireRole allow={['ADMIN', 'TEAM_MANAGER']}>
      <TeamsPage />
    </RequireRole>
  } />
</Route>
```

## Reusable UI Components

### LoadingSkeleton

Multi-purpose loading skeletons for different UI patterns:

```typescript
// src/components/LoadingSkeleton.tsx
import { Card, Skeleton, Table } from 'antd';

interface LoadingSkeletonProps {
  type?: 'card' | 'table' | 'form' | 'profile' | 'list';
  rows?: number;
}

export const LoadingSkeleton: FC<LoadingSkeletonProps> = ({ type = 'card', rows = 3 }) => {
  switch (type) {
    case 'table':
      return <TableSkeleton rows={rows} />;
    case 'form':
      return <FormSkeleton />;
    case 'profile':
      return <ProfileSkeleton />;
    case 'list':
      return <ListSkeleton rows={rows} />;
    default:
      return <CardSkeleton />;
  }
};

// Usage:
<LoadingSkeleton type="table" rows={5} />
<LoadingSkeleton type="profile" />
```

### ErrorBoundary

Catches runtime errors and displays user-friendly error page:

```typescript
// src/components/ErrorBoundary.tsx
import { Button, Result } from 'antd';
import { Component, type ReactNode } from 'react';

export class ErrorBoundary extends Component<Props, State> {
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error);
    // TODO: Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="Đã xảy ra lỗi"
          subTitle="Rất tiếc, đã có lỗi xảy ra. Vui lòng thử lại sau."
          extra={[
            <Button key="retry" type="primary" onClick={this.handleReset}>
              Thử lại
            </Button>,
          ]}
        />
      );
    }
    return this.props.children;
  }
}

// Usage in App.tsx:
<ErrorBoundary>
  <RouterProvider router={router} />
</ErrorBoundary>
```

## State Management Patterns

### useState for Local State

```typescript
const [data, setData] = useState<Team[]>([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### useEffect for Data Fetching

```typescript
useEffect(() => {
  let cancelled = false;

  async function loadData() {
    try {
      setLoading(true);
      const result = await fetchTeams();
      if (!cancelled) {
        setData(result);
      }
    } catch (err) {
      if (!cancelled) {
        setError(err.message);
      }
    } finally {
      if (!cancelled) {
        setLoading(false);
      }
    }
  }

  loadData();

  return () => {
    cancelled = true; // Cleanup to prevent state updates after unmount
  };
}, []); // Dependencies array
```

### Custom Hooks

```typescript
// src/hooks/useTeams.ts
import { useState, useEffect } from 'react';
import { fetchTeams } from '../services/api';
import type { Team } from '../types';

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => {
    try {
      setLoading(true);
      const data = await fetchTeams();
      setTeams(data);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, []);

  return { teams, loading, error, refetch };
}

// Usage in component
function TeamsPage() {
  const { teams, loading, error, refetch } = useTeams();

  if (loading) return <Spin />;
  if (error) return <Alert type="error" message={error.message} />;

  return <TeamList teams={teams} onUpdate={refetch} />;
}
```

## Environment Variables

### Configuration

Create `apps/web/.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### Usage in Code

```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;

// Type-safe env variables
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

> [!IMPORTANT]
> All environment variables must be prefixed with `VITE_` to be exposed to the client.

## Styling

### Global Styles

Edit `src/App.css`:

```css
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
}

.page-container {
  padding: 24px;
}

.table-actions {
  display: flex;
  gap: 8px;
}
```

### Inline Styles (TypeScript-safe)

```typescript
<div style={{ padding: '24px', backgroundColor: '#f5f5f5' }}>
  Content
</div>
```

### CSS Modules (Optional)

```typescript
// TeamCard.module.css
.card {
  border-radius: 8px;
  padding: 16px;
}

// TeamCard.tsx
import styles from './TeamCard.module.css';

export function TeamCard() {
  return <div className={styles.card}>...</div>;
}
```

## Best Practices

> [!TIP]
> **Component Organization**: Keep components small and focused. Extract reusable logic into custom hooks.

> [!TIP]
> **Type Safety**: Always define TypeScript interfaces for props, API responses, and form values.

> [!TIP]
> **Loading States**: Always show loading indicators (Ant Design's `Spin` component) while fetching data.

> [!WARNING]
> **Console Errors**: React 19 is strict about certain patterns. Always clean up effects and avoid state updates on unmounted components.

## Common Commands

```bash
# Development
cd apps/web
pnpm dev          # Start dev server (port 5173)

# Building
pnpm build        # Build for production
pnpm preview      # Preview production build

# Linting
pnpm lint         # Run ESLint
```

## Ant Design Customization

### Theme Configuration

```typescript
// src/main.tsx
import { ConfigProvider } from 'antd';

const theme = {
  token: {
    colorPrimary: '#1890ff',
    borderRadius: 4,
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ConfigProvider theme={theme}>
    <App />
  </ConfigProvider>
);
```

## Common Ant Design Components

- **Layout**: `Layout`, `Header`, `Content`, `Sider`, `Footer`
- **Navigation**: `Menu`, `Breadcrumb`, `Tabs`
- **Data Display**: `Table`, `Card`, `Descriptions`, `Tag`
- **Forms**: `Form`, `Input`, `Select`, `DatePicker`, `Checkbox`
- **Feedback**: `Modal`, `message`, `notification`, `Spin`, `Alert`
- **Buttons**: `Button`, `Dropdown`
- **Icons**: Import from `@ant-design/icons`

## Recommended Patterns

### Loading and Error States

```typescript
if (loading) {
  return <Spin tip="Loading..." />;
}

if (error) {
  return <Alert type="error" message="Error" description={error.message} />;
}

if (!data || data.length === 0) {
  return <Empty description="No data available" />;
}

return <DataDisplay data={data} />;
```

### Optimistic Updates

```typescript
async function handleUpdate(id: string, updates: Partial<Team>) {
  // Optimistically update UI
  setTeams(teams.map((t) => (t.id === id ? { ...t, ...updates } : t)));

  try {
    await updateTeam(id, updates);
    message.success('Updated successfully');
  } catch (error) {
    // Revert on error
    refetch();
    message.error('Update failed');
  }
}
```

## Authentication Context

### Auth Context Provider

```typescript
// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('accessToken');
    if (token) {
      authService.getProfile()
        .then(setUser)
        .catch(() => localStorage.removeItem('accessToken'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const { accessToken, user } = await authService.login(email, password);
    localStorage.setItem('accessToken', accessToken);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

### Usage

```typescript
// main.tsx
import { AuthProvider } from './contexts/AuthContext';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <App />
  </AuthProvider>
);

// In components
function UserProfile() {
  const { user, logout } = useAuth();
  return (
    <div>
      <span>Welcome, {user?.email}</span>
      <Button onClick={logout}>Logout</Button>
    </div>
  );
}
```

## Protected Routes

### ProtectedRoute Component

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
```

### Router Setup

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<HomePage />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />

        {/* Admin only */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminPage />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}
```

## Axios Interceptors

### API Client Setup

```typescript
// src/services/apiClient.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });

        localStorage.setItem('accessToken', data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
```

### Usage in Services

```typescript
// src/services/teams.ts
import { apiClient } from './apiClient';
import type { Team, CreateTeamDto } from '../types';

export const teamsService = {
  getAll: () => apiClient.get<Team[]>('/teams').then((res) => res.data),
  getById: (id: string) => apiClient.get<Team>(`/teams/${id}`).then((res) => res.data),
  create: (data: CreateTeamDto) => apiClient.post<Team>('/teams', data).then((res) => res.data),
  update: (id: string, data: Partial<CreateTeamDto>) =>
    apiClient.patch<Team>(`/teams/${id}`, data).then((res) => res.data),
  delete: (id: string) => apiClient.delete(`/teams/${id}`),
};
```

## Form Validation with Zod

### Install Zod

```bash
pnpm add zod
```

### Define Schema

```typescript
// src/schemas/team.schema.ts
import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters').max(100),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});

export const createPlayerSchema = z.object({
  fullName: z.string().min(2, 'Name is required').max(100),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  nationality: z.string().min(2, 'Nationality is required'),
  position: z.enum(['GK', 'DF', 'MF', 'FW']),
  teamId: z.string().uuid().optional(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
```

### Validation with Ant Design Form

```typescript
// src/components/TeamForm.tsx
import { Form, Input, Select, Button, message } from 'antd';
import { createTeamSchema, CreateTeamInput } from '../schemas/team.schema';

export function TeamForm({ onSuccess }: { onSuccess?: () => void }) {
  const [form] = Form.useForm<CreateTeamInput>();

  const validateWithZod = async (values: CreateTeamInput) => {
    const result = createTeamSchema.safeParse(values);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      Object.entries(errors).forEach(([field, messages]) => {
        form.setFields([{ name: field, errors: messages }]);
      });
      throw new Error('Validation failed');
    }
    return result.data;
  };

  const onFinish = async (values: CreateTeamInput) => {
    try {
      const validData = await validateWithZod(values);
      await teamsService.create(validData);
      message.success('Team created successfully');
      form.resetFields();
      onSuccess?.();
    } catch (error) {
      if (error instanceof Error && error.message !== 'Validation failed') {
        message.error('Failed to create team');
      }
    }
  };

  return (
    <Form form={form} onFinish={onFinish} layout="vertical">
      <Form.Item name="name" label="Team Name" rules={[{ required: true }]}>
        <Input placeholder="Enter team name" />
      </Form.Item>
      <Form.Item name="status" label="Status" initialValue="ACTIVE">
        <Select>
          <Select.Option value="ACTIVE">Active</Select.Option>
          <Select.Option value="INACTIVE">Inactive</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">Create Team</Button>
      </Form.Item>
    </Form>
  );
}
```

> [!TIP]
> Using Zod provides runtime type checking and better error messages compared to class-validator on the frontend.

```

```

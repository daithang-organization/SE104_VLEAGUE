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

| Route              | Page Component       | Description                   |
| ------------------ | -------------------- | ----------------------------- |
| `/`                | `DashboardPage`      | Main dashboard                |
| `/teams`           | `TeamsPage`          | Team management (CRUD)        |
| `/players`         | `PlayersPage`        | Player management (CRUD)      |
| `/schedule`        | `SchedulePage`       | Match schedule management     |
| `/seasons`         | `SeasonsPage`        | Season management (ADMIN)     |
| `/matches`         | `MatchesPage`        | Match results & events        |
| `/standings`       | `StandingsPage`      | League standings table        |
| `/regulations`     | `RegulationsPage`    | Regulation management (ADMIN) |
| `/reports`         | `ReportsPage`        | Reports & statistics          |
| `/users`           | `UsersPage`          | User management (ADMIN)       |
| `/profile`         | `ProfilePage`        | User profile management       |
| `/change-password` | `ChangePasswordPage` | Password change form          |
| `/sessions`        | `SessionsPage`       | Active sessions management    |

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

## Frontend Service API Reference

All service files are located in `src/services/` and use the primary Axios client (`lib/api.ts`).

> [!IMPORTANT]
> All service functions follow the naming pattern `api<Action><Entity>()`. Types are co-located and exported from each service file.

### Service Files Overview

| Service File      | #Functions | Key Types Exported                               |
| ----------------- | ---------- | ------------------------------------------------ |
| `authApi.ts`      | 16         | `LoginResponse`, `UserProfile`, `Session`        |
| `teamApi.ts`      | 5          | `Team`, `CreateTeamPayload`, `UpdateTeamPayload` |
| `playerApi.ts`    | 5          | `Player`, `CreatePlayerPayload`                  |
| `matchApi.ts`     | 3          | `Match`, `MatchEvent`, `AddMatchEventPayload`    |
| `scheduleApi.ts`  | 3          | `ScheduleMatch`                                  |
| `seasonApi.ts`    | 3          | `Season`                                         |
| `standingsApi.ts` | 4          | `TeamStanding`, `TopScorer`, `CardStat`          |
| `userApi.ts`      | 4          | `User`, `CreateUserPayload`                      |

### Detailed Function Reference

#### `teamApi.ts`

```typescript
apiGetTeams()                        → Team[]
apiGetTeam(id)                       → Team
apiCreateTeam(data)                  → Team
apiUpdateTeam(id, data)              → Team
apiDeleteTeam(id)                    → { success: boolean }
```

#### `playerApi.ts`

```typescript
apiGetPlayers()                      → Player[]
apiGetPlayer(id)                     → Player
apiCreatePlayer(data)                → Player
apiUpdatePlayer(id, data)            → Player
apiDeletePlayer(id)                  → { success: boolean }
```

#### `matchApi.ts`

```typescript
apiGetMatches(seasonId?)             → Match[]
apiGetMatch(id)                      → Match
apiAddMatchEvent(matchId, data)      → { ok, matchId, createdEvent }
```

#### `scheduleApi.ts`

```typescript
apiGetSchedule()                     → { ok, matches: ScheduleMatch[] }
apiGenerateSchedule()                → { ok, message }
apiPublishSchedule()                 → { ok, message }
```

#### `seasonApi.ts`

```typescript
apiGetSeasons()                      → Season[]
apiGetSeason(id)                     → Season
apiGetCurrentSeason()                → Season | null
```

#### `standingsApi.ts`

```typescript
apiGetStandings(seasonId?)           → TeamStanding[]
apiGetTopScorers(seasonId?, limit?)  → TopScorer[]
apiGetCardStats(seasonId?, limit?)   → CardStat[]
apiGetTeamStats(seasonId?)           → TeamStat[]
```

#### `userApi.ts`

```typescript
apiGetUsers()                        → User[]
apiCreateUser(data)                  → User
apiUpdateUserRole(id, role)          → User
apiDeleteUser(id)                    → { success: boolean }
```

### Legacy HTTP Client — `services/http.ts`

> [!WARNING]
> The fetch-based `http.ts` wrapper exists for legacy compatibility. It provides its own error toast notifications and status-specific handling (401→logout, 403→forbidden toast, 429→rate limit toast). **Do not use for new code** — use `lib/api.ts` (Axios) instead.

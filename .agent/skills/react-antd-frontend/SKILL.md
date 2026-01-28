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
│   ├── components/           # Reusable components
│   ├── pages/                # Page components
│   ├── services/             # API service layer
│   ├── types/                # TypeScript type definitions
│   └── utils/                # Utility functions
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

### Service Layer Pattern

Create API services in `src/services/`:

```typescript
// src/services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export async function fetchTeams() {
  const response = await fetch(`${API_BASE_URL}/teams`);
  if (!response.ok) {
    throw new Error('Failed to fetch teams');
  }
  return response.json();
}

export async function createTeam(data: CreateTeamDto) {
  const response = await fetch(`${API_BASE_URL}/teams`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create team');
  }
  
  return response.json();
}

export async function fetchTeamById(id: string) {
  const response = await fetch(`${API_BASE_URL}/teams/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch team');
  }
  return response.json();
}
```

### Error Handling

```typescript
import { message } from 'antd';

async function loadData() {
  try {
    setLoading(true);
    const data = await fetchData();
    setData(data);
  } catch (error) {
    console.error('Error loading data:', error);
    message.error('Failed to load data. Please try again.');
  } finally {
    setLoading(false);
  }
}
```

## TypeScript Types

### Define Types

Create type definitions in `src/types/`:

```typescript
// src/types/team.ts
export interface Team {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeamDto {
  name: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

// src/types/player.ts
export interface Player {
  id: string;
  fullName: string;
  dob: string;
  nationality: string;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  createdAt: string;
  updatedAt: string;
}

export type PlayerPosition = 'GK' | 'DF' | 'MF' | 'FW';
```

### Use Types in Components

```typescript
import type { Team } from '../types/team';
import type { FC } from 'react';

interface TeamCardProps {
  team: Team;
  onClick?: (team: Team) => void;
}

export const TeamCard: FC<TeamCardProps> = ({ team, onClick }) => {
  return (
    <Card onClick={() => onClick?.(team)}>
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

### Basic Layout with Ant Design

```typescript
import { Layout, Menu } from 'antd';
import { Link, Outlet } from 'react-router-dom';
import {
  TeamOutlined,
  TrophyOutlined,
  CalendarOutlined,
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;

export function AppLayout() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header>
        <h1 style={{ color: 'white' }}>VLeague Management</h1>
      </Header>
      
      <Layout>
        <Sider width={200}>
          <Menu mode="inline" defaultSelectedKeys={['teams']}>
            <Menu.Item key="teams" icon={<TeamOutlined />}>
              <Link to="/teams">Teams</Link>
            </Menu.Item>
            <Menu.Item key="matches" icon={<TrophyOutlined />}>
              <Link to="/matches">Matches</Link>
            </Menu.Item>
            <Menu.Item key="schedule" icon={<CalendarOutlined />}>
              <Link to="/schedule">Schedule</Link>
            </Menu.Item>
          </Menu>
        </Sider>
        
        <Content style={{ padding: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
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
  setTeams(teams.map(t => t.id === id ? { ...t, ...updates } : t));

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

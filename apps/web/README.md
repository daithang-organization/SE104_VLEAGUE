<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Ant%20Design-0170FE?style=for-the-badge&logo=ant-design&logoColor=white" alt="Ant Design"/>
</p>

<h1 align="center">🌐 VLeague Web</h1>

<p align="center">
  <strong>Frontend Application cho hệ thống quản lý giải VLeague</strong>
</p>

---

## 📋 Tổng quan

**VLeague Web** là ứng dụng frontend được xây dựng bằng React 19 + Vite, cung cấp giao diện người dùng hiện đại cho hệ thống quản lý giải bóng đá VLeague.

### ✨ Tính năng chính
- 🔐 **Login Page** - Đăng nhập vào hệ thống
- 📊 **Standings Page** - Xem bảng xếp hạng
- 📈 **Reports Page** - Xem báo cáo thống kê

---

## 🏗 Cấu trúc thư mục

```
apps/web/
├── 📂 public/                     # Static assets
│
├── 📂 src/
│   ├── 📄 main.tsx                # Entry point
│   ├── 📄 App.tsx                 # Root component & Routes
│   ├── 📄 App.css                 # Global styles
│   ├── 📄 index.css               # Base CSS
│   │
│   ├── 📂 assets/                 # 🖼️ Images, icons, fonts
│   │
│   ├── 📂 auth/                   # 🔐 Authentication
│   │   ├── AuthContext.tsx        # Auth context provider
│   │   └── auth.types.ts          # Auth type definitions
│   │
│   ├── 📂 pages/                  # 📄 Page Components
│   │   ├── LoginPage.tsx          # Trang đăng nhập
│   │   ├── StandingsPage.tsx      # Trang bảng xếp hạng
│   │   └── ReportsPage.tsx        # Trang báo cáo
│   │
│   └── 📂 services/               # 🔌 API Services
│       ├── http.ts                # HTTP client config
│       └── authApi.ts             # Auth API calls
│
├── 📄 index.html                  # HTML template
├── 📄 vite.config.ts              # Vite configuration
├── 📄 tsconfig.json               # TypeScript config
├── 📄 tsconfig.app.json           # App TypeScript config
├── 📄 tsconfig.node.json          # Node TypeScript config
└── 📄 eslint.config.js            # ESLint configuration
```

---

## 🚀 Bắt đầu

### Yêu cầu
- Node.js >= 20
- pnpm >= 8

### Cài đặt

```bash
# Từ root của project
cd apps/web

# Cài đặt dependencies (nếu chưa chạy ở root)
pnpm install
```

### Cấu hình Environment

Tạo file `.env` từ template:

```bash
cp .env.example .env
```

Nội dung file `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### Chạy Development Server

```bash
pnpm dev
```

App sẽ chạy tại: **http://localhost:5173**

---

## 📝 Các lệnh thường dùng

| Lệnh | Mô tả |
|------|-------|
| `pnpm dev` | Chạy development server với HMR |
| `pnpm build` | Build production |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Kiểm tra lỗi ESLint |

---

## 📂 Routing

App sử dụng **React Router v7** để quản lý routes:

| Path | Component | Mô tả |
|------|-----------|-------|
| `/` | Redirect | Chuyển hướng đến `/standings` |
| `/login` | `LoginPage` | Trang đăng nhập |
| `/standings` | `StandingsPage` | Bảng xếp hạng |
| `/reports` | `ReportsPage` | Báo cáo thống kê |

---

## 🎨 UI Components

Dự án sử dụng **Ant Design v6** làm UI Component Library.

### Import Components

```tsx
import { Button, Table, Form, Input } from 'antd';
```

### Theme Customization

Customize theme trong `App.tsx` hoặc tạo file riêng:

```tsx
import { ConfigProvider } from 'antd';

<ConfigProvider
  theme={{
    token: {
      colorPrimary: '#1890ff',
    },
  }}
>
  <App />
</ConfigProvider>
```

---

## 🔌 API Integration

### HTTP Client Setup

File `services/http.ts` chứa config cho HTTP client:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

### Ví dụ gọi API

```typescript
// services/authApi.ts
export const login = async (credentials: LoginCredentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  return response.json();
};
```

---

## 🔐 Authentication

### AuthContext

Sử dụng React Context để quản lý authentication state:

```tsx
// Wrap app với AuthProvider
<AuthProvider>
  <App />
</AuthProvider>

// Sử dụng trong component
const { user, login, logout } = useAuth();
```

---

## 📁 Hướng dẫn thêm Page mới

### 1. Tạo Page Component

```tsx
// src/pages/NewPage.tsx
export default function NewPage() {
  return (
    <div>
      <h1>New Page</h1>
    </div>
  );
}
```

### 2. Thêm Route

```tsx
// src/App.tsx
import NewPage from './pages/NewPage';

<Routes>
  {/* ... existing routes */}
  <Route path="/new-page" element={<NewPage />} />
</Routes>
```

---

## 📁 Hướng dẫn thêm Component mới

### Cấu trúc khuyến nghị

```
src/
├── components/
│   └── NewComponent/
│       ├── NewComponent.tsx       # Component chính
│       ├── NewComponent.css       # Styles (optional)
│       ├── NewComponent.test.tsx  # Tests
│       └── index.ts               # Export
```

### Example Component

```tsx
// src/components/MatchCard/MatchCard.tsx
import './MatchCard.css';

interface MatchCardProps {
  homeTeam: string;
  awayTeam: string;
  score?: string;
}

export function MatchCard({ homeTeam, awayTeam, score }: MatchCardProps) {
  return (
    <div className="match-card">
      <span>{homeTeam}</span>
      <span>{score ?? 'vs'}</span>
      <span>{awayTeam}</span>
    </div>
  );
}
```

---

## 🎯 Best Practices

### 1. Component Structure
- Một component một file
- Sử dụng TypeScript interfaces cho props
- Export default cho page components

### 2. State Management
- Sử dụng React Context cho global state
- useState cho local state
- Tránh prop drilling quá 2 levels

### 3. Styling
- Sử dụng Ant Design components khi có thể
- CSS Modules hoặc file CSS riêng cho custom styles
- Tránh inline styles

### 4. API Calls
- Tập trung trong thư mục `services/`
- Handle loading và error states
- Sử dụng TypeScript types cho responses

---

## 🛠 Cấu hình Vite

File `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
  },
});
```

---

## 📚 Tài liệu tham khảo

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/)
- [Ant Design Documentation](https://ant.design/)
- [React Router Documentation](https://reactrouter.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

<p align="center">
  <em>VLeague Web - Frontend Application</em>
</p>

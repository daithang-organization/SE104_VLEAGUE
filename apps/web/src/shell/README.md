# Shell Directory

Thư mục chứa layout chính và navigation của ứng dụng sau khi đăng nhập.

## Mục đích

Cung cấp "application shell" - khung giao diện bao quanh các trang nội dung:
- Sidebar navigation với menu
- Header với thông tin user và logout
- Content area cho nested routes
- Role-based menu filtering

## Cấu trúc

```
shell/
├── AppShell.tsx    # Main layout component
└── menu.ts         # Menu configuration với role permissions
```

## Files

### `menu.ts`

Cấu hình menu items với role-based access control.

**Type Definition:**
```typescript
type MenuItem = {
  key: string;      // Unique identifier
  label: string;    // Display text
  path: string;     // Route path
  roles?: string[]; // Allowed roles (undefined = all authenticated users)
};
```

**Cấu hình menu:**
```typescript
export const MENU: MenuItem[] = [
  { key: 'dashboard', label: 'Dashboard', path: '/', roles: ['ADMIN', 'TEAM_MANAGER', 'REFEREE'] },
  { key: 'teams', label: 'Đội bóng', path: '/teams', roles: ['ADMIN', 'TEAM_MANAGER'] },
  { key: 'schedule', label: 'Lịch thi đấu', path: '/schedule', roles: ['ADMIN'] },
  // ...
];
```

**Role Matrix:**
| Menu Item | ADMIN | TEAM_MANAGER | REFEREE |
|-----------|-------|--------------|---------|
| Dashboard | ✅ | ✅ | ✅ |
| Đội bóng | ✅ | ✅ | ❌ |
| Cầu thủ | ✅ | ✅ | ❌ |
| Lịch thi đấu | ✅ | ❌ | ❌ |
| Kết quả trận đấu | ✅ | ❌ | ✅ |
| Bảng xếp hạng | ✅ | ✅ | ✅ |
| Báo cáo | ✅ | ❌ | ❌ |

### `AppShell.tsx`

Layout component chính sử dụng Ant Design Layout.

**Structure:**
```
┌─────────────────────────────────────────┐
│ Sider          │ Header (user + logout) │
│ ┌───────────┐  ├───────────────────────┤
│ │ VLeague   │  │                       │
│ ├───────────┤  │                       │
│ │ Dashboard │  │      Content          │
│ │ Teams     │  │      (Outlet)         │
│ │ Players   │  │                       │
│ │ ...       │  │                       │
│ └───────────┘  │                       │
└─────────────────────────────────────────┘
```

**Features:**
- Collapsible sidebar
- Menu items filtered theo user role
- Active menu item highlighted theo current path
- User email và role hiển thị ở header
- Logout button với confirmation

**Sử dụng trong Router:**
```tsx
<Route
  element={
    <RequireAuth>
      <AppShell />
    </RequireAuth>
  }
>
  <Route path="/" element={<DashboardPage />} />
  <Route path="/teams" element={<TeamsPage />} />
  {/* Nested routes render trong <Outlet /> */}
</Route>
```

## Customization

### Thêm menu item mới

1. Thêm vào `menu.ts`:
```typescript
{ key: 'new-feature', label: 'Tính năng mới', path: '/new-feature', roles: ['ADMIN'] },
```

2. Thêm route trong `App.tsx`:
```tsx
<Route path="/new-feature" element={<NewFeaturePage />} />
```

### Thay đổi behavior (disabled thay vì hidden)

Trong `AppShell.tsx`, thay đổi logic filter:
```typescript
// Thay vì filter (ẩn hoàn toàn)
const items = MENU.filter(m => m.roles?.includes(role));

// Dùng map với disabled (hiện nhưng không click được)
const items = MENU.map(m => ({
  ...m,
  disabled: m.roles && !m.roles.includes(role),
}));
```

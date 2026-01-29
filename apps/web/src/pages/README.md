# Pages Directory

Thư mục chứa các page components (route-level components) của ứng dụng.

## Mục đích

Tổ chức các page components theo routes:
- Mỗi page tương ứng với một route
- Top-level components cho từng màn hình
- Compose từ các smaller components
- Handle page-level state và data fetching

## Cấu trúc

```
pages/
├── LoginPage.tsx          # Authentication page
├── StandingsPage.tsx      # League standings/rankings
└── ReportsPage.tsx        # Reports and statistics
```

## Pages

### `LoginPage.tsx`
Trang đăng nhập cho người dùng.

**Route:** `/login`

**Chức năng:**
- Login form với username/password
- Form validation
- Error handling
- Redirect sau khi login thành công
- "Remember me" option (optional)

**Typical Structure:**
```tsx
export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(credentials);
      navigate('/');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="login-page">
      <form onSubmit={handleSubmit}>
        <input 
          type="text"
          value={credentials.username}
          onChange={(e) => setCredentials({
            ...credentials,
            username: e.target.value
          })}
          placeholder="Username"
        />
        <input 
          type="password"
          value={credentials.password}
          onChange={(e) => setCredentials({
            ...credentials,
            password: e.target.value
          })}
          placeholder="Password"
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
```

**Features:**
- ✅ Form validation
- ✅ Loading state
- ✅ Error messages
- ✅ Password visibility toggle
- ✅ Accessibility (labels, ARIA)

---

### `StandingsPage.tsx`
Trang hiển thị bảng xếp hạng giải đấu.

**Route:** `/standings`

**Chức năng:**
- Hiển thị league table/standings
- Sắp xếp theo điểm, hiệu số, etc.
- Filter theo season/round
- Team statistics
- Position changes indicator

**Data Structure:**
```typescript
interface Standing {
  position: number;
  team: {
    id: string;
    name: string;
    logo: string;
  };
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form: string[]; // ['W', 'L', 'D', 'W', 'W']
}
```

**Typical Structure:**
```tsx
export function StandingsPage() {
  const [standings, setStandings] = useState<Standing[]>([]);
  const [season, setSeason] = useState('2026');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStandings(season);
  }, [season]);

  const fetchStandings = async (season: string) => {
    setLoading(true);
    try {
      const data = await standingsApi.getStandings(season);
      setStandings(data);
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="standings-page">
      <h1>League Standings</h1>
      <SeasonSelector 
        value={season} 
        onChange={setSeason} 
      />
      <StandingsTable standings={standings} />
    </div>
  );
}
```

**Features:**
- ✅ Season filter
- ✅ Sortable columns
- ✅ Responsive table
- ✅ Team logo display
- ✅ Form guide (last 5 matches)
- ✅ Position change indicators
- ✅ Highlighting (top 3, relegation zone)

---

### `ReportsPage.tsx`
Trang báo cáo và thống kê.

**Route:** `/reports`

**Chức năng:**
- Various statistics và reports
- Charts và visualizations
- Export reports (PDF, Excel)
- Custom date ranges
- Multiple report types

**Report Types:**
- Match statistics
- Player performance
- Team analytics
- Season summary
- Financial reports (if applicable)
- Attendance statistics

**Typical Structure:**
```tsx
export function ReportsPage() {
  const [reportType, setReportType] = useState('matches');
  const [dateRange, setDateRange] = useState({
    from: new Date(),
    to: new Date()
  });
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchReport();
  }, [reportType, dateRange]);

  const fetchReport = async () => {
    const reportData = await reportsApi.getReport(
      reportType, 
      dateRange
    );
    setData(reportData);
  };

  return (
    <div className="reports-page">
      <h1>Reports & Statistics</h1>
      
      <ReportControls
        reportType={reportType}
        onReportTypeChange={setReportType}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />

      <ReportVisualization 
        type={reportType}
        data={data}
      />

      <ExportButtons data={data} />
    </div>
  );
}
```

**Features:**
- ✅ Multiple report types
- ✅ Date range picker
- ✅ Charts/graphs (using Chart.js, Recharts)
- ✅ Export functionality
- ✅ Print view
- ✅ Filters và search

## Page Component Pattern

### Structure
```tsx
// 1. Imports
import { useState, useEffect } from 'react';
import { Component1, Component2 } from '@/components';
import { api } from '@/services';
import type { DataType } from '@/types';

// 2. Component
export function PageName() {
  // 3. State
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);

  // 4. Effects
  useEffect(() => {
    fetchData();
  }, []);

  // 5. Handlers
  const fetchData = async () => {
    // ...
  };

  // 6. Render logic
  if (loading) return <LoadingSpinner />;
  if (!data) return <ErrorMessage />;

  // 7. JSX
  return (
    <div className="page-name">
      {/* Page content */}
    </div>
  );
}
```

## Common Patterns

### Data Fetching
```tsx
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const result = await api.getData();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);
```

### Pagination
```tsx
const [page, setPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);

const fetchPage = async (pageNum: number) => {
  const result = await api.getData({ page: pageNum });
  setData(result.data);
  setTotalPages(result.totalPages);
};

<Pagination
  current={page}
  total={totalPages}
  onChange={setPage}
/>
```

### Filtering
```tsx
const [filters, setFilters] = useState({
  search: '',
  category: 'all',
  sort: 'name'
});

const filteredData = useMemo(() => {
  return data
    .filter(item => 
      item.name.includes(filters.search)
    )
    .filter(item => 
      filters.category === 'all' || 
      item.category === filters.category
    )
    .sort((a, b) => 
      a[filters.sort].localeCompare(b[filters.sort])
    );
}, [data, filters]);
```

## SEO & Meta Tags

```tsx
import { Helmet } from 'react-helmet';

export function StandingsPage() {
  return (
    <>
      <Helmet>
        <title>League Standings - VLeague</title>
        <meta name="description" content="Current VLeague standings and rankings" />
      </Helmet>
      
      <div className="standings-page">
        {/* Content */}
      </div>
    </>
  );
}
```

## Loading States

```tsx
if (loading) {
  return (
    <div className="page-loading">
      <Spinner />
      <p>Loading...</p>
    </div>
  );
}
```

## Error States

```tsx
if (error) {
  return (
    <div className="page-error">
      <ErrorIcon />
      <h2>Something went wrong</h2>
      <p>{error}</p>
      <button onClick={retry}>Try Again</button>
    </div>
  );
}
```

## Empty States

```tsx
if (data.length === 0) {
  return (
    <div className="page-empty">
      <EmptyIcon />
      <h2>No data available</h2>
      <p>There are no standings to display yet.</p>
    </div>
  );
}
```

## Adding New Pages

1. **Create page component:**
   ```bash
   touch src/pages/NewPage.tsx
   ```

2. **Add route:**
   ```tsx
   <Route path="/new" element={<NewPage />} />
   ```

3. **Create API service (nếu cần):**
   ```bash
   touch src/services/newApi.ts
   ```

4. **Add to navigation:**
   ```tsx
   <NavLink to="/new">New Page</NavLink>
   ```

## Best Practices

- ✅ One page per route
- ✅ Keep pages thin, extract logic to hooks/services
- ✅ Handle loading/error/empty states
- ✅ Use TypeScript types
- ✅ Memoize expensive computations
- ✅ Lazy load pages cho better performance
- ✅ Add proper meta tags
- ❌ Không viết business logic trong pages
- ❌ Tránh prop drilling (use context/state management)

import {
  BulbFilled,
  BulbOutlined,
  GlobalOutlined,
  KeyOutlined,
  LogoutOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  AutoComplete,
  Button,
  Dropdown,
  Input,
  Layout,
  Menu,
  message,
  Space,
  Spin,
  Typography,
} from 'antd';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiGlobalSearch, type SearchResult } from '../services/searchApi';
import { useTheme } from './ThemeContext';
import { MENU } from './menu';

const { Sider, Header, Content } = Layout;

export default function AppShell() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();
  const { i18n } = useTranslation();

  const toggleLang = () => {
    const next = i18n.language === 'vi' ? 'en' : 'vi';
    i18n.changeLanguage(next);
  };

  // ── Global Search ──
  const [searchOptions, setSearchOptions] = useState<
    { value: string; label: React.ReactNode; result: SearchResult }[]
  >([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onSearch = (value: string) => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!value || value.length < 2) {
      setSearchOptions([]);
      return;
    }
    searchTimerRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const results = await apiGlobalSearch(value, 8);
        setSearchOptions(
          results.map((r) => ({
            value: r.id,
            label: (
              <Space>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  [{r.type}]
                </Typography.Text>
                <span>{r.title}</span>
                {r.subtitle && <Typography.Text type="secondary">{r.subtitle}</Typography.Text>}
              </Space>
            ),
            result: r,
          })),
        );
      } catch {
        /* silent */
      }
      setSearchLoading(false);
    }, 300);
  };

  const onSelectSearch = (_: string, option: (typeof searchOptions)[number]) => {
    if (option.result.url) nav(option.result.url);
  };

  // Filter menu items based on user role
  const menuItems = useMemo(() => {
    const role = user?.role;
    return MENU.filter((m) => !m.roles || (role && m.roles.includes(role))).map((m) => ({
      key: m.key,
      label: m.label,
    }));
  }, [user]);

  // Find current selected key based on path
  const selectedKey = useMemo(() => {
    const currentPath = location.pathname;
    const matchedItem = MENU.find(
      (m) => currentPath === m.path || (m.path !== '/' && currentPath.startsWith(m.path)),
    );
    return matchedItem?.key || 'dashboard';
  }, [location.pathname]);

  const onMenuClick = (e: { key: string }) => {
    const menuItem = MENU.find((m) => m.key === e.key);
    if (menuItem) {
      nav(menuItem.path);
    }
  };

  const onLogout = async () => {
    await logout();
    message.info('Đã đăng xuất');
    nav('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin tài khoản',
      onClick: () => nav('/profile'),
    },
    {
      key: 'change-password',
      icon: <KeyOutlined />,
      label: 'Đổi mật khẩu',
      onClick: () => nav('/change-password'),
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: onLogout,
      danger: true,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div
          style={{
            padding: 16,
            color: 'white',
            fontWeight: 'bold',
            fontSize: 18,
            textAlign: 'center',
          }}
        >
          VLeague
        </div>
        <Menu
          theme="dark"
          mode="inline"
          items={menuItems}
          selectedKeys={[selectedKey]}
          onClick={onMenuClick}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 16,
            padding: '0 24px',
            background: isDark ? '#141414' : '#001529',
          }}
        >
          {/* Global Search */}
          <AutoComplete
            options={searchOptions}
            onSearch={onSearch}
            onSelect={onSelectSearch}
            style={{ width: 280 }}
            allowClear
          >
            <Input
              prefix={searchLoading ? <Spin size="small" /> : <SearchOutlined />}
              placeholder="Tìm kiếm..."
              style={{ borderRadius: 20 }}
            />
          </AutoComplete>

          {/* Dark Mode Toggle */}
          <Button
            type="text"
            icon={
              isDark ? (
                <BulbFilled style={{ color: '#fadb14' }} />
              ) : (
                <BulbOutlined style={{ color: 'white' }} />
              )
            }
            onClick={toggleTheme}
            title={isDark ? 'Chế độ sáng' : 'Chế độ tối'}
          />

          {/* Language Toggle */}
          <Button
            type="text"
            icon={<GlobalOutlined style={{ color: 'white' }} />}
            onClick={toggleLang}
            title={i18n.language === 'vi' ? 'Switch to English' : 'Chuyển sang Tiếng Việt'}
          >
            <span style={{ color: 'white', fontSize: 12, marginLeft: 4 }}>
              {i18n.language === 'vi' ? 'VI' : 'EN'}
            </span>
          </Button>

          <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
            <Button type="text" style={{ color: 'white' }}>
              <Space>
                <UserOutlined />
                {user?.email}
              </Space>
            </Button>
          </Dropdown>
        </Header>

        <Content style={{ padding: 24, background: isDark ? '#1a1a1a' : '#f5f5f5', minHeight: 0 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

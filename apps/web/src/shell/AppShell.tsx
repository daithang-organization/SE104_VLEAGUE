import { Button, Layout, Menu, message } from 'antd';
import { useMemo } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { MENU } from './menu';

const { Sider, Header, Content } = Layout;

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
            background: '#001529',
          }}
        >
          <span style={{ color: 'white' }}>
            {user?.email} ({user?.role})
          </span>
          <Button onClick={onLogout}>Đăng xuất</Button>
        </Header>

        <Content style={{ padding: 24, background: '#f5f5f5' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}

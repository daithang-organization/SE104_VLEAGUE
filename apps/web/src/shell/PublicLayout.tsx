import { TrophyOutlined } from '@ant-design/icons';
import { Button, Flex, Layout, Menu, Space, Typography } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const { Header, Content, Footer } = Layout;

const menuItems = [
  { key: '/public/standings', label: '🏆 Bảng xếp hạng' },
  { key: '/public/schedule', label: '📅 Lịch thi đấu' },
  { key: '/public/results', label: '⚽ Kết quả' },
];

export default function PublicLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <Flex align="center" gap={16}>
          <Space style={{ cursor: 'pointer' }} onClick={() => navigate('/public/standings')}>
            <TrophyOutlined style={{ fontSize: 24, color: '#fff' }} />
            <Typography.Title level={4} style={{ color: '#fff', margin: 0 }}>
              V-League
            </Typography.Title>
          </Space>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{
              background: 'transparent',
              borderBottom: 'none',
              color: '#fff',
              flex: 1,
            }}
            theme="dark"
          />
        </Flex>
        <Button type="primary" ghost onClick={() => navigate('/login')}>
          Đăng nhập
        </Button>
      </Header>

      <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: 'center', color: '#888' }}>
        V-League © {new Date().getFullYear()} — Hệ thống quản lý giải bóng đá
      </Footer>
    </Layout>
  );
}

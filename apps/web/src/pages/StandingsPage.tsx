import { Layout, Typography } from 'antd';

const { Header, Content } = Layout;

export default function StandingsPage() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <Typography.Title level={4} style={{ color: 'white', margin: 0 }}>
          VLEAGUE
        </Typography.Title>
      </Header>
      <Content style={{ padding: 24 }}>
        <Typography.Title level={2}>Standings</Typography.Title>
        <Typography.Paragraph>Standings page placeholder (Sprint 0)</Typography.Paragraph>
      </Content>
    </Layout>
  );
}

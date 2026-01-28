import { ConfigProvider, Layout, Typography } from 'antd';
import 'antd/dist/reset.css';
import React from 'react';
import ReactDOM from 'react-dom/client';

const { Header, Content } = Layout;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center' }}>
          <Typography.Title level={4} style={{ color: 'white', margin: 0 }}>
            VLEAGUE
          </Typography.Title>
        </Header>
        <Content style={{ padding: 24 }}>
          <Typography.Paragraph>Web scaffold OK ✅</Typography.Paragraph>
        </Content>
      </Layout>
    </ConfigProvider>
  </React.StrictMode>,
);

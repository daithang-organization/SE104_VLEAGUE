import { Button, Card, Form, Input, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiLogin } from '../services/authApi';

export default function LoginPage() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [msg, contextHolder] = message.useMessage();

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      const res = await apiLogin(values.username, values.password);
      login(res.accessToken);
      msg.success('Logged in (stub)');
      nav('/standings');
    } catch (e) {
      msg.error('Login failed');
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', height: '100vh', padding: 16 }}>
      {contextHolder}
      <Card style={{ width: 360 }}>
        <Typography.Title level={4} style={{ marginTop: 0 }}>
          VLeague Admin
        </Typography.Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item name="username" label="Username" rules={[{ required: true }]}>
            <Input placeholder="demo" />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={[{ required: true }]}>
            <Input.Password placeholder="demo" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block>
            Login
          </Button>
        </Form>
      </Card>
    </div>
  );
}

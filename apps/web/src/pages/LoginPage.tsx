import { Button, Card, Form, Input, message, Space, Typography } from 'antd';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function LoginPage() {
  const nav = useNavigate();
  const location = useLocation();
  const { login, isAuthed } = useAuth();
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to intended page
  const from = (location.state as { from?: string })?.from || '/';
  if (isAuthed) {
    nav(from, { replace: true });
    return null;
  }

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success('Đăng nhập thành công');
      nav(from, { replace: true });
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Đăng nhập thất bại';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 16 }}>
      <Card style={{ width: 360 }}>
        <Typography.Title level={4} style={{ marginTop: 0, textAlign: 'center' }}>
          VLeague Admin
        </Typography.Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input placeholder="admin@vleague.local" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 8 }}>
            <Link to="/forgot-password" style={{ float: 'right' }}>
              Quên mật khẩu?
            </Link>
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Đăng nhập
          </Button>
        </Form>
        <Space direction="vertical" style={{ width: '100%', marginTop: 16, textAlign: 'center' }}>
          <div>
            Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
          </div>
          <div>
            <Link to="/verify-email">Xác thực email</Link>
          </div>
        </Space>
      </Card>
    </div>
  );
}

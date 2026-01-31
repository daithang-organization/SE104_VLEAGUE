import { GoogleOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Divider, Form, Input, message, Space, Typography } from 'antd';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getGoogleAuthUrl } from '../services/authApi';

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

  const onFinish = async (values: { email: string; password: string; rememberMe?: boolean }) => {
    setLoading(true);
    try {
      await login(values.email, values.password, values.rememberMe);
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

  const handleGoogleLogin = () => {
    window.location.href = getGoogleAuthUrl();
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 16 }}>
      <Card style={{ width: 380 }}>
        <Typography.Title level={4} style={{ marginTop: 0, textAlign: 'center' }}>
          VLeague Admin
        </Typography.Title>
        <Form layout="vertical" onFinish={onFinish} initialValues={{ rememberMe: false }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Form.Item name="rememberMe" valuePropName="checked" noStyle>
                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>
              <Link to="/forgot-password">Quên mật khẩu?</Link>
            </div>
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Đăng nhập
          </Button>
        </Form>

        <Divider plain>hoặc</Divider>

        <Button
          icon={<GoogleOutlined />}
          block
          onClick={handleGoogleLogin}
          style={{ marginBottom: 16 }}
        >
          Đăng nhập với Google
        </Button>

        <Space direction="vertical" style={{ width: '100%', textAlign: 'center' }}>
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

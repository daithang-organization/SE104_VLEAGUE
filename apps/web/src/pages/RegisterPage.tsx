import { Button, Card, Form, Input, Typography, message } from 'antd';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiRegister } from '../services/authApi';

export default function RegisterPage() {
  const nav = useNavigate();
  const { isAuthed } = useAuth();
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to home
  if (isAuthed) {
    nav('/', { replace: true });
    return null;
  }

  const onFinish = async (values: { email: string; password: string; confirmPassword: string }) => {
    if (values.password !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      await apiRegister(values.email, values.password);
      message.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực.');
      nav('/verify-email', { state: { email: values.email } });
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Đăng ký thất bại';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 16 }}>
      <Card style={{ width: 400 }}>
        <Typography.Title level={4} style={{ marginTop: 0, textAlign: 'center' }}>
          Đăng ký tài khoản
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
            <Input placeholder="email@example.com" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                message: 'Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt',
              },
            ]}
            extra="Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)"
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Đăng ký
          </Button>
        </Form>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </div>
      </Card>
    </div>
  );
}

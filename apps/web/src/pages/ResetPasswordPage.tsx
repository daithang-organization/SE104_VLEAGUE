import { Button, Card, Form, Input, Typography, message, Space } from 'antd';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiResetPassword, apiForgotPassword } from '../services/authApi';

export default function ResetPasswordPage() {
  const nav = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Get email from navigation state
  const initialEmail = (location.state as { email?: string })?.email || '';

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onFinish = async (values: {
    email: string;
    otp: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      await apiResetPassword(values.email, values.otp, values.newPassword);
      message.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập.');
      nav('/login');
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Đặt lại mật khẩu thất bại';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (email: string) => {
    if (!email) {
      message.warning('Vui lòng nhập email trước');
      return;
    }
    setResendLoading(true);
    try {
      await apiForgotPassword(email);
      message.success('Đã gửi lại mã OTP. Vui lòng kiểm tra email.');
      setCountdown(60);
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Gửi lại OTP thất bại';
      message.error(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 16 }}>
      <Card style={{ width: 400 }}>
        <Typography.Title level={4} style={{ marginTop: 0, textAlign: 'center' }}>
          Đặt lại mật khẩu
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ textAlign: 'center' }}>
          Nhập mã OTP và mật khẩu mới
        </Typography.Paragraph>
        <Form layout="vertical" onFinish={onFinish} initialValues={{ email: initialEmail }}>
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
            name="otp"
            label="Mã OTP"
            rules={[
              { required: true, message: 'Vui lòng nhập mã OTP' },
              { len: 6, message: 'Mã OTP phải có 6 số' },
              { pattern: /^\d+$/, message: 'Mã OTP chỉ chứa số' },
            ]}
          >
            <Input
              placeholder="000000"
              maxLength={6}
              style={{ textAlign: 'center', fontSize: 24, letterSpacing: 8 }}
            />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                message: 'Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt',
              },
            ]}
            extra="Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt"
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Button type="primary" htmlType="submit" block loading={loading}>
              Đặt lại mật khẩu
            </Button>
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => (
                <Button
                  block
                  onClick={() => handleResendOtp(getFieldValue('email'))}
                  loading={resendLoading}
                  disabled={countdown > 0}
                >
                  {countdown > 0 ? `Gửi lại OTP (${countdown}s)` : 'Gửi lại OTP'}
                </Button>
              )}
            </Form.Item>
          </Space>
        </Form>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Link to="/login">Quay lại đăng nhập</Link>
        </div>
      </Card>
    </div>
  );
}

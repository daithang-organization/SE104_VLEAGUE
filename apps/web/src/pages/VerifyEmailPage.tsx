import { Button, Card, Form, Input, Typography, message, Space } from 'antd';
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiVerifyEmail, apiResendOtp } from '../services/authApi';

export default function VerifyEmailPage() {
  const nav = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Get email from navigation state or let user enter it
  const initialEmail = (location.state as { email?: string })?.email || '';

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const onFinish = async (values: { email: string; otp: string }) => {
    setLoading(true);
    try {
      await apiVerifyEmail(values.email, values.otp);
      message.success('Xác thực email thành công! Bạn có thể đăng nhập ngay.');
      nav('/login');
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Xác thực thất bại';
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
      await apiResendOtp(email);
      message.success('Đã gửi lại mã OTP. Vui lòng kiểm tra email.');
      setCountdown(60); // 60 seconds cooldown
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
          Xác thực Email
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ textAlign: 'center' }}>
          Nhập mã OTP 6 số đã được gửi đến email của bạn
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
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Button type="primary" htmlType="submit" block loading={loading}>
              Xác thực
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

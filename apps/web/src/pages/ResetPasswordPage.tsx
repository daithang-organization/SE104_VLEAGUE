import { Button, Card, Form, Input, message, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiForgotPassword, apiResetPassword } from '../services/authApi';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
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
      message.error(t('resetPassword.confirmPasswordMismatch'));
      return;
    }

    setLoading(true);
    try {
      await apiResetPassword(values.email, values.otp, values.newPassword);
      message.success(t('resetPassword.success'));
      nav('/login');
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t('resetPassword.error');
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (email: string) => {
    if (!email) {
      message.warning(t('resetPassword.resendEmailWarning'));
      return;
    }
    setResendLoading(true);
    try {
      await apiForgotPassword(email);
      message.success(t('resetPassword.resendSuccess'));
      setCountdown(60);
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t('resetPassword.resendError');
      message.error(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 16 }}>
      <Card style={{ width: 400 }}>
        <Typography.Title level={4} style={{ marginTop: 0, textAlign: 'center' }}>
          {t('resetPassword.title')}
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ textAlign: 'center' }}>
          {t('resetPassword.subtitle')}
        </Typography.Paragraph>
        <Form layout="vertical" onFinish={onFinish} initialValues={{ email: initialEmail }}>
          <Form.Item
            name="email"
            label={t('resetPassword.emailLabel')}
            rules={[
              { required: true, message: t('resetPassword.emailRequired') },
              { type: 'email', message: t('resetPassword.emailInvalid') },
            ]}
          >
            <Input placeholder={t('resetPassword.emailPlaceholder')} />
          </Form.Item>
          <Form.Item
            name="otp"
            label={t('resetPassword.otpLabel')}
            rules={[
              { required: true, message: t('resetPassword.otpRequired') },
              { len: 6, message: t('resetPassword.otpLength') },
              { pattern: /^\d+$/, message: t('resetPassword.otpDigitsOnly') },
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
            label={t('resetPassword.newPasswordLabel')}
            rules={[
              { required: true, message: t('resetPassword.newPasswordRequired') },
              { min: 8, message: t('resetPassword.newPasswordMin') },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                message: t('resetPassword.newPasswordPattern'),
              },
            ]}
            extra={t('resetPassword.newPasswordExtra')}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={t('resetPassword.confirmPasswordLabel')}
            dependencies={['newPassword']}
            rules={[
              { required: true, message: t('resetPassword.confirmPasswordRequired') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('resetPassword.confirmPasswordMismatch')));
                },
              }),
            ]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Button type="primary" htmlType="submit" block loading={loading}>
              {t('resetPassword.submitBtn')}
            </Button>
            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) => (
                <Button
                  block
                  onClick={() => handleResendOtp(getFieldValue('email'))}
                  loading={resendLoading}
                  disabled={countdown > 0}
                >
                  {countdown > 0
                    ? t('resetPassword.resendOtpCountdown', { seconds: countdown })
                    : t('resetPassword.resendOtpBtn')}
                </Button>
              )}
            </Form.Item>
          </Space>
        </Form>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Link to="/login">{t('resetPassword.backToLogin')}</Link>
        </div>
      </Card>
    </div>
  );
}

import { Button, Card, Form, Input, message, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { apiResendOtp, apiVerifyEmail } from '../services/authApi';

export default function VerifyEmailPage() {
  const { t } = useTranslation();
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
      message.success(t('verifyEmail.success'));
      nav('/login');
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t('verifyEmail.error');
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (email: string) => {
    if (!email) {
      message.warning(t('verifyEmail.resendEmailWarning'));
      return;
    }
    setResendLoading(true);
    try {
      await apiResendOtp(email);
      message.success(t('verifyEmail.resendSuccess'));
      setCountdown(60); // 60 seconds cooldown
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t('verifyEmail.resendError');
      message.error(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 16 }}>
      <Card style={{ width: 400 }}>
        <Typography.Title level={4} style={{ marginTop: 0, textAlign: 'center' }}>
          {t('verifyEmail.title')}
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ textAlign: 'center' }}>
          {t('verifyEmail.subtitle')}
        </Typography.Paragraph>
        <Form layout="vertical" onFinish={onFinish} initialValues={{ email: initialEmail }}>
          <Form.Item
            name="email"
            label={t('verifyEmail.emailLabel')}
            rules={[
              { required: true, message: t('verifyEmail.emailRequired') },
              { type: 'email', message: t('verifyEmail.emailInvalid') },
            ]}
          >
            <Input placeholder={t('verifyEmail.emailPlaceholder')} />
          </Form.Item>
          <Form.Item
            name="otp"
            label={t('verifyEmail.otpLabel')}
            rules={[
              { required: true, message: t('verifyEmail.otpRequired') },
              { len: 6, message: t('verifyEmail.otpLength') },
              { pattern: /^\d+$/, message: t('verifyEmail.otpDigitsOnly') },
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
              {t('verifyEmail.submitBtn')}
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
                    ? t('verifyEmail.resendOtpCountdown', { seconds: countdown })
                    : t('verifyEmail.resendOtpBtn')}
                </Button>
              )}
            </Form.Item>
          </Space>
        </Form>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Link to="/login">{t('verifyEmail.backToLogin')}</Link>
        </div>
      </Card>
    </div>
  );
}

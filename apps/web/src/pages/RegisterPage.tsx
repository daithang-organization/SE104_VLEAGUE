import { Button, Card, Form, Input, Typography, message } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { apiRegister } from '../services/authApi';

export default function RegisterPage() {
  const { t } = useTranslation();
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
      message.error(t('register.confirmPasswordMismatch'));
      return;
    }

    setLoading(true);
    try {
      await apiRegister(values.email, values.password);
      message.success(t('register.success'));
      nav('/verify-email', { state: { email: values.email } });
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t('register.error');
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 16 }}>
      <Card style={{ width: 400 }}>
        <Typography.Title level={4} style={{ marginTop: 0, textAlign: 'center' }}>
          {t('register.title')}
        </Typography.Title>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            label={t('register.emailLabel')}
            rules={[
              { required: true, message: t('register.emailRequired') },
              { type: 'email', message: t('register.emailInvalid') },
            ]}
          >
            <Input placeholder={t('register.emailPlaceholder')} />
          </Form.Item>
          <Form.Item
            name="password"
            label={t('register.passwordLabel')}
            rules={[
              { required: true, message: t('register.passwordRequired') },
              { min: 8, message: t('register.passwordMin') },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                message: t('register.passwordPattern'),
              },
            ]}
            extra={t('register.passwordExtra')}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={t('register.confirmPasswordLabel')}
            dependencies={['password']}
            rules={[
              { required: true, message: t('register.confirmPasswordRequired') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('register.confirmPasswordMismatch')));
                },
              }),
            ]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            {t('register.submitBtn')}
          </Button>
        </Form>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          {t('register.hasAccount')} <Link to="/login">{t('register.loginLink')}</Link>
        </div>
      </Card>
    </div>
  );
}

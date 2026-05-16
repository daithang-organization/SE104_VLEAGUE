import { FacebookOutlined, GoogleOutlined } from '@ant-design/icons';
import { Button, Card, Checkbox, Divider, Form, Input, message, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getFacebookAuthUrl, getGoogleAuthUrl } from '../services/authApi';

export default function LoginPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const location = useLocation();
  const { login, isAuthed } = useAuth();
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to intended page
  const from = (location.state as { from?: string })?.from || '/';
  useEffect(() => {
    if (isAuthed) {
      nav(from, { replace: true });
    }
  }, [from, isAuthed, nav]);

  const onFinish = async (values: { email: string; password: string; rememberMe?: boolean }) => {
    setLoading(true);
    try {
      await login(values.email, values.password, values.rememberMe);
      message.success(t('login.success'));
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t('login.error');
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthed) return null;

  const handleGoogleLogin = () => {
    window.location.href = getGoogleAuthUrl();
  };

  const handleFacebookLogin = () => {
    window.location.href = getFacebookAuthUrl();
  };

  return (
    <div
      style={{
        display: 'grid',
        placeItems: 'center',
        minHeight: '100vh',
        padding: 16,
        background: 'var(--bg)',
      }}
    >
      <Card style={{ width: 380 }}>
        <Typography.Title level={4} style={{ marginTop: 0, textAlign: 'center' }}>
          {t('login.title')}
        </Typography.Title>
        <Form layout="vertical" onFinish={onFinish} initialValues={{ rememberMe: false }}>
          <Form.Item
            name="email"
            label={t('login.emailLabel')}
            rules={[
              { required: true, message: t('login.emailRequired') },
              { type: 'email', message: t('login.emailInvalid') },
            ]}
          >
            <Input placeholder={t('login.emailPlaceholder')} />
          </Form.Item>
          <Form.Item
            name="password"
            label={t('login.passwordLabel')}
            rules={[{ required: true, message: t('login.passwordRequired') }]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Form.Item name="rememberMe" valuePropName="checked" noStyle>
                <Checkbox>{t('login.rememberMe')}</Checkbox>
              </Form.Item>
              <Link to="/forgot-password">{t('login.forgotPassword')}</Link>
            </div>
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            {t('login.submitBtn')}
          </Button>
        </Form>

        <Divider plain>{t('login.divider')}</Divider>

        <Space orientation="vertical" style={{ width: '100%' }}>
          <Button icon={<GoogleOutlined />} block onClick={handleGoogleLogin}>
            {t('login.googleBtn')}
          </Button>
          <Button
            icon={<FacebookOutlined />}
            block
            onClick={handleFacebookLogin}
            style={{ backgroundColor: '#1877f2', borderColor: '#1877f2', color: 'white' }}
          >
            {t('login.facebookBtn')}
          </Button>
        </Space>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Space orientation="vertical">
            <span>
              {t('login.noAccount')} <Link to="/register">{t('login.registerLink')}</Link>
            </span>
            <Link to="/verify-email">{t('login.verifyEmailLink')}</Link>
          </Space>
        </div>
      </Card>
    </div>
  );
}

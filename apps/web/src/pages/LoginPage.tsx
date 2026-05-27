import {
  BarChartOutlined,
  CalendarOutlined,
  FacebookOutlined,
  GoogleOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Button, Card, Checkbox, Divider, Form, Input, message, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { getFacebookAuthUrl, getGoogleAuthUrl } from '../services/authApi';

const seasonLogoSrc = '/V.League_1_2025-26_logo.svg.png';

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

  const features = [
    {
      icon: <CalendarOutlined />,
      title: t('login.featureCompetitionTitle'),
      description: t('login.featureCompetitionDesc'),
    },
    {
      icon: <TeamOutlined />,
      title: t('login.featureTeamsTitle'),
      description: t('login.featureTeamsDesc'),
    },
    {
      icon: <BarChartOutlined />,
      title: t('login.featureReportsTitle'),
      description: t('login.featureReportsDesc'),
    },
  ];

  return (
    <div className="login-page">
      <div
        className="login-football-background"
        data-testid="login-football-background"
        aria-hidden="true"
      >
        <div className="login-pitch-lines">
          <span className="login-pitch-center" />
          <span className="login-pitch-box login-pitch-box-left" />
          <span className="login-pitch-box login-pitch-box-right" />
        </div>
        <div className="login-goal-line">
          <span />
          <span />
          <span />
        </div>
        <span className="login-ball login-ball-one" />
        <span className="login-ball login-ball-two" />
        <span className="login-ball login-ball-three" />
      </div>

      <section className="login-showcase" aria-labelledby="login-system-title">
        <div className="login-brand-row">
          <div className="login-brand-mark">
            <img className="login-season-logo" src={seasonLogoSrc} alt="V.League 1 2025/26" />
          </div>
          <div>
            <Typography.Text className="login-eyebrow">{t('login.systemEyebrow')}</Typography.Text>
            <Typography.Title id="login-system-title" level={1} className="login-system-title">
              {t('login.systemTitle')}
            </Typography.Title>
          </div>
        </div>

        <Typography.Paragraph className="login-system-intro">
          {t('login.systemIntro')}
        </Typography.Paragraph>

        <div className="login-feature-grid">
          {features.map((feature) => (
            <div className="login-feature" key={feature.title}>
              <span className="login-feature-icon" aria-hidden="true">
                {feature.icon}
              </span>
              <div>
                <Typography.Text strong>{feature.title}</Typography.Text>
                <Typography.Paragraph>{feature.description}</Typography.Paragraph>
              </div>
            </div>
          ))}
        </div>

        <div className="login-trust-strip" aria-label={t('login.trustLabel')}>
          <div>
            <strong>{t('login.statSeasonValue')}</strong>
            <span>{t('login.statSeasonLabel')}</span>
          </div>
          <div>
            <strong>{t('login.statClubValue')}</strong>
            <span>{t('login.statClubLabel')}</span>
          </div>
          <div>
            <strong>
              <SafetyCertificateOutlined /> {t('login.statRoleValue')}
            </strong>
            <span>{t('login.statRoleLabel')}</span>
          </div>
        </div>
      </section>

      <section className="login-panel" aria-label={t('login.title')}>
        <Card className="login-card">
          <Typography.Title level={3} className="login-card-title">
            {t('login.title')}
          </Typography.Title>
          <Typography.Paragraph className="login-card-subtitle">
            {t('login.formSubtitle')}
          </Typography.Paragraph>
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
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
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
      </section>
    </div>
  );
}

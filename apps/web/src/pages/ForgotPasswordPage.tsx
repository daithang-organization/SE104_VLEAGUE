import { Button, Card, Form, Input, Typography, message } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { apiForgotPassword } from '../services/authApi';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string }) => {
    setLoading(true);
    try {
      await apiForgotPassword(values.email);
      message.success(t('forgotPassword.success'));
      nav('/reset-password', { state: { email: values.email } });
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t('forgotPassword.error');
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', padding: 16 }}>
      <Card style={{ width: 400 }}>
        <Typography.Title level={4} style={{ marginTop: 0, textAlign: 'center' }}>
          {t('forgotPassword.title')}
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ textAlign: 'center' }}>
          {t('forgotPassword.subtitle')}
        </Typography.Paragraph>
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            label={t('forgotPassword.emailLabel')}
            rules={[
              { required: true, message: t('forgotPassword.emailRequired') },
              { type: 'email', message: t('forgotPassword.emailInvalid') },
            ]}
          >
            <Input placeholder={t('forgotPassword.emailPlaceholder')} />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            {t('forgotPassword.submitBtn')}
          </Button>
        </Form>
        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Link to="/login">{t('forgotPassword.backToLogin')}</Link>
        </div>
      </Card>
    </div>
  );
}

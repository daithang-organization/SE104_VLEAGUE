import { Button, Card, Form, Input, Typography, message } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { apiChangePassword } from '../services/authApi';

export default function ChangePasswordPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error(t('changePassword.confirmPasswordMismatch'));
      return;
    }

    setLoading(true);
    try {
      await apiChangePassword(values.currentPassword, values.newPassword);
      message.success(t('changePassword.success'));
      form.resetFields();
      nav('/profile');
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t('changePassword.error');
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <Typography.Title level={3}>{t('changePassword.title')}</Typography.Title>

      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="currentPassword"
            label={t('changePassword.currentPasswordLabel')}
            rules={[{ required: true, message: t('changePassword.currentPasswordRequired') }]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label={t('changePassword.newPasswordLabel')}
            rules={[
              { required: true, message: t('changePassword.newPasswordRequired') },
              { min: 8, message: t('changePassword.newPasswordMin') },
              {
                pattern: /^(?=.*[A-Za-z])(?=.*\d)/,
                message: t('changePassword.newPasswordPattern'),
              },
            ]}
            extra={t('changePassword.newPasswordExtra')}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={t('changePassword.confirmPasswordLabel')}
            dependencies={['newPassword']}
            rules={[
              { required: true, message: t('changePassword.confirmPasswordRequired') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('changePassword.confirmPasswordMismatch')));
                },
              }),
            ]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
              {t('changePassword.submitBtn')}
            </Button>
            <Button onClick={() => nav('/profile')}>{t('changePassword.cancelBtn')}</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

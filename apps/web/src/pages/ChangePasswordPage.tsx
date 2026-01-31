import { Button, Card, Form, Input, Typography, message } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiChangePassword } from '../services/authApi';

export default function ChangePasswordPage() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      await apiChangePassword(values.currentPassword, values.newPassword);
      message.success('Đổi mật khẩu thành công!');
      form.resetFields();
      nav('/profile');
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Đổi mật khẩu thất bại';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: '0 auto' }}>
      <Typography.Title level={3}>Đổi mật khẩu</Typography.Title>

      <Card>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="currentPassword"
            label="Mật khẩu hiện tại"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự' },
              {
                pattern: /^(?=.*[A-Za-z])(?=.*\d)/,
                message: 'Mật khẩu phải có ít nhất 1 chữ cái và 1 số',
              },
            ]}
            extra="Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ và số"
          >
            <Input.Password placeholder="••••••••" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu mới"
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
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ marginRight: 8 }}>
              Đổi mật khẩu
            </Button>
            <Button onClick={() => nav('/profile')}>Hủy</Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

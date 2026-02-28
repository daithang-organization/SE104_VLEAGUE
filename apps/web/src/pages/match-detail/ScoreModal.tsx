import { Flex, Form, InputNumber, message, Modal, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { apiUpdateMatch, type Match } from '../../services/matchApi';

const { Title } = Typography;

interface Props {
  match: Match;
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function ScoreModal({ match, open, onCancel, onSuccess }: Props) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        homeScore: match.homeScore ?? 0,
        awayScore: match.awayScore ?? 0,
      });
    }
  }, [open, match, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await apiUpdateMatch(match.id, {
        homeScore: values.homeScore,
        awayScore: values.awayScore,
      });
      message.success('Đã cập nhật tỉ số!');
      onCancel();
      onSuccess();
    } catch {
      message.error('Không thể cập nhật tỉ số');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Cập nhật tỉ số"
      open={open}
      onCancel={onCancel}
      onOk={handleSave}
      confirmLoading={saving}
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Flex gap={16} align="flex-end">
          <Form.Item
            name="homeScore"
            label={match.homeTeam?.name ?? 'Đội nhà'}
            rules={[{ required: true, message: 'Nhập số bàn' }]}
            style={{ flex: 1 }}
          >
            <InputNumber min={0} max={99} style={{ width: '100%' }} size="large" />
          </Form.Item>
          <Title level={3} style={{ margin: '0 0 24px 0' }}>
            :
          </Title>
          <Form.Item
            name="awayScore"
            label={match.awayTeam?.name ?? 'Đội khách'}
            rules={[{ required: true, message: 'Nhập số bàn' }]}
            style={{ flex: 1 }}
          >
            <InputNumber min={0} max={99} style={{ width: '100%' }} size="large" />
          </Form.Item>
        </Flex>
      </Form>
    </Modal>
  );
}

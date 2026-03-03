import { Flex, Form, InputNumber, message, Modal, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { apiUpdateMatch, type Match } from '../../services/matchApi';

const { Title } = Typography;

interface Props {
  match: Match;
  open: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function ScoreModal({ match, open, onCancel, onSuccess }: Props) {
  const { t } = useTranslation();
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
      message.success(t('scoreModal.success'));
      onCancel();
      onSuccess();
    } catch (_err) {
      message.error(t('scoreModal.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={t('scoreModal.title')}
      open={open}
      onCancel={onCancel}
      onOk={handleSave}
      confirmLoading={saving}
      okText={t('scoreModal.save')}
      cancelText={t('scoreModal.cancel')}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Flex gap={16} align="flex-end">
          <Form.Item
            name="homeScore"
            label={match.homeTeam?.name ?? t('scoreModal.homeDefault')}
            rules={[{ required: true, message: t('scoreModal.required') }]}
            style={{ flex: 1 }}
          >
            <InputNumber min={0} max={99} style={{ width: '100%' }} size="large" />
          </Form.Item>
          <Title level={3} style={{ margin: '0 0 24px 0' }}>
            :
          </Title>
          <Form.Item
            name="awayScore"
            label={match.awayTeam?.name ?? t('scoreModal.awayDefault')}
            rules={[{ required: true, message: t('scoreModal.required') }]}
            style={{ flex: 1 }}
          >
            <InputNumber min={0} max={99} style={{ width: '100%' }} size="large" />
          </Form.Item>
        </Flex>
      </Form>
    </Modal>
  );
}

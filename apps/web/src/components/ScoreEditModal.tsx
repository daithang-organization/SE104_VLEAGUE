import { Flex, Form, InputNumber, Modal, Typography } from 'antd';

interface ScoreEditModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (homeScore: number, awayScore: number) => Promise<void>;
  loading: boolean;
  homeTeamName: string;
  awayTeamName: string;
  initialHomeScore?: number | null;
  initialAwayScore?: number | null;
}

export default function ScoreEditModal({
  open,
  onCancel,
  onOk,
  loading,
  homeTeamName,
  awayTeamName,
  initialHomeScore,
  initialAwayScore,
}: ScoreEditModalProps) {
  const [form] = Form.useForm();

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      form.setFieldsValue({
        homeScore: initialHomeScore ?? 0,
        awayScore: initialAwayScore ?? 0,
      });
    }
  };

  const handleOk = async () => {
    const values = await form.validateFields();
    await onOk(values.homeScore, values.awayScore);
  };

  return (
    <Modal
      title="Cập nhật tỉ số"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={loading}
      okText="Lưu"
      cancelText="Hủy"
      afterOpenChange={handleOpen}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Flex gap={16} align="flex-end">
          <Form.Item
            name="homeScore"
            label={homeTeamName}
            rules={[{ required: true, message: 'Nhập số bàn' }]}
            style={{ flex: 1 }}
          >
            <InputNumber min={0} max={99} style={{ width: '100%' }} size="large" />
          </Form.Item>
          <Typography.Title level={3} style={{ margin: '0 0 24px 0' }}>
            :
          </Typography.Title>
          <Form.Item
            name="awayScore"
            label={awayTeamName}
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

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Flex, Form, Input, InputNumber, Modal, Radio, Select, Typography } from 'antd';
import { useMemo, useState } from 'react';
import type { RosterPlayer } from '../services/matchApi';
import { EVENT_TYPE_MAP } from '../utils/constants';

export interface EventFormRow {
  type: string;
  minute: number;
  playerId?: string;
  note?: string;
  goalType?: string;
  relatedPlayerId?: string;
}

interface EventModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (teamSide: 'home' | 'away', events: EventFormRow[]) => Promise<void>;
  loading: boolean;
  homeTeamName: string;
  awayTeamName: string;
  homeRoster: RosterPlayer[];
  awayRoster: RosterPlayer[];
  rosterLoading: boolean;
}

export default function EventModal({
  open,
  onCancel,
  onSubmit,
  loading,
  homeTeamName,
  awayTeamName,
  homeRoster,
  awayRoster,
  rosterLoading,
}: EventModalProps) {
  const [form] = Form.useForm();
  const [teamSide, setTeamSide] = useState<'home' | 'away' | null>(null);

  const currentRoster = useMemo(() => {
    if (teamSide === 'home') return homeRoster;
    if (teamSide === 'away') return awayRoster;
    return [];
  }, [teamSide, homeRoster, awayRoster]);

  const handleOk = async () => {
    const values = await form.validateFields();
    const events: EventFormRow[] = values.events ?? [];
    if (events.length === 0) return;
    await onSubmit(values.teamSide, events);
  };

  const handleCancel = () => {
    form.resetFields();
    setTeamSide(null);
    onCancel();
  };

  return (
    <Modal
      title="Thêm sự kiện trận đấu"
      open={open}
      onCancel={handleCancel}
      onOk={handleOk}
      confirmLoading={loading}
      okText="Thêm tất cả"
      cancelText="Hủy"
      destroyOnClose
      width={680}
      afterOpenChange={(isOpen) => {
        if (!isOpen) {
          form.resetFields();
          setTeamSide(null);
        }
      }}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        {/* Team selector */}
        <Form.Item
          name="teamSide"
          label="Đội"
          rules={[{ required: true, message: 'Vui lòng chọn đội' }]}
        >
          <Radio.Group
            onChange={(e) => {
              setTeamSide(e.target.value);
              const events = form.getFieldValue('events') ?? [];
              form.setFieldsValue({
                events: events.map((evt: Record<string, unknown>) => ({
                  ...evt,
                  playerId: undefined,
                })),
              });
            }}
            optionType="button"
            buttonStyle="solid"
            style={{ width: '100%' }}
          >
            <Radio.Button value="home" style={{ width: '50%', textAlign: 'center' }}>
              🏠 {homeTeamName}
            </Radio.Button>
            <Radio.Button value="away" style={{ width: '50%', textAlign: 'center' }}>
              ✈️ {awayTeamName}
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        {/* Dynamic event rows */}
        <Form.List name="events" initialValue={[{}]}>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }, idx) => (
                <div
                  key={key}
                  style={{
                    background: idx % 2 === 0 ? '#fafafa' : '#f0f0f0',
                    padding: '12px 12px 4px',
                    borderRadius: 8,
                    marginBottom: 8,
                    position: 'relative',
                  }}
                >
                  <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
                    <Typography.Text strong style={{ fontSize: 13, color: '#666' }}>
                      Sự kiện {idx + 1}
                    </Typography.Text>
                    {fields.length > 1 && (
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      />
                    )}
                  </Flex>

                  <Flex gap={8}>
                    <Form.Item
                      {...restField}
                      name={[name, 'type']}
                      rules={[{ required: true, message: 'Chọn loại' }]}
                      style={{ flex: 2, marginBottom: 8 }}
                    >
                      <Select placeholder="Loại sự kiện" size="middle">
                        {Object.entries(EVENT_TYPE_MAP).map(([value, { label, icon }]) => (
                          <Select.Option key={value} value={value}>
                            {icon} {label}
                          </Select.Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'minute']}
                      rules={[{ required: true, message: 'Phút' }]}
                      style={{ flex: 1, marginBottom: 8 }}
                    >
                      <InputNumber min={0} max={150} style={{ width: '100%' }} placeholder="Phút" />
                    </Form.Item>
                  </Flex>

                  <Flex gap={8}>
                    <Form.Item
                      {...restField}
                      name={[name, 'playerId']}
                      style={{ flex: 2, marginBottom: 8 }}
                    >
                      <Select
                        placeholder={teamSide ? 'Chọn cầu thủ' : 'Chọn đội trước'}
                        disabled={!teamSide || rosterLoading}
                        loading={rosterLoading}
                        showSearch
                        optionFilterProp="label"
                        allowClear
                        options={currentRoster.map((p) => ({
                          value: p.playerId,
                          label: `#${p.jerseyNumber ?? '?'} ${p.fullName} (${p.position})`,
                        }))}
                      />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'note']}
                      style={{ flex: 1, marginBottom: 8 }}
                    >
                      <Input placeholder="Ghi chú" />
                    </Form.Item>
                  </Flex>

                  <Form.Item
                    noStyle
                    shouldUpdate={(prev, cur) => {
                      const prevType = prev?.events?.[name]?.type;
                      const curType = cur?.events?.[name]?.type;
                      return prevType !== curType;
                    }}
                  >
                    {() => {
                      const evtType = form.getFieldValue(['events', name, 'type']);
                      const showGoalType = ['GOAL', 'PENALTY'].includes(evtType);
                      const showRelated = ['GOAL', 'SUBSTITUTION'].includes(evtType);
                      if (!showGoalType && !showRelated) return null;
                      return (
                        <Flex gap={8}>
                          {showGoalType && (
                            <Form.Item
                              {...restField}
                              name={[name, 'goalType']}
                              style={{ flex: 1, marginBottom: 8 }}
                            >
                              <Select placeholder="Loại bàn thắng" allowClear>
                                <Select.Option value="NORMAL">Bình thường</Select.Option>
                                <Select.Option value="HEADER">Đánh đầu</Select.Option>
                                <Select.Option value="FREE_KICK">Sút phạt</Select.Option>
                                <Select.Option value="PENALTY_KICK">Penalty</Select.Option>
                                <Select.Option value="LONG_RANGE">Sút xa</Select.Option>
                              </Select>
                            </Form.Item>
                          )}
                          {showRelated && (
                            <Form.Item
                              {...restField}
                              name={[name, 'relatedPlayerId']}
                              style={{ flex: 1, marginBottom: 8 }}
                            >
                              <Select
                                placeholder={evtType === 'GOAL' ? 'Kiến tạo' : 'Cầu thủ bị thay'}
                                disabled={!teamSide || rosterLoading}
                                loading={rosterLoading}
                                showSearch
                                optionFilterProp="label"
                                allowClear
                                options={currentRoster.map((p) => ({
                                  value: p.playerId,
                                  label: `#${p.jerseyNumber ?? '?'} ${p.fullName}`,
                                }))}
                              />
                            </Form.Item>
                          )}
                        </Flex>
                      );
                    }}
                  </Form.Item>
                </div>
              ))}

              <Button
                type="dashed"
                onClick={() => add({})}
                block
                icon={<PlusOutlined />}
                style={{ marginTop: 4 }}
              >
                Thêm sự kiện
              </Button>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}

import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Flex,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Radio,
  Select,
  Typography,
} from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  apiAddMatchEvent,
  type AddMatchEventPayload,
  type Match,
  type RosterPlayer,
} from '../../services/matchApi';
import { EVENT_TYPE_MAP } from './constants';

const { Text } = Typography;

interface Props {
  match: Match;
  open: boolean;
  homeRoster: RosterPlayer[];
  awayRoster: RosterPlayer[];
  rosterLoading: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function EventFormModal({
  match,
  open,
  homeRoster,
  awayRoster,
  rosterLoading,
  onCancel,
  onSuccess,
}: Props) {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [selectedTeamSide, setSelectedTeamSide] = useState<'home' | 'away' | null>(null);

  const currentRoster =
    selectedTeamSide === 'home' ? homeRoster : selectedTeamSide === 'away' ? awayRoster : [];

  const handleCancel = () => {
    setSelectedTeamSide(null);
    onCancel();
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const teamId = values.teamSide === 'home' ? match.homeTeamId : match.awayTeamId;
      const events: {
        type: string;
        minute: number;
        playerId?: string;
        note?: string;
        goalType?: string;
        relatedPlayerId?: string;
      }[] = values.events ?? [];
      if (events.length === 0) {
        message.warning(t('eventFormModal.warningEmpty'));
        setSaving(false);
        return;
      }
      let successCount = 0;
      for (const evt of events) {
        try {
          const payload: AddMatchEventPayload = {
            minute: evt.minute,
            type: evt.type as AddMatchEventPayload['type'],
            teamId,
            playerId: evt.playerId || undefined,
            note: evt.note || undefined,
            goalType: evt.goalType || undefined,
            relatedPlayerId: evt.relatedPlayerId || undefined,
          };
          await apiAddMatchEvent(match.id, payload);
          successCount++;
        } catch {
          message.error(t('eventFormModal.eventError', { minute: evt.minute }));
        }
      }
      if (successCount > 0) {
        message.success(t('eventFormModal.success', { count: successCount }));
        form.resetFields();
        setSelectedTeamSide(null);
        onCancel();
        onSuccess();
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error(t('eventFormModal.genericError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={t('eventFormModal.title')}
      open={open}
      onCancel={handleCancel}
      onOk={handleSave}
      confirmLoading={saving}
      okText={t('eventFormModal.okText')}
      cancelText={t('eventFormModal.cancel')}
      destroyOnClose
      width={680}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="teamSide"
          label={t('eventFormModal.teamLabel')}
          rules={[{ required: true, message: t('eventFormModal.teamRequired') }]}
        >
          <Radio.Group
            onChange={(e) => {
              setSelectedTeamSide(e.target.value);
              const evts = form.getFieldValue('events') ?? [];
              form.setFieldsValue({
                events: evts.map((evt: Record<string, unknown>) => ({
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
              {t('eventFormModal.homeBtn', {
                team: match.homeTeam?.name ?? t('eventFormModal.homeDefault'),
              })}
            </Radio.Button>
            <Radio.Button value="away" style={{ width: '50%', textAlign: 'center' }}>
              {t('eventFormModal.awayBtn', {
                team: match.awayTeam?.name ?? t('eventFormModal.awayDefault'),
              })}
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

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
                    <Text strong style={{ fontSize: 13, color: '#666' }}>
                      {t('eventFormModal.eventLabel', { index: idx + 1 })}
                    </Text>
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
                      rules={[{ required: true, message: t('eventFormModal.typeRequired') }]}
                      style={{ flex: 2, marginBottom: 8 }}
                    >
                      <Select placeholder={t('eventFormModal.typePlaceholder')} size="middle">
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
                      rules={[{ required: true, message: t('eventFormModal.minuteRequired') }]}
                      style={{ flex: 1, marginBottom: 8 }}
                    >
                      <InputNumber
                        min={0}
                        max={150}
                        style={{ width: '100%' }}
                        placeholder={t('eventFormModal.minutePlaceholder')}
                      />
                    </Form.Item>
                  </Flex>
                  <Flex gap={8}>
                    <Form.Item
                      {...restField}
                      name={[name, 'playerId']}
                      style={{ flex: 2, marginBottom: 8 }}
                    >
                      <Select
                        placeholder={
                          selectedTeamSide
                            ? t('eventFormModal.playerPlaceholder')
                            : t('eventFormModal.playerDisabledHint')
                        }
                        disabled={!selectedTeamSide || rosterLoading}
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
                      <Input placeholder={t('eventFormModal.notePlaceholder')} />
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
                              <Select
                                placeholder={t('eventFormModal.goalTypePlaceholder')}
                                allowClear
                              >
                                <Select.Option value="NORMAL">{t('goalType.NORMAL')}</Select.Option>
                                <Select.Option value="HEADER">{t('goalType.HEADER')}</Select.Option>
                                <Select.Option value="FREE_KICK">
                                  {t('goalType.FREE_KICK')}
                                </Select.Option>
                                <Select.Option value="PENALTY_KICK">
                                  {t('goalType.PENALTY_KICK')}
                                </Select.Option>
                                <Select.Option value="LONG_RANGE">
                                  {t('goalType.LONG_RANGE')}
                                </Select.Option>
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
                                placeholder={
                                  evtType === 'GOAL'
                                    ? t('eventFormModal.assistPlaceholder')
                                    : t('eventFormModal.subPlayerPlaceholder')
                                }
                                disabled={!selectedTeamSide || rosterLoading}
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
                {t('eventFormModal.addEventBtn')}
              </Button>
            </>
          )}
        </Form.List>
      </Form>
    </Modal>
  );
}

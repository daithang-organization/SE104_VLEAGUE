import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import {
  apiCreatePlayer,
  apiDeletePlayer,
  apiGetPlayers,
  apiUpdatePlayer,
  type CreatePlayerPayload,
  type Player,
} from '../services/playerApi';
import { apiGetTeams, type Team } from '../services/teamApi';

const POSITION_LABELS: Record<string, string> = {
  GK: 'Thủ môn',
  DF: 'Hậu vệ',
  MF: 'Tiền vệ',
  FW: 'Tiền đạo',
};

const POSITION_COLORS: Record<string, string> = {
  GK: 'gold',
  DF: 'blue',
  MF: 'green',
  FW: 'red',
};

const CAN_EDIT_ROLES = ['ADMIN', 'TEAM_MANAGER'];

export default function PlayersPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [form] = Form.useForm();

  const canEdit = useMemo(() => {
    return user?.role && CAN_EDIT_ROLES.includes(user.role);
  }, [user]);

  const fetchPlayers = useCallback(async (page = 1, limit = 20) => {
    setLoading(true);
    try {
      const res = await apiGetPlayers(page, limit);
      setPlayers(res.data);
      setPagination({ page: res.page, limit: res.limit, total: res.total });
    } catch (_err) {
      message.error(t('players.loadError'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlayers();
    apiGetTeams()
      .then((res) => setTeams(res.data))
      .catch(() => {});
  }, [fetchPlayers]);

  const openCreateModal = () => {
    setEditingPlayer(null);
    form.resetFields();
    form.setFieldsValue({ playerType: 'DOMESTIC' });
    setModalOpen(true);
  };

  const openEditModal = (player: Player) => {
    setEditingPlayer(player);
    form.setFieldsValue({
      fullName: player.fullName,
      dob: dayjs(player.dob),
      nationality: player.nationality,
      position: player.position,
      playerType: player.playerType ?? 'DOMESTIC',
      birthPlace: player.birthPlace ?? '',
      heightCm: player.heightCm ?? undefined,
      weightKg: player.weightKg ?? undefined,
      teamId: player.teamPlayers?.[0]?.team?.id ?? undefined,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);

      const payload: CreatePlayerPayload = {
        fullName: values.fullName,
        dob: values.dob.format('YYYY-MM-DD'),
        nationality: values.nationality,
        position: values.position,
        playerType: values.playerType || undefined,
        birthPlace: values.birthPlace || undefined,
        heightCm: values.heightCm || undefined,
        weightKg: values.weightKg || undefined,
        teamId: values.teamId || undefined,
      };

      if (editingPlayer) {
        await apiUpdatePlayer(editingPlayer.id, payload);
        message.success(t('players.updateSuccess'));
      } else {
        await apiCreatePlayer(payload);
        message.success(t('players.createSuccess'));
      }

      setModalOpen(false);
      fetchPlayers();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'errorFields' in err) return;
      message.error(t('players.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiDeletePlayer(id);
      message.success(t('players.deleteSuccess'));
      fetchPlayers();
    } catch (_err) {
      message.error(t('players.deleteError'));
    }
  };

  const filteredPlayers = players.filter(
    (p) =>
      p.fullName.toLowerCase().includes(search.toLowerCase()) ||
      p.nationality.toLowerCase().includes(search.toLowerCase()),
  );

  const columns: ColumnsType<Player> = [
    {
      title: '#',
      key: 'index',
      width: 60,
      render: (_, __, i) => i + 1,
    },
    {
      title: t('players.colFullName'),
      dataIndex: 'fullName',
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
      render: (name: string, record: Player) => (
        <a onClick={() => navigate(`/players/${record.id}`)}>{name}</a>
      ),
    },
    {
      title: t('players.colClub'),
      key: 'club',
      width: 180,
      render: (_, record) => {
        const tp = record.teamPlayers?.[0];
        if (!tp?.team) return <span style={{ color: '#ccc' }}>{t('players.colNoClub')}</span>;
        const team = tp.team;
        return (
          <Space size={4}>
            {team.logoUrl && (
              <img
                src={team.logoUrl}
                alt={team.name}
                style={{ width: 20, height: 20, objectFit: 'contain' }}
              />
            )}
            <span>{team.shortName || team.name}</span>
          </Space>
        );
      },
      filters: (() => {
        const clubs = new Map<string, string>();
        players.forEach((p) => {
          const tp = p.teamPlayers?.[0];
          if (tp?.team) clubs.set(tp.team.id, tp.team.name);
        });
        return [...clubs.entries()].map(([id, name]) => ({ text: name, value: id }));
      })(),
      onFilter: (value, record) => record.teamPlayers?.[0]?.team?.id === value,
    },
    {
      title: t('players.colDob'),
      dataIndex: 'dob',
      width: 120,
      render: (dob: string) => dayjs(dob).format('DD/MM/YYYY'),
      sorter: (a, b) => new Date(a.dob).getTime() - new Date(b.dob).getTime(),
    },
    {
      title: t('players.colNationality'),
      dataIndex: 'nationality',
      width: 120,
      filters: [...new Set(players.map((p) => p.nationality))].map((n) => ({
        text: n,
        value: n,
      })),
      onFilter: (value, record) => record.nationality === value,
    },
    {
      title: t('players.colPosition'),
      dataIndex: 'position',
      width: 100,
      render: (pos: string) => (
        <Tag color={POSITION_COLORS[pos]}>{POSITION_LABELS[pos] ?? pos}</Tag>
      ),
      filters: Object.entries(POSITION_LABELS).map(([value, text]) => ({
        text,
        value,
      })),
      onFilter: (value, record) => record.position === value,
    },
    {
      title: t('players.colType'),
      dataIndex: 'playerType',
      width: 100,
      render: (type: string) => (
        <Tag color={type === 'FOREIGN' ? 'purple' : 'cyan'}>
          {type === 'FOREIGN' ? t('players.formTypeForeign') : t('players.formTypeDomestic')}
        </Tag>
      ),
      filters: [
        { text: t('players.formTypeDomestic'), value: 'DOMESTIC' },
        { text: t('players.formTypeForeign'), value: 'FOREIGN' },
      ],
      onFilter: (value, record) => record.playerType === value,
    },
    {
      title: t('players.colHeight'),
      dataIndex: 'heightCm',
      width: 90,
      render: (v: number | null) => (v ? `${v} cm` : '—'),
      sorter: (a, b) => (a.heightCm ?? 0) - (b.heightCm ?? 0),
    },
    {
      title: t('players.colWeight'),
      dataIndex: 'weightKg',
      width: 90,
      render: (v: number | null) => (v ? `${v} kg` : '—'),
      sorter: (a, b) => (a.weightKg ?? 0) - (b.weightKg ?? 0),
    },
    ...(canEdit
      ? [
          {
            title: t('players.colActions'),
            key: 'actions',
            width: 120,
            render: (_: unknown, record: Player) => (
              <Space>
                <Button
                  type="text"
                  icon={<EyeOutlined />}
                  onClick={() => navigate(`/players/${record.id}`)}
                />
                <Button type="text" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
                <Popconfirm
                  title={t('players.deleteConfirmTitle')}
                  description={t('players.deleteConfirmDesc', { name: record.fullName })}
                  onConfirm={() => handleDelete(record.id)}
                  okText={t('players.deleteOk')}
                  cancelText={t('players.deleteCancel')}
                  okButtonProps={{ danger: true }}
                >
                  <Button type="text" danger icon={<DeleteOutlined />} />
                </Popconfirm>
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <Card>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          {t('players.title')}
        </Typography.Title>
        <Space>
          <Input
            placeholder={t('players.searchPlaceholder')}
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          {canEdit && (
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              {t('players.addBtn')}
            </Button>
          )}
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredPlayers}
        rowKey="id"
        loading={loading}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => t('players.totalCount', { total }),
          onChange: (page, pageSize) => fetchPlayers(page, pageSize),
        }}
        size="middle"
      />

      <Modal
        title={editingPlayer ? t('players.modalEditTitle') : t('players.modalCreateTitle')}
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleSave}
        confirmLoading={saving}
        okText={editingPlayer ? t('common.save') : t('common.create')}
        cancelText={t('common.cancel')}
        destroyOnClose
        width={650}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="fullName"
            label={t('players.formFullName')}
            rules={[{ required: true, message: t('players.formFullNameRequired') }]}
          >
            <Input placeholder={t('players.formFullNamePlaceholder')} />
          </Form.Item>

          <Form.Item name="teamId" label={t('players.formClub')}>
            <Select
              placeholder={t('players.formClubPlaceholder')}
              allowClear
              showSearch
              optionFilterProp="label"
              options={teams
                .filter((t) => t.status === 'ACTIVE')
                .map((t) => ({
                  value: t.id,
                  label: `${t.name}${t.shortName ? ` (${t.shortName})` : ''}`,
                }))}
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="dob"
                label={t('players.formDob')}
                rules={[{ required: true, message: t('players.formDobRequired') }]}
              >
                <DatePicker
                  format="DD/MM/YYYY"
                  style={{ width: '100%' }}
                  placeholder={t('players.formDobPlaceholder')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="birthPlace" label={t('players.formBirthPlace')}>
                <Input placeholder={t('players.formBirthPlacePlaceholder')} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="nationality"
                label={t('players.formNationality')}
                rules={[{ required: true, message: t('players.formNationalityRequired') }]}
              >
                <Input placeholder={t('players.formNationalityPlaceholder')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="playerType" label={t('players.formType')}>
                <Select>
                  <Select.Option value="DOMESTIC">{t('players.formTypeDomestic')}</Select.Option>
                  <Select.Option value="FOREIGN">{t('players.formTypeForeign')}</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="position"
                label={t('players.formPosition')}
                rules={[{ required: true, message: t('players.formPositionRequired') }]}
              >
                <Select placeholder={t('players.formPositionPlaceholder')}>
                  <Select.Option value="GK">{t('players.formPositionGK')}</Select.Option>
                  <Select.Option value="DF">{t('players.formPositionDF')}</Select.Option>
                  <Select.Option value="MF">{t('players.formPositionMF')}</Select.Option>
                  <Select.Option value="FW">{t('players.formPositionFW')}</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="heightCm" label={t('players.formHeight')}>
                <InputNumber
                  min={100}
                  max={250}
                  style={{ width: '100%' }}
                  placeholder={t('players.formHeightPlaceholder')}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="weightKg" label={t('players.formWeight')}>
                <InputNumber
                  min={30}
                  max={200}
                  style={{ width: '100%' }}
                  placeholder={t('players.formWeightPlaceholder')}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Card>
  );
}

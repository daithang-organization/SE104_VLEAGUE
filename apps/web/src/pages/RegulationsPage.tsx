import {
  CalendarOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SettingOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppMenuIcon, PageCover, TableSkeleton } from '../components';
import {
  apiDeleteRegulation,
  apiGetRegulations,
  apiSeedDefaultRegulations,
  apiUpsertRegulation,
  type Regulation,
} from '../services/regulationApi';
import { apiGetSeasons, type Season } from '../services/seasonApi';

const REGULATION_KEYS = [
  'MIN_AGE',
  'MAX_AGE',
  'MIN_ROSTER',
  'MAX_ROSTER',
  'MAX_FOREIGN_PLAYERS',
  'WIN_POINTS',
  'DRAW_POINTS',
  'LOSS_POINTS',
  'MAX_GOAL_TIME',
];
const VALUE_TYPE_KEYS = ['number', 'string', 'boolean'] as const;

export default function RegulationsPage() {
  const { t } = useTranslation();

  const valueTypeOptions = useMemo(
    () => VALUE_TYPE_KEYS.map((k) => ({ label: t(`valueType.${k}`), value: k })),
    [t],
  );

  const regulationLabels = useMemo(
    () => Object.fromEntries(REGULATION_KEYS.map((k) => [k, t(`regulationLabel.${k}`)])),
    [t],
  );
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReg, setEditingReg] = useState<Regulation | null>(null);
  const [form] = Form.useForm();

  // Load seasons on mount
  useEffect(() => {
    apiGetSeasons()
      .then((data) => {
        setSeasons(data);
        // Auto-select current season or first
        const current = data.find((s) => s.status === 'IN_PROGRESS');
        if (current) setSelectedSeason(current.id);
        else if (data.length > 0) setSelectedSeason(data[0].id);
      })
      .catch(() => message.error(t('regulations.loadError')))
      .finally(() => setInitialLoad(false));
  }, []);

  // Load regulations when season changes
  useEffect(() => {
    if (!selectedSeason) return;
    loadRegulations();
  }, [selectedSeason]);

  async function loadRegulations() {
    setLoading(true);
    try {
      const data = await apiGetRegulations(selectedSeason);
      setRegulations(data);
    } catch (_err) {
      message.error(t('regulations.loadRegError'));
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingReg(null);
    form.resetFields();
    form.setFieldsValue({ valueType: 'number' });
    setModalOpen(true);
  }

  function openEditModal(reg: Regulation) {
    setEditingReg(reg);
    form.setFieldsValue({
      key: reg.key,
      value: reg.value,
      valueType: reg.valueType,
    });
    setModalOpen(true);
  }

  async function handleSubmit() {
    try {
      const values = await form.validateFields();
      await apiUpsertRegulation(selectedSeason, {
        key: values.key,
        value: values.value,
        valueType: values.valueType,
      });
      message.success(editingReg ? t('regulations.updateSuccess') : t('regulations.createSuccess'));
      setModalOpen(false);
      loadRegulations();
    } catch (_err) {
      // validation errors handled by form
    }
  }

  async function handleDelete(key: string) {
    try {
      await apiDeleteRegulation(selectedSeason, key);
      message.success(t('regulations.deleteSuccess'));
      loadRegulations();
    } catch (_err) {
      message.error(t('regulations.deleteError'));
    }
  }

  async function handleSeedDefaults() {
    try {
      await apiSeedDefaultRegulations(selectedSeason);
      message.success(t('regulations.seedSuccess'));
      loadRegulations();
    } catch (_err) {
      message.error(t('regulations.seedError'));
    }
  }

  const columns: ColumnsType<Regulation> = [
    {
      title: t('regulations.colKey'),
      dataIndex: 'key',
      width: 220,
      render: (key: string) => (
        <span>
          <Tag color="blue">{key}</Tag>
          {regulationLabels[key] && (
            <Typography.Text type="secondary" style={{ marginLeft: 4, fontSize: 12 }}>
              {regulationLabels[key]}
            </Typography.Text>
          )}
        </span>
      ),
    },
    {
      title: t('regulations.colValue'),
      dataIndex: 'value',
      width: 150,
      render: (value: string) => <Typography.Text strong>{value}</Typography.Text>,
    },
    {
      title: t('regulations.colType'),
      dataIndex: 'valueType',
      width: 100,
      render: (vt: string) => <Tag>{vt}</Tag>,
    },
    {
      title: t('regulations.colActions'),
      key: 'actions',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
            size="small"
          />
          <Popconfirm
            title={t('regulations.deleteConfirmTitle')}
            onConfirm={() => handleDelete(record.key)}
            okText={t('regulations.deleteOk')}
            cancelText={t('regulations.deleteCancel')}
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];
  const hero = (
    <PageCover
      eyebrow={t('menu.regulations')}
      title={t('regulations.title')}
      description={t('regulations.subtitle')}
      icon={<AppMenuIcon menuKey="regulations" />}
      metrics={[
        {
          label: t('common.total'),
          value: regulations.length.toLocaleString('vi-VN'),
          icon: <SettingOutlined />,
        },
        {
          label: t('menu.seasons'),
          value: seasons.length.toLocaleString('vi-VN'),
          icon: <CalendarOutlined />,
        },
        {
          label: t('regulations.colKey'),
          value: REGULATION_KEYS.length.toLocaleString('vi-VN'),
          icon: <SettingOutlined />,
        },
      ]}
    />
  );
  const toolbar = (
    <div className="page-toolbar">
      <Space wrap>
        <Select
          style={{ width: 240 }}
          value={selectedSeason || undefined}
          onChange={setSelectedSeason}
          placeholder={t('regulations.seasonPlaceholder')}
          options={seasons.map((s) => ({
            label: `${s.name} (${s.year})`,
            value: s.id,
          }))}
        />
        <Button
          icon={<ThunderboltOutlined />}
          onClick={handleSeedDefaults}
          disabled={!selectedSeason}
        >
          {t('regulations.seedDefaultsBtn')}
        </Button>
      </Space>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={openCreateModal}
        disabled={!selectedSeason}
      >
        {t('regulations.addBtn')}
      </Button>
    </div>
  );

  if (initialLoad) {
    return (
      <div className="page-stack">
        {hero}
        {toolbar}
        <Card>
          <TableSkeleton rows={6} />
        </Card>
      </div>
    );
  }

  return (
    <div className="page-stack">
      {hero}
      {toolbar}

      <Card>
        <Table
          columns={columns}
          dataSource={regulations}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="middle"
          locale={{ emptyText: t('regulations.empty') }}
        />
      </Card>

      <Modal
        title={editingReg ? t('regulations.modalEditTitle') : t('regulations.modalCreateTitle')}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editingReg ? t('regulations.okUpdate') : t('regulations.okCreate')}
        cancelText={t('common.cancel')}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="key"
            label={t('regulations.formKey')}
            rules={[{ required: true, message: t('regulations.formKeyRequired') }]}
          >
            <Input placeholder={t('regulations.formKeyPlaceholder')} disabled={!!editingReg} />
          </Form.Item>
          <Form.Item
            name="value"
            label={t('regulations.formValue')}
            rules={[{ required: true, message: t('regulations.formValueRequired') }]}
          >
            <Input placeholder={t('regulations.formValuePlaceholder')} />
          </Form.Item>
          <Form.Item name="valueType" label={t('regulations.formValueType')}>
            <Select options={valueTypeOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

import {
  CheckOutlined,
  DeleteOutlined,
  ExperimentOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  InputNumber,
  message,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/AuthContext';
import {
  apiConfirmDrawLot,
  apiExecuteDrawLot,
  apiGetDrawLotStatus,
  apiResetDrawLot,
  type DrawLotResultItem,
  type DrawLotStatus,
  type SeasonAwards,
} from '../../services/standingsApi';

interface Props {
  awards: SeasonAwards | null;
  loading: boolean;
  onAwardsChanged?: () => Promise<void> | void;
}

type AwardRow = {
  key: string;
  category: string;
  winner: string;
  detail: string;
};

export default function SeasonAwardsTab({ awards, loading, onAwardsChanged }: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [drawLotStatus, setDrawLotStatus] = useState<DrawLotStatus | null>(null);
  const [drawLotLoading, setDrawLotLoading] = useState(false);
  const [overrides, setOverrides] = useState<Map<string, number>>(new Map());

  const fetchDrawLotStatus = useCallback(async (seasonId?: string | null) => {
    try {
      const status = await apiGetDrawLotStatus(seasonId ?? undefined);
      setDrawLotStatus(status);
      // Init overrides from existing results
      if (status.results.length > 0) {
        const map = new Map<string, number>();
        for (const r of status.results) {
          map.set(r.teamId, r.resolvedRank);
        }
        setOverrides(map);
      }
    } catch (_) {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (awards?.seasonId) {
      fetchDrawLotStatus(awards.seasonId);
    } else {
      setDrawLotStatus(null);
      setOverrides(new Map());
    }
  }, [awards?.seasonId, fetchDrawLotStatus]);

  const handleExecute = async () => {
    if (!drawLotStatus?.seasonId) return;
    setDrawLotLoading(true);
    try {
      const result = await apiExecuteDrawLot(drawLotStatus.seasonId);
      message.success(result.message);
      await fetchDrawLotStatus(drawLotStatus.seasonId);
    } catch (_) {
      message.error('Không thể rút thăm. Hãy kiểm tra lại.');
    } finally {
      setDrawLotLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!drawLotStatus?.seasonId) return;
    setDrawLotLoading(true);
    try {
      const overrideArr = Array.from(overrides.entries()).map(([teamId, resolvedRank]) => ({
        teamId,
        resolvedRank,
      }));
      const result = await apiConfirmDrawLot(drawLotStatus.seasonId, overrideArr);
      message.success(result.message);
      await fetchDrawLotStatus(drawLotStatus.seasonId);
      await onAwardsChanged?.();
    } catch (_) {
      message.error('Không thể xác nhận. Hãy kiểm tra thứ hạng không trùng.');
    } finally {
      setDrawLotLoading(false);
    }
  };

  const handleReset = async () => {
    if (!drawLotStatus?.seasonId) return;
    setDrawLotLoading(true);
    try {
      const result = await apiResetDrawLot(drawLotStatus.seasonId);
      message.success(result.message);
      setOverrides(new Map());
      await fetchDrawLotStatus(drawLotStatus.seasonId);
      await onAwardsChanged?.();
    } catch (_) {
      message.error('Không thể xóa kết quả rút thăm.');
    } finally {
      setDrawLotLoading(false);
    }
  };

  const rows: AwardRow[] = awards
    ? [
        {
          key: 'champion',
          category: t('seasonAwardsTab.champion'),
          winner: awards.champion?.teamName ?? '-',
          detail: awards.champion
            ? t('seasonAwardsTab.pointsDetail', { count: awards.champion.points })
            : '-',
        },
        {
          key: 'runnerUp',
          category: t('seasonAwardsTab.runnerUp'),
          winner: awards.runnerUp?.teamName ?? '-',
          detail: awards.runnerUp
            ? t('seasonAwardsTab.pointsDetail', { count: awards.runnerUp.points })
            : '-',
        },
        {
          key: 'topScorer',
          category: t('seasonAwardsTab.topScorer'),
          winner: awards.topScorer?.playerName ?? '-',
          detail: awards.topScorer
            ? t('seasonAwardsTab.goalsDetail', { count: awards.topScorer.goals })
            : '-',
        },
        {
          key: 'bestPlayer',
          category: t('seasonAwardsTab.bestPlayer'),
          winner: awards.bestPlayer?.playerName ?? '-',
          detail: awards.bestPlayer
            ? t('seasonAwardsTab.awardsDetail', { count: awards.bestPlayer.awards })
            : '-',
        },
      ]
    : [];

  const columns: ColumnsType<AwardRow> = [
    {
      title: t('seasonAwardsTab.colCategory'),
      dataIndex: 'category',
      width: 180,
      render: (category: string) => <Tag color="gold">{category}</Tag>,
    },
    { title: t('seasonAwardsTab.colWinner'), dataIndex: 'winner', ellipsis: true },
    { title: t('seasonAwardsTab.colDetail'), dataIndex: 'detail', width: 180 },
  ];

  const drawLotColumns: ColumnsType<DrawLotResultItem> = [
    {
      title: 'Hạng rút thăm',
      dataIndex: 'resolvedRank',
      width: 120,
      align: 'center',
      render: (rank: number, record) => {
        if (!isAdmin || drawLotStatus?.isResolved) {
          return <Tag color="blue">#{rank}</Tag>;
        }
        return (
          <InputNumber
            min={1}
            max={20}
            value={overrides.get(record.teamId) ?? rank}
            size="small"
            style={{ width: 70 }}
            onChange={(val) => {
              if (val) {
                setOverrides((prev) => new Map(prev).set(record.teamId, val));
              }
            }}
          />
        );
      },
    },
    {
      title: 'CLB',
      key: 'team',
      render: (_, r) => (
        <Space size={6}>
          <strong>{r.team.name}</strong>
          {r.team.shortName && <span style={{ color: '#888' }}>({r.team.shortName})</span>}
        </Space>
      ),
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      width: 220,
      render: (note: string | null) => (
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {note ?? '—'}
        </Typography.Text>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'confirmed',
      width: 120,
      align: 'center',
      render: (_, r) =>
        r.confirmed ? (
          <Tag color="success" icon={<CheckOutlined />}>
            Đã xác nhận
          </Tag>
        ) : (
          <Tag color="warning">Chờ xác nhận</Tag>
        ),
    },
  ];

  const hasUnresolvedTies =
    drawLotStatus && drawLotStatus.teamsRequiringDrawLot.length > 0 && !drawLotStatus.isResolved;

  const hasResults = drawLotStatus && drawLotStatus.results.length > 0;

  return (
    <Space direction="vertical" size={12} style={{ width: '100%' }}>
      {/* Resolved success */}
      {drawLotStatus?.isResolved && (
        <Alert
          type="success"
          showIcon
          icon={<CheckOutlined />}
          message="BXH đã xếp hạng chính thức sau rút thăm"
          description="Kết quả rút thăm đã được xác nhận. Bảng xếp hạng cuối mùa phản ánh thứ hạng chính thức."
        />
      )}

      {/* Unresolved warning */}
      {hasUnresolvedTies && !hasResults && (
        <Alert
          type="warning"
          showIcon
          message={`Có ${drawLotStatus.teamsRequiringDrawLot.length} đội cần rút thăm để xác định thứ hạng chính thức`}
          description={
            <Space direction="vertical" size={4} style={{ marginTop: 4 }}>
              {drawLotStatus.teamsRequiringDrawLot.map((team) => (
                <Typography.Text key={team.teamId} type="secondary" style={{ fontSize: 12 }}>
                  <Tag style={{ fontSize: 11 }}>{team.teamName}</Tag>
                  {team.points} điểm · HS {team.goalDifference > 0 ? '+' : ''}
                  {team.goalDifference}
                  {team.tieBreakNote && ` · ${team.tieBreakNote}`}
                </Typography.Text>
              ))}
              {isAdmin && (
                <Button
                  type="primary"
                  size="small"
                  icon={<ExperimentOutlined />}
                  loading={drawLotLoading}
                  onClick={handleExecute}
                  style={{ marginTop: 4, width: 'fit-content' }}
                >
                  Rút thăm tự động (Random)
                </Button>
              )}
            </Space>
          }
        />
      )}

      {/* Draw lot results table */}
      {hasResults && (
        <div>
          <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
            <ExperimentOutlined /> Kết quả rút thăm
          </Typography.Text>
          <Table
            columns={drawLotColumns}
            dataSource={drawLotStatus!.results}
            rowKey="id"
            pagination={false}
            size="small"
          />
          {isAdmin && !drawLotStatus?.isResolved && (
            <Space style={{ marginTop: 12 }}>
              <Button
                type="primary"
                icon={<CheckOutlined />}
                loading={drawLotLoading}
                onClick={handleConfirm}
              >
                Xác nhận kết quả
              </Button>
              <Button icon={<ReloadOutlined />} loading={drawLotLoading} onClick={handleExecute}>
                Rút thăm lại
              </Button>
              <Popconfirm
                title="Xóa toàn bộ kết quả rút thăm?"
                onConfirm={handleReset}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button danger icon={<DeleteOutlined />} loading={drawLotLoading}>
                  Xóa kết quả
                </Button>
              </Popconfirm>
            </Space>
          )}
          {isAdmin && drawLotStatus?.isResolved && (
            <Space style={{ marginTop: 12 }}>
              <Popconfirm
                title="Xóa kết quả rút thăm đã xác nhận? BXH sẽ quay lại trạng thái chờ rút thăm."
                onConfirm={handleReset}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button danger icon={<DeleteOutlined />} loading={drawLotLoading} size="small">
                  Xóa để rút thăm lại
                </Button>
              </Popconfirm>
            </Space>
          )}
        </div>
      )}

      {/* Awards table */}
      <Table
        rowKey="key"
        columns={columns}
        dataSource={rows}
        loading={loading}
        pagination={false}
        size="middle"
        locale={{ emptyText: t('seasonAwardsTab.empty') }}
      />
    </Space>
  );
}

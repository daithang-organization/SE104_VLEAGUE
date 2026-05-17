import { Card, Collapse, message, Select, Space, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { apiGetSchedule, type ScheduleMatch } from '../../services/scheduleApi';
import { apiGetSeasons, type Season } from '../../services/seasonApi';

import { PUBLIC_STATUS_MAP as STATUS_MAP } from '../../utils/constants';
import { getTeamLogoUrl } from '../../utils/teamLogos';

const { Title, Text } = Typography;

export default function PublicSchedulePage() {
  const [matches, setMatches] = useState<ScheduleMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string | undefined>();

  useEffect(() => {
    apiGetSeasons().then((data) => {
      setSeasons(data);
      if (data.length > 0) setSelectedSeasonId(data[0].id);
    });
  }, []);

  const fetchSchedule = useCallback(async () => {
    if (!selectedSeasonId) return;
    setLoading(true);
    try {
      const res = await apiGetSchedule(selectedSeasonId);
      setMatches(res.matches ?? []);
    } catch (_err) {
      message.error('Không thể tải lịch thi đấu');
    } finally {
      setLoading(false);
    }
  }, [selectedSeasonId]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  // Group by round
  const grouped = new Map<number, ScheduleMatch[]>();
  for (const m of matches) {
    const round = m.roundNo ?? 0;
    if (!grouped.has(round)) grouped.set(round, []);
    grouped.get(round)!.push(m);
  }
  const rounds = Array.from(grouped.entries()).sort(([a], [b]) => a - b);

  const collapseItems = rounds.map(([roundNo, roundMatches]) => {
    const numRounds = matches.length > 0 ? Math.max(...matches.map((m) => m.roundNo)) / 2 : 9;
    const isLeg2 = roundNo > numRounds;

    return {
      key: String(roundNo),
      label: (
        <Space>
          <strong>Vòng {roundNo}</strong>
          <Tag color={isLeg2 ? 'volcano' : 'blue'}>{isLeg2 ? 'Lượt về' : 'Lượt đi'}</Tag>
          <Text type="secondary">{roundMatches.length} trận</Text>
        </Space>
      ),
      children: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {roundMatches.map((m) => {
            const st = STATUS_MAP[m.status];
            return (
              <Card
                key={m.id}
                size="small"
                style={{
                  borderLeft: `3px solid ${st?.color === 'green' ? '#52c41a' : st?.color === 'blue' ? '#1677ff' : '#d9d9d9'}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <strong style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {m.homeTeam?.name ?? '—'}
                      {getTeamLogoUrl(m.homeTeam) && (
                        <img
                          src={getTeamLogoUrl(m.homeTeam)}
                          alt={`${m.homeTeam?.name ?? 'Home team'} logo`}
                          style={{ width: 22, height: 22, objectFit: 'contain' }}
                        />
                      )}
                    </strong>
                    {m.homeScore != null && (
                      <span style={{ margin: '0 8px', fontSize: 16, fontWeight: 700 }}>
                        {m.homeScore} – {m.awayScore}
                      </span>
                    )}
                    {m.homeScore == null && (
                      <span style={{ margin: '0 8px', color: '#bbb' }}>vs</span>
                    )}
                    <strong style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {getTeamLogoUrl(m.awayTeam) && (
                        <img
                          src={getTeamLogoUrl(m.awayTeam)}
                          alt={`${m.awayTeam?.name ?? 'Away team'} logo`}
                          style={{ width: 22, height: 22, objectFit: 'contain' }}
                        />
                      )}
                      {m.awayTeam?.name ?? '—'}
                    </strong>
                  </div>
                  <Space size="small">
                    {m.stadium && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        🏟️ {m.stadium.name}
                      </Text>
                    )}
                    {m.kickoffAt && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        📅 {dayjs(m.kickoffAt).format('DD/MM/YYYY HH:mm')}
                      </Text>
                    )}
                    <Tag color={st?.color}>{st?.label ?? m.status}</Tag>
                  </Space>
                </div>
              </Card>
            );
          })}
        </div>
      ),
    };
  });

  // Auto-open rounds with upcoming matches
  const defaultKeys = rounds
    .filter(([, ms]) => ms.some((m) => m.status !== 'FINISHED'))
    .slice(0, 2)
    .map(([r]) => String(r));

  return (
    <div>
      <Space style={{ marginBottom: 16 }} align="center">
        <Title level={3} style={{ margin: 0 }}>
          📅 Lịch thi đấu V-League
        </Title>
        <Select
          value={selectedSeasonId}
          onChange={setSelectedSeasonId}
          style={{ width: 220 }}
          placeholder="Chọn mùa giải"
          options={seasons.map((s) => ({
            value: s.id,
            label: `${s.name} (${s.year}/${s.year + 1})`,
          }))}
        />
      </Space>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Đang tải...</div>
      ) : rounds.length === 0 ? (
        <Card>
          <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
            Chưa có lịch thi đấu
          </div>
        </Card>
      ) : (
        <Collapse defaultActiveKey={defaultKeys} items={collapseItems} />
      )}
    </div>
  );
}

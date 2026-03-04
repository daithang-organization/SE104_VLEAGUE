import { Card, Tag, Typography } from 'antd';
import type { MatchEvent } from '../../services/matchApi';
import { EVENT_TYPE_MAP } from './constants';

const { Text } = Typography;

interface MatchTimelineProps {
  events: MatchEvent[];
  homeTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  onPlayerClick?: (playerId: string) => void;
}

export default function MatchTimeline({
  events,
  homeTeamId,
  homeTeamName,
  awayTeamName,
  onPlayerClick,
}: MatchTimelineProps) {
  const sorted = [...events].sort((a, b) => a.minute - b.minute);

  if (sorted.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Chưa có sự kiện nào</div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '8px 16px',
          marginBottom: 8,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: 8,
          color: '#fff',
        }}
      >
        <Text strong style={{ color: '#fff', fontSize: 14 }}>
          {homeTeamName}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>DIỄN BIẾN TRẬN ĐẤU</Text>
        <Text strong style={{ color: '#fff', fontSize: 14 }}>
          {awayTeamName}
        </Text>
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative', padding: '0 8px' }}>
        {/* Center line */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: 3,
            background: 'linear-gradient(180deg, #667eea, #764ba2)',
            transform: 'translateX(-50%)',
            borderRadius: 2,
            opacity: 0.3,
          }}
        />

        {sorted.map((event, idx) => {
          const isHome = event.team?.id === homeTeamId;
          const meta = EVENT_TYPE_MAP[event.type] ?? {
            label: event.type,
            color: 'default',
            icon: '•',
          };

          const bgColor =
            event.type === 'GOAL' || event.type === 'PENALTY'
              ? '#f6ffed'
              : event.type === 'OWN_GOAL'
                ? '#fff7e6'
                : event.type === 'RED_CARD'
                  ? '#fff1f0'
                  : event.type === 'YELLOW_CARD'
                    ? '#fffbe6'
                    : event.type === 'SUBSTITUTION'
                      ? '#e6f7ff'
                      : '#fafafa';

          const borderColor =
            event.type === 'GOAL' || event.type === 'PENALTY'
              ? '#b7eb8f'
              : event.type === 'OWN_GOAL'
                ? '#ffd591'
                : event.type === 'RED_CARD'
                  ? '#ffa39e'
                  : event.type === 'YELLOW_CARD'
                    ? '#ffe58f'
                    : event.type === 'SUBSTITUTION'
                      ? '#91d5ff'
                      : '#d9d9d9';

          return (
            <div
              key={event.id ?? idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: 8,
                minHeight: 44,
              }}
            >
              {/* Left (home) side */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'flex-end',
                  paddingRight: 16,
                }}
              >
                {isHome && (
                  <Card
                    size="small"
                    style={{
                      background: bgColor,
                      border: `1px solid ${borderColor}`,
                      borderRadius: 8,
                      maxWidth: 280,
                      cursor: event.playerId ? 'pointer' : 'default',
                    }}
                    styles={{ body: { padding: '6px 10px' } }}
                    onClick={() => event.playerId && onPlayerClick?.(event.playerId)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 16 }}>{meta.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>
                          {event.player?.fullName ?? '—'}
                        </div>
                        <div style={{ fontSize: 11, color: '#888' }}>
                          <Tag
                            color={meta.color}
                            style={{ fontSize: 10, lineHeight: '16px', marginRight: 4 }}
                          >
                            {meta.label}
                          </Tag>
                          {event.relatedPlayer && (
                            <span style={{ color: '#aaa' }}>
                              {event.type === 'SUBSTITUTION' ? '↘ ' : '🅰 '}
                              {event.relatedPlayer.fullName}
                            </span>
                          )}
                          {event.goalType && (
                            <Tag style={{ fontSize: 10, marginLeft: 2 }}>{event.goalType}</Tag>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* Center minute bubble */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background:
                    event.type === 'GOAL' || event.type === 'PENALTY'
                      ? '#52c41a'
                      : event.type === 'RED_CARD'
                        ? '#ff4d4f'
                        : event.type === 'YELLOW_CARD'
                          ? '#faad14'
                          : event.type === 'SUBSTITUTION'
                            ? '#1890ff'
                            : event.type === 'OWN_GOAL'
                              ? '#fa8c16'
                              : '#8c8c8c',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 13,
                  flexShrink: 0,
                  zIndex: 1,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                }}
              >
                {event.minute}'
              </div>

              {/* Right (away) side */}
              <div
                style={{
                  flex: 1,
                  display: 'flex',
                  justifyContent: 'flex-start',
                  paddingLeft: 16,
                }}
              >
                {!isHome && (
                  <Card
                    size="small"
                    style={{
                      background: bgColor,
                      border: `1px solid ${borderColor}`,
                      borderRadius: 8,
                      maxWidth: 280,
                      cursor: event.playerId ? 'pointer' : 'default',
                    }}
                    styles={{ body: { padding: '6px 10px' } }}
                    onClick={() => event.playerId && onPlayerClick?.(event.playerId)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 16 }}>{meta.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13, lineHeight: 1.3 }}>
                          {event.player?.fullName ?? '—'}
                        </div>
                        <div style={{ fontSize: 11, color: '#888' }}>
                          <Tag
                            color={meta.color}
                            style={{ fontSize: 10, lineHeight: '16px', marginRight: 4 }}
                          >
                            {meta.label}
                          </Tag>
                          {event.relatedPlayer && (
                            <span style={{ color: '#aaa' }}>
                              {event.type === 'SUBSTITUTION' ? '↘ ' : '🅰 '}
                              {event.relatedPlayer.fullName}
                            </span>
                          )}
                          {event.goalType && (
                            <Tag style={{ fontSize: 10, marginLeft: 2 }}>{event.goalType}</Tag>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

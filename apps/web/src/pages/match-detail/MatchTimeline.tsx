import { Card, Tag, Typography } from 'antd';
import type { CSSProperties } from 'react';
import type { MatchEvent } from '../../services/matchApi';
import { useTheme } from '../../shell/ThemeContext';
import { getTeamTheme } from '../../utils/teamLogos';
import { EVENT_TYPE_MAP } from './constants';

const { Text } = Typography;

const LIGHT_BG: Record<string, string> = {
  GOAL: '#f6ffed',
  PENALTY: '#f6ffed',
  OWN_GOAL: '#fff7e6',
  RED_CARD: '#fff1f0',
  YELLOW_CARD: '#fffbe6',
  SUBSTITUTION: '#e6f7ff',
  DEFAULT: '#fafafa',
};

const DARK_BG: Record<string, string> = {
  GOAL: '#162312',
  PENALTY: '#162312',
  OWN_GOAL: '#2b1d11',
  RED_CARD: '#2a1215',
  YELLOW_CARD: '#2b2611',
  SUBSTITUTION: '#111d2c',
  DEFAULT: '#1f1f1f',
};

const LIGHT_BORDER: Record<string, string> = {
  GOAL: '#b7eb8f',
  PENALTY: '#b7eb8f',
  OWN_GOAL: '#ffd591',
  RED_CARD: '#ffa39e',
  YELLOW_CARD: '#ffe58f',
  SUBSTITUTION: '#91d5ff',
  DEFAULT: '#d9d9d9',
};

const DARK_BORDER: Record<string, string> = {
  GOAL: '#274916',
  PENALTY: '#274916',
  OWN_GOAL: '#593815',
  RED_CARD: '#58181c',
  YELLOW_CARD: '#594e15',
  SUBSTITUTION: '#15395b',
  DEFAULT: '#424242',
};

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
  const { isDark } = useTheme();
  const palette = isDark ? DARK_BG : LIGHT_BG;
  const borders = isDark ? DARK_BORDER : LIGHT_BORDER;
  const homeEventCount = sorted.filter((event) => event.team?.id === homeTeamId).length;
  const awayEventCount = sorted.length - homeEventCount;
  const homeTheme = getTeamTheme(homeTeamName);
  const awayTheme = getTeamTheme(awayTeamName);
  const heroStyle = {
    '--match-home-primary': homeTheme.primary,
    '--match-home-border': homeTheme.border,
    '--match-away-primary': awayTheme.primary,
    '--match-away-border': awayTheme.border,
  } as CSSProperties;

  // CSS keyframes for slide-in animation
  const animStyles = `
    @keyframes slideInLeft {
      from { opacity: 0; transform: translateX(-30px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(30px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes popIn {
      from { opacity: 0; transform: scale(0.5); }
      to { opacity: 1; transform: scale(1); }
    }
    .timeline-event-home { animation: slideInLeft 0.4s ease-out forwards; }
    .timeline-event-away { animation: slideInRight 0.4s ease-out forwards; }
    .timeline-minute { animation: popIn 0.3s ease-out forwards; }
  `;

  return (
    <div>
      <style>{animStyles}</style>
      {/* Header */}
      <section className="match-timeline-hero" style={heroStyle} aria-label="Diễn biến trận đấu">
        <div className="match-timeline-grid">
          <article className="match-timeline-grid-card match-timeline-team-card-home">
            <Text className="match-timeline-card-label">Đội nhà</Text>
            <strong>{homeTeamName}</strong>
            <span>{homeEventCount} sự kiện</span>
          </article>
          <article className="match-timeline-grid-card match-timeline-center-card">
            <Text className="match-timeline-card-label">Diễn biến trận đấu</Text>
            <strong>{sorted.length}</strong>
            <span>Tổng sự kiện</span>
          </article>
          <article className="match-timeline-grid-card match-timeline-team-card-away">
            <Text className="match-timeline-card-label">Đội khách</Text>
            <strong>{awayTeamName}</strong>
            <span>{awayEventCount} sự kiện</span>
          </article>
        </div>
      </section>

      {sorted.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>Chưa có sự kiện nào</div>
      ) : (
        <>
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

              const bgColor = palette[event.type] ?? palette.DEFAULT;

              const borderColor = borders[event.type] ?? borders.DEFAULT;

              return (
                <div
                  key={event.id ?? idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: 8,
                    minHeight: 44,
                    animationDelay: `${idx * 0.08}s`,
                    animationFillMode: 'both',
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
                        className="timeline-event-home"
                        style={{
                          background: bgColor,
                          border: `1px solid ${borderColor}`,
                          borderRadius: 8,
                          maxWidth: 280,
                          cursor: event.playerId ? 'pointer' : 'default',
                          animationDelay: `${idx * 0.08}s`,
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
                    className="timeline-minute"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      animationDelay: `${idx * 0.08}s`,
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
                        className="timeline-event-away"
                        style={{
                          background: bgColor,
                          border: `1px solid ${borderColor}`,
                          borderRadius: 8,
                          maxWidth: 280,
                          cursor: event.playerId ? 'pointer' : 'default',
                          animationDelay: `${idx * 0.08}s`,
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
        </>
      )}
    </div>
  );
}

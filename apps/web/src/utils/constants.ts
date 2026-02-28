/**
 * Shared UI constant maps used across multiple pages.
 * Single source of truth — import from here instead of duplicating.
 */

/* ── Match Status ── */

export const STATUS_MAP: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Nháp', color: 'default' },
  PUBLISHED: { label: 'Đã công bố', color: 'blue' },
  LOCKED: { label: 'Đã khóa', color: 'orange' },
  FINISHED: { label: 'Kết thúc', color: 'green' },
  POSTPONED: { label: 'Hoãn', color: 'red' },
};

/** Public-facing status labels (user-friendly wording) */
export const PUBLIC_STATUS_MAP: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Nháp', color: 'default' },
  PUBLISHED: { label: 'Sắp diễn ra', color: 'blue' },
  LOCKED: { label: 'Đang diễn ra', color: 'orange' },
  FINISHED: { label: 'Kết thúc', color: 'green' },
  POSTPONED: { label: 'Hoãn', color: 'red' },
};

/* ── Match Event Types ── */

export const EVENT_TYPE_MAP: Record<string, { label: string; color: string; icon: string }> = {
  GOAL: { label: 'Bàn thắng', color: 'green', icon: '⚽' },
  OWN_GOAL: { label: 'Phản lưới', color: 'red', icon: '⚽🔴' },
  PENALTY: { label: 'Phạt đền (ghi bàn)', color: 'green', icon: '⚽🎯' },
  PENALTY_MISS: { label: 'Phạt đền (hỏng)', color: 'orange', icon: '❌🎯' },
  YELLOW_CARD: { label: 'Thẻ vàng', color: 'gold', icon: '🟨' },
  RED_CARD: { label: 'Thẻ đỏ', color: 'red', icon: '🟥' },
  SUBSTITUTION: { label: 'Thay người', color: 'blue', icon: '🔄' },
};

/* ── Player Positions ── */

export const POSITION_MAP: Record<string, { label: string; color: string }> = {
  GK: { label: 'Thủ môn', color: 'gold' },
  DF: { label: 'Hậu vệ', color: 'blue' },
  MF: { label: 'Tiền vệ', color: 'green' },
  FW: { label: 'Tiền đạo', color: 'red' },
};

/* ── Roles allowed to edit match data ── */

export const CAN_EDIT_ROLES = ['ADMIN', 'REFEREE'];

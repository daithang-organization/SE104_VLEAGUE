export const STATUS_MAP: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'Nháp', color: 'default' },
  PUBLISHED: { label: 'Đã công bố', color: 'blue' },
  LOCKED: { label: 'Đã khóa', color: 'orange' },
  FINISHED: { label: 'Kết thúc', color: 'green' },
  POSTPONED: { label: 'Hoãn', color: 'red' },
};

export const EVENT_TYPE_MAP: Record<string, { label: string; color: string; icon: string }> = {
  GOAL: { label: 'Bàn thắng', color: 'green', icon: '⚽' },
  OWN_GOAL: { label: 'Phản lưới', color: 'red', icon: '⚽🔴' },
  PENALTY: { label: 'Phạt đền (ghi bàn)', color: 'green', icon: '⚽🎯' },
  PENALTY_MISS: { label: 'Phạt đền (hỏng)', color: 'orange', icon: '❌🎯' },
  YELLOW_CARD: { label: 'Thẻ vàng', color: 'gold', icon: '🟨' },
  RED_CARD: { label: 'Thẻ đỏ', color: 'red', icon: '🟥' },
  SUBSTITUTION: { label: 'Thay người', color: 'blue', icon: '🔄' },
};

export const POSITION_MAP: Record<string, { label: string; color: string }> = {
  GK: { label: 'Thủ môn', color: 'gold' },
  DF: { label: 'Hậu vệ', color: 'blue' },
  MF: { label: 'Tiền vệ', color: 'green' },
  FW: { label: 'Tiền đạo', color: 'red' },
};

export const CAN_EDIT_ROLES = ['ADMIN', 'REFEREE'];

type PlayerNationalityLike = {
  playerType?: string | null;
  nationality?: string | null;
};

export function normalizeVietnameseText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function isVietnameseNationality(nationality?: string | null) {
  if (!nationality) return false;
  const normalized = normalizeVietnameseText(nationality);
  return (
    normalized === 'viet nam' || normalized === 'vietnam' || normalized === 'vn'
  );
}

export function isForeignPlayer(player?: PlayerNationalityLike | null) {
  if (!player) return false;
  if (player.playerType === 'FOREIGN') return true;
  if (!player.nationality) return false;
  return !isVietnameseNationality(player.nationality);
}

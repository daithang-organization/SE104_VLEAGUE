type TeamIdentity = {
  name?: string | null;
  shortName?: string | null;
  logoUrl?: string | null;
};

const TEAM_LOGOS: Record<string, string> = {
  'thep xanh nam dinh': '/team-logos/images.png',
  txnd: '/team-logos/images.png',
  'ha noi fc': '/team-logos/Logo_H%C3%A0_N%E1%BB%99i_FC.png',
  hn: '/team-logos/Logo_H%C3%A0_N%E1%BB%99i_FC.png',
  'cong an ha noi': '/team-logos/Logo_CAHN_FC.svg.png',
  cahn: '/team-logos/Logo_CAHN_FC.svg.png',
  'the cong viettel': '/team-logos/Logo_CLB_TC-VT.svg',
  'the cong-viettel': '/team-logos/Logo_CLB_TC-VT.svg',
  tcvt: '/team-logos/Logo_CLB_TC-VT.svg',
  'becamex binh duong': '/team-logos/Logo_of_Becamex_B%C3%ACnh_D%C6%B0%C6%A1ng_FC.svg.png',
  bbd: '/team-logos/Logo_of_Becamex_B%C3%ACnh_D%C6%B0%C6%A1ng_FC.svg.png',
  'hai phong fc': '/team-logos/H%E1%BA%A3i_Ph%C3%B2ng_FC.webp',
  hp: '/team-logos/H%E1%BA%A3i_Ph%C3%B2ng_FC.webp',
  'dong a thanh hoa': '/team-logos/Logo_CLB_%C4%90ATH.png',
  dath: '/team-logos/Logo_CLB_%C4%90ATH.png',
  'lpbank hoang anh gia lai': '/team-logos/Ho%C3%A0ng_Anh_Gia_Lai_FC.png',
  'hoang anh gia lai': '/team-logos/Ho%C3%A0ng_Anh_Gia_Lai_FC.png',
  hagl: '/team-logos/Ho%C3%A0ng_Anh_Gia_Lai_FC.png',
  'tp hcm fc': '/team-logos/Logo_CLB_TPHCM.svg.png',
  'tp.hcm fc': '/team-logos/Logo_CLB_TPHCM.svg.png',
  hcm: '/team-logos/Logo_CLB_TPHCM.svg.png',
  'song lam nghe an': '/team-logos/SLNA_FC_logo.svg',
  slna: '/team-logos/SLNA_FC_logo.svg',
  'merryland quy nhon binh dinh': '/team-logos/Binh_Dinh_FC_logo.svg',
  'quy nhon binh dinh': '/team-logos/Binh_Dinh_FC_logo.svg',
  qnbd: '/team-logos/Binh_Dinh_FC_logo.svg',
  'quang nam fc': '/team-logos/Qu%E1%BA%A3ng_Nam_FC.svg.png',
  qn: '/team-logos/Qu%E1%BA%A3ng_Nam_FC.svg.png',
  'hong linh ha tinh': '/team-logos/HLHT_FC.svg.png',
  hlht: '/team-logos/HLHT_FC.svg.png',
  'shb da nang': '/team-logos/CLB_SHB_%C4%90%C3%A0_N%E1%BA%B5ng.svg.png',
  dn: '/team-logos/CLB_SHB_%C4%90%C3%A0_N%E1%BA%B5ng.svg.png',
};

export function normalizeTeamLogoKey(value?: string | null) {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[Đđ]/g, 'd')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function getTeamLogoUrl(team?: TeamIdentity | string | null) {
  if (!team) return undefined;
  if (typeof team === 'string') return TEAM_LOGOS[normalizeTeamLogoKey(team)];
  return (
    team.logoUrl ||
    TEAM_LOGOS[normalizeTeamLogoKey(team.name)] ||
    TEAM_LOGOS[normalizeTeamLogoKey(team.shortName)]
  );
}

export function hasTeamLogo(team?: TeamIdentity | string | null) {
  return Boolean(getTeamLogoUrl(team));
}

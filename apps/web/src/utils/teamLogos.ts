import type { CSSProperties } from 'react';
import bacNinhLogo from '../assets/promo-candidates/bac-ninh-fc.svg';
import daiHocVanHienLogo from '../assets/promo-candidates/dai-hoc-van-hien-fc.png';
import dongThapLogo from '../assets/promo-candidates/dong-thap-fc.png';
import longAnLogo from '../assets/promo-candidates/long-an-fc.png';
import quangNinhLogo from '../assets/promo-candidates/quang-ninh-fc.png';
import quyNhonUnitedLogo from '../assets/promo-candidates/quy-nhon-united.png';
import sannaKhanhHoaLogo from '../assets/promo-candidates/sanna-khanh-hoa-fc.png';
import thanhNienTpHcmLogo from '../assets/promo-candidates/thanh-nien-tp-ho-chi-minh-fc.png';
import trePvfCandLogo from '../assets/promo-candidates/tre-pvf-cand.png';
import truongTuoiDongNaiLogo from '../assets/promo-candidates/truong-tuoi-dong-nai.png';
import xuanThienPhuThoLogo from '../assets/promo-candidates/xuan-thien-phu-tho-fc.png';

type TeamIdentity = {
  name?: string | null;
  shortName?: string | null;
  logoUrl?: string | null;
};

type TeamTheme = {
  primary: string;
  secondary: string;
  accent: string;
  border: string;
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
  'bac ninh fc': bacNinhLogo,
  bn: bacNinhLogo,
  'long an fc': longAnLogo,
  la: longAnLogo,
  'quy nhon united': quyNhonUnitedLogo,
  qnu: quyNhonUnitedLogo,
  'quang ninh fc': quangNinhLogo,
  qninh: quangNinhLogo,
  'sanna khanh hoa fc': sannaKhanhHoaLogo,
  skh: sannaKhanhHoaLogo,
  'thanh nien tp ho chi minh fc': thanhNienTpHcmLogo,
  tnhcm: thanhNienTpHcmLogo,
  'truong tuoi dong nai': truongTuoiDongNaiLogo,
  ttdn: truongTuoiDongNaiLogo,
  'tre pvf cand': trePvfCandLogo,
  pvf: trePvfCandLogo,
  'xuan thien phu tho fc': xuanThienPhuThoLogo,
  pt: xuanThienPhuThoLogo,
  'dai hoc van hien fc': daiHocVanHienLogo,
  vhu: daiHocVanHienLogo,
  'dong thap fc': dongThapLogo,
  dt: dongThapLogo,
};

const DEFAULT_TEAM_THEME: TeamTheme = {
  primary: 'rgba(227, 34, 33, 0.16)',
  secondary: 'rgba(37, 99, 235, 0.08)',
  accent: '#e32221',
  border: 'rgba(227, 34, 33, 0.24)',
};

const TEAM_THEMES: Record<string, TeamTheme> = {
  'thep xanh nam dinh': {
    primary: 'rgba(248, 205, 42, 0.24)',
    secondary: 'rgba(35, 80, 169, 0.13)',
    accent: '#f6c945',
    border: 'rgba(248, 205, 42, 0.34)',
  },
  txnd: {
    primary: 'rgba(248, 205, 42, 0.24)',
    secondary: 'rgba(35, 80, 169, 0.13)',
    accent: '#f6c945',
    border: 'rgba(248, 205, 42, 0.34)',
  },
  'ha noi fc': {
    primary: 'rgba(91, 48, 143, 0.24)',
    secondary: 'rgba(247, 201, 72, 0.15)',
    accent: '#f7c948',
    border: 'rgba(247, 201, 72, 0.34)',
  },
  hn: {
    primary: 'rgba(91, 48, 143, 0.24)',
    secondary: 'rgba(247, 201, 72, 0.15)',
    accent: '#f7c948',
    border: 'rgba(247, 201, 72, 0.34)',
  },
  'cong an ha noi': {
    primary: 'rgba(203, 27, 38, 0.25)',
    secondary: 'rgba(245, 197, 66, 0.16)',
    accent: '#f5c542',
    border: 'rgba(245, 197, 66, 0.34)',
  },
  cahn: {
    primary: 'rgba(203, 27, 38, 0.25)',
    secondary: 'rgba(245, 197, 66, 0.16)',
    accent: '#f5c542',
    border: 'rgba(245, 197, 66, 0.34)',
  },
  'the cong viettel': {
    primary: 'rgba(207, 32, 47, 0.24)',
    secondary: 'rgba(15, 139, 61, 0.12)',
    accent: '#cf202f',
    border: 'rgba(207, 32, 47, 0.3)',
  },
  'the cong-viettel': {
    primary: 'rgba(207, 32, 47, 0.24)',
    secondary: 'rgba(15, 139, 61, 0.12)',
    accent: '#cf202f',
    border: 'rgba(207, 32, 47, 0.3)',
  },
  tcvt: {
    primary: 'rgba(207, 32, 47, 0.24)',
    secondary: 'rgba(15, 139, 61, 0.12)',
    accent: '#cf202f',
    border: 'rgba(207, 32, 47, 0.3)',
  },
  'becamex binh duong': {
    primary: 'rgba(30, 64, 175, 0.22)',
    secondary: 'rgba(220, 38, 38, 0.12)',
    accent: '#2563eb',
    border: 'rgba(37, 99, 235, 0.3)',
  },
  bbd: {
    primary: 'rgba(30, 64, 175, 0.22)',
    secondary: 'rgba(220, 38, 38, 0.12)',
    accent: '#2563eb',
    border: 'rgba(37, 99, 235, 0.3)',
  },
  'hai phong fc': {
    primary: 'rgba(215, 25, 32, 0.23)',
    secondary: 'rgba(20, 80, 170, 0.12)',
    accent: '#d71920',
    border: 'rgba(215, 25, 32, 0.32)',
  },
  hp: {
    primary: 'rgba(215, 25, 32, 0.23)',
    secondary: 'rgba(20, 80, 170, 0.12)',
    accent: '#d71920',
    border: 'rgba(215, 25, 32, 0.32)',
  },
  'dong a thanh hoa': {
    primary: 'rgba(251, 191, 36, 0.22)',
    secondary: 'rgba(220, 38, 38, 0.14)',
    accent: '#f59e0b',
    border: 'rgba(251, 191, 36, 0.34)',
  },
  dath: {
    primary: 'rgba(251, 191, 36, 0.22)',
    secondary: 'rgba(220, 38, 38, 0.14)',
    accent: '#f59e0b',
    border: 'rgba(251, 191, 36, 0.34)',
  },
  'lpbank hoang anh gia lai': {
    primary: 'rgba(37, 99, 235, 0.21)',
    secondary: 'rgba(250, 204, 21, 0.16)',
    accent: '#2563eb',
    border: 'rgba(37, 99, 235, 0.3)',
  },
  'hoang anh gia lai': {
    primary: 'rgba(37, 99, 235, 0.21)',
    secondary: 'rgba(250, 204, 21, 0.16)',
    accent: '#2563eb',
    border: 'rgba(37, 99, 235, 0.3)',
  },
  hagl: {
    primary: 'rgba(37, 99, 235, 0.21)',
    secondary: 'rgba(250, 204, 21, 0.16)',
    accent: '#2563eb',
    border: 'rgba(37, 99, 235, 0.3)',
  },
  'tp hcm fc': {
    primary: 'rgba(220, 38, 38, 0.23)',
    secondary: 'rgba(15, 23, 42, 0.14)',
    accent: '#dc2626',
    border: 'rgba(220, 38, 38, 0.32)',
  },
  'tp.hcm fc': {
    primary: 'rgba(220, 38, 38, 0.23)',
    secondary: 'rgba(15, 23, 42, 0.14)',
    accent: '#dc2626',
    border: 'rgba(220, 38, 38, 0.32)',
  },
  hcm: {
    primary: 'rgba(220, 38, 38, 0.23)',
    secondary: 'rgba(15, 23, 42, 0.14)',
    accent: '#dc2626',
    border: 'rgba(220, 38, 38, 0.32)',
  },
  'song lam nghe an': {
    primary: 'rgba(242, 201, 76, 0.23)',
    secondary: 'rgba(29, 78, 216, 0.12)',
    accent: '#f2c94c',
    border: 'rgba(242, 201, 76, 0.34)',
  },
  slna: {
    primary: 'rgba(242, 201, 76, 0.23)',
    secondary: 'rgba(29, 78, 216, 0.12)',
    accent: '#f2c94c',
    border: 'rgba(242, 201, 76, 0.34)',
  },
  'merryland quy nhon binh dinh': {
    primary: 'rgba(185, 28, 28, 0.23)',
    secondary: 'rgba(250, 204, 21, 0.14)',
    accent: '#b91c1c',
    border: 'rgba(185, 28, 28, 0.32)',
  },
  'quy nhon binh dinh': {
    primary: 'rgba(185, 28, 28, 0.23)',
    secondary: 'rgba(250, 204, 21, 0.14)',
    accent: '#b91c1c',
    border: 'rgba(185, 28, 28, 0.32)',
  },
  qnbd: {
    primary: 'rgba(185, 28, 28, 0.23)',
    secondary: 'rgba(250, 204, 21, 0.14)',
    accent: '#b91c1c',
    border: 'rgba(185, 28, 28, 0.32)',
  },
  'quang nam fc': {
    primary: 'rgba(250, 204, 21, 0.24)',
    secondary: 'rgba(37, 99, 235, 0.12)',
    accent: '#facc15',
    border: 'rgba(250, 204, 21, 0.34)',
  },
  qn: {
    primary: 'rgba(250, 204, 21, 0.24)',
    secondary: 'rgba(37, 99, 235, 0.12)',
    accent: '#facc15',
    border: 'rgba(250, 204, 21, 0.34)',
  },
  'hong linh ha tinh': {
    primary: 'rgba(220, 38, 38, 0.22)',
    secondary: 'rgba(37, 99, 235, 0.12)',
    accent: '#dc2626',
    border: 'rgba(220, 38, 38, 0.32)',
  },
  hlht: {
    primary: 'rgba(220, 38, 38, 0.22)',
    secondary: 'rgba(37, 99, 235, 0.12)',
    accent: '#dc2626',
    border: 'rgba(220, 38, 38, 0.32)',
  },
  'shb da nang': {
    primary: 'rgba(249, 115, 22, 0.23)',
    secondary: 'rgba(37, 99, 235, 0.12)',
    accent: '#f97316',
    border: 'rgba(249, 115, 22, 0.32)',
  },
  dn: {
    primary: 'rgba(249, 115, 22, 0.23)',
    secondary: 'rgba(37, 99, 235, 0.12)',
    accent: '#f97316',
    border: 'rgba(249, 115, 22, 0.32)',
  },
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
  const mappedLogo =
    TEAM_LOGOS[normalizeTeamLogoKey(team.name)] || TEAM_LOGOS[normalizeTeamLogoKey(team.shortName)];

  if (mappedLogo) return mappedLogo;

  return (
    (team.logoUrl ? encodeURI(team.logoUrl) : undefined) ||
    TEAM_LOGOS[normalizeTeamLogoKey(team.name)] ||
    TEAM_LOGOS[normalizeTeamLogoKey(team.shortName)]
  );
}

export function getTeamTheme(team?: TeamIdentity | string | null) {
  if (!team) return DEFAULT_TEAM_THEME;
  if (typeof team === 'string')
    return TEAM_THEMES[normalizeTeamLogoKey(team)] ?? DEFAULT_TEAM_THEME;

  return (
    TEAM_THEMES[normalizeTeamLogoKey(team.name)] ||
    TEAM_THEMES[normalizeTeamLogoKey(team.shortName)] ||
    DEFAULT_TEAM_THEME
  );
}

export function getTeamThemeStyle(team?: TeamIdentity | string | null) {
  const theme = getTeamTheme(team);

  return {
    '--club-primary': theme.primary,
    '--club-secondary': theme.secondary,
    '--club-accent': theme.accent,
    '--club-border': theme.border,
  } as CSSProperties;
}

export function hasTeamLogo(team?: TeamIdentity | string | null) {
  return Boolean(getTeamLogoUrl(team));
}

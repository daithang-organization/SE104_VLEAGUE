import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  patch: vi.fn(),
  post: vi.fn(),
}));

vi.mock('../../lib/api', () => ({ api: mockApi }));

import {
  apiGetTeamManagerApplication,
  apiGetTeamManagerManagedTeam,
  apiSubmitTeamManagerApplication,
} from '../teamManagerApi';

describe('teamManagerApi application calls', () => {
  beforeEach(() => vi.clearAllMocks());

  it('apiGetTeamManagerApplication calls GET /team-manager/application', async () => {
    const application = { id: 'season-team-1', ownerName: 'Club Owner' };
    mockApi.get.mockResolvedValue({ data: application });

    const result = await apiGetTeamManagerApplication('season-1');

    expect(mockApi.get).toHaveBeenCalledWith('/team-manager/application', {
      params: { seasonId: 'season-1' },
    });
    expect(result).toEqual(application);
  });

  it('apiGetTeamManagerManagedTeam calls GET /team-manager/managed-team', async () => {
    const team = { id: 'team-1', name: 'Hà Nội FC' };
    mockApi.get.mockResolvedValue({ data: team });

    const result = await apiGetTeamManagerManagedTeam();

    expect(mockApi.get).toHaveBeenCalledWith('/team-manager/managed-team');
    expect(result).toEqual(team);
  });

  it('apiSubmitTeamManagerApplication calls POST /team-manager/application', async () => {
    const payload = {
      seasonId: 'season-1',
      ownerName: 'Công ty CLB',
      ownerCountry: 'Việt Nam',
      teamIntroduction: 'Giới thiệu đội',
      primaryKit: 'Áo đỏ',
      backupKit: 'Áo trắng',
      participationFeePaid: true,
    };
    const application = { id: 'season-team-1', ...payload };
    mockApi.post.mockResolvedValue({ data: application });

    const result = await apiSubmitTeamManagerApplication(payload);

    expect(mockApi.post).toHaveBeenCalledWith('/team-manager/application', payload);
    expect(result).toEqual(application);
  });
});

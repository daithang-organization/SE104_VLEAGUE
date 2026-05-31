import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
            },
            notification: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('creates one notification for each admin user', async () => {
    jest
      .spyOn(prisma.user, 'findMany')
      .mockResolvedValue([{ id: 'admin-1' }, { id: 'admin-2' }] as any);
    jest
      .spyOn(prisma.notification, 'create')
      .mockResolvedValue({ id: 'notification-1' } as any);

    await (service as any).notifyAdmins({
      title: 'CLB nộp hồ sơ mùa giải',
      message: 'Hà Nội FC đã nộp hồ sơ.',
      type: 'SYSTEM',
      entityType: 'season_team',
      entityId: 'season-team-1',
    });

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      where: { role: 'ADMIN' },
      select: { id: true },
    });
    expect(prisma.notification.create).toHaveBeenCalledTimes(2);
    expect(prisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'admin-1',
          title: 'CLB nộp hồ sơ mùa giải',
          entityType: 'season_team',
          entityId: 'season-team-1',
        }),
      }),
    );
    expect(prisma.notification.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'admin-2',
        }),
      }),
    );
  });
});

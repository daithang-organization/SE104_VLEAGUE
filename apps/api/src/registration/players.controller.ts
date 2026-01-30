import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RegistrationService } from './registration.service';

@ApiTags('Players')
@Controller()
export class PlayersController {
  constructor(private readonly reg: RegistrationService) {}

  @Get('/players')
  @ApiOperation({
    summary: 'Lấy danh sách cầu thủ',
    description: 'Trả về danh sách tất cả cầu thủ đã đăng ký trong hệ thống',
  })
  @ApiOkResponse({
    description: 'Danh sách cầu thủ',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            example: '550e8400-e29b-41d4-a716-446655440010',
          },
          fullName: { type: 'string', example: 'Nguyễn Quang Hải' },
          dob: {
            type: 'string',
            format: 'date-time',
            example: '1997-04-12T00:00:00.000Z',
          },
          nationality: { type: 'string', example: 'Vietnam' },
          position: {
            type: 'string',
            enum: ['GK', 'DF', 'MF', 'FW'],
            example: 'MF',
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  async getPlayers(): Promise<
    Awaited<ReturnType<typeof this.reg.listPlayers>>
  > {
    return await this.reg.listPlayers();
  }
}

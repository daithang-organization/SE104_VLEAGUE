import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard, Role, Roles, RolesGuard } from '../auth';
import { RegistrationService } from './registration.service';

@ApiTags('Players')
@Controller('players')
export class PlayersImportController {
  constructor(private readonly reg: RegistrationService) {}

  @Post('import')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth('access-token')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
      fileFilter: (_req, file, cb) => {
        if (
          !file.mimetype.includes('csv') &&
          !file.originalname.endsWith('.csv')
        ) {
          cb(new BadRequestException('Chỉ chấp nhận file CSV'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  @ApiOperation({
    summary: 'Import cầu thủ từ CSV',
    description:
      'Upload file CSV với format: fullName,dob,nationality,position,playerType,birthPlace,heightCm,weightKg',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File CSV chứa danh sách cầu thủ',
        },
      },
    },
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        imported: { type: 'number' },
        errors: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  async importPlayers(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file CSV');
    }

    const csvContent = file.buffer.toString('utf-8');
    const lines = csvContent.split('\n').filter((l) => l.trim());

    if (lines.length < 2) {
      throw new BadRequestException('File CSV rỗng hoặc thiếu dữ liệu');
    }

    // Skip header row
    const dataLines = lines.slice(1);
    let imported = 0;
    const errors: string[] = [];

    for (let i = 0; i < dataLines.length; i++) {
      const fields = dataLines[i].split(',').map((f) => f.trim());
      const [
        fullName,
        dob,
        nationality,
        position,
        playerType,
        birthPlace,
        heightCm,
        weightKg,
      ] = fields;

      if (
        !fullName ||
        !dob ||
        !nationality ||
        !position ||
        !['GK', 'DF', 'MF', 'FW'].includes(position)
      ) {
        errors.push(
          `Dòng ${i + 2}: Thiếu thông tin bắt buộc (fullName, dob, nationality, position)`,
        );
        continue;
      }

      try {
        await this.reg.createPlayer({
          fullName,
          dob,
          nationality,
          position: position as 'GK' | 'DF' | 'MF' | 'FW',
          playerType:
            playerType === 'FOREIGN'
              ? 'FOREIGN'
              : ('DOMESTIC' as 'DOMESTIC' | 'FOREIGN'),
          birthPlace: birthPlace || undefined,
          heightCm: heightCm ? Number(heightCm) : undefined,
          weightKg: weightKg ? Number(weightKg) : undefined,
        });
        imported++;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        errors.push(`Dòng ${i + 2}: ${msg}`);
      }
    }

    return { imported, errors, total: dataLines.length };
  }
}

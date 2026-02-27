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
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { JwtAuthGuard, Role, Roles, RolesGuard } from '../auth';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const storage = diskStorage({
  destination: join(process.cwd(), 'uploads'),
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  @Post('image')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEAM_MANAGER)
  @ApiBearerAuth('access-token')
  @UseInterceptors(
    FileInterceptor('file', {
      storage,
      limits: { fileSize: MAX_SIZE },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_TYPES.includes(file.mimetype)) {
          cb(
            new BadRequestException(
              'Chỉ chấp nhận file ảnh (JPEG, PNG, WebP, GIF)',
            ),
            false,
          );
          return;
        }
        cb(null, true);
      },
    }),
  )
  @ApiOperation({
    summary: 'Upload ảnh',
    description:
      'Upload file ảnh (JPEG, PNG, WebP, GIF). Tối đa 5MB. Trả về URL ảnh.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary', description: 'File ảnh' },
      },
    },
  })
  @ApiOkResponse({
    description: 'Upload thành công',
    schema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          example: '/uploads/abc123.jpg',
        },
        filename: { type: 'string', example: 'abc123.jpg' },
      },
    },
  })
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Vui lòng chọn file');
    }

    return {
      url: `/uploads/${file.filename}`,
      filename: file.filename,
    };
  }
}

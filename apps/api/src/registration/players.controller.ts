import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard, Role, Roles, RolesGuard } from '../auth';
import { CreatePlayerDto, UpdatePlayerDto } from './dto/player.dto';
import { RegistrationService } from './registration.service';

@ApiTags('Players')
@Controller('players')
export class PlayersController {
  constructor(private readonly reg: RegistrationService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách cầu thủ',
    description: 'Trả về danh sách tất cả cầu thủ đã đăng ký trong hệ thống',
  })
  @ApiOkResponse({ description: 'Danh sách cầu thủ' })
  async getPlayers() {
    return await this.reg.listPlayers();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Lấy chi tiết cầu thủ',
    description: 'Trả về thông tin chi tiết cầu thủ bao gồm đội hiện tại',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Thông tin cầu thủ' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy cầu thủ' })
  async getPlayer(@Param('id') id: string) {
    return await this.reg.findOnePlayer(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEAM_MANAGER)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Tạo cầu thủ mới',
    description: 'ADMIN hoặc TEAM_MANAGER có quyền tạo cầu thủ',
  })
  @ApiBody({ type: CreatePlayerDto })
  @ApiOkResponse({ description: 'Cầu thủ đã được tạo' })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập' })
  @ApiForbiddenResponse({ description: 'Không có quyền' })
  async createPlayer(@Body() dto: CreatePlayerDto) {
    return await this.reg.createPlayer(dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEAM_MANAGER)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Cập nhật cầu thủ',
    description: 'ADMIN hoặc TEAM_MANAGER có quyền cập nhật',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdatePlayerDto })
  @ApiOkResponse({ description: 'Cầu thủ đã được cập nhật' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy cầu thủ' })
  @ApiForbiddenResponse({ description: 'Không có quyền' })
  async updatePlayer(@Param('id') id: string, @Body() dto: UpdatePlayerDto) {
    return await this.reg.updatePlayer(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TEAM_MANAGER)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Xóa cầu thủ',
    description: 'ADMIN hoặc TEAM_MANAGER có quyền xóa',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Cầu thủ đã được xóa' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy cầu thủ' })
  @ApiForbiddenResponse({ description: 'Không có quyền' })
  async deletePlayer(@Param('id') id: string) {
    return await this.reg.deletePlayer(id);
  }
}

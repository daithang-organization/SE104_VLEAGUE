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
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard, Role, Roles, RolesGuard } from '../auth';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth('access-token')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({
    summary: 'Lấy danh sách người dùng',
    description: 'Chỉ ADMIN có quyền xem danh sách người dùng',
  })
  @ApiOkResponse({ description: 'Danh sách người dùng' })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập' })
  @ApiForbiddenResponse({ description: 'Không có quyền (yêu cầu ADMIN)' })
  async getUsers() {
    return this.usersService.listUsers();
  }

  @Post()
  @ApiOperation({
    summary: 'Tạo người dùng mới',
    description: 'ADMIN tạo tài khoản với vai trò cụ thể',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiOkResponse({ description: 'Người dùng đã được tạo' })
  @ApiConflictResponse({ description: 'Email đã tồn tại' })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập' })
  @ApiForbiddenResponse({ description: 'Không có quyền (yêu cầu ADMIN)' })
  async createUser(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  @Patch(':id/role')
  @ApiOperation({
    summary: 'Cập nhật vai trò người dùng',
    description: 'Chỉ ADMIN có quyền thay đổi role',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiBody({ type: UpdateRoleDto })
  @ApiOkResponse({ description: 'Vai trò đã được cập nhật' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy người dùng' })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập' })
  @ApiForbiddenResponse({ description: 'Không có quyền (yêu cầu ADMIN)' })
  async updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.usersService.updateRole(id, dto.role as never);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Xóa người dùng',
    description: 'Chỉ ADMIN có quyền xóa người dùng',
  })
  @ApiParam({ name: 'id', type: 'string', format: 'uuid' })
  @ApiOkResponse({ description: 'Người dùng đã được xóa' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy người dùng' })
  @ApiUnauthorizedResponse({ description: 'Chưa đăng nhập' })
  @ApiForbiddenResponse({ description: 'Không có quyền (yêu cầu ADMIN)' })
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}

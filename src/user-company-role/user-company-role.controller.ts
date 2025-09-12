import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserCompanyRoleService } from './user-company-role.service';
import { CreateUserCompanyRoleDto } from './dto/create-user-company-role.dto';
import { UpdateUserCompanyRoleDto } from './dto/update-user-company-role.dto';

@Controller('user-company-role')
export class UserCompanyRoleController {
  constructor(private readonly userCompanyRoleService: UserCompanyRoleService) {}

  @Post()
  create(@Body() createUserCompanyRoleDto: CreateUserCompanyRoleDto) {
    return this.userCompanyRoleService.create(createUserCompanyRoleDto);
  }

  @Get()
  findAll() {
    return this.userCompanyRoleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userCompanyRoleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserCompanyRoleDto: UpdateUserCompanyRoleDto) {
    return this.userCompanyRoleService.update(+id, updateUserCompanyRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userCompanyRoleService.remove(+id);
  }
}

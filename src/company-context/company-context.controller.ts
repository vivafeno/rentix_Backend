// src/company-context/company-context.controller.ts
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { CompanyContextService } from './company-context.service';
import { SelectCompanyDto } from './dto/select-company.dto';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AppRole } from 'src/auth/enums/user-global-role.enum';
import { Roles } from 'src/auth/decorators/roles.decorator';

@ApiTags('context')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(AppRole.SUPERADMIN, AppRole.ADMIN, AppRole.USER)
@Controller('context')
export class CompanyContextController {
  constructor(private readonly companyContextService: CompanyContextService) {}

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Nuevo accessToken con empresa seleccionada' })
 @Post('select-company')
@UseGuards(JwtAuthGuard)
async selectCompany(
  @GetUser('id') userId: string, // 👈 Cambiado de 'sub' a 'id'
  @Body() dto: SelectCompanyDto,
) {
  return this.companyContextService.selectCompany(userId, dto);
}
}

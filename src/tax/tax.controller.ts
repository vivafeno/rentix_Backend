import { Controller, Get, Post, Body, Param, Delete, ParseUUIDPipe, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TaxService } from './tax.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { Tax } from './entities/tax.entity';
import { Auth } from './../auth/decorators/auth.decorator';
import { GetUser } from './../auth/decorators/get-user.decorator';
import { AppRole } from './../auth/enums/user-global-role.enum';

@ApiTags('Taxes')
@ApiBearerAuth()
@Controller('tax')
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Post()
  @Auth(AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Crear un nuevo impuesto' })
  @ApiResponse({ status: 201, type: Tax })
  create(@Body() createTaxDto: CreateTaxDto, @GetUser() user: any) {
    if (!user.companyId) throw new BadRequestException('Contexto de empresa requerido');
    return this.taxService.create(user.companyId, createTaxDto);
  }

  @Get()
  @Auth(AppRole.ADMIN, AppRole.USER)
  @ApiOperation({ summary: 'Listar impuestos de la empresa' })
  @ApiResponse({ status: 200, type: [Tax] })
  findAll(@GetUser() user: any) {
    if (!user.companyId) throw new BadRequestException('Contexto de empresa requerido');
    return this.taxService.findAll(user.companyId);
  }

  @Delete(':id')
  @Auth(AppRole.ADMIN)
  @ApiOperation({ summary: 'Borrado lógico de impuesto' })
  @ApiResponse({ status: 200, type: Tax })
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: any) {
    return this.taxService.remove(id, user.companyId);
  }
}
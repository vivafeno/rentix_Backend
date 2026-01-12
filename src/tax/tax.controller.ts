import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TaxService } from './tax.service';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { Tax } from './entities/tax.entity';

@ApiTags('Taxes') // Agrupa en Swagger
@Controller('tax')
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo impuesto' })
  @ApiResponse({ status: 201, type: Tax })
  create(@Body() createTaxDto: CreateTaxDto) {
    return this.taxService.create(createTaxDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los impuestos activos' })
  @ApiResponse({ status: 200, type: [Tax] })
  findAll() {
    return this.taxService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un impuesto por ID' })
  @ApiResponse({ status: 200, type: Tax })
  findOne(@Param('id') id: string) {
    return this.taxService.findOne(id);
  }
}
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseUUIDPipe, 
  Query
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { Contract } from './entities/contract.entity';

@ApiTags('Contracts') // Agrupa los endpoints en Swagger bajo "Contracts"
@Controller('contracts')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo contrato de alquiler' })
  @ApiResponse({ status: 201, description: 'Contrato creado exitosamente.', type: Contract })
  @ApiResponse({ status: 400, description: 'Datos inválidos o violación de propiedad (triángulo de seguridad).' })
  create(@Body() createContractDto: CreateContractDto) {
    return this.contractService.create(createContractDto);
  }

  @Get('by-company/:companyId')
  @ApiOperation({ summary: 'Listar todos los contratos de una empresa' })
  @ApiParam({ name: 'companyId', description: 'UUID de la empresa' })
  findAll(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return this.contractService.findAll(companyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener el detalle de un contrato específico' })
  @ApiResponse({ status: 200, description: 'Detalle del contrato encontrado.', type: Contract })
  @ApiResponse({ status: 404, description: 'Contrato no encontrado.' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.contractService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar (Soft Delete) un contrato' })
  @ApiResponse({ status: 200, description: 'Contrato marcado como eliminado.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.contractService.remove(id);
  }
}
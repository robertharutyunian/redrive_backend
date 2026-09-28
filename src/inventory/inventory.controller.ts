import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiOkResponsePaginated } from '../common/decorators/api-paginated-response.decorator.js';
import { InventoryService } from './inventory.service.js';
import { InventoryQueryDto } from './dto/inventory-query.dto.js';
import { InventoryResponseDto } from './dto/inventory-response.dto.js';

@ApiTags('Inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'List inventory records' })
  @ApiOkResponsePaginated(InventoryResponseDto)
  findAll(@Query() query: InventoryQueryDto) {
    return this.inventoryService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an inventory record by id' })
  @ApiOkResponse({ type: InventoryResponseDto })
  @ApiNotFoundResponse({ description: 'Inventory record not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inventoryService.findOne(id);
  }
}

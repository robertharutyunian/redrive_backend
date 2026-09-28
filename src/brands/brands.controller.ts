import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiOkResponsePaginated } from '../common/decorators/api-paginated-response.decorator.js';
import { BrandsService } from './brands.service.js';
import { BrandQueryDto } from './dto/brand-query.dto.js';
import { BrandResponseDto } from './dto/brand-response.dto.js';

@ApiTags('Brands')
@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @ApiOperation({ summary: 'List brands' })
  @ApiOkResponsePaginated(BrandResponseDto)
  findAll(@Query() query: BrandQueryDto) {
    return this.brandsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a brand by id' })
  @ApiOkResponse({ type: BrandResponseDto })
  @ApiNotFoundResponse({ description: 'Brand not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.brandsService.findOne(id);
  }
}

import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiOkResponsePaginated } from '../common/decorators/api-paginated-response.decorator.js';
import { TiresService } from './tires.service.js';
import { TireQueryDto } from './dto/tire-query.dto.js';
import { TireResponseDto } from './dto/tire-response.dto.js';

@ApiTags('Tires')
@Controller('tires')
export class TiresController {
  constructor(private readonly tiresService: TiresService) {}

  @Get()
  @ApiOperation({ summary: 'List tires' })
  @ApiOkResponsePaginated(TireResponseDto)
  findAll(@Query() query: TireQueryDto) {
    return this.tiresService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a tire by id' })
  @ApiOkResponse({ type: TireResponseDto })
  @ApiNotFoundResponse({ description: 'Tire not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tiresService.findOne(id);
  }
}

import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiOkResponsePaginated } from '../common/decorators/api-paginated-response.decorator.js';
import { RefundService } from './refund.service.js';
import { RefundQueryDto } from './dto/refund-query.dto.js';
import { RefundResponseDto } from './dto/refund-response.dto.js';

@ApiTags('Refund')
@Controller('refund')
export class RefundController {
  constructor(private readonly refundService: RefundService) {}

  @Get()
  @ApiOperation({ summary: 'List refunds' })
  @ApiOkResponsePaginated(RefundResponseDto)
  findAll(@Query() query: RefundQueryDto) {
    return this.refundService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a refund by id' })
  @ApiOkResponse({ type: RefundResponseDto })
  @ApiNotFoundResponse({ description: 'Refund not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.refundService.findOne(id);
  }
}

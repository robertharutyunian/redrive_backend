import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiOkResponsePaginated } from '../common/decorators/api-paginated-response.decorator.js';
import { PaymentService } from './payment.service.js';
import { PaymentQueryDto } from './dto/payment-query.dto.js';
import { PaymentResponseDto } from './dto/payment-response.dto.js';

@ApiTags('Payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  @ApiOperation({ summary: 'List payments' })
  @ApiOkResponsePaginated(PaymentResponseDto)
  findAll(@Query() query: PaymentQueryDto) {
    return this.paymentService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a payment by id' })
  @ApiOkResponse({ type: PaymentResponseDto })
  @ApiNotFoundResponse({ description: 'Payment not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.paymentService.findOne(id);
  }
}

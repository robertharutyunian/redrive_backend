import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ApiOkResponsePaginated } from '../common/decorators/api-paginated-response.decorator.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard.js';
import { OptionalCurrentUser } from '../auth/decorators/optional-current-user.decorator.js';
import { OrdersService } from './orders.service.js';
import { OrderQueryDto } from './dto/order-query.dto.js';
import { OrderResponseDto } from './dto/order-response.dto.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "List the current user's orders" })
  @ApiOkResponsePaginated(OrderResponseDto)
  @ApiUnauthorizedResponse({ description: 'Missing, invalid or expired token' })
  findAll(@Query() query: OrderQueryDto, @CurrentUser() user: { sub: number }) {
    return this.ordersService.findAll(query, user.sub);
  }

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Place an order (guest or signed-in)' })
  @ApiCreatedResponse({ type: OrderResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or expired token' })
  @ApiBadRequestResponse({
    description: 'Insufficient stock, unknown tire, or missing guest contact details',
  })
  create(
    @Body() dto: CreateOrderDto,
    @OptionalCurrentUser() user?: { sub: number },
  ) {
    return this.ordersService.create(dto, user?.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get one of the current user's orders by id" })
  @ApiOkResponse({ type: OrderResponseDto })
  @ApiUnauthorizedResponse({ description: 'Missing, invalid or expired token' })
  @ApiNotFoundResponse({ description: 'Order not found, or not owned by the current user' })
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: { sub: number }) {
    return this.ordersService.findOne(id, user.sub);
  }
}

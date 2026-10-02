import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { EmptyToUndefined } from '../../common/decorators/empty-to-undefined.decorator.js';
import {
  ArrayNotEmpty,
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import {
  USER_EMAIL_MAX_LENGTH,
  USER_PHONE_MAX_LENGTH,
  USER_PHONE_PATTERN,
  USER_PHONE_PATTERN_MESSAGE,
} from '../../users/constants/users.constants.js';
import { ORDER_ITEM_QUANTITY_MIN } from '../../order-items/constants/order-item.constants.js';
import { PaymentMethod } from '../../payment/enums/payment-method.enum.js';
import { DeliveryMethod } from '../enums/delivery-method.enum.js';
import {
  ORDER_CONTACT_NAME_MAX_LENGTH,
  ORDER_DELIVERY_ADDRESS_MAX_LENGTH,
  ORDER_DELIVERY_INSTRUCTIONS_MAX_LENGTH,
} from '../constants/orders.constants.js';

export class CreateOrderItemDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  tireId: number;

  @ApiProperty()
  @IsInt()
  @Min(ORDER_ITEM_QUANTITY_MIN)
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ type: () => [CreateOrderItemDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @ApiProperty({ enum: DeliveryMethod })
  @IsEnum(DeliveryMethod)
  deliveryMethod: DeliveryMethod;

  // Only meaningful for courier delivery; pickup orders have no address to validate.
  @ApiProperty({ required: false, description: 'Required when deliveryMethod is courier' })
  @ValidateIf((dto: CreateOrderDto) => dto.deliveryMethod === DeliveryMethod.COURIER)
  @IsNotEmpty()
  @IsString()
  @MaxLength(ORDER_DELIVERY_ADDRESS_MAX_LENGTH)
  deliveryAddress?: string;

  @ApiProperty({ required: false })
  @EmptyToUndefined()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(ORDER_DELIVERY_INSTRUCTIONS_MAX_LENGTH)
  deliveryInstructions?: string;

  @ApiProperty({ enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  // Contact fields are required for guest checkout and ignored for logged-in
  // checkout, where they are copied from the authenticated user's profile.
  // The conditional requirement is enforced in OrdersService.create, which is
  // the only place that knows whether the request carried a valid token.
  @ApiProperty({ required: false, description: 'Required for guest checkout' })
  @EmptyToUndefined()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(ORDER_CONTACT_NAME_MAX_LENGTH)
  contactName?: string;

  @ApiProperty({ required: false, description: 'Required for guest checkout' })
  @EmptyToUndefined()
  @IsOptional()
  @IsEmail()
  @MaxLength(USER_EMAIL_MAX_LENGTH)
  contactEmail?: string;

  @ApiProperty({ required: false, description: 'Required for guest checkout' })
  @EmptyToUndefined()
  @IsOptional()
  @Matches(USER_PHONE_PATTERN, { message: USER_PHONE_PATTERN_MESSAGE })
  @MaxLength(USER_PHONE_MAX_LENGTH)
  contactPhone?: string;
}

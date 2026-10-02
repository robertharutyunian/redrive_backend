import { ApiProperty } from '@nestjs/swagger';
import { Email } from '../entities/email.entity.js';
import { EmailType } from '../enums/email-type.enum.js';

export class EmailResponseDto {
  @ApiProperty() id: number;
  @ApiProperty({ nullable: true }) userId: number | null;
  @ApiProperty() recipientEmail: string;
  @ApiProperty({ nullable: true }) orderId: number | null;
  @ApiProperty({ enum: EmailType }) type: EmailType;
  @ApiProperty({ nullable: true }) sentAt: Date | null;
  @ApiProperty({ nullable: true }) invoiceUrl: string | null;
  @ApiProperty() createdAt: Date;
}

export function toEmailResponse(email: Email): EmailResponseDto {
  return {
    id: email.id,
    userId: email.user ? email.user.id : null,
    recipientEmail: email.recipientEmail,
    orderId: email.order ? email.order.id : null,
    type: email.type,
    sentAt: email.sentAt,
    invoiceUrl: email.invoiceUrl,
    createdAt: email.createdAt,
  };
}

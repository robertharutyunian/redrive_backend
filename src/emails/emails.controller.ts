import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiOkResponsePaginated } from '../common/decorators/api-paginated-response.decorator.js';
import { EmailsService } from './emails.service.js';
import { EmailQueryDto } from './dto/email-query.dto.js';
import { EmailResponseDto } from './dto/email-response.dto.js';

@ApiTags('Emails')
@Controller('emails')
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  @Get()
  @ApiOperation({ summary: 'List emails' })
  @ApiOkResponsePaginated(EmailResponseDto)
  findAll(@Query() query: EmailQueryDto) {
    return this.emailsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an email by id' })
  @ApiOkResponse({ type: EmailResponseDto })
  @ApiNotFoundResponse({ description: 'Email not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.emailsService.findOne(id);
  }
}

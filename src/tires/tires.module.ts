import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tire } from './entities/tire.entity.js';
import { TiresController } from './tires.controller.js';
import { TiresService } from './tires.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Tire])],
  controllers: [TiresController],
  providers: [TiresService],
})
export class TiresModule {}

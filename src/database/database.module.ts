import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from '../brands/brand.entity.js';
import { Tire } from '../tires/tire.entity.js';
import { Inventory } from '../inventory/inventory.entity.js';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.getOrThrow<string>('DATABASE_URL'),
        entities: [Brand, Tire, Inventory],
        migrations: [],
        synchronize: false,
      }),
    }),
  ],
})
export class DatabaseModule {}

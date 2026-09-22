import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Brand } from '../brands/brand.entity.js';
import { Tire } from '../tires/tire.entity.js';
import { Inventory } from '../inventory/inventory.entity.js';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Brand, Tire, Inventory],
  migrations: ['dist/database/migrations/*.js'],
});

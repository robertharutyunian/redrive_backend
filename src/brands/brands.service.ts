import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { paginate } from '../common/dto/paginated-response.dto.js';
import type { PaginatedResponseDto } from '../common/dto/paginated-response.dto.js';
import { Brand } from './entities/brand.entity.js';
import { BrandQueryDto } from './dto/brand-query.dto.js';
import { toBrandResponse } from './dto/brand-response.dto.js';
import type { BrandResponseDto } from './dto/brand-response.dto.js';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandsRepository: Repository<Brand>,
  ) {}

  async findAll(
    query: BrandQueryDto,
  ): Promise<PaginatedResponseDto<BrandResponseDto>> {
    const { page, limit, name } = query;

    const [brands, total] = await this.brandsRepository.findAndCount({
      where: name ? { name: ILike(`%${name}%`) } : {},
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginate(brands.map(toBrandResponse), total, page, limit);
  }

  async findOne(id: number): Promise<BrandResponseDto> {
    const brand = await this.brandsRepository.findOne({ where: { id } });

    if (!brand) {
      throw new NotFoundException(`Brand ${id} not found`);
    }

    return toBrandResponse(brand);
  }
}

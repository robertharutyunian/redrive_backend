import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import type { EntityManager } from 'typeorm';
import { paginate } from '../common/dto/paginated-response.dto.js';
import type { PaginatedResponseDto } from '../common/dto/paginated-response.dto.js';
import { User } from '../users/entities/user.entity.js';
import { Inventory } from '../inventory/entities/inventory.entity.js';
import { OrderItem } from '../order-items/entities/order-item.entity.js';
import { Payment } from '../payment/entities/payment.entity.js';
import { PaymentStatus } from '../payment/enums/payment-status.enum.js';
import { Email } from '../emails/entities/email.entity.js';
import { EmailType } from '../emails/enums/email-type.enum.js';
import { Order } from './entities/order.entity.js';
import { OrderStatus } from './enums/order-status.enum.js';
import { DeliveryMethod } from './enums/delivery-method.enum.js';
import { OrderQueryDto } from './dto/order-query.dto.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { toOrderResponse } from './dto/order-response.dto.js';
import type { OrderResponseDto } from './dto/order-response.dto.js';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(
    query: OrderQueryDto,
    currentUserId: number,
  ): Promise<PaginatedResponseDto<OrderResponseDto>> {
    const { page, limit, status } = query;

    const qb = this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'user')
      .andWhere('user.id = :currentUserId', { currentUserId });

    if (status !== undefined) {
      qb.andWhere('order.status = :status', { status });
    }

    qb.orderBy('order.id', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [page1, total] = await qb.getManyAndCount();
    const orders = await this.loadWithItems(page1.map((order) => order.id));

    return paginate(orders.map(toOrderResponse), total, page, limit);
  }

  async findOne(id: number, currentUserId: number): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: { user: true, orderItems: { tire: { brand: true, inventory: true } } },
    });

    if (!order || order.user?.id !== currentUserId) {
      throw new NotFoundException(`Order ${id} not found`);
    }

    return toOrderResponse(order);
  }

  // Loading orderItems via the paginated query builder above would break pagination
  // (a one-to-many join multiplies rows before skip/take applies), so the item tree is
  // loaded in a second query, keyed by id, and reordered to match the paginated page.
  private async loadWithItems(ids: number[]): Promise<Order[]> {
    if (ids.length === 0) return [];

    const orders = await this.ordersRepository.find({
      where: { id: In(ids) },
      relations: { user: true, orderItems: { tire: { brand: true, inventory: true } } },
    });

    const byId = new Map(orders.map((order) => [order.id, order]));
    return ids.map((id) => byId.get(id)!);
  }

  async create(dto: CreateOrderDto, userId?: number): Promise<OrderResponseDto> {
    const tireIds = dto.items.map((item) => item.tireId);
    if (new Set(tireIds).size !== tireIds.length) {
      throw new BadRequestException('Duplicate tireId in items');
    }

    const order = await this.dataSource.transaction(async (manager) => {
      const user = userId !== undefined ? await this.loadUser(manager, userId) : null;
      const contact = this.resolveContact(dto, user);

      // Lock in ascending tireId order so two concurrent checkouts sharing tires
      // always acquire row locks in the same order, ruling out a lock-ordering deadlock.
      const sortedItems = [...dto.items].sort((a, b) => a.tireId - b.tireId);

      const orderItemsData: {
        tireId: number;
        quantity: number;
        unitPrice: number;
      }[] = [];
      let totalPrice = 0;

      for (const item of sortedItems) {
        const inventory = await manager
          .createQueryBuilder(Inventory, 'inventory')
          .setLock('pessimistic_write')
          .where('inventory.tire_id = :tireId', { tireId: item.tireId })
          .getOne();

        if (!inventory) {
          throw new BadRequestException(`Tire ${item.tireId} has no inventory record`);
        }
        if (inventory.quantity < item.quantity) {
          throw new BadRequestException(
            `Tire ${item.tireId} only has ${inventory.quantity} in stock, requested ${item.quantity}`,
          );
        }

        const unitPrice = Number(inventory.unitPrice);
        orderItemsData.push({ tireId: item.tireId, quantity: item.quantity, unitPrice });
        totalPrice += unitPrice * item.quantity;

        inventory.quantity -= item.quantity;
        await manager.save(Inventory, inventory);
      }

      const savedOrder = await manager.save(
        Order,
        manager.create(Order, {
          user,
          contactName: contact.contactName,
          contactEmail: contact.contactEmail,
          contactPhone: contact.contactPhone,
          deliveryMethod: dto.deliveryMethod,
          deliveryAddress:
            dto.deliveryMethod === DeliveryMethod.COURIER ? dto.deliveryAddress! : null,
          deliveryInstructions: dto.deliveryInstructions ?? null,
          status: OrderStatus.PENDING,
          totalPrice: totalPrice.toFixed(2),
        }),
      );

      await manager.save(
        OrderItem,
        orderItemsData.map((item) =>
          manager.create(OrderItem, {
            order: savedOrder,
            tire: { id: item.tireId },
            quantity: item.quantity,
            unitPrice: item.unitPrice.toFixed(2),
            totalPrice: (item.unitPrice * item.quantity).toFixed(2),
          }),
        ),
      );

      await manager.save(
        Payment,
        manager.create(Payment, {
          order: savedOrder,
          amount: totalPrice.toFixed(2),
          method: dto.paymentMethod,
          status: PaymentStatus.PENDING,
          gateway: null,
          gatewayReference: null,
        }),
      );

      await manager.save(
        Email,
        manager.create(Email, {
          user,
          order: savedOrder,
          recipientEmail: contact.contactEmail,
          type: EmailType.ORDER_CONFIRMATION,
          sentAt: new Date(),
          invoiceUrl: null,
        }),
      );

      // Stand-in for real email dispatch, same as AuthService.forgotPassword.
      console.log(`Order confirmation for order ${savedOrder.id} sent to ${contact.contactEmail}`);

      return savedOrder;
    });

    return toOrderResponse(order);
  }

  private async loadUser(manager: EntityManager, userId: number): Promise<User> {
    const user = await manager.findOne(User, { where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User for authenticated request not found');
    }
    return user;
  }

  private resolveContact(
    dto: CreateOrderDto,
    user: User | null,
  ): { contactName: string; contactEmail: string; contactPhone: string } {
    if (user) {
      return {
        contactName: `${user.fname} ${user.lname}`,
        contactEmail: user.email,
        contactPhone: user.phone,
      };
    }

    if (!dto.contactName || !dto.contactEmail || !dto.contactPhone) {
      throw new BadRequestException(
        'contactName, contactEmail and contactPhone are required for guest checkout',
      );
    }

    return {
      contactName: dto.contactName,
      contactEmail: dto.contactEmail,
      contactPhone: dto.contactPhone,
    };
  }
}

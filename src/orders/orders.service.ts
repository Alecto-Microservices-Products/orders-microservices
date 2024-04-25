import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { PrismaClient } from '@prisma/client';
import { RpcException } from '@nestjs/microservices';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { ChangeOrderStatusDtp } from './dto';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('OrderService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Base de datos conectada');
  }

  create(createOrderDto: CreateOrderDto) {
    return this.order.create({
      data: createOrderDto,
    });
  }

  async findAll(orderPaginationDto: OrderPaginationDto) {
    const totalPages = await this.order.count({
      //Cuenta el numero total de ordenes
      where: {
        status: orderPaginationDto.status, //Cuando el estado cumpla
      },
    });

    const currenPage = orderPaginationDto.page; //Page por defecto es 1
    const perPage = orderPaginationDto.limit; //Limite por defecto es 10

    // Si currentPage = 3 y perPage = 4, entonces cada página mostrará 4 elementos.

    // skip: (currentPage - 1) * perPage: En este caso, (3 - 1) * 4 = 8. Esto significa que se
    // omitirán los primeros 8 registros de la consulta, ya que estamos en la tercera página y
    // queremos comenzar desde el noveno elemento.
    // take: perPage: Tomaremos 4 registros de la base de datos, ya que perPage es 4.
    // where: { status: orderPaginationDto.status }: Se filtran los registros según el estado
    // de la orden proporcionado en orderPaginationDto.status.

    return {
      data: await this.order.findMany({
        skip: (currenPage - 1) * perPage,
        take: perPage,
        where: {
          status: orderPaginationDto.status,
        },
      }),
      meta: {
        total: totalPages,
        page: currenPage,
        lastPage: Math.ceil(totalPages / perPage),
      },
    };
  }

  async findOne(id: string) {
    const order = await this.order.findFirst({
      where: { id },
    });

    if (!order) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: `Order with id ${id} not found`,
      });
    }

    return order;
  }


  async changeStatus(changeOrderStatusDto:ChangeOrderStatusDtp){
    const {id, status} = changeOrderStatusDto;

    const order = await this.findOne(id);

    if (order.status === status) {
      return order;
    }

    return this.order.update({
      where: {id},
      data: {
        status: status
      }
    });
  }
}

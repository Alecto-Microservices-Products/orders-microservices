import { OrderStatus } from "@prisma/client";
import { IsEnum, IsUUID } from "class-validator";
import { OrderStatusList } from "../enum/order.enum";


export class ChangeOrderStatusDtp{


    @IsUUID(4)
    id:string;


    @IsEnum(OrderStatusList, {
        message: `Los estados validos son ${OrderStatusList}`
    })
    status: OrderStatus;
}
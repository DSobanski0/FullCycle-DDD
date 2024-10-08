import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {

    async create(entity: Order): Promise<void> {
        await OrderModel.create({
            id: entity.id,
            customer_id: entity.customerId,
            total: entity.total(),
            items: entity.items.map((item) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                product_id: item.productId,
                quantity: item.quantity
            }))
        },
            {
                include: [{ model: OrderItemModel }]
            }
        );
    }

    async update(entity: Order): Promise<void> {
        const itemsOnOrder = entity.items.map((item) => ({
            id: item.id,
            product_id: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
        }));

        const itemsOnDB = await OrderItemModel.findAll({ where: { order_id: entity.id } });
        for (const itemOnOrder of itemsOnOrder) {
            const itemExistsOnDB = itemsOnDB.find((itemOnDB) => itemOnDB.id === itemOnOrder.id);

            if (!itemExistsOnDB) {
                await OrderItemModel.create({ ...itemOnOrder, order_id: entity.id });
            }
        }

        for (const itemOnDB of itemsOnDB) {
            const itemExistsOnUpdatedItems = itemsOnOrder.find((itemOnOrder) => itemOnOrder.id === itemOnDB.id);

            if (!itemExistsOnUpdatedItems) {
                await OrderItemModel.destroy({ where: { id: itemOnDB.id } });
            }
        }

        await OrderModel.update({ total: entity.total() }, { where: { id: entity.id } });
    }

    async find(id: string): Promise<Order> {
        let orderModel;
        try {
            orderModel = await OrderModel.findOne({
                where: {
                    id
                },
                include: [{ model: OrderItemModel }],
                rejectOnEmpty: true
            });
        } catch (error) {
            throw new Error("Order not found");
        }

        const items = orderModel.items.map((item) =>
            new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity));
        const order = new Order(orderModel.id, orderModel.customer_id, items);

        return order;
    }

    async findAll(): Promise<Order[]> {
        const ordersModel = await OrderModel.findAll({ include: [{ model: OrderItemModel }] });

        const orders = ordersModel.map((orderModel) => {
            const items = orderModel.items.map((item) =>
                new OrderItem(item.id, item.name, item.price, item.product_id, item.quantity));
            const order = new Order(orderModel.id, orderModel.customer_id, items);

            return order;
        });
        return orders;
    }
}
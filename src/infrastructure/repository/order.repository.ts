import Order from "../../domain/entity/order";
import OrderItem from "../../domain/entity/order_item";
import OrderRepositoryInterface from "../../domain/repository/order-repository.interface";
import OrderItemModel from "../db/sequelize/model/order-item.model";
import OrderModel from "../db/sequelize/model/order.model";

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
        const updatedItems = entity.items.map((item) => ({
            id: item.id,
            product_id: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
        }));

        const itemsOnDB = await OrderItemModel.findAll({ where: { order_id: entity.id } });
        for (const updatedItem of updatedItems) {
            const itemExistsOnDB = itemsOnDB.find((itemOnDB) => itemOnDB.id === updatedItem.id);

            if (!itemExistsOnDB) {
                await OrderItemModel.create({ ...updatedItem, order_id: entity.id });
            }
        }

        for (const itemOnDB of itemsOnDB) {
            const itemExistsOnUpdatedItems = updatedItems.find((updatedItem) => updatedItem.id === itemOnDB.id);

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
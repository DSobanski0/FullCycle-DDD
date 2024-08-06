import Address from "./address";
import Customer from "./customer";

describe("Customer unit tests", () => {

    it("should throw error when id is empty", () => {
        expect(() => {
            let customer = new Customer("", "Daniel Sobanski");
        }).toThrowError("Id is required");
    })

    it("should throw error when name is empty", () => {
        expect(() => {
            let customer = new Customer("123", "");
        }).toThrowError("Name is required");
    })

    it("should change name", () => {
        //Arrange
        const customer = new Customer("123", "Daniel");
        //Act
        customer.changeName("John");
        //Assert
        expect(customer.name).toBe("John");
    })

    it("should activate customer", () => {
        const customer = new Customer("123", "Daniel");
        const address = new Address("Street 1", 123, "13330-250", "São Paulo");
        customer.address = address;
        customer.activate();
        expect(customer.isActive()).toBe(true);
    })

    it("should throw error when address is undefined when you activate a customer", () => {
        expect(() => {
            let customer = new Customer("123", "Daniel");
            customer.activate();
        }).toThrowError("Address is mandatory to activate a customer");
    })

    it("should deactivate customer", () => {
        const customer = new Customer("123", "Daniel");
        customer.deactivate();
        expect(customer.isActive()).toBe(false);
    })

    it("should add reward points", () => {
        const customer = new Customer("123", "Daniel");
        expect(customer.rewardPoints).toBe(0);
        customer.addRewardPoints(10);
        expect(customer.rewardPoints).toBe(10);
        customer.addRewardPoints(20);
        expect(customer.rewardPoints).toBe(20);
    })
});
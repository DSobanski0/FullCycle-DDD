import EventDispatcher from "../../@shared/event/event-dispatcher";
import CustomerChangeAddressEvent from "./customer-change-address.event";
import SendConsoleLogHandler from "./handler/send-console-log.handler";

describe("Domain events tests", () => {

    it("should notify all events when create customer", () => {
        const eventDispatcher = new EventDispatcher();
        const eventHandler = new SendConsoleLogHandler();
        const spyEventHandler = jest.spyOn(eventHandler, "handle");

        eventDispatcher.register("CustomerChangeAddressEvent", eventHandler);

        expect(eventDispatcher.getEventHandlers["CustomerChangeAddressEvent"][0]).toMatchObject(eventHandler);
        expect(eventDispatcher.getEventHandlers["CustomerChangeAddressEvent"].length).toBe(1);

        const customerChangeAddressEvent = new CustomerChangeAddressEvent({
            id: "1",
            name: "Daniel Sobanski",
            address: "Rua 1, cidade 1"
        });

        // Quando o notify for executado o EnviaConsoleLogHandler.handle() deve ser chamado
        eventDispatcher.notify(customerChangeAddressEvent);
        expect(spyEventHandler).toHaveBeenCalled();
    });
});
import EventHandlerInterface from "./event-handler.interface";
import EventInterface from "./event.interface";

export default interface EventDispatcherInterface {

    notify(event: EventInterface): void;
    register(eventName: String, eventHandler: EventHandlerInterface): void;
    unregister(eventName: String, eventHandler: EventHandlerInterface): void;
    unregisterAll(): void;
}
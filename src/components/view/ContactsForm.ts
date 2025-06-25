import { Form } from "./Form";
import { TOrderForm } from "../../types";
import { EventEmitter, IEvents } from "../base/events";

export class ContactsForm extends Form<TOrderForm> {
    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);
    }

    set phone(value: string) {
        (this.container.elements.namedItem('phone') as HTMLInputElement).value = value;
    }

    set email(value: string) {
        (this.container.elements.namedItem('email') as HTMLInputElement).value = value;
    }

}
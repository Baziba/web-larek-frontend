import { Form } from "./Form";
import { TOrderForm, PayMethod } from "../../types";
import { EventEmitter, IEvents } from "../base/events";
import { ensureElement } from "../../utils/utils";

export class OrderForm extends Form<TOrderForm> {
    private _typeCash: HTMLButtonElement;
    private _typeCard: HTMLButtonElement;

    constructor(container: HTMLFormElement, events: IEvents) {
        super(container, events);

        this._typeCash = ensureElement<HTMLButtonElement>('button[name="cash"]', this.container);
        this._typeCard = ensureElement<HTMLButtonElement>('button[name="card"]', this.container);

        this._typeCash.addEventListener('click', () => {
            this.onInputChange('payment', 'cash');
            this.payment = 'offline';
        });

        this._typeCard.addEventListener('click', () => {
            this.onInputChange('payment', 'card');
            this.payment = 'online';
        });
    }

    set address(value: string) {
        (this.container.elements.namedItem('address') as HTMLInputElement).value = value;
    }

    set payment(value: PayMethod) {
        this.toggleClass(this._typeCard, 'button_alt-active', value === 'online');
        this.toggleClass(this._typeCash, 'button_alt-active', value === 'offline');
    }

}
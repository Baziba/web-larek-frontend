import { Component } from '../base/Component';
import { createElement, ensureElement, formatNumber } from '../../utils/utils';
import { IEvents } from '../base/events';

interface TBasketView {
	items: HTMLElement[];
	total: number;
	button: string[];
	locked: boolean;
}

export class Basket extends Component<TBasketView> {
	protected _items: HTMLElement;
	protected _total: HTMLElement;
	protected _button: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this._items = ensureElement<HTMLElement>('.basket__list', this.container);
		this._total = ensureElement<HTMLElement>('.basket__price', this.container);
		this._button = ensureElement<HTMLElement>('.basket__button', this.container)

		if (this._button) {
			this._button.addEventListener('click', () => {
				events.emit('order:open');
			});
		}

		this.total = 0;
		this.items = [];

	}

	set items(items: HTMLElement[]) {
		if (items.length) {
			this._items.replaceChildren(...items);
		} else {
			this._items.replaceChildren(
				createElement<HTMLParagraphElement>('p', {
					textContent: 'Корзина пуста',
				})
			);
		}
	}

	set total(total: number) {
		this.setText(this._total, formatNumber(total) + ' синапсов');
	}

	set toggleButton(value: boolean) {
		this.setDisabled(this._button, value);
	}

}

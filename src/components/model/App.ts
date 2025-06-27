import { Model } from '../base/Model';
import { FormErrors, TBasket, TContactsForm, TOrder, TOrderForm, TProduct, PayMethod } from '../../types';
import { CatalogItem } from './CatalogItem';

/**
 * Модель приложения
 */
export interface IAppModel {
	items: CatalogItem[];	// Список товаров полученный с сервера
	basket: TBasket;		// Корзина товаров
	preview: string | null;	// Выбранный товар
	order: TOrder | null;	// Содержимое заказа
	formErrors: FormErrors;	// Ошибки валидации форм
}

export class App extends Model<IAppModel> implements IAppModel {
	items: CatalogItem[];
	basket: TBasket = {
		items: [],
		total: 0,
	};
	preview: string | null;
	order: TOrder = {
		phone: null,
		email: null,
		payment: null,
		address: null,
		total: 0,
		items: [],
	};
	formErrors: FormErrors = {};

	setCatalog(products: TProduct[]) {
		this.items = products.map((product) => new CatalogItem(product, this.events));
		this.emitChanges('catalog:update', { catalog: this.items });
	}

	setPreview(item: CatalogItem) {
		this.preview = item.id;
		this.emitChanges('preview:change', item);
	}

	addToBasket(item: CatalogItem) {
		if (!this.basket.items.includes(item.id)) {
			this.basket.items.push(item.id)
		};
		this.emitChanges('preview:change', item);
		this.emitChanges('basket:change', item);
	}

	removeFromBasket(item: CatalogItem) {
		this.basket.items = this.basket.items.filter(i => i !== item.id);
		this.emitChanges('basket:change', item);
	}

	removeFromCard(item: CatalogItem) {
		this.basket.items = this.basket.items.filter(i => i !== item.id);
		this.emitChanges('preview:change', item);
		this.emitChanges('basket:change', item);
	}

	setOrderField(field: keyof TOrderForm, value: string) {
		if (field === 'payment') {
			this.setOrderPayment(value);
		} else {
			this.order[field] = value;
		}

		if (this.validateOrder()) {
			this.emitChanges('contact:open', this.order);
		}
	}

	setContactsField(field: keyof TContactsForm, value: string) {
		this.order[field] = value;

		if (this.validateContacts()) {
			this.emitChanges('order:ready', this.order);
		}

		if (this.validateContacts()) {
			this.setOrderData();
		}
	}

	/**
	 * Перенос товаров и их столимости в заказ
	 */
	setOrderData() {
		this.order.total = this.basket.total;
		this.order.items = this.basket.items;
	}

	/**
	 * Установка типа оплаты в заказе
	 * @param {string} method
	 */
	setOrderPayment(method: string) {
		const payMethod = new Map([
			['card', 'online'],
			['cash', 'offline'],
		]);
		this.order.payment = payMethod.get(method) as PayMethod;
	}

	validateOrder() {
		const errors: typeof this.formErrors = {};
		if (!this.order.payment) {
			errors.payment = 'Необходимо выбрать тип';
		}
		if (!this.order.address) {
			errors.address = 'Необходимо указать адрес';
		}
		this.formErrors = errors;
		this.emitChanges('order:validate', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	validateContacts() {
		const errors: typeof this.formErrors = {};
		if (!this.order.email) {
			errors.email = 'Необходимо указать email';
		}
		if (!this.order.phone) {
			errors.phone = 'Необходимо указать телефон';
		}
		this.formErrors = errors;
		this.emitChanges('contacts:validate', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	clearBasket() {
		this.basket.items = [];
		this.basket.total = 0;
		this.events.emit('basket:change', this.basket);
	}

}
export { CatalogItem };


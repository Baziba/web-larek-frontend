/**
 * Карточка товара получаема с сервера
 */
export interface IProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}

/**
 * Строгий тип оплаты
 */
export type PayMethod = 'online' | 'offline';

/**
 * Данные формы контактов
 */
export interface IContactsForm {
	email?: string;
	phone?: string;
}

/**
 * Данные формы с адресом и типом оплаты
 */
export interface IOrderForm {
	address?: string;
	payment?: PayMethod;
}

/**
 * Данные для отправки заказа на сервер
 */
export interface IOrder extends IOrderForm, IContactsForm {
	items?: string[]
	total?: number;
}

/**
 * Перечень ошибок форм
 */
export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IOrderResult {
	id: string;
	total: number;
}

export interface IBasket {
	items: string[];
	total?: number;
}
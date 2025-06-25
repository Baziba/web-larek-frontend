/**
 * Карточка товара получаема с сервера
 */
export type TProduct = {
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
export type TContactsForm = {
	email?: string;
	phone?: string;
}

/**
 * Данные формы с адресом и типом оплаты
 */
export type TOrderForm = {
	address?: string;
	payment?: PayMethod;
}

/**
 * Данные для отправки заказа на сервер
 */
export type TOrder = TOrderForm & TContactsForm & {
	items?: string[]
	total?: number;
}

/**
 * Перечень ошибок форм
 */
export type FormErrors = Partial<Record<keyof TOrder, string>>;

export type TOrderResult = {
	id: string;
	total: number;
}

export type TBasket = {
	items: string[];
	total?: number;
}

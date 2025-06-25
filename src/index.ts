import './scss/styles.scss';

import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { EventEmitter } from './components/base/events';
import { LarekApi } from './components/LarekApi';
import { App } from './components/model/App';
import { CatalogItem } from './components/model/CatalogItem';
import { Page } from './components/view/Page';
import { Modal } from './components/view/Modal';
import { Basket } from './components/view/Basket';
import { Card } from './components/view/Card';
import { OrderForm } from './components/view/OrderForm';
import { IProduct, IContactsForm, IOrderForm, IOrder, IOrderResult } from './types';
import { ContactsForm } from './components/view/ContactsForm';
import { Success } from './components/view/Success';

const events = new EventEmitter();
const api = new LarekApi(API_URL, CDN_URL);
const app = new App({}, events);

/**
 * Шаблоны
 */
const cardTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const previewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');
const modalEl = ensureElement<HTMLElement>('#modal-container');

/**
 * Представления
 */
const page = new Page(document.body, events);
const basket = new Basket(cloneTemplate(basketTemplate), events);
const modal = new Modal(modalEl, events);
const order = new OrderForm(cloneTemplate(orderTemplate), events);
const contacts = new ContactsForm(cloneTemplate(contactsTemplate), events);

/**
 * Загрузка каталога товаров
 */
events.on('catalog:update', () => {
	page.catalog = app.items.map((item) => {
		const card = new Card('card', cloneTemplate(cardTemplate), {
			onClick: () => events.emit('card:select', item),
		});

		return card.render({
			id: item.id,
			title: item.title,
			image: item.image,
			category: item.category,
			price: item.price,
			categoryClass: item.categoryClass,
			available: true
		});
	});
});

/**
 * Изменение выбранного товара
 */
events.on('card:select', (item: CatalogItem) => {
	app.setPreview(item);
});

/**
 * Открытие модального окна с товаром
 */
events.on('preview:changed', (item: CatalogItem) => {
	console.log(item);
	const inBasket = app.basket.items.includes(item.id);
	const card = new Card('card', cloneTemplate(previewTemplate), {
		onClick: () => {
			events.emit(`basket:${inBasket ? 'open' : 'add'}`, item);
		},
	});
	modal.render({
		content: card.render({
			title: item.title,
			image: item.image,
			description: item.description,
			category: item.category,
			price: item.price,
			available: inBasket,
			categoryClass: item.categoryClass,
		})
	});
});

/**
 * Открытие модального окна с корзиной
 */
events.on('basket:open', () => {
	basket.locked = app.basket.items.length === 0;
	modal.render({
		content: basket.render({})
	});
});

/**
 * Добавляем товар в корзину
 */
events.on('basket:add', (item: IProduct) => {
	app.addToBasket(item);
});

/**
 * Удаляем товар из корзины
 */
events.on('basket:remove', (item: IProduct) => {
	app.removeFromBasket(item);
});

/**
 * Обработка измений корзины
 */
events.on('basket:changed', () => {
	let total = 0;
	basket.items = app.basket.items.map((id, index) => {
		const item = app.items.find((item) => item.id === id);
		total += item.price;
		const card = new Card('card', cloneTemplate(cardBasketTemplate), {
			onClick: () => events.emit('basket:remove', item)
		});
		return card.render({
			index: (index + 1).toString(),
			title: item.title,
			price: item.price,
		});
	});

	app.basket.total = total;
	basket.locked = app.basket.items.length === 0;
	page.counter = app.basket.items.length;

});

/**
 * Открытие модального окна c формой заказа
 */
events.on('order:open', () => {
	modal.render({
		content: order.render({
			valid: false,
			errors: []
		})
	});
});

/**
 * Изменения в полях формы заказа
 */
events.on(/^order\..*:change/, (data: { field: keyof IOrderForm, value: string }) => {
	app.setOrderField(data.field, data.value);
});

/**
 * Изменилось состояние валидации формы заказа
 */
events.on('order:validate', (errors: Partial<IOrder>) => {
	const { address, payment } = errors;
	order.valid = !address && !payment;
	order.errors = Object.values({ address, payment }).filter(i => !!i).join('; ');
});


/**
 * Открытие модального окна c формой контактов
 */
events.on('order:submit', () => {
	modal.render({
		content: contacts.render({
			valid: false,
			errors: []
		})
	});
});


/**
 * Изменения в полях формы контактов
 */
events.on(/^contacts\..*:change/, (data: { field: keyof IContactsForm, value: string }) => {
	app.setContactsField(data.field, data.value);
});

/**
 * Изменилось состояние валидации формы контактов
 */
events.on('contacts:validate', (errors: Partial<IOrder>) => {
	const { email, phone } = errors;
	contacts.valid = !email && !phone;
	contacts.errors = Object.values({ email, phone }).filter(i => !!i).join('; ');
});

/**
 * 
 */
events.on('contacts:submit', () => {
	api.placeOrder(app.order)
		.then((result: IOrderResult) => {
			app.clearBasket();
			const success = new Success('order-success', cloneTemplate(successTemplate), {
				onClick: () => { modal.close(); },
			});
			success.total = result.total;
			modal.render({
				content: success.render(),
			});
		})
		.catch((err) => console.error(err));
});

events.on('modal:open', () => {
	page.locked = true;
});

/**
 * Блокируем прокрутку страницы если открыта модалка
 */
events.on('modal:open', () => {
	page.locked = true;
});

/**
 * ... и разблокируем
 */
events.on('modal:close', () => {
	page.locked = false;
});

/**
 * Получаем товары
 */
api
	.getProductList()
	.then(app.setCatalog.bind(app))
	.catch((err) => console.error(err));


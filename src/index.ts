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
import { TProduct, TContactsForm, TOrderForm, TOrder, TOrderResult } from './types';
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
			categoryClass: item.categoryClass
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
events.on('preview:change', (item: CatalogItem) => {
	const inBasket = app.basket.items.includes(item.id);
	const card = new Card('card', cloneTemplate(previewTemplate), {
		onClick: () => {
			events.emit(`${inBasket ? 'card:remove' : 'basket:add'}`, item);
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
	basket.toggleButton = app.basket.items.length === 0;
	basket.total = app.basket.total;
	modal.render({
		content: basket.render({})
	});
});

/**
 * Добавляем товар в корзину
 */
events.on('basket:add', (item: CatalogItem) => {
	app.addToBasket(item);
});

/**
 * Удаляем товар из корзины
 */
events.on('basket:remove', (item: CatalogItem) => {
	app.removeFromBasket(item);
});

events.on('card:remove', (item: CatalogItem) => {
	app.removeFromCard(item);
});

/**
 * Обработка измений корзины
 */
events.on('basket:change', () => {
	let total = 0;
	basket.items = app.basket.items.map((id, index) => {
		console.log({ index });

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
	basket.toggleButton = app.basket.items.length === 0;
	basket.total = app.basket.total;
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
events.on(/^order\..*:change/, (data: { field: keyof TOrderForm, value: string }) => {
	app.setOrderField(data.field, data.value);
});

/**
 * Изменилось состояние валидации формы заказа
 */
events.on('order:validate', (errors: Partial<TOrder>) => {
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
events.on(/^contacts\..*:change/, (data: { field: keyof TContactsForm, value: string }) => {
	app.setContactsField(data.field, data.value);
});

/**
 * Изменилось состояние валидации формы контактов
 */
events.on('contacts:validate', (errors: Partial<TOrder>) => {
	const { email, phone } = errors;
	contacts.valid = !email && !phone;
	contacts.errors = Object.values({ email, phone }).filter(i => !!i).join('; ');
});

/**
 * 
 */
events.on('contacts:submit', () => {
	api.placeOrder(app.order)
		.then((result: TOrderResult) => {
			app.clearBasket();
			const success = new Success('order-success', cloneTemplate(successTemplate), {
				onClick: () => { modal.close(); },
			});
			success.total = result.total;
			modal.render({
				content: success.render(),
			});
		})
		.catch(console.error);
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
	.catch(console.error);


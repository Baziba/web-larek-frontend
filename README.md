# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:

- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:

- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск

Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```

## Сборка

```
npm run build
```

или

```
yarn build
```

## Архитектура

Для реализации проекта использован паттерн проектирования MVP.

**Model** - Модель, позволяет хранить и изменять данные.

**View** - Вид, отобраджает данные на странице.

**Presenter** - Презенер, связывает между собой вид и модель в реагируя на действия пользователя.

Действия пользователя отслеживает `EventEmitter` - брокер событий.

## Базовый код

### Component

Дженерик, родительский класс всех элементов представлений.

_Конструктор_:

- `container: HTMLElemen` - DOM контейнер элемента

### Api

Базовая логика отправки, получения и обработки запросов.

_Конструктор_:

- `baseUrl` - Url адрес для запроса
- `options`- Параметры запроса

_Методы_:

- `get` - отправляет `GET` запрос и возвращает `Promise<object>`
- `post` - отправляет `POST` запрос с данными

### EventEmitter

Реализует паттерн «Наблюдатель» и позволяет подписываться на события и уведомлять подписчиков о наступлении события.

_Конструктор_ записывает в свойство `_events` экземпляр объекта Map для хранения перечень событий и подписчиков

_Методы_:

- `on` — Установить обработчик на событие
- `emit` — Инициировать событие с данными
- `trigger` - Сделать коллбек триггер, генерирующий событие при вызове

## Основные типы данных

**Карточка**

```ts
export interface IProduct {
	id: string;
	description: string;
	image: string;
	title: string;
	category: TProductCategory;
	price: number | null;
}
```

**Корзина**

```ts
export interface ICart {
	total: number;
	items: string[];
}
```

**Данные заказа**

```ts
export interface IOrder {
	payment: TPayMethod;
	address: string;
	email: string;
	phone: string;
	total: number;
	items: string[];
}
```

**Строгий тип оплаты**

```ts
export type TPayMethod = 'online' | 'offline';
```

**Строгий тип категории товара**

```ts
export type TProductCategory =
	| 'софт-скил'
	| 'другое'
	| 'дополнительное'
	| 'кнопка'
	| 'хард-скил';
```

**Товар для модального окна корзины**

```ts
export type TProductInCart = Pick<IProduct, 'title' | 'price'>;
```

**Количество в иконке**

```ts
export type TCartMini = Pick<ICart, 'items'>;
```

## Слой данных Model

`ProductList` - Каталог карточек

```ts
export interface IProductList {
	items: string[]; // Массив карточек товаров
	preview: string | null; // id карточки для просмотра в МО
	getProduct(items: string[]): IProduct; // Получение товара по id
	getProducts(): IProduct[]; // Получение списка товаров от сервера
}
```

`CartModel` - Корзина

```ts
export interface ICartModel {
	items: string[]; // Перечень товаров в корзине
	addProduct(id: string): void; // Добавление товара в корзину
	removeProduct(id: string): void; // Удаление товара из  корзины
	emptyCart(): void; // Сброс корзины
	getTotal(items: string[]): number; // Сумма заказа
	getCount(items: string[]): number; // Количество товаров в корзине
}
```

`OrderModel` - Заказ

```ts
export interface IOrderModel {
	items: string[]; // Перечень товаров в заказе
	payment: TPayMethod; // Тип оплаты
	address: string; // Адрес доставки
	email: string; // Электронный адрес
	phone: string; // Телефон
	total: number; // Сумма заказа
	checkValidation(): boolean;
}
```

## Слой отражений View

`ModalView` - Отвечает за отображение модального окна.

`FormView` - Обрабатывает формы.

`MiniCartView` - Отображает состояние мини-корзины.

`AppView` - Выступает "оболочкой", объединяющей отображения.

## Слой презентера Presenter

`EventEmitter` - осуществляет взамиодействие модели и представления.
Компоненты создают события через брокер событий, который передаёт их модели для обработки. Получая ответ от можели производит обновление представлений.

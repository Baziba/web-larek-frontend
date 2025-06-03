import { ApiPostMethods } from "../components/base/api";

/**
 * Тип данных: Карточка
 */
export interface IProduct {
  id: string;
  description: string;
  image: string;
  title: string;
  category: TProductCategory;
  price: number | null;
}

/**
 * Тип данных: Корзина
 */
export interface ICart {
  total: number
  items: string[];
}

/**
 * Тип данных: Данные заказа
 */
export interface IOrder {
  payment: TPayMethod;
  address: string;
  email: string;
  phone: string;
  total: number;
  items: string[];
}

/**
 * Строгий тип оплаты
 */
export type TPayMethod = 'online' | 'offline';

/**
 * Строгий тип категории товара
 */
export type TProductCategory = 'софт-скил' | 'другое' | 'дополнительное' | 'кнопка' | 'хард-скил';

/**
 * Товар для модального окна корзины
 */
export type TProductInCart = Pick<IProduct, 'title' | 'price'>;

/** Количество в иконке корзины буду выводлить считая количество товаров в корзине */
export type TCartMini = Pick<ICart, 'items'>;

/**
 * Интерфейс базового класса Api
 */
export interface Api {
  baseUrl: string;
  options: RequestInit;
  handleResponse(response: Response): Promise<object>
  get(uri: string): Promise<object>;
  post(uri: string, data: object, method: ApiPostMethods): Promise<object>;
}

/**
 * Перечень товаров от Api
 */
export interface IApiProductList {
  total: number;
  items: IProduct[];
}

/**
 * Ответ Api на заказ
 */
export interface IApiOrder {
  id: string;
  total: number;
}

/**
 * Модель списка карточек
 */
export interface IProductList {
  items: string[];
  preview: string | null;
  getProduct(items: string[]): IProduct;
  getProducts(): IProduct[];
}

/**
 * Модель корзины
 */
export interface ICartModel {
  items: string[];
  addProduct(id: string): void;
  removeProduct(id: string): void;
  emptyCart(): void;
  getTotal(items: string[]): number;
  getCount(items: string[]): number;
}

/**
 * Модель заказа
 */
export interface IOrderModel {
  items: string[];
  payment: TPayMethod;
  address: string;
  email: string;
  phone: string;
  total: number;
}

/**
 * Отображает карточку товара
 */
export interface IProductView {
  container: HTMLElement;
  render: HTMLElement;
}

/**
 * Отображает список карточек товара
 */
export interface IProductListView {
  container: HTMLElement;
  setProductCards: HTMLElement[];
  render: HTMLElement;
}

/**
 * Отображает корзину
 */
export interface ICartView {

}

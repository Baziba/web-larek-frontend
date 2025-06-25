import { Api, ApiListResponse } from './base/api';
import { IOrder, IOrderResult, IProduct } from './../types';

/**
 * Модель взаимдоействия с Api
 */
export interface ILarekApiModel {
	getProduct: (id: string) => Promise<IProduct>;
	getProductList: () => Promise<IProduct[]>;
	placeOrder: (order: IOrder) => Promise<IOrderResult>;
}

export class LarekApi extends Api implements ILarekApiModel {
	readonly cdn: string;

	constructor(baseUrl: string, cdn: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	getProduct(id: string): Promise<IProduct> {
		return this.get(`/product/${id}`).then((item: IProduct) => ({
			...item,
			image: this.cdn + item.image.replace('.svg', '.png'),
		}));
	}

	getProductList(): Promise<IProduct[]> {
		return this.get('/product').then((response: ApiListResponse<IProduct>) =>
			response.items.map((item) => ({
				...item,
				image: this.cdn + item.image.replace('.svg', '.png'),
			}))
		);
	}

	placeOrder(order: IOrder): Promise<IOrderResult> {
		return this.post('/order', order).then(
			(response: IOrderResult) => response
		);
	}
}

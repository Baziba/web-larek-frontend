import { Api, ApiListResponse } from './base/api';
import { TOrder, TOrderResult, TProduct } from './../types';

/**
 * Модель взаимдоействия с Api
 */
export interface ILarekApiModel {
	getProduct: (id: string) => Promise<TProduct>;
	getProductList: () => Promise<TProduct[]>;
	placeOrder: (order: TOrder) => Promise<TOrderResult>;
}

export class LarekApi extends Api implements ILarekApiModel {
	readonly cdn: string;

	constructor(baseUrl: string, cdn: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	getProduct(id: string): Promise<TProduct> {
		return this.get(`/product/${id}`).then((item: TProduct) => ({
			...item,
			image: this.cdn + item.image.replace('.svg', '.png'),
		}));
	}

	getProductList(): Promise<TProduct[]> {
		return this.get('/product').then((response: ApiListResponse<TProduct>) =>
			response.items.map((item) => ({
				...item,
				image: this.cdn + item.image.replace('.svg', '.png'),
			}))
		);
	}

	placeOrder(order: TOrder): Promise<TOrderResult> {
		return this.post('/order', order).then(
			(response: TOrderResult) => response
		);
	}
}

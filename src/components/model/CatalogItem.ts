import { TProduct } from "../../types";
import { Model } from "../base/Model";

export class CatalogItem extends Model<TProduct> {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
    inBasket: boolean;

    get categoryClass(): string {
        const categoryClass = new Map([
            ['софт-скил', 'soft'],
            ['хард-скил', 'hard'],
            ['другое', 'other'],
            ['дополнительное', 'additional'],
            ['кнопка', 'button'],
        ]);

        return categoryClass.get(this.category);
    }

    
}
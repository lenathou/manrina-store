import { IProduct, IProductUpdateFields, IProductVariant } from './IProduct';
import { ProductEntity } from './ProductEntity';

export interface ProductRepository {
    createProduct: (product: ProductEntity) => Promise<ProductEntity>;
    createProducts: (products: IProduct[]) => Promise<ProductEntity[]>;
    getAllProducts: () => Promise<ProductEntity[]>;
    getAllProductsWithStock: () => Promise<ProductEntity[]>;
    updateVariant: (variantId: string, updates: Partial<IProductVariant>) => Promise<IProductVariant>;
    updateProduct: (productId: string, updates: IProductUpdateFields) => Promise<IProduct>;
}

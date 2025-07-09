import path from 'path';
import deliveryMethods from '../../mock/deliveryMethods.json';
import { AirtableService, AirtableSumupProduct } from '../../service/airtable';
import { FileSystemService } from '../../service/FileSystemService';
import { DeliveryMethodsData } from '../../types/DeliveryMethodsType';
import { Basket } from '../checkout/IBasket';
import { executeInBatches } from '../utils/executeInBatches';
import { IProduct, IProductUpdateFields, IProductVariant } from './IProduct';
import { IProductHistoryRepository } from './ProductHistoryRepository';
import { ProductRepository } from './ProductRepository';

export type BasketValidationResult = {
    isValid: boolean;
    unavailableItems: {
        productId: string;
        variantId: string;
        name: string;
        requestedQuantity: number;
        availableStock: number;
        reason: 'OUT_OF_STOCK' | 'INSUFFICIENT_STOCK' | 'PRODUCT_NOT_FOUND';
    }[];
};

export class ProductUseCases {
    constructor(
        private productRepository: ProductRepository,
        private productHistoryRepository: IProductHistoryRepository,
        private airtableService: AirtableService,
        private fileSystemService: FileSystemService,
    ) {}

    public createProductsFromAirtable = async () => {
        const products = await this.airtableService.getCurrentSumupProducts();
        // console.log('products', products[0]);
        // throw new Error('Not implemented');
        const productsToCreate = products.map((product) => product.fields);
        await this.loadImagesFromAirtableToPublicFolder(productsToCreate);
        return await this.createProductsFromObjectArray(productsToCreate);
    };

    private loadImagesFromAirtableToPublicFolder = async (products: AirtableSumupProduct[] = []) => {
        const imagesFolder = path.join(process.cwd(), 'public', 'images');
        // ensure folder exists
        await executeInBatches(products, 20, async (product) => {
            const image = product.productImage?.[0]?.url;
            if (!image) {
                return;
            }
            const productId = product['Item id (Do not change)'];
            console.log('running image download for', product['Item name']);
            //if contains image already locally, skip
            if (this.fileSystemService.doesFileExist(path.join(imagesFolder, `${productId}.png`))) {
                return;
            }
            const imagePath = path.join(imagesFolder, `${productId}.png`);
            const imageBuffer = await fetch(image).then((res) => res.arrayBuffer());
            await this.fileSystemService.writeFile(imagePath, Buffer.from(imageBuffer));
        });
    };

    private createProductsFromObjectArray = async (productsToCreate: AirtableSumupProduct[] = []) => {
        const productsGroupedByItemName = productsToCreate.reduce(
            (acc, product) => {
                const productId = product['Item id (Do not change)'];
                const productName = product['Item name'];
                // const imageUrl = product['Image 1'];
                const imageUrl = `/images/${productId}.png`;
                if (!acc[productName]) {
                    acc[productName] = {
                        id: productId,
                        category: product.Category,
                        name: product['Item name'],
                        imageUrl: imageUrl,
                        showInStore: product['Display item in Online Store? (Yes/No)'] === 'Yes',
                        description: product['Description (Online Store and Invoices only)'] || '',
                        variants: [],
                    };
                }
                if (product['Variant id (Do not change)']) {
                    acc[productName].variants.push({
                        id: product['Variant id (Do not change)'],
                        optionSet: product['Option set 1'] || '',
                        optionValue: product['Option 1'] || product['Variations'] || '',
                        productId: productId,
                        description: product['Description (Online Store and Invoices only)'] || '',
                        imageUrl: imageUrl,
                        price: +product.Price,
                        stock: Math.floor(+product.Quantity),
                    });
                }
                return acc;
            },
            {} as Record<string, IProduct>,
        );
        const products: IProduct[] = Object.values(productsGroupedByItemName);
        return await this.createProducts(products);
    };

    private createProducts = async (products: IProduct[]) => {
        const createdProducts = await this.productRepository.createProducts(products);

        // Log the product creation in history
        await this.productHistoryRepository.logProductUpdate('BULK_CREATE', {
            dataString: JSON.stringify(products),
        });

        return createdProducts;
    };

    public getAllProductsWithStock = () => {
        return this.productRepository.getAllProductsWithStock();
    };

    public getAllProducts = this.productRepository.getAllProducts;

    public getDeliveryMethods = () => {
        return deliveryMethods as DeliveryMethodsData;
    };

    public updateVariant = async (variantId: string, updates: Partial<IProductVariant>) => {
        return this.productRepository.updateVariant(variantId, updates);
    };

    public updateProduct = async (productId: string, updates: IProductUpdateFields) => {
        return this.productRepository.updateProduct(productId, updates);
    };

    public addVatRateToBasket = async (basket: Basket, defaultTaxId: string) => {
        // Get all products to find their VAT rates
        const products = await this.getAllProducts();

        // Create a new basket with updated items
        const updatedItems = basket.items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            const variant = product?.variants.find((v) => v.id === item.productVariantId);

            return {
                ...item,
                vatRateId: variant?.vatRate?.taxId || defaultTaxId,
            };
        });

        return new Basket({
            ...basket,
            items: updatedItems,
        });
    };

    public validateBasketItems = async (
        items: { productId: string; variantId: string; quantity: number }[],
    ): Promise<BasketValidationResult> => {
        const products = await this.productRepository.getAllProducts();
        const unavailableItems: BasketValidationResult['unavailableItems'] = [];

        for (const item of items) {
            const product = products.find((p) => p.id === item.productId);
            if (!product) {
                unavailableItems.push({
                    productId: item.productId,
                    variantId: item.variantId,
                    name: 'Unknown Product',
                    requestedQuantity: item.quantity,
                    availableStock: 0,
                    reason: 'PRODUCT_NOT_FOUND',
                });
                continue;
            }

            const variant = product.variants.find((v) => v.id === item.variantId);
            if (!variant) {
                unavailableItems.push({
                    productId: item.productId,
                    variantId: item.variantId,
                    name: product.name,
                    requestedQuantity: item.quantity,
                    availableStock: 0,
                    reason: 'PRODUCT_NOT_FOUND',
                });
                continue;
            }

            if (variant.stock <= 0) {
                unavailableItems.push({
                    productId: item.productId,
                    variantId: item.variantId,
                    name: `${product.name} ${variant.optionSet} ${variant.optionValue}`.trim(),
                    requestedQuantity: item.quantity,
                    availableStock: 0,
                    reason: 'OUT_OF_STOCK',
                });
            } else if (variant.stock < item.quantity) {
                unavailableItems.push({
                    productId: item.productId,
                    variantId: item.variantId,
                    name: `${product.name} ${variant.optionSet} ${variant.optionValue}`.trim(),
                    requestedQuantity: item.quantity,
                    availableStock: variant.stock,
                    reason: 'INSUFFICIENT_STOCK',
                });
            }
        }

        return {
            isValid: unavailableItems.length === 0,
            unavailableItems,
        };
    };
}

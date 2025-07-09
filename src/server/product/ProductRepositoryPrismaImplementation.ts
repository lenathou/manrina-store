import { Prisma, PrismaClient } from '@prisma/client';
import { IProduct, IProductUpdateFields, IProductVariant, IProductVariantUpdateFields } from './IProduct';
import { ProductEntity } from './ProductEntity';
import { ProductRepository } from './ProductRepository';

export class ProductRepositoryPrismaImplementation implements ProductRepository {
    constructor(private prisma: PrismaClient) {}

    public createProducts = async (products: IProduct[]): Promise<ProductEntity[]> => {
        return Promise.all(products.map((product) => this.createProduct(new ProductEntity(product))));
    };

    public createProduct = async (productDto: ProductEntity) => {
        const result = await this.prisma.product.upsert({
            where: {
                id: productDto.id,
            },
            create: {
                id: productDto.id,
                category: productDto.category,
                name: productDto.name,
                description: productDto.description ?? Prisma.skip,
                imageUrl: productDto.imageUrl,
                showInStore: productDto.showInStore,
                variants: {
                    createMany: {
                        data: productDto.variants.map((variant) => ({
                            id: variant.id,
                            optionSet: variant.optionSet,
                            optionValue: variant.optionValue,
                            description: variant.description,
                            imageUrl: variant.imageUrl,
                            price: variant.price,
                            stock: variant.stock,
                        })),
                    },
                },
            },
            update: {
                category: productDto.category,
                name: productDto.name,
                description: productDto.description ?? Prisma.skip,
                imageUrl: productDto.imageUrl,
                showInStore: productDto.showInStore,
                variants: {
                    upsert: productDto.variants.map((variant) => ({
                        where: { id: variant.id },
                        create: {
                            id: variant.id,
                            optionSet: variant.optionSet,
                            optionValue: variant.optionValue,
                            description: variant.description,
                            imageUrl: variant.imageUrl,
                            price: variant.price,
                            stock: variant.stock,
                        },
                        update: {
                            optionSet: variant.optionSet,
                            optionValue: variant.optionValue,
                            description: variant.description,
                            imageUrl: variant.imageUrl,
                            price: variant.price,
                            stock: variant.stock,
                        },
                    })),
                },
            },
            include: {
                variants: true,
            },
        });
        return new ProductEntity(result as IProduct);
    };

    public getAllProducts = async () => {
        const products = await this.prisma.product.findMany({
            include: {
                variants: true,
            },
            orderBy: {
                name: 'asc',
            },
        });

        return products.map((product) => new ProductEntity(product as IProduct));
    };

    public getAllProductsWithStock = async () => {
        const products = await this.prisma.product.findMany({
            where: {
                showInStore: true,
                variants: {
                    some: {
                        stock: { gt: 0 },
                    },
                },
            },
            include: {
                variants: {
                    where: {
                        stock: { gt: 0 },
                    },
                },
            },
            orderBy: {
                name: 'asc',
            },
        });

        return products.map((product) => new ProductEntity(product as IProduct));
    };

    public updateVariant = async (variantId: string, updates: IProductVariantUpdateFields) => {
        const result = await this.prisma.productVariant.update({
            where: { id: variantId },
            data: { ...updates, vatRate: (updates.vatRate as Prisma.JsonValue) ?? Prisma.skip },
        });
        return result as IProductVariant;
    };

    public updateProduct = async (productId: string, updates: IProductUpdateFields) => {
        const result = await this.prisma.product.update({
            where: { id: productId },
            data: updates,
            include: {
                variants: true,
            },
        });
        return result as IProduct;
    };
}

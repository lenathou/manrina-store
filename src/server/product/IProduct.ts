export interface IProduct {
    id: string;
    category?: string | null;
    name: string;
    imageUrl: string;
    showInStore: boolean;
    description?: string | null;
    variants: IProductVariant[];
}
export type ProductDtoForCreation = {
    id?: string;
    category?: string;
    name: string;
    imageUrl: string;
    showInStore: boolean;
    description?: string;
};
export interface VatRate {
    taxRate: number;
    taxId: string;
}
export type IProductVariant = {
    id: string;
    optionSet: string;
    optionValue: string;
    productId: string;
    description: string | null;
    imageUrl: string | null;
    price: number;
    stock: number;
    vatRate?: VatRate | null;
    showDescriptionOnPrintDelivery?: boolean;
};
export type IProductVariantUpdateFields = Partial<Omit<IProductVariant, 'id' | 'productId'>>;
export type IProductUpdateFields = Partial<Omit<IProduct, 'id' | 'variants'>>;

export const getFirstVariantWithStock = (variants: IProductVariant[]) => {
    return variants.find((v) => v.stock > 0);
};

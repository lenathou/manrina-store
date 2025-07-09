import { useMutation, useQueryClient } from '@tanstack/react-query';
import { IProduct, IProductVariant, IProductVariantUpdateFields } from '../../server/product/IProduct';
import { backendFetchService } from '../../service/BackendFetchService';
import { STOCK_GET_ALL_PRODUCTS_QUERY_KEY } from './stock.config';

export const useUpdateVariant = <AllowedFields extends keyof IProductVariantUpdateFields>(data: {
    errorMessage: string;
}) => {
    const queryClient = useQueryClient();
    const updateVariantMutation = useMutation({
        mutationFn: async (props: {
            variantId: string;
            dataToUpdate: Pick<IProductVariantUpdateFields, AllowedFields>;
        }) => {
            await backendFetchService.updateVariant(props.variantId, props.dataToUpdate);
            return props;
        },
        onSuccess: (props) => {
            queryClient.setQueryData<IProduct[]>([STOCK_GET_ALL_PRODUCTS_QUERY_KEY], (oldProducts) => {
                if (!oldProducts) return oldProducts;
                return oldProducts.map((product) => ({
                    ...product,
                    variants: product.variants.map((v: IProductVariant) =>
                        v.id === props.variantId ? { ...v, ...props.dataToUpdate } : v,
                    ),
                }));
            });
        },
        onError: () => {
            alert(data.errorMessage);
        },
    });
    return updateVariantMutation;
};

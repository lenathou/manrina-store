import { useQuery } from '@tanstack/react-query';
import { PropsWithChildren, createContext, useContext } from 'react';
import { BasketStorage, useBasketStorage } from '../hooks/useBasketStorage';
import { IProduct } from '../server/product/IProduct';
import { backendFetchService } from '../service/BackendFetchService';

type AppContextType = {
    basketStorage: BasketStorage;
    totalProducts: number;
    addProductToBasket: (product: IProduct, quantity: number, variantId: string) => void;
    removeProductFromBasket: (productId: string, variantId: string) => void;
    decrementProductQuantity: (productId: string, variantId: string) => void;
    updateProductQuantity: (productId: string, variantId: string, quantity: number, setQuantity?: boolean) => boolean;
    getProductQuantityInBasket: (productId: string, variantId: string) => number;
    products: IProduct[];
    getProductsByCategory: (category: string) => IProduct[];
    isLoading: boolean;
    resetBasketStorage: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider = ({ children }: PropsWithChildren) => {
    const {
        basketStorage,
        totalProducts,
        addProductToBasket,
        removeProductFromBasket,
        decrementProductQuantity,
        resetBasketStorage,
        updateProductQuantity,
        getProductQuantityInBasket,
    } = useBasketStorage();

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['products_with_stock'],
        queryFn: () =>
            backendFetchService
                .getAllProductsWithStock()
                .then((products) => products.sort((a, b) => a.name.localeCompare(b.name))),
    });

    const getProductsByCategory = (category: string) => {
        if (!category) return products;
        return products.filter((product) => product.category === category);
    };

    return (
        <AppContext.Provider
            value={{
                basketStorage,
                totalProducts,
                addProductToBasket,
                removeProductFromBasket,
                decrementProductQuantity,
                updateProductQuantity,
                getProductQuantityInBasket,
                products,
                getProductsByCategory,
                isLoading,
                resetBasketStorage,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const appContext = useContext(AppContext);
    if (!appContext) {
        throw new Error('useAppContext must be used within an AppContextProvider');
    }
    return appContext;
};

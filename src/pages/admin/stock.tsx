import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useDebounce } from 'react-use';
import { ShowDescriptionOnPrintDeliveryEditor } from '../../components/admin/ShowDescriptionOnPrintDeliveryEditorProps';
import { ShowInStoreBadge } from '../../components/admin/ShowInStoreBadge';
import { STOCK_GET_ALL_PRODUCTS_QUERY_KEY } from '../../components/admin/stock.config';
import { VatRateEditor } from '../../components/admin/VatRateEditor';
import { withAdminAuth } from '../../components/admin/withAdminAuth';
import { AppButton } from '../../components/button';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { AppImage } from '../../components/Image';
import { UpdateQuantityButtons } from '../../components/products/BasketItem';
import { SearchBar } from '../../components/products/SearchBar';
import { TaxRatesProvider, useTaxRates } from '../../contexts/TaxRatesContext';
import { useFilteredProducts } from '../../hooks/useFilteredProducts';
import { IProduct } from '../../server/product/IProduct';
import { backendFetchService } from '../../service/BackendFetchService';

function StockEditor({ variant }: { variant: IProduct['variants'][0] }) {
    const [inputValue, setInputValue] = useState(variant.stock.toString());
    const queryClient = useQueryClient();

    const inputValueNumber = parseInt(inputValue);

    const { mutate: updateStock, isPending: updating } = useMutation({
        mutationFn: async (newStock: number) => {
            if (newStock < 0) return variant.stock;

            await backendFetchService.adjustStock({
                variantId: variant.id,
                newStock,
                reason: 'Manual adjustment',
                adjustedBy: 'admin',
            });
            return newStock;
        },
        onSuccess: (newStock) => {
            // Update the products cache with new stock value
            queryClient.setQueryData<IProduct[]>(['products'], (oldProducts) => {
                if (!oldProducts) return oldProducts;
                return oldProducts.map((product) => ({
                    ...product,
                    variants: product.variants.map((v) => (v.id === variant.id ? { ...v, stock: newStock } : v)),
                }));
            });
        },
        onError: () => {
            // Reset to previous value on error
            setInputValue(variant.stock.toString());
            alert('Failed to update stock');
        },
    });

    const handleStockChange = (newValue: string) => {
        setInputValue(newValue);
    };

    const handleQuantityChange = (newQuantity: number) => {
        setInputValue(newQuantity.toString());
        updateStock(newQuantity);
    };

    useDebounce(
        () => {
            const numValue = parseInt(inputValue);
            if (!isNaN(numValue) && numValue !== variant.stock) {
                updateStock(numValue);
            }
        },
        300,
        [inputValue],
    );

    return (
        <div className="flex items-center">
            <UpdateQuantityButtons
                increment={() => handleStockChange(Math.max(0, inputValueNumber + 1).toString())}
                decrement={() => handleStockChange(Math.max(0, inputValueNumber - 1).toString())}
                quantity={inputValueNumber}
                disabled={updating}
                centerEditing={true}
                onQuantityChange={handleQuantityChange}
            />
        </div>
    );
}

function StockManagementPageContent() {
    const [searchTerm, setSearchTerm] = useState('');
    const queryClient = useQueryClient();

    const { data: products = [], isLoading } = useQuery({
        queryKey: [STOCK_GET_ALL_PRODUCTS_QUERY_KEY],
        queryFn: () =>
            backendFetchService
                .getAllProducts()
                .then((products) => products.sort((a, b) => a.name.localeCompare(b.name))),
    });
    const { error: taxRatesError } = useTaxRates();

    const { mutate: createProductsFromAirtable, isPending: isCreatingProducts } = useMutation({
        mutationFn: async () => {
            await backendFetchService.createProductsFromAirtable();
        },
        onSuccess: () => {
            // Invalidate and refetch products after successful import
            window.location.reload();
        },
        onError: (error) => {
            console.error('Failed to import products from Airtable:', error);
            alert('Erreur lors de la récupération des produits depuis Airtable');
        },
    });

    const filteredProductsList = useFilteredProducts(products, searchTerm, {
        includeVariants: true,
    });

    if (isLoading) {
        return (
            <div className="flex-1 flex justify-center items-center">
                <p className="text-lg">Loading...</p>
            </div>
        );
    }

    return (
        <div className="flex-1 p-8 bg-[#F7F0EA]">
            <ErrorBanner message={taxRatesError?.message || ''} />
            <AppButton
                label={isCreatingProducts ? 'Récupération en cours...' : 'Récupérer les produits depuis Airtable'}
                action={() => {
                    const confirmed = window.confirm('Voulez-vous vraiment récupérer les produits depuis Airtable ?');
                    if (confirmed) {
                        createProductsFromAirtable();
                    }
                }}
                loading={isCreatingProducts}
                disable={isCreatingProducts}
            />
            <div className="flex-1 bg-white rounded-lg p-6 max-w-7xl mx-auto mt-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Products Stock Management</h1>
                <SearchBar
                    initialValue={searchTerm}
                    onSearch={setSearchTerm}
                />

                {/* Table Header */}
                <div className="overflow-x-auto mt-6">
                    <table className="w-full border-collapse">
                        <thead className="bg-gray-50">
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Variant</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Price</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">VAT Rate</th>
                                <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProductsList.map((product) =>
                                product.variants.map((variant, variantIndex) => (
                                    <tr
                                        key={`${product.id}-${variant.id}`}
                                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                                            !product.showInStore ? 'opacity-50' : ''
                                        }`}
                                    >
                                        {/* Product Column */}
                                        <td className="py-4 px-4">
                                            {variantIndex === 0 && (
                                                <div className="flex items-center space-x-3">
                                                    <AppImage
                                                        source={product.imageUrl}
                                                        style={{ width: 50, height: 50, borderRadius: 4 }}
                                                        alt={product.name}
                                                    />
                                                    <div>
                                                        <span className="font-medium text-gray-900">
                                                            {product.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </td>

                                        {/* Variant Column */}
                                        <td className="py-4 px-4">
                                            <span className="text-sm text-gray-700">{variant.optionValue}</span>
                                        </td>

                                        {/* Price Column */}
                                        <td className="py-4 px-4">
                                            <span className="font-medium text-gray-900">{variant.price}€</span>
                                        </td>

                                        {/* Stock Column */}
                                        <td className="py-4 px-4">
                                            <StockEditor variant={variant} />
                                        </td>

                                        {/* VAT Rate Column */}
                                        <td className="py-4 px-4">
                                            <VatRateEditor variant={variant} />
                                        </td>

                                        {/* Status Column */}
                                        <td className="py-4 px-4 text-center">
                                            {variantIndex === 0 && <ShowInStoreBadge product={product} />}
                                        </td>

                                        {/* Actions Column */}
                                        <td className="py-4 px-4">
                                            <ShowDescriptionOnPrintDeliveryEditor variant={variant} />
                                        </td>
                                    </tr>
                                )),
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StockManagementPage() {
    return (
        <TaxRatesProvider>
            <StockManagementPageContent />
        </TaxRatesProvider>
    );
}

export default withAdminAuth(StockManagementPage);

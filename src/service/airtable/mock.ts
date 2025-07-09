import type { CSVStockObject } from 'Sumup';
import { AirtableService } from '.';
import type { ManrinaActualisationElement, ManrinaProduct } from './types';

// Import mock data
import products from '../../mock/data/products.json';
import sumupProducts from '../../mock/data/sumup-products.json';
import actualisation from '../../mock/data/actualisation.json';

// Type assertion to match the expected structure
const mockProducts: ManrinaProduct[] = products as ManrinaProduct[];
const mockSumupProducts = sumupProducts;
const mockActualisation: ManrinaActualisationElement[] = actualisation as ManrinaActualisationElement[];

export class AirtableServiceMock extends AirtableService {
    constructor() {
        // Pass a dummy key, it won't be used
        super('dummy_api_key'); 
    }

    // Override methods to use mock data instead of API calls

    getAllProducts = async (): Promise<ManrinaProduct[]> => {
        console.log('--- USING MOCK DATA: getAllProducts ---');
        return Promise.resolve(mockProducts);
    };

    getCurrentSumupProducts = async () => {
        console.log('--- USING MOCK DATA: getCurrentSumupProducts ---');
        // Transform to AirTableRowWithCSVData format
        const transformedProducts = mockSumupProducts.map((product: { id?: string; createdTime?: string; fields: Record<string, unknown> }, index) => ({
            createdTime: product.createdTime || new Date().toISOString(),
            fields: {
                // Required CSVStockObject properties with defaults
                'Item name': '',
                'Variations': '',
                'Option set 1': '',
                'Option 1': '',
                'Option set 2': '',
                'Option 2': '',
                'Option set 3': '',
                'Option 3': '',
                'Option set 4': '',
                'Option 4': '',
                'Is variation visible? (Yes/No)': 'Yes',
                'Price': '0',
                'On sale in Online Store?': 'No',
                'Regular price (before sale)': '',
                'Tax rate (%)': '0',
                'Track inventory? (Yes/No)': 'No',
                'Quantity': '0',
                'Low stock threshold': '0',
                'SKU': '',
                'Barcode': '',
                'Description (Online Store and Invoices only)': '',
                'Category': '',
                'Display colour in POS checkout': '',
                'Image 1': '',
                'Image 2': '',
                'Image 3': '',
                'Image 4': '',
                'Image 5': '',
                'Image 6': '',
                'Image 7': '',
                'Display item in Online Store? (Yes/No)': 'No',
                'SEO title (Online Store only)': '',
                'SEO description (Online Store only)': '',
                'Shipping weight [kg] (Online Store only)': '0',
                'Item id (Do not change)': '',
                'Variant id (Do not change)': '',
                'Valeur par défaut': 0,
                // Override with actual mock data
                ...product.fields,
                // Add productImage for AirtableSumupProduct
                productImage: [{ url: '/images/default-product.svg' }]
            },
            id: product.id || `mock_id_${index}`
        }));
        return Promise.resolve(transformedProducts);
    };
    
    protected getAllElementsFromView = async <ElementType>({ base, view }: { base: string; view: string }): Promise<ElementType[]> => {
        console.log(`--- USING MOCK DATA: getAllElementsFromView (base: ${base}, view: ${view}) ---`);
        if (base === 'Produits') {
            return Promise.resolve(mockProducts as unknown as ElementType[]);
        }
        if (base === this['SUMUP_PRODUCTS_TABLE_ID']) {
            // Transform to match AirTableRowWithCSVData format
            const transformedProducts = mockSumupProducts.map((product: { id?: string; createdTime?: string; fields: Record<string, unknown> }, index) => ({
                createdTime: product.createdTime || new Date().toISOString(),
                fields: {
                    // Required CSVStockObject properties with defaults
                    'Item name': '',
                    'Variations': '',
                    'Option set 1': '',
                    'Option 1': '',
                    'Option set 2': '',
                    'Option 2': '',
                    'Option set 3': '',
                    'Option 3': '',
                    'Option set 4': '',
                    'Option 4': '',
                    'Is variation visible? (Yes/No)': 'Yes',
                    'Price': '0',
                    'On sale in Online Store?': 'No',
                    'Regular price (before sale)': '',
                    'Tax rate (%)': '0',
                    'Track inventory? (Yes/No)': 'No',
                    'Quantity': '0',
                    'Low stock threshold': '0',
                    'SKU': '',
                    'Barcode': '',
                    'Description (Online Store and Invoices only)': '',
                    'Category': '',
                    'Display colour in POS checkout': '',
                    'Image 1': '',
                    'Image 2': '',
                    'Image 3': '',
                    'Image 4': '',
                    'Image 5': '',
                    'Image 6': '',
                    'Image 7': '',
                    'Display item in Online Store? (Yes/No)': 'No',
                    'SEO title (Online Store only)': '',
                    'SEO description (Online Store only)': '',
                    'Shipping weight [kg] (Online Store only)': '0',
                    'Item id (Do not change)': '',
                    'Variant id (Do not change)': '',
                    'Valeur par défaut': 0,
                    // Override with actual mock data
                    ...product.fields,
                    // Add productImage for AirtableSumupProduct
                    productImage: [{ url: '/images/default-product.svg' }]
                },
                id: product.id || `mock_id_${index}`
            }));
            return Promise.resolve(transformedProducts as unknown as ElementType[]);
        }
        if (base.toLowerCase().includes('actualisation')) {
             return Promise.resolve(mockActualisation as unknown as ElementType[]);
        }
        return Promise.resolve([]);
    };

    addSumupProducts = async (products: CSVStockObject[]) => {
        console.log('--- MOCK: addSumupProducts called with: ---', products);
        return Promise.resolve();
    };

    resetValues = async () => {
        console.log('--- MOCK: resetValues called ---');
        return Promise.resolve();
    };

    generateActualisationValues = async (baseName: string) => {
        console.log(`--- MOCK: generateActualisationValues called for base: ${baseName} ---`);
        // This is a complex function. For the mock, we'll return a simplified, empty structure.
        // You can expand this if you need to test the data transformation logic.
        return Promise.resolve({
            productsWhereHighestQuantityIsNotTheLowestPrice: [],
            productsSumupWithNameAndQuantity: [],
            productsFromActualisationWithId: [],
            productsInKgsNames: [],
            productsInDifferentFormat: [],
            productsInKg: [],
        });
    };

    updateShowInOnlineStore = async () => {
        console.log('--- MOCK: updateShowInOnlineStore called ---');
        return Promise.resolve();
    };
    
    // Inherits other methods like getSumUpProductsWithVariantId, etc.
    // They will use the mocked versions of getAllProducts, getCurrentSumupProducts, etc.
}

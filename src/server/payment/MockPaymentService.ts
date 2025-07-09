// STRIPE COMMENTED OUT - Service de paiement mock pour remplacer Stripe
import { Basket } from '../checkout/IBasket';
import { ICustomer } from '../customer/Customer';
import { CheckoutSessionSuccessPayload } from './CheckoutSessionSuccessPayload';
import { PaymentService, TaxRate } from './PaymentService';

type BasketPaid = {
    type: 'basketPaid';
    basketId: string;
    customerId: string;
    checkoutSessionId: string;
};

/**
 * Service de paiement mock qui remplace Stripe pendant le développement
 * Permet à l'application de fonctionner sans configuration Stripe
 */
export class MockPaymentService implements PaymentService {
    async getTaxRates(): Promise<{ defaultTaxRate: TaxRate; allRates: TaxRate[] }> {
        // Retourne des taux de taxe mock
        const defaultTaxRate: TaxRate = {
            taxRate: 8.5, // 8.5% de TVA par défaut
            taxId: 'mock_tax_rate_1',
            displayName: 'TVA Standard',
            description: 'Taux de TVA standard (mock)',
        };

        return {
            defaultTaxRate,
            allRates: [defaultTaxRate],
        };
    }

    async getPaymentLink(
        customer: ICustomer,
        basket: Basket,
        checkoutSessionId: string,
    ): Promise<{ id: string; url: string; total: number }> {
        // Calcule le total du panier
        const total = basket.items.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        // Retourne un lien de paiement mock
        return {
            id: `mock_payment_${checkoutSessionId}`,
            url: `/mock-payment?session=${checkoutSessionId}&total=${total}`,
            total: total,
        };
    }

    async handleWebhook(
    ): Promise<BasketPaid & { rawPayload: CheckoutSessionSuccessPayload }> {
        // Mock webhook handler - ne fait rien en mode développement
        console.log('Mock webhook handler called - Stripe webhooks disabled');
        
        // Retourne un objet mock conforme à l'interface
        throw new Error('Mock webhook handler: webhooks are disabled in development mode');
    }
}
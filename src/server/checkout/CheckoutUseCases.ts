import { CustomerRepository } from '../customer/CustomerRepository';
import { ICheckoutCreatePayload } from '../payment/CheckoutSession';
import { StockUseCases } from '../stock/StockUseCases';
import { BasketSessionFilters, CheckoutRepository } from './CheckoutRepository';
import { Basket } from './IBasket';
import { CheckoutSession } from './ICheckout';

export class CheckoutUseCases {
    constructor(
        private checkoutRepository: CheckoutRepository,
        private stockUseCases: StockUseCases,
        private customerRepository: CustomerRepository,
    ) {}

    public saveBasketSession = async (checkoutPayload: ICheckoutCreatePayload) => {
        const customer = await this.customerRepository.getMatchingCustomerOrCreate(checkoutPayload.contact);
        const basketToSave = Basket.fromCheckoutPayload(customer.id, checkoutPayload);
        const basketSaved = await this.checkoutRepository.createBasketSession(basketToSave);
        return {
            basket: basketSaved,
            customer,
        };
    };

    public getBasketSessions = async (filters?: BasketSessionFilters) => {
        return (await this.checkoutRepository.getBasketSessions(filters)).map((basket) => basket.toCommandToShow());
    };

    public getBasketSessionById = async (basketId: string) => {
        return await this.checkoutRepository.getBasketSessionById(basketId);
    };

    public createCheckoutSession = async (basket: Basket) => {
        const checkoutSessionToSave = CheckoutSession.newCheckoutSession(basket.id, basket.total);
        const checkoutSession = await this.checkoutRepository.saveCheckoutSession(checkoutSessionToSave);
        return checkoutSession;
    };

    public getCheckoutSessionById = this.checkoutRepository.getCheckoutSessionById;

    public handleSuccessfulPayment = async (checkoutSessionId: string, rawPayload: any) => {
        const checkoutSession = await this.checkoutRepository.getCheckoutSessionById(checkoutSessionId);

        if (!checkoutSession) {
            throw new Error('Checkout session not found');
        }

        await this.checkoutRepository.markCheckoutSessionAsPaid(checkoutSession.checkoutSession, rawPayload);

        await this.stockUseCases.updateStockAfterCheckout({
            checkoutSessionId,
            items: checkoutSession.basketSession.items.map((item) => ({
                variantId: item.productVariantId,
                quantity: item.quantity,
            })),
            reason: 'Checkout completed',
        });
    };

    public setDeliveryDate = async (basketId: string, deliveryDate: string) => {
        const basket = await this.checkoutRepository.getBasketById(basketId);
        basket.validateDeliveryStatus();
        return await this.checkoutRepository.setDeliveryDate(basketId, deliveryDate);
    };
}

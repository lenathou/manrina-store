import { INotificationManager } from '../pwa/INotificationManager';
import { ReqInfos } from '../service/BackendFetchService';
import { AdminUseCases } from './admin/AdminUseCases';
import { IAdminLoginPayload } from './admin/IAdmin';
import { CheckoutUseCases } from './checkout/CheckoutUseCases';
import { ICheckoutCreatePayload } from './payment/CheckoutSession';
import { PaymentUseCases } from './payment/PaymentUseCases';
import { ProductUseCases } from './product/ProductUseCases';
import { BrevoEmailNotificationService } from './services/NotificationService/BrevoEmailNotificationService';
import { StockUseCases } from './stock/StockUseCases';

export class ApiUseCases {
    constructor(
        private paymentUseCases: PaymentUseCases,
        private productUseCases: ProductUseCases,
        private stockUseCases: StockUseCases,
        private checkoutUseCases: CheckoutUseCases,
        private notificationManager: INotificationManager,
        private adminUseCases: AdminUseCases,
    ) {}

    // Admin methods
    public adminLogin = async (loginPayload: IAdminLoginPayload, { res }: ReqInfos) => {
        try {
            const jwt = await this.adminUseCases.login(loginPayload);
            res.setHeader('Set-Cookie', `adminToken=${jwt.jwt}; HttpOnly; Path=/; Max-Age=36000;`); // 10 hours
            return { success: true };
        } catch (error) {
            return { success: false, message: (error as Error).message };
        }
    };

    public adminLogout = ({ res }: ReqInfos) => {
        res.setHeader('Set-Cookie', 'adminToken=; HttpOnly; Path=/; Max-Age=0;');
        return { success: true };
    };

    public verifyAdminToken = ({ req }: ReqInfos) => {
        const token = req.cookies.adminToken;
        if (!token) return false;
        return this.adminUseCases.verifyToken(token);
    };

    public createCheckoutSession = async (checkoutCreatePayload: ICheckoutCreatePayload, checkoutStatusUrl: string) => {
        const { basket, customer } = await this.checkoutUseCases.saveBasketSession(checkoutCreatePayload);
        const checkoutSession = await this.checkoutUseCases.createCheckoutSession(basket);
        const { defaultTaxRate } = await this.paymentUseCases.getTaxRates();
        const basketWithVatRates = await this.productUseCases.addVatRateToBasket(basket, defaultTaxRate.taxId);
        const { paymentUrl } = await this.paymentUseCases.getPaymentLink(
            customer,
            basketWithVatRates,
            checkoutSession,
            checkoutStatusUrl,
        );

        return {
            basketId: basket.id,
            paymentUrl,
            checkoutSessionId: checkoutSession.id,
        };
    };
    public getCheckoutSessionById = this.checkoutUseCases.getCheckoutSessionById;

    public createProductsFromAirtable = this.productUseCases.createProductsFromAirtable;

    public getAllProductsWithStock = async () => {
        return await this.productUseCases.getAllProductsWithStock();
    };
    public getAllProducts = this.productUseCases.getAllProducts;

    public getDeliveryMethods = async () => {
        return await this.productUseCases.getDeliveryMethods();
    };

    public subscribeUser = this.notificationManager.subscribeUser;
    public unsubscribeUser = this.notificationManager.unsubscribeUser;
    public sendNotification = this.notificationManager.sendNotification;

    public adjustStock = this.stockUseCases.adjustStock;
    public getStockMovements = this.stockUseCases.getStockMovements;

    public getBasketSessions = this.checkoutUseCases.getBasketSessions;

    public updateVariant = this.productUseCases.updateVariant;

    public updateProduct = this.productUseCases.updateProduct;

    public getTaxRates = async () => {
        return await this.paymentUseCases.getTaxRates();
    };

    public markBasketAsDelivered = async (basketId: string) => {
        const deliveryDate = new Date().toISOString();
        await this.sendDeliveryEmail(basketId);
        return await this.checkoutUseCases.setDeliveryDate(basketId, deliveryDate);
    };

    public sendDeliveryEmail = async (basketId: string) => {
        const basket = await this.checkoutUseCases.getBasketSessionById(basketId);
        const emailNotificationService = new BrevoEmailNotificationService();
        return await emailNotificationService.sendEmail(
            basket.customer.email,
            'Livraison de votre commande manrina',
            `<html><body><h1>Votre commande a été livrée</h1>
<div>Vous pouvez venir la retirer</div>
<div>Adresse de livraison: ${basket.basket.address?.address}</div>
<div>Code postal: ${basket.basket.address?.postalCode}</div>
<div>Ville: ${basket.basket.address?.city}</div>
<p>Merci pour votre commande.</p>
<p>Cordialement,</p>
<p>L'équipe manrina</p>
</body></html>`,
        );
    };

    public validateBasketItems = async (items: { productId: string; variantId: string; quantity: number }[]) => {
        return await this.productUseCases.validateBasketItems(items);
    };
}

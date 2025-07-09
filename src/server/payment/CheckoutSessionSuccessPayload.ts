// STRIPE COMMENTED OUT - Type Stripe désactivé
// import stripeLib from 'stripe';

// STRIPE COMMENTED OUT - Utilisation d'un type mock au lieu du type Stripe
// export type CheckoutSessionSuccessPayload = stripeLib.Checkout.Session;
export type CheckoutSessionSuccessPayload = {
    id: string;
    status: string;
    payment_status: string;
    customer_email?: string;
    metadata?: Record<string, string>;
    created?: number;
    payment_method_types?: string[];
    amount_subtotal?: number;
    amount_total?: number;
    total_details?: {
        amount_tax?: number;
        amount_discount?: number;
    };
};

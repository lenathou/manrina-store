import { Prisma, PrismaClient } from '@prisma/client';
import { Customer } from '../customer/Customer';
import { CheckoutRepository } from './CheckoutRepository';
import { CheckoutSessionWithBasket } from './CheckoutSessionWithBasket';
import { Basket, IBasket, IBasketWithCheckoutSessions } from './IBasket';
import { CheckoutSession } from './ICheckout';

type PAYMENT_STATUSES = 'pending' | 'paid' | 'failed';

export class CheckoutRepositoryPrismaImplementation implements CheckoutRepository {
    constructor(private prisma: PrismaClient) {}

    public createBasketSession = async (basketSession: Basket): Promise<Basket> => {
        const basketSessionCreated = await this.prisma.basketSession.create({
            data: {
                id: basketSession.id,
                customer: { connect: { id: basketSession.customerId } },
                items: {
                    create: basketSession.items.map((item) => ({
                        name: item.name,
                        price: item.price,
                        productVariantId: item.productVariantId,
                        productId: item.productId,
                        quantity: item.quantity,
                        description: item.description,
                    })),
                },
                total: basketSession.total,
                paymentStatus: basketSession.paymentStatus,
                address: basketSession.address?.id
                    ? {
                          connectOrCreate: {
                              where: { id: basketSession.address.id },
                              create: {
                                  id: basketSession.address.id,
                                  postalCode: basketSession.address.postalCode,
                                  address: basketSession.address.address,
                                  city: basketSession.address.city,
                                  country: basketSession.address.country,
                                  name: basketSession.address.name || null,
                                  type: basketSession.address.type,
                              },
                          },
                      }
                    : basketSession.address
                      ? {
                            create: {
                                postalCode: basketSession.address.postalCode,
                                address: basketSession.address.address,
                                city: basketSession.address.city,
                                country: basketSession.address.country,
                                name: basketSession.address.name || null,
                                type: basketSession.address.type,
                                customer: { connect: { id: basketSession.customerId } },
                            },
                        }
                      : undefined,
                deliveryCost: basketSession.deliveryCost,
                deliveryDay: basketSession.deliveryDay,
                delivered: basketSession.delivered,
                retrieved: basketSession.retrieved,
                rawCustomer: basketSession.rawCustomer || undefined,
                deliveryMessage: basketSession.deliveryMessage,
            },
            include: {
                items: true,
                address: true,
            },
        });
        return new Basket(basketSessionCreated as IBasket);
    };

    public getBasketSessions = async (_filters?: {
        afterDate?: string;
        paid?: boolean;
        notDelivered?: boolean;
    }): Promise<IBasketWithCheckoutSessions[]> => {
        const filters = _filters || {};
        const basketSessions = await this.prisma.basketSession.findMany({
            where: {
                createdAt: filters.afterDate ? { gt: filters.afterDate } : Prisma.skip,
                paymentStatus: filters.paid ? 'paid' : Prisma.skip,
                delivered: filters.notDelivered ? null : Prisma.skip,
            },
            orderBy: {
                orderIndex: 'asc',
            },
            include: {
                items: true,
                address: true,
                checkoutSession: true,
                customer: true,
            },
        });
        return basketSessions.map(
            (basketSession) =>
                new IBasketWithCheckoutSessions(
                    new Basket(basketSession as IBasket),
                    basketSession.checkoutSession.map((checkoutSession) => new CheckoutSession(checkoutSession)),
                    new Customer(basketSession.customer),
                ),
        );
    };

    public getBasketSessionById = async (basketId: string): Promise<IBasketWithCheckoutSessions> => {
        const basketSession = await this.prisma.basketSession.findUniqueOrThrow({
            where: { id: basketId },
            include: {
                items: true,
                address: true,
                checkoutSession: true,
                customer: true,
            },
        });
        return new IBasketWithCheckoutSessions(
            new Basket(basketSession as IBasket),
            basketSession.checkoutSession.map((checkoutSession) => new CheckoutSession(checkoutSession)),
            new Customer(basketSession.customer),
        );
    };

    public getCheckoutSessionById = async (checkoutSessionId: string): Promise<CheckoutSessionWithBasket> => {
        const data = await this.prisma.checkoutSession.findUniqueOrThrow({
            where: { id: checkoutSessionId },
            include: {
                basketSession: {
                    include: { items: true, address: true },
                },
            },
        });
        const { basketSession, ...checkoutSession } = data;
        return {
            checkoutSession: new CheckoutSession(checkoutSession),
            basketSession: new Basket(basketSession as IBasket),
        };
    };

    public saveCheckoutSession = async ({
        successPayload,
        ...checkoutSession
    }: CheckoutSession): Promise<CheckoutSession> => {
        const checkoutSessionSaved = await this.prisma.checkoutSession.upsert({
            where: { id: checkoutSession.id },
            update: { ...checkoutSession },
            create: { ...checkoutSession },
            select: {
                id: true,
                basketSessionId: true,
                paymentAmount: true,
                paymentStatus: true,
                createdAt: true,
                updatedAt: true,
                successPayload: true,
            },
        });
        return new CheckoutSession(checkoutSessionSaved);
    };

    public markCheckoutSessionAsPaid = async (checkoutSession: CheckoutSession, rawPayload: Prisma.JsonObject) => {
        await this.prisma.checkoutSession.update({
            where: { id: checkoutSession.id },
            data: {
                paymentStatus: 'paid' as PAYMENT_STATUSES,
                basketSession: {
                    update: {
                        paymentStatus: 'paid' as PAYMENT_STATUSES,
                    },
                },
                successPayload: rawPayload,
            },
        });
    };

    public setDeliveryDate = async (basketId: string, deliveryDate: string): Promise<Basket> => {
        const updatedBasket = await this.prisma.basketSession.update({
            where: { id: basketId },
            data: {
                delivered: deliveryDate,
            },
            include: {
                items: true,
                address: true,
            },
        });
        return new Basket(updatedBasket as IBasket);
    };

    public getBasketById = async (basketId: string): Promise<Basket> => {
        const basket = await this.prisma.basketSession.findUnique({
            where: { id: basketId },
            include: {
                items: true,
                address: true,
            },
        });
        if (!basket) {
            throw new Error(`Basket with id ${basketId} not found`);
        }
        return new Basket(basket as IBasket);
    };
}

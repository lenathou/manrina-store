import { PrismaClient } from '@prisma/client';
import { Customer, CustomerCreatePayload } from './Customer';
import { CustomerRepository } from './CustomerRepository';

export class CustomerRepositoryPrismaImplementation implements CustomerRepository {
    constructor(private prisma: PrismaClient) {}

    private createCustomer = async (customer: Customer): Promise<Customer> => {
        const customerCreated = await this.prisma.customer.create({
            data: {
                id: customer.id,
                name: customer.name,
                email: customer.email,
                phone: customer.phone,
            },
        });
        return new Customer(customerCreated);
    };

    private getCustomerById = async (customerId: string): Promise<Customer> => {
        const customer = await this.prisma.customer.findUniqueOrThrow({
            where: { id: customerId },
        });
        return new Customer(customer);
    };

    private getCustomerByEmail = async (email: string): Promise<Customer> => {
        const customer = await this.prisma.customer.findUniqueOrThrow({
            where: { email },
        });
        return new Customer(customer);
    };

    public getMatchingCustomerOrCreate = async (customer: CustomerCreatePayload): Promise<Customer> => {
        try {
            const existingCustomer = await this.getCustomerByEmail(customer.email);
            return existingCustomer;
        } catch (error) {
            return this.createCustomer(Customer.createNew(customer));
        }
    };
}

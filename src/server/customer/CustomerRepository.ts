import { Customer, CustomerCreatePayload } from './Customer';

export interface CustomerRepository {
    // createCustomer: (customer: Customer) => Promise<Customer>;
    // getCustomerById: (customerId: string) => Promise<Customer>;
    // getCustomerByEmail: (email: string) => Promise<Customer>;
    getMatchingCustomerOrCreate: (customer: CustomerCreatePayload) => Promise<Customer>;
}

import { NotificationManager } from '../pwa/actions';
import { AirtableService } from '../service/airtable';
import { AirtableServiceMock } from '../service/airtable/mock';
import { FileSystemService } from '../service/FileSystemService';
import { AdminRepositoryPrismaImplementation } from './admin/AdminRepositoryPrismaImplementation';
import { AdminUseCases } from './admin/AdminUseCases';
import { ApiUseCases } from './ApiUseCases';
import { CheckoutRepositoryPrismaImplementation } from './checkout/CheckoutRepositoryPrismaImplementation';
import { CheckoutUseCases } from './checkout/CheckoutUseCases';
import { CustomerRepositoryPrismaImplementation } from './customer/CustomerRepositoryPrismaImplementation';
import { prisma } from './database/prisma';
import { PaymentUseCases } from './payment/PaymentUseCases';
// STRIPE COMMENTED OUT - Import et initialisation Stripe désactivés
// import { StripeServiceImplementation } from './payment/StripeServiceImplementation';
import { MockPaymentService } from './payment/MockPaymentService';
import { ProductHistoryRepositoryPrismaImplementation } from './product/ProductHistoryRepository';
import { ProductRepositoryPrismaImplementation } from './product/ProductRepositoryPrismaImplementation';
import { ProductUseCases } from './product/ProductUseCases';
import { JwtService } from './services/JwtService';
import { PasswordService } from './services/PasswordService';
import { StockRepositoryPrismaImplementation } from './stock/StockRepositoryPrismaImplementation';
import { StockUseCases } from './stock/StockUseCases';

// STRIPE COMMENTED OUT - Service Stripe désactivé, utilisation du service mock
// const stripeService = new StripeServiceImplementation(process.env.STRIPE_SECRET_KEY as string);
const stripeService = new MockPaymentService();

// Initialise le service Airtable en fonction de la variable d'environnement
const useMockData = process.env.USE_MOCK_DATA === 'true';
const airtableService = useMockData
    ? new AirtableServiceMock()
    : new AirtableService(process.env.AIRTABLE_TOKEN as string);

console.log(useMockData ? 'INFO: Using MOCK Airtable data.' : 'INFO: Using REAL Airtable data.');

const fileSystemService = new FileSystemService();

const productRepository = new ProductRepositoryPrismaImplementation(prisma);
const productHistoryRepository = new ProductHistoryRepositoryPrismaImplementation(prisma);
const productUseCases = new ProductUseCases(
    productRepository,
    productHistoryRepository,
    airtableService,
    fileSystemService,
);

const stockRepository = new StockRepositoryPrismaImplementation(prisma);
const checkoutRepository = new CheckoutRepositoryPrismaImplementation(prisma);
const stockUseCases = new StockUseCases(stockRepository);
const customerRepository = new CustomerRepositoryPrismaImplementation(prisma);
const checkoutUseCases = new CheckoutUseCases(checkoutRepository, stockUseCases, customerRepository);

export const paymentUseCases = new PaymentUseCases(stripeService, checkoutUseCases);
const notificationManager = new NotificationManager();

// Admin services and repositories
const jwtService = new JwtService();
const passwordService = new PasswordService();
const adminRepository = new AdminRepositoryPrismaImplementation(prisma, passwordService);
const adminUseCases = new AdminUseCases(adminRepository, jwtService);

export const apiUseCases = new ApiUseCases(
    paymentUseCases,
    productUseCases,
    stockUseCases,
    checkoutUseCases,
    notificationManager,
    adminUseCases,
);

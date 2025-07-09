import { useRouter } from 'next/router';
import { backendFetchService } from '../service/BackendFetchService';
import { ROUTES } from './routes';

export function useAppRouter() {
    const router = useRouter();

    const navigate = {
        to: (route: string) => router.push(route),

        // Product routes
        toHome: () => router.push(ROUTES.PRODUITS),
        toTaNouBio: () => router.push(ROUTES.TA_NOU_BIO),
        toNosPaniersBio: () => router.push(ROUTES.NOS_PANIERS_BIO),
        toNosPaniersManrina: () => router.push(ROUTES.NOS_PANIERS_MANRINA),
        toPanier: () => router.push(ROUTES.PANIER),
        toPaiement: () => router.push(ROUTES.PAIEMENT),
        toArticle: (productId: string) => router.push(ROUTES.ARTICLE(productId)),

        // Admin routes
        admin: {
            toLogin: () => router.push(ROUTES.ADMIN.LOGIN),
            toDashboard: () => router.push(ROUTES.ADMIN.DASHBOARD),
            toStock: () => router.push(ROUTES.ADMIN.STOCK),
            toCommandes: () => router.push(ROUTES.ADMIN.COMMANDES),
            logout: async () => {
                await backendFetchService.adminLogout();
                router.push(ROUTES.ADMIN.LOGIN);
            },
        },
    };

    return {
        ...router,
        navigate,
        currentRoute: router.pathname,
        isAdminRoute: router.pathname.startsWith('/admin'),
    };
} 
export const ROUTES = {
    PRODUITS: '/',
    TA_NOU_BIO: '/?category=Ta+Nou+Bio',
    NOS_PANIERS_BIO: '/?category=Nos+Paniers+Bio',
    NOS_PANIERS_MANRINA: '/?category=Nos+Paniers+Manrina',
    PANIER: '/panier',
    PAIEMENT: '/payment',
    ARTICLE: (productId: string) => `/article/${productId}`,
    ADMIN: {
        LOGIN: '/admin/login',
        DASHBOARD: '/admin/dashboard',
        STOCK: '/admin/stock',
        COMMANDES: '/admin/commandes',
    },
} as const;

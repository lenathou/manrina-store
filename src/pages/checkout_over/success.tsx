import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BasketValidated } from '../../components/icons/BasketValidated';
import { PageContainer } from '../../components/products/PageContainer';
import { useAppContext } from '../../context/AppContext';
import { isCheckoutSessionPaid } from '../../server/checkout/ICheckout';
import { backendFetchService } from '../../service/BackendFetchService';
import { checkoutSessionService } from '../../service/CheckoutSessionService';

const useCheckoutSession = () => {
    const router = useRouter();
    const appContext = useAppContext();
    const { checkoutId } = router.query;
    const { data, isLoading } = useQuery({
        queryKey: ['checkoutSession'],
        queryFn: () => backendFetchService.getCheckoutSessionById(checkoutId as string),
        enabled: !!checkoutId,
        refetchInterval: (query) => {
            return query.state.data && isCheckoutSessionPaid(query.state.data.checkoutSession)
                ? false
                : query.state.error
                  ? 20000
                  : 5000;
        },
    });
    useEffect(() => {
        if (data?.checkoutSession.paymentStatus === 'paid') {
            const { shouldEraseBasket } = checkoutSessionService.markCheckoutSessionAsPaid(checkoutId as string);
            if (shouldEraseBasket) {
                appContext.resetBasketStorage();
            }
        }
    }, [data?.checkoutSession.paymentStatus]);
    return { checkoutSession: data, isLoading };
};

export default function HomeSuccessPage() {
    useCheckoutSession();
    return (
        <PageContainer>
            <View style={styles.body}>
                <View style={{ margin: 10, marginTop: '15vh', gap: 10 }}>
                    <View style={styles.roundBackground}>
                        <BasketValidated
                            width={120}
                            height={120}
                        />
                    </View>
                    <Text
                        style={{
                            fontSize: 20,
                            margin: 'auto',
                            color: '#333',
                            textAlign: 'center',
                            lineHeight: 30,
                        }}
                    >
                        Votre paiement a bien été validé.
                        <br /> Nous vous avons envoyé un email récapitulatif avec les détails de votre commande.
                    </Text>
                </View>
            </View>
        </PageContainer>
    );
}

const styles = StyleSheet.create({
    body: {
        flex: 1,
    },
    roundBackground: {
        margin: 'auto',
        height: 200,
        width: 200,
        borderRadius: '100%',
        backgroundColor: '#cccccc',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

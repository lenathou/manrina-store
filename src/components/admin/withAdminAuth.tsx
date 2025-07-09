import { ComponentType, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ROUTES } from '../../router/routes';
import { useAppRouter } from '../../router/useAppRouter';
import { backendFetchService } from '../../service/BackendFetchService';
import { colorUsages, common } from '../../theme';

export function withAdminAuth<P extends object>(WrappedComponent: ComponentType<P>) {
    return function WithAdminAuthComponent(props: P) {
        const { navigate, currentRoute } = useAppRouter();
        const [isLoading, setIsLoading] = useState(true);

        useEffect(() => {
            const checkAuth = async () => {
                try {
                    const isValid = await backendFetchService.verifyAdminToken();
                    
                    if (!isValid) {
                        throw new Error('Not authenticated');
                    }

                    setIsLoading(false);
                } catch (error) {
                    navigate.admin.toLogin();
                }
            };

            // Skip auth check on login page
            if (currentRoute !== ROUTES.ADMIN.LOGIN) {
                checkAuth();
            } else {
                setIsLoading(false);
            }
        }, [currentRoute, navigate]);

        if (isLoading && currentRoute !== ROUTES.ADMIN.LOGIN) {
            return (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading...</Text>
                </View>
            );
        }

        return <WrappedComponent {...props} />;
    };
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colorUsages.background,
    },
    loadingText: {
        ...common.text.text,
        color: colorUsages.primary,
    },
});

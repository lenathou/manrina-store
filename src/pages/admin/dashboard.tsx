import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { withAdminAuth } from '../../components/admin/withAdminAuth';
import { useAppRouter } from '../../router/useAppRouter';
import { colorUsages, common, variables } from '../../theme';

function AdminDashboard() {
    const { navigate } = useAppRouter();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Admin Dashboard</Text>
                <TouchableOpacity 
                    style={styles.logoutButton}
                    onPress={navigate.admin.logout}
                >
                    <Text style={styles.buttonText}>Logout</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.content}>
                <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={navigate.admin.toStock}
                >
                    <Text style={styles.menuText}>Stock Management</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.menuItem}
                    onPress={navigate.admin.toCommandes}
                >
                    <Text style={styles.menuText}>Orders Management</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: variables.spaceXL,
        backgroundColor: colorUsages.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: variables.spaceXL,
    },
    title: {
        ...common.text.h1HighlightInfo,
    },
    content: {
        gap: variables.spaceBig,
    },
    menuItem: {
        backgroundColor: colorUsages.white,
        padding: variables.spaceBig,
        borderRadius: 8,
        shadowColor: colorUsages.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    menuText: {
        ...common.text.h2Title,
        color: colorUsages.primary,
    },
    logoutButton: {
        backgroundColor: colorUsages.secondary,
        padding: variables.space,
        borderRadius: 4,
    },
    buttonText: {
        ...common.text.text,
        color: colorUsages.white,
    },
});

export default withAdminAuth(AdminDashboard); 
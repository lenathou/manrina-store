import { ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { palette, typography, variables } from '../theme';

interface Props {
    label: string;
    loading?: boolean;
    action?: () => void;
    btnStyle?: ViewStyle;
    labelStyle?: TextStyle;
    disable?: boolean;
}

export const AppButton = ({ label, action, loading, btnStyle, labelStyle, disable }: Props): JSX.Element => {
    return (
        <TouchableOpacity
            style={[styles.container, btnStyle, { opacity: disable ? 0.5 : 1 }]}
            onPress={action}
            disabled={disable || loading}
        >
            {loading ? (
                <ActivityIndicator
                    animating={true}
                    color="white"
                    size="small"
                />
            ) : (
                <Text style={[styles.label, labelStyle]}>{label}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        minHeight: 50,
        backgroundColor: palette.primary,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 4,
        borderRadius: variables.smallRadius,
    },
    label: {
        marginTop: 9,
        marginBottom: 10,
        fontSize: 24,
        lineHeight: 25,
        paddingTop: 5,
        fontFamily: typography.redgar,
        color: palette.white,
        textAlignVertical: 'center',
        textAlign: 'center',
    },
});

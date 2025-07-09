import { Control, useController } from 'react-hook-form';
import { InputModeOptions, KeyboardTypeOptions, StyleSheet, Text, TextInput } from 'react-native';

export type TextFormField = {
    type: 'text' | 'password';
    placeholder: string;
    name: string;
    required?: boolean;
    inputType?: KeyboardTypeOptions;
    inputMode?: InputModeOptions;
};
export const Input = ({
    placeholder,
    name,
    control,
    required,
    type,
    onSubmitEditing,
    inputType,
    inputMode,
}: TextFormField & {
    control: Control;
    onSubmitEditing?: () => void;
}) => {
    const { field, fieldState } = useController({
        control,
        defaultValue: '',
        name,
        rules: {
            required: required ? 'Ce champ est requis' : false,
            pattern:
                inputMode === 'email'
                    ? {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Format d'email invalide",
                      }
                    : undefined,
        },
    });
    const hasError = !!fieldState.error;
    return (
        <>
            {hasError && <Text style={styles.inputErrorText}>{fieldState.error?.message}</Text>}
            <TextInput
                placeholder={placeholder}
                style={[styles.input, hasError && styles.inputError]}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                onSubmitEditing={onSubmitEditing}
                secureTextEntry={type === 'password'}
                keyboardType={inputType}
                inputMode={inputMode}
            />
        </>
    );
};

export const styles = StyleSheet.create({
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
        fontSize: 16,
        width: '100%',
    },
    inputError: {
        borderColor: 'red',
    },
    inputErrorText: {
        color: 'red',
    },
});

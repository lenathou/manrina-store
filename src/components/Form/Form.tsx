import { Control, useForm } from 'react-hook-form';
import { View } from 'react-native';
import { AppButton } from '../button';
import { Input, TextFormField } from './Input';

export type FormField = TextFormField;
const ComponentByType = {
    text: Input,
    password: Input,
};

export const Form = <DataToSubmit extends Record<string, any>>({
    formFields,
    submitLabel,
    onSubmit,
    isDisabled,
}: {
    formFields: FormField[];
    submitLabel: string;
    isDisabled?: boolean;
    onSubmit: (data: DataToSubmit) => void;
}) => {
    const { control, handleSubmit, formState } = useForm<DataToSubmit>({ mode: 'onBlur' });
    const isFormValid = formState.isDirty && formState.isValid;
    return (
        <View>
            {formFields.map((field) => {
                const Component = ComponentByType[field.type];
                if (!Component) {
                    return null;
                }
                return (
                    <Component
                        key={field.name}
                        {...field}
                        control={control as Control}
                        onSubmitEditing={handleSubmit(onSubmit)}
                    />
                );
            })}
            <AppButton
                label={submitLabel}
                // color="#666"
                action={handleSubmit(onSubmit)}
                disable={isDisabled || !isFormValid}
            />
        </View>
    );
};

import { cn } from "@/lib/utils";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { useId } from "react";

type InputFieldProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  placeholder: string;
  type?: string;
  className?: string;
  icon?: React.ReactNode;
  description?: string;
} & React.ComponentProps<typeof Input>;

export default function InputField<T extends FieldValues>({
  name,
  control,
  label,
  type = "text",
  placeholder,
  className,
  icon,
  description,
  ...props
}: InputFieldProps<T>) {
  const generatedId = useId();
  const errorId = `${generatedId}-error`;

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <Field
          data-invalid={fieldState.invalid}
          className="relative w-full min-w-37.5"
        >
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          <div className="relative">
            {icon}
            <Input
              {...field}
              id={field.name}
              aria-invalid={fieldState.invalid}
              aria-describedby={fieldState.invalid ? errorId : undefined}
              placeholder={placeholder || label}
              type={type}
              className={cn("h-10 rounded-md w-full ", className)}
              {...props}
            />
          </div>

          <FieldDescription>{description}</FieldDescription>

          {fieldState.invalid && (
            <FieldError id={errorId} errors={[fieldState.error]} />
          )}
        </Field>
      )}
    />
  );
}

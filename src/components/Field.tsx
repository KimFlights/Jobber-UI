import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

interface BaseProps {
  label: string;
  hint?: ReactNode;
}

/** Labelled single-line input. */
export function Field({
  label,
  hint,
  id,
  ...rest
}: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="field" htmlFor={inputId}>
      <span className="field__label">{label}</span>
      <input id={inputId} className="field__control" {...rest} />
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  );
}

/** Labelled multi-line textarea. */
export function TextAreaField({
  label,
  hint,
  id,
  ...rest
}: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
  return (
    <label className="field" htmlFor={inputId}>
      <span className="field__label">{label}</span>
      <textarea id={inputId} className="field__control field__control--area" {...rest} />
      {hint && <span className="field__hint">{hint}</span>}
    </label>
  );
}

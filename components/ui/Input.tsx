import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label:    string
  error?:   string
  hint?:    string
}

export function Input({ label, error, hint, id, required, className = '', ...props }: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-masala-800">
        {label}
        {required && <span className="text-chili-600 ml-1" aria-hidden="true">*</span>}
      </label>
      <input
        id={inputId}
        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
        aria-invalid={!!error}
        required={required}
        className={`
          h-10 w-full border rounded-xl px-4 bg-white text-masala-900
          placeholder:text-masala-400 text-sm
          transition-all duration-150
          focus:outline-none focus:ring-2 focus:ring-saffron-400/50 focus:border-saffron-500
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error
            ? 'border-chili-600 ring-1 ring-chili-500/30'
            : 'border-masala-200 hover:border-masala-400'
          }
          ${className}
        `}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-chili-600" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={`${inputId}-hint`} className="text-xs text-masala-600">
          {hint}
        </p>
      )}
    </div>
  )
}

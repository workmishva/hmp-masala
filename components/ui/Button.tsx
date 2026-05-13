'use client'

import { Loader2 } from 'lucide-react'
import type { ButtonHTMLAttributes } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
type ButtonSize    = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant
  size?:     ButtonSize
  loading?:  boolean
  children:  React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:   'bg-chili-600 text-white shadow-md hover:bg-chili-700 active:scale-[0.97]',
  secondary: 'border border-saffron-500 text-saffron-600 bg-transparent hover:bg-saffron-50 active:scale-[0.97]',
  danger:    'bg-chili-600 text-white hover:bg-chili-700 active:scale-[0.97]',
  ghost:     'text-masala-800 hover:bg-masala-100 active:scale-[0.97]',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8  px-3 text-sm  rounded-lg',
  md: 'h-10 px-5 text-base rounded-xl',
  lg: 'h-12 px-8 text-lg  rounded-xl',
}

export function Button({
  variant  = 'primary',
  size     = 'md',
  loading  = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-all duration-150 cursor-pointer
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-chili-600
        disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
        min-w-[7.5rem]
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  )
}

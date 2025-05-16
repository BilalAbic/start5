'use client';

import { FiAlertCircle } from 'react-icons/fi';

interface AuthInputProps {
  id: string;
  type: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
}

export default function AuthInput({
  id,
  type,
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  autoComplete,
  autoFocus = false,
}: AuthInputProps) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-200"
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        required={required}
        placeholder={placeholder}
        className={`w-full px-3 py-2 bg-gray-800 border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
          error ? 'border-red-500' : 'border-gray-700'
        }`}
      />
      {error && (
        <p className="text-sm text-red-400 flex items-center">
          <FiAlertCircle className="mr-1" />
          {error}
        </p>
      )}
    </div>
  );
} 
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthInput from '@/components/auth/AuthInput';
import AuthLayout from '@/components/auth/AuthLayout';
import { FiLogIn, FiLoader } from 'react-icons/fi';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [toast, setToast] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Kullanıcı zaten giriş yapmışsa dashboard'a yönlendir
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/user');
        const data = await response.json();

        if (response.ok && data.user) {
          setIsAuthenticated(true);
          router.push('/dashboard');
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      }
    };

    checkAuthStatus();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Clear error when user types
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
    
    setFormError(null);
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email adresi gerekli';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir email adresi giriniz';
    }
    
    if (!formData.password) {
      newErrors.password = 'Şifre gerekli';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include' // Cookie'lerin gönderilmesini sağlar
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Giriş işlemi başarısız');
      }
      
      // Başarılı giriş
      setToast({
        type: 'success',
        message: 'Giriş başarılı! Yönlendiriliyorsunuz...'
      });
      
      // Kısa bir gecikme ile yönlendirme yap
      setTimeout(() => {
        // Router cache'i temizleyerek yönlendirme yap
        router.refresh(); // Router'ı yenile
        window.location.href = '/dashboard'; // Fallback yönlendirme
      }, 1000);
      
    } catch (error) {
      console.error('Login error:', error);
      setFormError(error instanceof Error ? error.message : 'Bir hata oluştu');
      setToast({
        type: 'error',
        message: error instanceof Error ? error.message : 'Giriş işlemi başarısız'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout 
      isLoading={isAuthenticated === null} 
      toast={toast} 
      onCloseToast={() => setToast(null)}
    >
      <div>
        <h1 className="text-center text-2xl font-bold text-white">Start5'e Giriş Yap</h1>
        <p className="mt-2 text-center text-sm text-gray-400">
          Projenize devam etmek için giriş yapın
        </p>
      </div>
      
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <AuthInput
            id="email"
            type="email"
            label="Email Adresi"
            value={formData.email}
            onChange={handleChange}
            placeholder="email@adresiniz.com"
            error={errors.email}
            required
            autoComplete="email"
            autoFocus
          />
          
          <AuthInput
            id="password"
            type="password"
            label="Şifre"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            required
            autoComplete="current-password"
          />
        </div>
        
        {formError && (
          <div className="p-3 bg-red-500/20 border border-red-500 text-red-400 rounded-md text-sm">
            {formError}
          </div>
        )}
        
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
              isSubmitting
                ? 'bg-blue-700 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isSubmitting ? (
              <>
                <FiLoader className="animate-spin -ml-1 mr-2 h-5 w-5" />
                Giriş Yapılıyor...
              </>
            ) : (
              <>
                <FiLogIn className="-ml-1 mr-2 h-5 w-5" />
                Giriş Yap
              </>
            )}
          </button>
        </div>
      </form>
      
      <div className="text-center mt-4">
        <p className="text-sm text-gray-400">
          Hesabınız yok mu?{' '}
          <Link href="/register" className="font-medium text-blue-500 hover:text-blue-400">
            Kayıt ol
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
} 
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User } from '@prisma/client';
import { toast } from 'react-hot-toast';

// Define a custom User type with optional fields
interface UserData extends Partial<User> {
  id?: string;
  userId?: string;
  username?: string;
  profileImage?: string;
  usernameLastChanged?: Date | null;
  createdAt?: Date;
}

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

export default function ClientAccountPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    profileImage: '',
    username: '',
    bio: '',
    website: '',
    github: '',
    twitter: '',
  });
  const [usernameData, setUsernameData] = useState({
    username: '',
    lastChanged: null as Date | null,
    canChange: true,
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const router = useRouter();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/user', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store'
        });
        
        if (!res.ok) {
          console.log('Authentication check failed, redirecting to login');
          router.push('/login');
          return false;
        }
        
        const data = await res.json();
        return data.authenticated;
      } catch (error) {
        console.error('Auth check error:', error);
        router.push('/login');
        return false;
      }
    };
    
    checkAuth();
  }, [router]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // First try to get detailed profile data
        console.log('Attempting to fetch profile data...');
        const profileRes = await fetch('/api/auth/profile', {
          method: 'GET',
          credentials: 'include', // Important to include cookies for authentication
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store' // Prevent caching to always get fresh data
        });
        
        console.log('Profile fetch response status:', profileRes.status);
        
        if (!profileRes.ok) {
          console.log('Profile fetch failed, status:', profileRes.status);
          
          // Fall back to basic user data
          console.log('Falling back to user API...');
          const res = await fetch('/api/auth/user', {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'no-store'
          });
          
          console.log('User API response status:', res.status);
          
          if (!res.ok) {
            console.log('User fetch failed, status:', res.status);
            throw new Error('Failed to fetch user data');
          }
          
          const data = await res.json();
          console.log('User API response data:', data);
          
          if (!data.user) {
            throw new Error('User data not found');
          }
          
          setUser(data.user);
          setFormData({
            email: data.user.email || '',
            firstName: data.user.firstName || '',
            lastName: data.user.lastName || '',
            profileImage: data.user.profileImage || '',
            username: data.user.username || '',
            bio: data.user.bio || '',
            website: data.user.website || '',
            github: data.user.github || '',
            twitter: data.user.twitter || '',
          });
          
          // Username değişim durumu kontrolü
          setUsernameData({
            username: data.user.username || '',
            lastChanged: data.user.usernameLastChanged ? new Date(data.user.usernameLastChanged) : null,
            canChange: !data.user.usernameLastChanged || 
              (new Date().getTime() - new Date(data.user.usernameLastChanged).getTime() > 365 * 24 * 60 * 60 * 1000)
          });
        } else {
          // Use detailed profile data
          const profileData = await profileRes.json();
          console.log('Profile API response data:', profileData);
          
          if (!profileData.user) {
            throw new Error('Profile data not found');
          }
          
          const userData = profileData.user;
          setUser(userData);
          setFormData({
            email: userData.email || '',
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            profileImage: userData.profileImage || '',
            username: userData.username || '',
            bio: userData.bio || '',
            website: userData.website || '',
            github: userData.github || '',
            twitter: userData.twitter || '',
          });
          
          // Username değişim durumu kontrolü
          setUsernameData({
            username: userData.username || '',
            lastChanged: userData.usernameLastChanged ? new Date(userData.usernameLastChanged) : null,
            canChange: !userData.usernameLastChanged || 
              (new Date().getTime() - new Date(userData.usernameLastChanged).getTime() > 365 * 24 * 60 * 60 * 1000)
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setMessage({
          type: 'error',
          text: 'Kullanıcı bilgileri yüklenemedi. Lütfen tekrar deneyin.',
        });
        toast.error('Kullanıcı bilgileri yüklenemedi');
        
        // If we can't fetch user data, redirect to login
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle username input changes
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setUsernameData((prev) => ({ ...prev, username: value }));
  };

  // Handle password form input changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Lütfen geçerli bir resim dosyası seçin.' });
        toast.error('Lütfen geçerli bir resim dosyası seçin');
        return;
      }
      
      // 4MB size limit
      if (file.size > 4 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Resim dosyası 4MB\'den küçük olmalıdır.' });
        toast.error('Resim dosyası 4MB\'den küçük olmalıdır');
        return;
      }
      
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Update profile information
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      // Upload image if selected
      let imageUrl = formData.profileImage;
      if (imageFile) {
        const uploadData = new FormData();
        uploadData.append('file', imageFile);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          credentials: 'include',
          body: uploadData,
        });
        
        if (!uploadRes.ok) {
          const errorData = await uploadRes.json().catch(() => ({ error: 'Profil resmi yüklenemedi' }));
          throw new Error(errorData.error || 'Profil resmi yüklenemedi');
        }
        
        const uploadJson = await uploadRes.json();
        imageUrl = uploadJson.url;
      }

      // Update user profile
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          profileImage: imageUrl,
          bio: formData.bio,
          website: formData.website,
          github: formData.github,
          twitter: formData.twitter,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Profil güncellenemedi' }));
        throw new Error(errorData.error || 'Profil güncellenemedi');
      }

      const data = await res.json();
      setUser(data.user);
      setMessage({
        type: 'success',
        text: 'Profil bilgileriniz başarıyla güncellendi.',
      });
      toast.success('Profil bilgileriniz güncellendi');
      
      // Update form data with new values
      setFormData({
        ...formData,
        email: data.user.email || '',
        firstName: data.user.firstName || '',
        lastName: data.user.lastName || '',
        profileImage: data.user.profileImage || '',
        username: data.user.username || '',
        bio: data.user.bio || '',
        website: data.user.website || '',
        github: data.user.github || '',
        twitter: data.user.twitter || '',
      });
      
      // Clear image preview
      setImagePreview(null);
      setImageFile(null);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Profil güncellenirken bir hata oluştu.',
      });
      toast.error(error.message || 'Profil güncellenirken bir hata oluştu');
    } finally {
      setUpdating(false);
    }
  };

  // Update username
  const handleUsernameUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate username
    if (!usernameData.username.trim()) {
      setMessage({ type: 'error', text: 'Kullanıcı adı boş olamaz.' });
      toast.error('Kullanıcı adı boş olamaz');
      return;
    }
    
    if (usernameData.username.length < 3 || usernameData.username.length > 16) {
      setMessage({ 
        type: 'error', 
        text: 'Kullanıcı adı 3-16 karakter arasında olmalıdır.' 
      });
      toast.error('Kullanıcı adı 3-16 karakter arasında olmalıdır');
      return;
    }
    
    if (!/^[a-z0-9_-]+$/.test(usernameData.username)) {
      setMessage({ 
        type: 'error', 
        text: 'Kullanıcı adı sadece küçük harf, rakam, tire ve alt çizgi içerebilir.' 
      });
      toast.error('Kullanıcı adı sadece küçük harf, rakam, tire ve alt çizgi içerebilir');
      return;
    }
    
    if (!usernameData.canChange) {
      setMessage({ 
        type: 'error', 
        text: 'Kullanıcı adınızı yılda en fazla bir kez değiştirebilirsiniz.' 
      });
      toast.error('Kullanıcı adınızı yılda en fazla bir kez değiştirebilirsiniz');
      return;
    }
    
    setUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/auth/profile/username', {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: usernameData.username,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Kullanıcı adı güncellenemedi' }));
        throw new Error(errorData.error || 'Kullanıcı adı güncellenemedi');
      }

      const data = await res.json();
      setUser((prev) => prev ? { ...prev, username: data.username } : null);
      setFormData((prev) => ({ ...prev, username: data.username }));
      setUsernameData({
        username: data.username,
        lastChanged: new Date(),
        canChange: false,
      });
      
      setMessage({
        type: 'success',
        text: 'Kullanıcı adınız başarıyla güncellendi.',
      });
      toast.success('Kullanıcı adınız güncellendi');
    } catch (error: any) {
      console.error('Error updating username:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Kullanıcı adı güncellenirken bir hata oluştu.',
      });
      toast.error(error.message || 'Kullanıcı adı güncellenirken bir hata oluştu');
    } finally {
      setUpdating(false);
    }
  };

  // Update password
  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    setMessage({ type: '', text: '' });

    // Validate passwords
    if (!passwordData.currentPassword) {
      setMessage({
        type: 'error',
        text: 'Mevcut şifrenizi girmelisiniz.',
      });
      toast.error('Mevcut şifrenizi girmelisiniz');
      setUpdating(false);
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setMessage({
        type: 'error',
        text: 'Yeni şifre en az 8 karakter olmalıdır.',
      });
      toast.error('Yeni şifre en az 8 karakter olmalıdır');
      setUpdating(false);
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Yeni şifreler eşleşmiyor.',
      });
      toast.error('Yeni şifreler eşleşmiyor');
      setUpdating(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Şifre değiştirilemedi' }));
        throw new Error(errorData.error || 'Şifre değiştirilemedi');
      }

      setMessage({
        type: 'success',
        text: 'Şifreniz başarıyla güncellendi. Lütfen tekrar giriş yapın.',
      });
      toast.success('Şifreniz güncellendi, tekrar giriş yapın');
      
      // Clear password form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // Redirect to login after a delay
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error: any) {
      console.error('Error changing password:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Şifre değiştirilirken bir hata oluştu.',
      });
      toast.error(error.message || 'Şifre değiştirilirken bir hata oluştu');
    } finally {
      setUpdating(false);
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    if (!window.confirm('Hesabınızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    setUpdating(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Hesap silinemedi');
      }

      setMessage({
        type: 'success',
        text: 'Hesabınız başarıyla silindi. Ana sayfaya yönlendiriliyorsunuz.',
      });
      toast.success('Hesabınız silindi');
      
      // Redirect to home after a delay
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error: any) {
      console.error('Error deleting account:', error);
      setMessage({
        type: 'error',
        text: error.message || 'Hesap silinirken bir hata oluştu.',
      });
      toast.error(error.message || 'Hesap silinirken bir hata oluştu');
    } finally {
      setUpdating(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Hesap</h1>
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Hesap Ayarları</h1>
        
        {message.text && (
          <div className={`p-4 mb-6 rounded-lg ${
            message.type === 'error' ? 'bg-red-900/50 text-red-200' : 'bg-green-900/50 text-green-200'
          }`}>
            {message.text}
          </div>
        )}
        
        {/* User Info Summary */}
        <div className="bg-gray-800/50 p-6 rounded-lg shadow-lg mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
              {formData.profileImage ? (
                <Image
                  src={formData.profileImage}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No Image
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{formData.firstName} {formData.lastName}</h2>
              <p className="text-blue-400">@{formData.username}</p>
              <p className="text-gray-400">{formData.email}</p>
              {user?.createdAt && (
                <p className="text-gray-400 text-sm mt-1">
                  Üyelik: {new Date(user.createdAt as any).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Profile Information */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Profil Bilgileri</h2>
          
          <form onSubmit={handleProfileUpdate}>
            <div className="space-y-6">
              {/* Profile Image */}
              <div>
                <label className="block text-gray-300 mb-2">Profil Fotoğrafı</label>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-700">
                    {(imagePreview || formData.profileImage) ? (
                      <Image
                        src={imagePreview || formData.profileImage || ''}
                        alt="Profile"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        No Image
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-400 cursor-pointer py-2 px-4 bg-blue-900/30 rounded-md">
                      <span>Fotoğraf Seç</span>
                      <input
                        type="file"
                        name="profileImage"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                      />
                    </label>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setImageFile(null);
                        }}
                        className="mt-2 text-sm text-red-400"
                      >
                        Seçimi İptal Et
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-gray-300 mb-1">
                  E-posta
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white"
                  disabled
                />
                <p className="text-xs text-gray-400 mt-1">E-posta adresinizi değiştiremezsiniz.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block text-gray-300 mb-1">
                    Ad
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white"
                  />
                </div>
                
                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block text-gray-300 mb-1">
                    Soyad
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white"
                  />
                </div>
              </div>
              
              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-gray-300 mb-1">
                  Hakkımda
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white min-h-[100px]"
                  placeholder="Kendiniz hakkında kısa bilgi..."
                  maxLength={300}
                />
              </div>
              
              {/* Social Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Sosyal Medya</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Website */}
                  <div>
                    <label htmlFor="website" className="block text-gray-300 mb-1">
                      Web Sitesi
                    </label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white"
                      placeholder="https://example.com"
                    />
                  </div>
                  
                  {/* GitHub */}
                  <div>
                    <label htmlFor="github" className="block text-gray-300 mb-1">
                      GitHub
                    </label>
                    <input
                      type="text"
                      id="github"
                      name="github"
                      value={formData.github}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white"
                      placeholder="username"
                    />
                  </div>
                  
                  {/* Twitter */}
                  <div>
                    <label htmlFor="twitter" className="block text-gray-300 mb-1">
                      Twitter
                    </label>
                    <input
                      type="text"
                      id="twitter"
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleInputChange}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white"
                      placeholder="username"
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                  disabled={updating}
                >
                  {updating ? 
                    <span className="flex items-center">
                      <span className="animate-spin h-4 w-4 mr-2 border-2 border-white rounded-full border-t-transparent"></span>
                      Güncelleniyor...
                    </span> : 
                    'Bilgilerimi Güncelle'
                  }
                </button>
              </div>
            </div>
          </form>
        </div>
        
        {/* Username Change */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Kullanıcı Adını Değiştir</h2>
          
          <form onSubmit={handleUsernameUpdate}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={usernameData.username}
                onChange={handleUsernameChange}
                disabled={!usernameData.canChange || updating}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-sm text-gray-400">
                Kullanıcı adı 3-16 karakter arasında olmalı ve sadece küçük harf, rakam, tire ve alt çizgi içerebilir.
              </p>
              {usernameData.lastChanged && (
                <p className="mt-2 text-xs text-gray-400">
                  Son değişiklik: {usernameData.lastChanged.toLocaleDateString()}
                  {!usernameData.canChange && ' - Kullanıcı adınızı yılda bir kez değiştirebilirsiniz.'}
                </p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={!usernameData.canChange || updating}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                !usernameData.canChange || updating 
                  ? 'bg-gray-600 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 transition-colors'
              }`}
            >
              {updating ? 
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-white rounded-full border-t-transparent"></span>
                  Güncelleniyor...
                </span> : 
                'Kullanıcı Adını Güncelle'
              }
            </button>
          </form>
        </div>
        
        {/* Password Change */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Şifre Değiştir</h2>
          
          <form onSubmit={handlePasswordUpdate}>
            <div className="space-y-6">
              {/* Current Password */}
              <div>
                <label htmlFor="currentPassword" className="block text-gray-300 mb-1">
                  Mevcut Şifre
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white"
                  required
                />
              </div>
              
              {/* New Password */}
              <div>
                <label htmlFor="newPassword" className="block text-gray-300 mb-1">
                  Yeni Şifre
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white"
                  required
                  minLength={8}
                />
                <p className="text-xs text-gray-400 mt-1">Şifreniz en az 8 karakter olmalıdır.</p>
              </div>
              
              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-gray-300 mb-1">
                  Yeni Şifre (Tekrar)
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 text-white"
                  required
                />
              </div>
              
              <div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                  disabled={updating}
                >
                  {updating ? 
                    <span className="flex items-center">
                      <span className="animate-spin h-4 w-4 mr-2 border-2 border-white rounded-full border-t-transparent"></span>
                      Güncelleniyor...
                    </span> : 
                    'Şifremi Değiştir'
                  }
                </button>
              </div>
            </div>
          </form>
        </div>
        
        {/* Delete Account */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Hesabımı Sil</h2>
          <p className="text-gray-300 mb-4">
            Hesabınızı sildiğinizde, tüm verileriniz kalıcı olarak silinecektir.
            Bu işlem geri alınamaz.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors"
            disabled={updating}
          >
            {updating ? 
              <span className="flex items-center">
                <span className="animate-spin h-4 w-4 mr-2 border-2 border-white rounded-full border-t-transparent"></span>
                İşleniyor...
              </span> : 
              'Hesabımı Kalıcı Olarak Sil'
            }
          </button>
          <p className="text-yellow-400 text-sm mt-2">
            Not: Hesap silme özelliği bakım nedeniyle geçici olarak devre dışı bırakılmış olabilir.
          </p>
        </div>
      </div>
    </div>
  );
} 
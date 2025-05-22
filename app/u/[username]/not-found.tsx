import React from 'react';
import Link from 'next/link';
import { FaSearch, FaHome, FaCompass } from 'react-icons/fa';

export default function UserNotFound() {
  return (
    <div className="container mx-auto px-4 py-12 md:py-16">
      <div className="max-w-md mx-auto bg-gradient-to-b from-gray-900 to-gray-950 rounded-lg overflow-hidden shadow-lg border border-gray-700 p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-900/30 text-indigo-400 rounded-full mb-6">
          <FaSearch size={32} className="animate-pulse" />
        </div>
        
        <h1 className="text-2xl font-bold text-white mb-3">Kullanıcı Bulunamadı</h1>
        
        <p className="text-gray-300 mb-6">
          Aradığınız kullanıcı bulunamadı veya henüz kaydolmamış olabilir.
        </p>
        
        <hr className="border-gray-700/50 my-6" />
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/explore" 
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <FaCompass />
            Projeleri Keşfet
          </Link>
          <Link 
            href="/" 
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            <FaHome />
            Ana Sayfaya Dön
          </Link>
        </div>
        
        <p className="mt-8 text-sm text-gray-500">
          Arama yaptığınız kullanıcı adını doğru yazdığınızdan emin olun veya başka bir kullanıcı arayın.
        </p>
      </div>
    </div>
  );
} 
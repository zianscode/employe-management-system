'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Palet warna dari gambar
  const colorPalette = {
    gradientStart: '#FF5A57', 
    gradientMid1: '#E02F75',  
    gradientMid2: '#6700A3',  
    gradientEnd: '#050C38',   
    white: '#FFFFFF',
    grayText: '#6B7280', 
    darkText: '#1F2937',
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulasi loading
    setTimeout(() => {
      // Cek kredensial sederhana (bisa diganti dengan API call)
      if (formData.username && formData.password) {
        // Simpan status login di localStorage atau context
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', formData.username);
        
        // Redirect ke dashboard
        router.push('/dashboard');
      } else {
        alert('Username dan password harus diisi!');
      }
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col lg:flex-row bg-white shadow-2xl rounded-3xl overflow-hidden max-w-6xl w-full">

        <div className="w-full lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
          <h2 className="text-4xl font-extrabold text-gray-800 mb-4">Selamat datang kembali!</h2>
          <p className="text-lg text-gray-500 mb-8">
             Silakan masukkan kredensial Anda untuk mengakses dashboard.
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="sr-only">Email atau Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Email atau Username"
                className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 ease-in-out placeholder-gray-400 text-gray-800 text-lg"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Kata Sandi</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Kata Sandi"
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition duration-200 ease-in-out placeholder-gray-400 text-gray-800 text-lg"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 cursor-pointer hover:text-gray-600"
                >
                  {showPassword ? (
                    // Eye slash icon (hide password)
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    // Eye icon (show password)
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div className="text-right">
              <a href="#" className="text-sm text-purple-600 hover:underline font-medium">Lupa Kata Sandi?</a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 rounded-xl font-semibold text-lg hover:bg-gray-800 transition duration-200 ease-in-out shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="flex items-center justify-center my-8">
            <span className="text-gray-400 text-sm">atau lanjutkan dengan</span>
          </div>

          <div className="flex justify-center space-x-4">
            <button className="flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full hover:bg-gray-200 transition duration-200 shadow-md">
              {/* Ikon Google */}
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.24 10.285V11.85h5.186a6.57 6.57 0 01-2.91 3.99L17 16.92a9.99 9.99 0 005.15-4.998c.45-.92.71-1.95.71-3.042 0-2.07-.63-3.99-1.7-5.58L19.46 1.8A9.99 0 0012.24 0C5.46 0 0 5.46 0 12s5.46 12 12.24 12c3.4 0 6.46-1.4 8.64-3.68l-2.6-2.02c-1.12.8-2.58 1.27-4.14 1.27-3.4 0-6.2-2.72-6.2-6.08s2.8-6.08 6.2-6.08c1.88 0 3.52.8 4.7 2.08l2.32-2.32A9.99 9.99 0 0012.24 0z" />
              </svg>
            </button>
            <button className="flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full hover:bg-gray-200 transition duration-200 shadow-md">
              {/* Ikon Apple */}
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C6.477 0 2 4.477 2 10c0 3.843 2.146 7.18 5.25 8.924C7.09 19.12 7 19.55 7 20c0 1.657 1.343 3 3 3h4c1.657 0 3-1.343 3-3 0-.45-.09-.88-.25-1.076C19.854 17.18 22 13.843 22 10c0-5.523-4.477-10-10-10zm0 2c4.418 0 8 3.582 8 8 0 3.033-1.67 5.67-4.12 7.086C14.15 17.26 14 17.68 14 18c0 .552-.448 1-1 1h-2c-.552 0-1-.448-1-1 0-.32-.15-.74-.88-1.086C6.67 15.67 5 13.033 5 10c0-4.418 3.582-8 8-8z"/>
              </svg>
            </button>
            <button className="flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full hover:bg-gray-200 transition duration-200 shadow-md">
              {/* Ikon Facebook */}
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.35C0 23.407.593 24 1.325 24h11.496v-9.294h-3.172V11.2H12.82V8.307c0-3.13 1.893-4.847 4.659-4.847 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.801.715-1.801 1.76V11.2h3.587l-.507 3.496h-3.08V24h6.115c.732 0 1.325-.593 1.325-1.325V1.325C24 .593 23.407 0 22.675 0z"/>
              </svg>
            </button>
          </div>

          <div className="text-center mt-8 text-gray-500">
            Belum punya akun?{' '}
            <a href="#" className="text-purple-600 hover:underline font-medium">Daftar sekarang</a>
          </div>
        </div>

        <div
          className="hidden lg:flex w-1/2 items-center justify-center p-12 rounded-l-3xl"
          style={{
            background: `linear-gradient(135deg, ${colorPalette.gradientStart}, ${colorPalette.gradientMid1}, ${colorPalette.gradientMid2}, ${colorPalette.gradientEnd})`
          }}
        >
          <div className="text-center text-white p-6">
            <Image
              src="/assets/login.png" 
              alt="Ilustrasi Tuga's App"
              width={400}
              height={400}
              className="mx-auto mb-8 w-full max-w-sm rounded-lg "
            />
            <h3 className="text-3xl font-bold mb-4">
              Manajemen Karyawan Terpusat dan Efisien
            </h3>
            <p className="text-xl">dengan Sistem Manajemen Karyawan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
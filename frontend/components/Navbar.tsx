'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [doctorImage, setDoctorImage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.role === 'doctor') {
      fetchDoctorImage();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Refresh image when dropdown opens or storage changes (cross-tab sync)
  useEffect(() => {
    if (showDropdown && user?.role === 'doctor') {
      fetchDoctorImage();
    }
  }, [showDropdown, user]);

  // Listen for storage changes to sync image across tabs and from profile page
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'doctor_image_updated' && user?.role === 'doctor') {
        fetchDoctorImage();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [user]);

  const fetchDoctorImage = async () => {
    try {
      const res = await api.get('/doctors');
      const doctors = res.data;
      const doctor = doctors.find((d: any) => d.email === user?.email);
      if (doctor?.image) {
        // Add timestamp to force refresh the image
        setDoctorImage(`${API_URL}${doctor.image}?t=${Date.now()}`);
      }
    } catch (error) {
      console.error('Failed to fetch doctor image', error);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex gap-6">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/doctors" className="hover:underline">All Doctors</Link>
          <Link href="/about" className="hover:underline">About</Link>
          <Link href="/contact" className="hover:underline">Contact</Link>
        </div>
        <div className="flex gap-4 items-center">
          {user ? (
            <>
              {user.role === 'admin' && (
                <>
                  <Link href="/admin/dashboard" className="hover:underline">Dashboard</Link>
                  <button onClick={handleLogout} className="hover:underline">Logout</button>
                </>
              )}
              {user.role === 'doctor' && (
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 hover:bg-blue-700 p-1 rounded-full"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-white">
                      {doctorImage ? (
                        <img src={doctorImage} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-blue-600 font-bold">
                          {user.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </button>
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                      <Link 
                        href="/doctor/profile" 
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowDropdown(false)}
                      >
                        Manage Profile
                      </Link>
                      <Link 
                        href="/doctor/dashboard" 
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowDropdown(false)}
                      >
                        Dashboard
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              )}
              {user.role === 'patient' && (
                <>
                  <Link href="/patient/dashboard" className="hover:underline">Dashboard</Link>
                  <button onClick={handleLogout} className="hover:underline">Logout</button>
                </>
              )}
            </>
          ) : (
            <>
              <Link href="/login" className="hover:underline">Login</Link>
              <Link href="/register" className="hover:underline">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
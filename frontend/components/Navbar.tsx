'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000';

interface DoctorSummary {
  email: string;
  image?: string | null;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchProfileImage();
    } else {
      setProfileImage(null);
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

  useEffect(() => {
    if (showDropdown && user) {
      fetchProfileImage();
    }
  }, [showDropdown, user]);

  const fetchProfileImage = async () => {
    try {
      if (user?.role === 'doctor') {
        const res = await api.get('/doctors');
        const doctor = res.data.find((d: DoctorSummary) => d.email === user.email);
        setProfileImage(doctor?.image ? `${API_URL}${doctor.image}?t=${Date.now()}` : null);
      }

      if (user?.role === 'patient') {
        const res = await api.get('/patients/profile/me');
        const image = res.data.patient?.profile_image;
        setProfileImage(image ? `${API_URL}${image}?t=${Date.now()}` : null);
      }
    } catch (error) {
      console.error('Failed to fetch profile image', error);
    }
  };

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
    router.push('/login');
  };

  const dashboardHref =
    user?.role === 'admin' ? '/admin/dashboard' :
    user?.role === 'doctor' ? '/doctor/dashboard' :
    '/patient/dashboard';

  const profileHref = user?.role === 'doctor' ? '/doctor/profile' : '/patient/profile';

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-sm">
            DA
          </div>
          <div>
            <p className="font-bold leading-tight text-slate-950">DocAssist</p>
            <p className="text-xs text-slate-500">Appointment care</p>
          </div>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {[
            ['Home', '/'],
            ['All Doctors', '/doctors'],
            ['About', '/about'],
            ['Contact', '/contact'],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-blue-700">
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown((value) => !value)}
                className="flex items-center gap-3 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="h-9 w-9 overflow-hidden rounded-full bg-blue-100">
                  {profileImage ? (
                    <img src={profileImage} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-bold text-blue-700">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="max-w-28 truncate text-sm font-semibold text-slate-900">{user.name}</p>
                  <p className="text-xs capitalize text-slate-500">{user.role}</p>
                </div>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="truncate font-semibold text-slate-950">{user.name}</p>
                    <p className="truncate text-sm text-slate-500">{user.email}</p>
                  </div>
                  <Link href={dashboardHref} onClick={() => setShowDropdown(false)} className="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Dashboard
                  </Link>
                  {user.role !== 'admin' && (
                    <Link href={profileHref} onClick={() => setShowDropdown(false)} className="block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                      Manage Profile
                    </Link>
                  )}
                  <button onClick={handleLogout} className="block w-full px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="rounded-md px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">
                Login
              </Link>
              <Link href="/register" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

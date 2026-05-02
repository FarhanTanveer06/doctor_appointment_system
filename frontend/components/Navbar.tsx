'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
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
  const pathname = usePathname();
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

  const handleNavClick = (href: string, sectionId?: string) => {
    if (pathname === '/' && sectionId) {
      // If on homepage and sectionId provided, scroll to section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    // If not on homepage, navigate to homepage with hash for scrolling
    if (sectionId) {
      router.push(`/#${sectionId}`);
    } else {
      router.push(href);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/95 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500 to-emerald-600 font-bold text-white shadow-sm">
            DA
          </div>
          <div>
            <p className="font-bold leading-tight text-white">DocAssist</p>
            <p className="text-xs text-slate-400">Appointment care</p>
          </div>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          <button onClick={() => handleNavClick('/', 'home')} className="rounded-md px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-emerald-300">
            Home
          </button>
          <button onClick={() => handleNavClick('/about', 'about')} className="rounded-md px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-emerald-300">
            About
          </button>
          <Link href="/doctors" className="rounded-md px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-emerald-300">
            All Doctors
          </Link>
          <Link href="/assistant" className="rounded-md px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-emerald-300">
            AI Assistant
          </Link>
          <button onClick={() => handleNavClick('/contact', 'contact')} className="rounded-md px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-emerald-300">
            Contact
          </button>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown((value) => !value)}
                className="flex items-center gap-3 rounded-full border border-slate-700 bg-slate-900/90 py-1 pl-1 pr-3 shadow-sm transition hover:border-emerald-400/50 hover:bg-slate-800/90"
              >
                <div className="h-9 w-9 overflow-hidden rounded-full bg-emerald-100">
                  {profileImage ? (
                    <img src={profileImage} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-bold text-emerald-700">
                      {user.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="max-w-28 truncate text-sm font-semibold text-white">{user.name}</p>
                  <p className="text-xs capitalize text-slate-400">{user.role}</p>
                </div>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-lg border border-slate-700 bg-slate-900/95 shadow-xl backdrop-blur-xl">
                  <div className="border-b border-slate-700 px-4 py-3">
                    <p className="truncate font-semibold text-white">{user.name}</p>
                    <p className="truncate text-sm text-slate-400">{user.email}</p>
                  </div>
                  <Link href={dashboardHref} onClick={() => setShowDropdown(false)} className="block px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800/90">
                    Dashboard
                  </Link>
                  {user.role !== 'admin' && (
                    <Link href={profileHref} onClick={() => setShowDropdown(false)} className="block px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800/90">
                      Manage Profile
                    </Link>
                  )}
                  <Link href="/assistant" onClick={() => setShowDropdown(false)} className="block px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-slate-800/90">
                    AI Assistant
                  </Link>
                  <button onClick={handleLogout} className="block w-full px-4 py-3 text-left text-sm font-medium text-red-400 transition hover:bg-red-500/10">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="rounded-md px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-emerald-300">
                Login
              </Link>
              <Link href="/register" className="rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-emerald-400">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

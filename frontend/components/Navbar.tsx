'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex gap-6">
          <Link href="/" className="hover:underline">Home</Link>
          <Link href="/doctors" className="hover:underline">All Doctors</Link>
          <Link href="/about" className="hover:underline">About</Link>
          <Link href="/contact" className="hover:underline">Contact</Link>
        </div>
        <div className="flex gap-4">
          {user ? (
            <>
              <span className="text-sm">Welcome, {user.name}</span>
              {user.role === 'admin' && (
                <Link href="/admin/dashboard" className="hover:underline">Dashboard</Link>
              )}
              {user.role === 'doctor' && (
                <Link href="/doctor/dashboard" className="hover:underline">Dashboard</Link>
              )}
              {user.role === 'patient' && (
                <Link href="/patient/dashboard" className="hover:underline">Dashboard</Link>
              )}
              <button onClick={logout} className="hover:underline">Logout</button>
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
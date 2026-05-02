'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Chamber {
  chamber_name: string;
  chamber_address: string;
  available_days?: string;
  appointment_time_start?: string;
  appointment_time_end?: string;
}

interface Doctor {
  id: number;
  name: string;
  email: string;
  specialty: string;
  qualifications: string;
  fees: number;
  available_days: string;
  image: string;
  bmdc_reg_no?: string;
  id_no?: string;
  description?: string;
  field_of_concentration?: string;
  specializations?: string;
  work_experience?: string;
  education?: string;
  chambers?: Chamber[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000';

export default function AdminDoctors() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (!authLoading && user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchDoctors();
    }
  }, [user]);

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors');
      setDoctors(res.data);
    } catch (error) {
      console.error('Failed to fetch doctors', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return;
    try {
      await api.delete(`/doctors/${id}`);
      fetchDoctors();
    } catch (error) {
      alert('Failed to delete doctor');
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = !filterSpecialty || doctor.specialty === filterSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const specialties = [...new Set(doctors.map(doctor => doctor.specialty))];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Doctor Management</h1>
              <p className="mt-1 text-sm text-slate-400">Manage healthcare professionals</p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-800"
              >
                ← Back to Dashboard
              </Link>
              <Link
                href="/admin/add-doctor"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-400"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Doctor
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Filters */}
        <div className="mb-8 rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Search Doctors</label>
              <input
                type="text"
                placeholder="Search by name, email, or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-slate-100 placeholder-slate-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Filter by Specialty</label>
              <select
                value={filterSpecialty}
                onChange={(e) => setFilterSpecialty(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3 text-slate-100 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
              >
                <option value="">All Specialties</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <div className="rounded-xl bg-slate-800/50 px-4 py-3 text-sm text-slate-300">
                <span className="font-semibold text-emerald-400">{filteredDoctors.length}</span> doctors found
              </div>
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        {filteredDoctors.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-12 text-center backdrop-blur-sm">
            <svg className="mx-auto h-16 w-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-white">No doctors found</h3>
            <p className="mt-2 text-slate-400">
              {searchTerm || filterSpecialty ? 'Try adjusting your search filters.' : 'Get started by adding your first doctor.'}
            </p>
            <Link
              href="/admin/add-doctor"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-400"
            >
              Add First Doctor
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDoctors.map((doctor) => (
              <div key={doctor.id} className="group rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm transition hover:border-slate-700 hover:bg-slate-800/50">
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-emerald-500/20 transition group-hover:bg-emerald-500/30">
                    {doctor.image ? (
                      <img
                        src={`${API_URL}${doctor.image}`}
                        alt={doctor.name}
                        className="h-full w-full rounded-xl object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-emerald-400">
                        {doctor.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white truncate">{doctor.name}</h3>
                    <p className="text-sm font-medium text-emerald-400">{doctor.specialty}</p>
                    <p className="mt-1 text-sm text-slate-400 line-clamp-2">{doctor.qualifications || 'No qualifications listed'}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Consultation Fee</span>
                    <span className="font-semibold text-emerald-400">${doctor.fees}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Available Days</span>
                    <span className="text-slate-300">{doctor.available_days || 'Not specified'}</span>
                  </div>
                  <div className="text-sm text-slate-400 truncate">
                    {doctor.email}
                  </div>
                </div>

                <div className="mt-6 flex gap-2">
                  <button
                    onClick={() => router.push(`/doctor/${doctor.id}`)}
                    className="flex-1 rounded-lg border border-slate-700 bg-slate-800/50 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-800 hover:text-white"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => handleDelete(doctor.id)}
                    className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Stats {
  totalAppointments: number;
  confirmedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  totalDoctors: number;
}

interface Appointment {
  id: number;
  patient_name: string;
  patient_email: string;
  doctor_name: string;
  specialty: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
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
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

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
      fetchDashboard();
      fetchDoctors();
    }
  }, [user]);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data);
      setAppointments(res.data.recentAppointments || []);
    } catch (error) {
      console.error('Failed to fetch dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors');
      setDoctors(res.data.slice(0, 6)); // Show only first 6 doctors
    } catch (error) {
      console.error('Failed to fetch doctors', error);
    }
  };

  const handleDeleteDoctor = async (id: number) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return;
    try {
      await api.delete(`/doctors/${id}`);
      fetchDoctors();
      fetchDashboard();
    } catch (error) {
      alert('Failed to delete doctor');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading admin dashboard...</p>
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
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="mt-1 text-sm text-slate-400">Manage your healthcare platform</p>
            </div>
            <div className="flex items-center gap-3">
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
        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Total Doctors</p>
                <p className="text-2xl font-bold text-white">{stats?.totalDoctors || 0}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20">
                <svg className="h-6 w-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m0 0l-2-2m2 2l2-2m4-6v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Total Appointments</p>
                <p className="text-2xl font-bold text-white">{stats?.totalAppointments || 0}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/20">
                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Confirmed</p>
                <p className="text-2xl font-bold text-green-400">{stats?.confirmedAppointments || 0}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-500/20">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">{stats?.pendingAppointments || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Doctors Management Section */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
              <div className="border-b border-slate-800 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">Doctor Management</h2>
                  <Link
                    href="/admin/doctors"
                    className="text-sm font-medium text-emerald-400 hover:text-emerald-300"
                  >
                    View All →
                  </Link>
                </div>
              </div>
              <div className="p-6">
                {doctors.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="mt-4 text-slate-400">No doctors registered yet</p>
                    <Link
                      href="/admin/add-doctor"
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-400"
                    >
                      Add First Doctor
                    </Link>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {doctors.map((doctor) => (
                      <div key={doctor.id} className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 transition hover:bg-slate-800/70">
                        <div className="flex items-start gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/20">
                            {doctor.image ? (
                              <img
                                src={`${API_URL}${doctor.image}`}
                                alt={doctor.name}
                                className="h-full w-full rounded-lg object-cover"
                              />
                            ) : (
                              <span className="text-lg font-semibold text-emerald-400">
                                {doctor.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-white truncate">{doctor.name}</h3>
                            <p className="text-sm text-emerald-400">{doctor.specialty}</p>
                            <p className="text-sm text-slate-400">{doctor.qualifications || 'No qualifications listed'}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-sm font-medium text-slate-300">${doctor.fees}</span>
                              <button
                                onClick={() => handleDeleteDoctor(doctor.id)}
                                className="text-red-400 hover:text-red-300 text-sm font-medium"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Appointments */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm">
            <div className="border-b border-slate-800 px-6 py-4">
              <h2 className="text-xl font-semibold text-white">Recent Appointments</h2>
            </div>
            <div className="p-6">
              {appointments.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v10m0 0l-2-2m2 2l2-2m4-6v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2" />
                  </svg>
                  <p className="mt-4 text-slate-400">No recent appointments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.slice(0, 5).map((apt) => (
                    <div key={apt.id} className="rounded-lg border border-slate-700 bg-slate-800/30 p-4">
                      <div className="flex items-start justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white truncate">{apt.patient_name}</p>
                          <p className="text-sm text-slate-400 truncate">{apt.doctor_name}</p>
                          <p className="text-xs text-emerald-400">{apt.specialty}</p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          apt.status === 'confirmed' ? 'bg-green-500/20 text-green-400' :
                          apt.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-red-500/20 text-red-400'
                        }`}>
                          {apt.status}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-slate-500">
                        {apt.appointment_date} at {apt.appointment_time}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
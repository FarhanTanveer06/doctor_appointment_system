'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Appointment {
  id: number;
  patient_name?: string;
  patient_email?: string;
  doctor_name?: string;
  specialty?: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  fees?: number;
}

interface Stats {
  totalAppointments: number;
  confirmedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  totalEarnings: number;
}

export default function DoctorDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [visitingAppointments, setVisitingAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (!authLoading && user && user.role !== 'doctor') {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'doctor') {
      fetchDashboard();
    }
  }, [user]);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/admin/doctor-dashboard');
      setStats(res.data);
      setAppointments(res.data.appointments || []);
      setVisitingAppointments(res.data.visitingAppointments || []);
    } catch (error) {
      console.error('Failed to fetch dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: number) => {
    try {
      await api.put(`/appointments/${id}/confirm`);
      fetchDashboard();
    } catch (error) {
      alert('Failed to confirm appointment');
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await api.put(`/appointments/${id}/cancel`);
      fetchDashboard();
    } catch (error) {
      alert('Failed to cancel appointment');
    }
  };

  if (authLoading || loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-100 py-10">
      <div className="mx-auto max-w-screen-2xl px-6">
        <div className="mb-10 rounded-4xl bg-white p-8 shadow-[0_28px_80px_-35px_rgba(15,23,42,0.25)]">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.3em] text-amber-500">Doctor workspace</p>
              <h1 className="mt-3 text-4xl font-semibold text-slate-950">Your practice, organized with clarity</h1>
              <p className="mt-4 text-slate-600">Monitor appointments, manage your profile, and keep patient workflows moving from a clean full-width dashboard designed for busy doctors.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/doctor/profile" className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-amber-100 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-amber-200">
                Manage Profile
              </Link>
              <button
                onClick={() => router.push('/patient/dashboard')}
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Patient View
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5 mb-10">
          <div className="rounded-4xl bg-white p-6 shadow-xl">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Total Appointments</p>
            <p className="mt-4 text-4xl font-semibold text-slate-950">{stats?.totalAppointments || 0}</p>
          </div>
          <div className="rounded-4xl bg-white p-6 shadow-xl">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Confirmed</p>
            <p className="mt-4 text-4xl font-semibold text-emerald-600">{stats?.confirmedAppointments || 0}</p>
          </div>
          <div className="rounded-4xl bg-white p-6 shadow-xl">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Pending</p>
            <p className="mt-4 text-4xl font-semibold text-amber-600">{stats?.pendingAppointments || 0}</p>
          </div>
          <div className="rounded-4xl bg-white p-6 shadow-xl">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Cancelled</p>
            <p className="mt-4 text-4xl font-semibold text-rose-600">{stats?.cancelledAppointments || 0}</p>
          </div>
          <div className="rounded-4xl bg-white p-6 shadow-xl">
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Earnings</p>
            <p className="mt-4 text-4xl font-semibold text-slate-950">${stats?.totalEarnings || 0}</p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
          <section className="rounded-4xl bg-white p-8 shadow-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Upcoming appointments</p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">Today & tomorrow</h2>
              </div>
              <p className="text-sm text-slate-600">Manage your next sessions and keep patient details in view.</p>
            </div>

            {appointments.length === 0 ? (
              <div className="mt-8 rounded-4xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-600">
                No appointments yet. Your schedule will appear here once a patient books.
              </div>
            ) : (
              <div className="mt-8 space-y-4">
                {appointments.map((apt) => (
                  <div key={apt.id} className="rounded-4xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                      <div>
                        <p className="text-sm uppercase tracking-[0.24em] text-slate-500">{apt.patient_name || 'Patient'}</p>
                        <h3 className="mt-2 text-xl font-semibold text-slate-950">{apt.patient_email || 'No contact info'}</h3>
                        <p className="mt-2 text-sm text-slate-600">{apt.appointment_date} · {apt.appointment_time}</p>
                        <p className="mt-1 text-sm text-slate-500">{apt.specialty || 'General consultation'}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
                          apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                          apt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-rose-100 text-rose-700'
                        }`}>
                          {apt.status}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">${apt.fees || 0}</span>
                        {apt.status === 'pending' && (
                          <button
                            onClick={() => handleConfirm(apt.id)}
                            className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
                          >
                            Confirm
                          </button>
                        )}
                        {apt.status !== 'cancelled' && (
                          <button
                            onClick={() => handleCancel(apt.id)}
                            className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <div className="rounded-4xl bg-white p-6 shadow-xl">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Clinic visits</p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">Referrals & visits</h2>
              {visitingAppointments.length === 0 ? (
                <p className="mt-6 text-slate-600">No visits booked with other doctors yet.</p>
              ) : (
                <div className="mt-6 space-y-4">
                  {visitingAppointments.map((apt) => (
                    <div key={apt.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-900">{apt.doctor_name}</p>
                      <p className="text-sm text-slate-600">{apt.specialty}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                        <span>{apt.appointment_date}</span>
                        <span>·</span>
                        <span>{apt.appointment_time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-4xl bg-white p-6 shadow-xl">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Quick actions</p>
              <div className="mt-6 grid gap-3">
                <Link href="/doctor/profile" className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                  Update profile details
                </Link>
                <Link href="/doctors" className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                  View doctor directory
                </Link>
                <a href="tel:09611530530" className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
                  Contact support
                </a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Appointment {
  id: number;
  doctor_name: string;
  specialty: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  fees: number;
}

export default function PatientDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (!authLoading && user?.role === 'doctor') {
      router.push('/doctor/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'patient') {
      fetchAppointments();
    } else if (!authLoading && user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/appointments');
      setAppointments(res.data);
    } catch (error) {
      console.error('Failed to fetch appointments', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await api.put(`/appointments/${id}/cancel`);
      fetchAppointments();
    } catch (error) {
      alert('Failed to cancel appointment');
    }
  };

  const appointmentStats = useMemo(() => {
    const total = appointments.length;
    const upcoming = appointments.filter((apt) => apt.status === 'confirmed' || apt.status === 'pending').length;
    const completed = appointments.filter((apt) => apt.status === 'completed').length;
    const cancelled = appointments.filter((apt) => apt.status === 'cancelled').length;
    return { total, upcoming, completed, cancelled };
  }, [appointments]);

  if (authLoading || loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_420px]">
          <div className="rounded-4xl border border-slate-200 bg-white p-8 shadow-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-emerald-500">Patient Dashboard</p>
                <h1 className="mt-3 text-3xl font-bold text-slate-950">Welcome back{user?.name ? `, ${user.name}` : ''}</h1>
                <p className="mt-2 max-w-2xl text-slate-600">Manage your appointments, view quick health stats, and book new care with ease.</p>
              </div>
              <Link
                href="/doctors"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
              >
                Book New Appointment
              </Link>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: 'Total Appointments', value: appointmentStats.total },
                { label: 'Upcoming', value: appointmentStats.upcoming },
                { label: 'Completed', value: appointmentStats.completed },
                { label: 'Cancelled', value: appointmentStats.cancelled },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <p className="text-sm font-semibold text-slate-500">{item.label}</p>
                  <p className="mt-3 text-3xl font-bold text-slate-950">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-xl">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Quick actions</p>
              <div className="mt-6 grid gap-3">
                <Link
                  href="/patient/profile"
                  className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Edit Profile
                </Link>
                <Link
                  href="/doctors"
                  className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Find Doctors
                </Link>
                <a
                  href="tel:09611530530"
                  className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Call Support
                </a>
              </div>
            </div>
            <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-xl">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Need immediate care?</p>
              <p className="mt-4 text-3xl font-semibold text-slate-950">09611 530 530</p>
              <p className="mt-2 text-sm text-slate-600">Ambulance & emergency support available 24/7.</p>
            </div>
          </aside>
        </div>

        <section className="mt-10 rounded-4xl border border-slate-200 bg-white p-6 shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Upcoming Appointments</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">Your next visits</h2>
            </div>
            <Link href="/doctors" className="text-sm font-semibold text-emerald-500 hover:text-emerald-600">
              Book a new appointment
            </Link>
          </div>

          {appointments.length === 0 ? (
            <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600">
              No appointments found yet. Start by booking a consultation with a specialist.
            </div>
          ) : (
            <div className="mt-8 grid gap-4">
              {appointments.map((apt) => (
                <div key={apt.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{apt.specialty}</p>
                      <h3 className="mt-2 text-xl font-semibold text-slate-950">Dr. {apt.doctor_name}</h3>
                      <p className="mt-3 text-sm text-slate-600">{apt.appointment_date} · {apt.appointment_time}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-sm font-semibold ${
                        apt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' :
                        apt.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {apt.status}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">${apt.fees}</span>
                      {apt.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancel(apt.id)}
                          className="rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
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
      </div>
    </div>
  );
}

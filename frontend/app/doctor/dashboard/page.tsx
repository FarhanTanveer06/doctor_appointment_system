'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Appointment {
  id: number;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
          <Link href="/doctor/profile" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Edit Profile
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-600 text-sm">Total Appointments</h3>
            <p className="text-3xl font-bold">{stats?.totalAppointments || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-600 text-sm">Confirmed</h3>
            <p className="text-3xl font-bold text-green-600">{stats?.confirmedAppointments || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-600 text-sm">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats?.pendingAppointments || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-600 text-sm">Total Earnings</h3>
            <p className="text-3xl font-bold text-blue-600">${stats?.totalEarnings || 0}</p>
          </div>
        </div>

        {/* Appointments Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <h2 className="text-xl font-semibold p-4 bg-gray-100">Recent Appointments</h2>
          {appointments.length === 0 ? (
            <p className="p-4 text-gray-600">No appointments found</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Patient</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Time</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id} className="border-t">
                    <td className="px-4 py-3">
                      <div>{apt.patient_name}</div>
                      <div className="text-sm text-gray-500">{apt.patient_email}</div>
                    </td>
                    <td className="px-4 py-3">{apt.appointment_date}</td>
                    <td className="px-4 py-3">{apt.appointment_time}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {apt.status === 'pending' && (
                        <button
                          onClick={() => handleConfirm(apt.id)}
                          className="text-green-600 hover:underline mr-4"
                        >
                          Confirm
                        </button>
                      )}
                      {apt.status !== 'cancelled' && (
                        <button
                          onClick={() => handleCancel(apt.id)}
                          className="text-red-600 hover:underline"
                        >
                          Cancel
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
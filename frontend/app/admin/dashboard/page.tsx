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

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
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

  if (authLoading || loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Navigation */}
        <div className="mb-6 flex gap-4">
          <Link href="/admin/doctors" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Manage Doctors
          </Link>
          <Link href="/admin/add-doctor" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
            Add New Doctor
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-gray-600 text-sm">Total Doctors</h3>
            <p className="text-3xl font-bold">{stats?.totalDoctors || 0}</p>
          </div>
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
        </div>

        {/* Recent Appointments */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <h2 className="text-xl font-semibold p-4 bg-gray-100">Recent Appointments</h2>
          {appointments.length === 0 ? (
            <p className="p-4 text-gray-600">No appointments found</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">Patient</th>
                  <th className="px-4 py-3 text-left">Doctor</th>
                  <th className="px-4 py-3 text-left">Specialty</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id} className="border-t">
                    <td className="px-4 py-3">{apt.patient_name}</td>
                    <td className="px-4 py-3">{apt.doctor_name}</td>
                    <td className="px-4 py-3">{apt.specialty}</td>
                    <td className="px-4 py-3">{apt.appointment_date}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {apt.status}
                      </span>
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
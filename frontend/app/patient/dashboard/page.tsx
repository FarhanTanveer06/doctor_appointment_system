'use client';

import { useEffect, useState } from 'react';
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
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'patient') {
      fetchAppointments();
    }
  }, [user]);

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

  if (authLoading || loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Appointments</h1>

        <div className="mb-6">
          <Link href="/doctors" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Book New Appointment
          </Link>
        </div>

        {appointments.length === 0 ? (
          <p className="text-gray-600">No appointments found</p>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Doctor</th>
                  <th className="px-4 py-3 text-left">Specialty</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Time</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Fees</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id} className="border-t">
                    <td className="px-4 py-3">{apt.doctor_name}</td>
                    <td className="px-4 py-3">{apt.specialty}</td>
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
                    <td className="px-4 py-3">${apt.fees}</td>
                    <td className="px-4 py-3">
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
          </div>
        )}
      </div>
    </div>
  );
}
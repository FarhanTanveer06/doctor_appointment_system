'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Doctor {
  id: number;
  name: string;
  email: string;
  specialty: string;
  qualifications: string;
  fees: number;
  available_days: string;
}

export default function AdminDoctors() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
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

  if (authLoading || loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Doctors</h1>
          <Link href="/admin/add-doctor" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Add New Doctor
          </Link>
        </div>

        {doctors.length === 0 ? (
          <p className="text-gray-600">No doctors found</p>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Specialty</th>
                  <th className="px-4 py-3 text-left">Qualifications</th>
                  <th className="px-4 py-3 text-left">Fees</th>
                  <th className="px-4 py-3 text-left">Available</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doctor) => (
                  <tr key={doctor.id} className="border-t">
                    <td className="px-4 py-3">{doctor.name}</td>
                    <td className="px-4 py-3">{doctor.email}</td>
                    <td className="px-4 py-3">{doctor.specialty}</td>
                    <td className="px-4 py-3">{doctor.qualifications || '-'}</td>
                    <td className="px-4 py-3">${doctor.fees}</td>
                    <td className="px-4 py-3">{doctor.available_days || '-'}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(doctor.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
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
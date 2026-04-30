'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  image: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function DoctorProfile() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');

  useEffect(() => {
    fetchDoctor();
  }, [params.id]);

  const fetchDoctor = async () => {
    try {
      const res = await api.get(`/doctors/${params.id}`);
      setDoctor(res.data);
    } catch (error) {
      console.error('Failed to fetch doctor', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(`/doctors/${params.id}`));
      return;
    }

    if (!appointmentDate || !appointmentTime) {
      alert('Please select date and time');
      return;
    }

    try {
      setBooking(true);
      await api.post('/appointments', {
        doctorId: doctor?.id,
        appointmentDate,
        appointmentTime,
      });
      alert('Appointment booked successfully!');
      router.push('/patient/dashboard');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!doctor) return <div className="p-8 text-center">Doctor not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-2xl mx-auto">
          {/* Doctor Image */}
          <div className="h-64 bg-gray-200 relative">
            {doctor.image ? (
              <img
                src={getImageUrl(doctor.image)}
                alt={doctor.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-6xl font-bold">
                {doctor.name.charAt(0)}
              </div>
            )}
          </div>

          {/* Doctor Info */}
          <div className="p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-1">{doctor.name}</h1>
              <p className="text-xl text-blue-600">{doctor.specialty}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h2 className="text-lg font-semibold mb-2">Qualifications</h2>
                <p className="text-gray-600">{doctor.qualifications || 'Not specified'}</p>
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">Available Days</h2>
                <p className="text-gray-600">{doctor.available_days || 'Not specified'}</p>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Consultation Fee</h2>
              <p className="text-2xl font-bold text-green-600">${doctor.fees}</p>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Book an Appointment</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time</label>
                  <input
                    type="time"
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
              <button
                onClick={handleBooking}
                disabled={booking}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
              >
                {booking ? 'Booking...' : 'Book Appointment'}
              </button>
              {!user && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  You need to login to book an appointment
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Chamber {
  id: number;
  chamber_name: string;
  chamber_address: string;
  available_days: string;
  appointment_time_start: string;
  appointment_time_end: string;
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
  gender?: string;
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

  const getImageUrl = (imagePath: string | null | undefined): string | undefined => {
    if (!imagePath) return undefined;
    if (imagePath.startsWith('http')) return imagePath;
    // Use API_URL from env, removing /api suffix to get base URL
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}${imagePath}`;
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!doctor) return <div className="p-8 text-center">Doctor not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-4xl mx-auto">
          {/* Doctor Image & Basic Info */}
          <div className="md:flex">
            <div className="md:w-1/3">
              <div className="h-64 bg-gray-200 relative">
                {doctor.image ? (
                  <img src={getImageUrl(doctor.image)} alt={doctor.name} className="w-full h-full object-contain bg-gray-100" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-6xl font-bold">
                    {doctor.name.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            <div className="md:w-2/3 p-6">
              <h1 className="text-3xl font-bold mb-1">{doctor.name}</h1>
              <p className="text-xl text-blue-600 mb-2">{doctor.specialty}</p>
              <p className="text-gray-600 mb-4">{doctor.qualifications || 'Not specified'}</p>
              
              {/* Registration Info */}
              <div className="flex gap-4 mb-4 text-sm">
                {doctor.bmdc_reg_no && (
                  <span className="bg-gray-100 px-3 py-1 rounded">BMDC: {doctor.bmdc_reg_no}</span>
                )}
                {doctor.gender && (
                  <span className="bg-gray-100 px-3 py-1 rounded">{doctor.gender}</span>
                )}
              </div>
              
              <p className="text-2xl font-bold text-green-600">${doctor.fees} <span className="text-sm text-gray-500 font-normal">per visit</span></p>
            </div>
          </div>

          {/* Description */}
          {doctor.description && (
            <div className="p-6 border-t">
              <h2 className="text-xl font-semibold mb-2">About</h2>
              <p className="text-gray-600">{doctor.description}</p>
            </div>
          )}

          {/* Professional Info */}
          {(doctor.field_of_concentration || doctor.specializations || doctor.work_experience || doctor.education) && (
            <div className="p-6 border-t">
              <h2 className="text-xl font-semibold mb-4">Professional Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctor.field_of_concentration && (
                  <div>
                    <h3 className="font-medium text-gray-700">Field of Concentration</h3>
                    <p className="text-gray-600">{doctor.field_of_concentration}</p>
                  </div>
                )}
                {doctor.specializations && (
                  <div>
                    <h3 className="font-medium text-gray-700">Specializations</h3>
                    <p className="text-gray-600">{doctor.specializations}</p>
                  </div>
                )}
                {doctor.work_experience && (
                  <div className="md:col-span-2">
                    <h3 className="font-medium text-gray-700">Work Experience</h3>
                    <p className="text-gray-600 whitespace-pre-line">{doctor.work_experience}</p>
                  </div>
                )}
                {doctor.education && (
                  <div className="md:col-span-2">
                    <h3 className="font-medium text-gray-700">Education</h3>
                    <p className="text-gray-600 whitespace-pre-line">{doctor.education}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Chambers */}
          {doctor.chambers && doctor.chambers.length > 0 && (
            <div className="p-6 border-t">
              <h2 className="text-xl font-semibold mb-4">Chamber Locations</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {doctor.chambers.map((chamber, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold">{chamber.chamber_name}</h3>
                    <p className="text-gray-600 text-sm">{chamber.chamber_address}</p>
                    <div className="mt-2 text-sm text-gray-500">
                      <p>Available: {chamber.available_days || 'Not specified'}</p>
                      {chamber.appointment_time_start && chamber.appointment_time_end && (
                        <p>Time: {chamber.appointment_time_start} - {chamber.appointment_time_end}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Booking Section */}
          <div className="p-6 border-t">
            <h2 className="text-xl font-semibold mb-4">Book an Appointment</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} className="w-full border rounded-lg px-3 py-2" min={new Date().toISOString().split('T')[0]} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input type="time" value={appointmentTime} onChange={(e) => setAppointmentTime(e.target.value)} className="w-full border rounded-lg px-3 py-2" />
              </div>
            </div>
            <button onClick={handleBooking} disabled={booking} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400">
              {booking ? 'Booking...' : 'Book Appointment'}
            </button>
            {!user && <p className="text-sm text-gray-500 mt-2 text-center">You need to login to book an appointment</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
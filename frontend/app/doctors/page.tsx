'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

const specialties = [
  'All',
  'General Physician',
  'Dermatologist',
  'Pediatrician',
  'Neurologist',
  'Gastroenterologist',
  'Cardiologist',
];

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

function DoctorsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get('specialty') || 'All');

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params = selectedSpecialty !== 'All' ? { specialty: selectedSpecialty } : {};
      const res = await api.get('/doctors', { params });
      setDoctors(res.data);
    } catch (error) {
      console.error('Failed to fetch doctors', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSpecialtyChange = (specialty: string) => {
    setSelectedSpecialty(specialty);
    if (specialty === 'All') {
      router.push('/doctors');
    } else {
      router.push(`/doctors?specialty=${encodeURIComponent(specialty)}`);
    }
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">All Doctors</h1>

        {/* Specialty Filter */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Filter by Specialty:</h3>
          <div className="flex flex-wrap gap-2">
            {specialties.map((specialty) => (
              <button
                key={specialty}
                onClick={() => handleSpecialtyChange(specialty)}
                className={`px-4 py-2 rounded-full font-medium transition ${
                  selectedSpecialty === specialty
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border hover:bg-gray-100'
                }`}
              >
                {specialty}
              </button>
            ))}
          </div>
        </div>

        {/* Doctors List */}
        {loading ? (
          <p className="text-center">Loading...</p>
        ) : doctors.length === 0 ? (
          <p className="text-center text-gray-600">No doctors found</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div key={doctor.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Doctor Image */}
                <div className="h-48 bg-gray-200 relative">
                  {doctor.image ? (
                    <img
                      src={getImageUrl(doctor.image)}
                      alt={doctor.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white text-5xl font-bold">
                      {doctor.name.charAt(0)}
                    </div>
                  )}
                </div>
                {/* Doctor Info */}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-1">{doctor.name}</h3>
                  <p className="text-blue-600 font-medium mb-2">{doctor.specialty}</p>
                  <p className="text-gray-600 text-sm mb-2">{doctor.qualifications || 'No qualifications listed'}</p>
                  <p className="text-gray-500 text-sm mb-2">Available: {doctor.available_days || 'Not specified'}</p>
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-xl font-bold text-green-600">${doctor.fees}</p>
                    <Link
                      href={`/doctors/${doctor.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                    >
                      View & Book
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <DoctorsContent />
    </Suspense>
  );
}
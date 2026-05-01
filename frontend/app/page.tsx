'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

const specialties = [
  'Cardiac Surgeon',
  'Cardiologist (Heart Specialist)',
  'Chest Specialist (Pulmonologist)',
  'Gastroenterologist',
  'Neurologist',
  'Neurosurgeon',
  'Orthopedic Surgeon (Bone Specialist)',
  'General Surgeon',
  'Urologist',
  'Nephrologist (Kidney Specialist)',
  'Endocrinologist (Diabetes & Hormone Specialist)',
  'Dermatologist (Skin Specialist)',
  'Venereologist (Skin & Sexual Diseases)',
  'Gynecologist & Obstetrician',
  'Pediatrician (Child Specialist)',
  'Neonatologist (Newborn Specialist)',
  'Oncologist (Cancer Specialist)',
  'Hematologist (Blood Specialist)',
  'Rheumatologist (Joint & Autoimmune Specialist)',
  'Ophthalmologist (Eye Specialist)',
  'ENT Specialist (Ear, Nose, Throat)',
  'Psychiatrist (Mental Health Specialist)',
  'Radiologist (Imaging Specialist)',
  'Pathologist (Lab Diagnosis Specialist)',
  'Anesthesiologist',
  'Critical Care Specialist (ICU)',
  'Emergency Medicine Specialist',
  'Physical Medicine & Rehabilitation Specialist',
  'Pain Management Specialist',
  'Plastic & Reconstructive Surgeon',
  'Vascular Surgeon',
  'Family Medicine Specialist',
  'Public Health Specialist',
];

const searchTypes = ['All', 'Doctor', 'Hospital'];
const genders = ['All', 'Male', 'Female'];

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  image?: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000';

export default function Home() {
  const router = useRouter();
  const [searchType, setSearchType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [gender, setGender] = useState('All');
  const [specialty, setSpecialty] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const res = await api.get('/doctors');
      setDoctors(res.data);
    } catch (error) {
      console.error('Failed to fetch doctors', error);
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (specialty && specialty !== 'All') params.set('specialty', specialty);
    if (gender && gender !== 'All') params.set('gender', gender);
    router.push(`/doctors?${params.toString()}`);
  };

  const handleSpecialtyClick = (spec: string) => {
    router.push(`/doctors?specialty=${encodeURIComponent(spec)}`);
  };

  const getImageUrl = (imagePath: string | null | undefined): string | undefined => {
    if (!imagePath) return undefined;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  return (
    <div className="min-h-screen">
      {/* Find Doctor Section */}
      <section className="bg-blue-600 py-12 px-4">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-white text-center mb-8">Find Doctor</h1>
          
          {/* Search Bar */}
          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              {/* Search Type Dropdown */}
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {searchTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              {/* Search Input */}
              <input
                type="text"
                placeholder="Search doctor name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Search
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              {/* Gender Dropdown */}
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {genders.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>

              {/* Specialty Dropdown */}
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Find by Speciality</option>
                {specialties.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties Grid */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Browse by Speciality</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {specialties.map((spec) => (
              <button
                key={spec}
                onClick={() => handleSpecialtyClick(spec)}
                className="bg-white border border-gray-200 p-4 rounded-lg text-center hover:border-blue-500 hover:text-blue-600 transition shadow-sm"
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="bg-gray-50 py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Featured Doctors</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.slice(0, 4).map((doctor) => (
              <div key={doctor.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="h-40 bg-gray-200 flex items-center justify-center">
                  {doctor.image ? (
                    <img src={getImageUrl(doctor.image)} alt={doctor.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-4xl font-bold text-gray-400">{doctor.name?.charAt(0)}</div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{doctor.name}</h3>
                  <p className="text-sm text-blue-600">{doctor.specialty}</p>
                  <Link
                    href={`/doctors/${doctor.id}`}
                    className="block mt-2 text-center bg-blue-600 text-white py-1 rounded hover:bg-blue-700"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/doctors" className="text-blue-600 hover:underline text-lg">
              View All Doctors →
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 mx-auto mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Search Doctor</h3>
              <p className="text-gray-600">Use our search filters to find the right specialist for your needs</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 mx-auto mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Book Appointment</h3>
              <p className="text-gray-600">Select a convenient date and time slot</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 mx-auto mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Get Care</h3>
              <p className="text-gray-600">Visit the doctor and get quality healthcare</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

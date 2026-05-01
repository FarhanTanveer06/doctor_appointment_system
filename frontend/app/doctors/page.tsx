'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

const specialties = [
  'All',
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

interface Chamber {
  chamber_name: string;
  chamber_address: string;
  available_days?: string;
  appointment_time_start?: string;
  appointment_time_end?: string;
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
  description?: string;
  field_of_concentration?: string;
  specializations?: string;
  chambers?: Chamber[];
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000';

function DoctorsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState(searchParams.get('specialty') || 'All');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [gender, setGender] = useState(searchParams.get('gender') || 'All');
  const [searchType, setSearchType] = useState(searchParams.get('type') || 'All');

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty, searchQuery, gender]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedSpecialty !== 'All') params.specialty = selectedSpecialty;
      if (searchQuery) params.q = searchQuery;
      if (gender !== 'All') params.gender = gender;
      
      const res = await api.get('/doctors', { params });
      let filteredDoctors = res.data;
      
      // Client-side filtering for search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredDoctors = filteredDoctors.filter((d: Doctor) => 
          d.name?.toLowerCase().includes(query) ||
          d.specialty?.toLowerCase().includes(query) ||
          d.qualifications?.toLowerCase().includes(query)
        );
      }
      
      setDoctors(filteredDoctors);
    } catch (error) {
      console.error('Failed to fetch doctors', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSpecialtyChange = (specialty: string) => {
    setSelectedSpecialty(specialty);
    updateURL(specialty, searchQuery, gender);
  };

  const handleSearch = () => {
    updateURL(selectedSpecialty, searchQuery, gender);
  };

  const handleGenderChange = (g: string) => {
    setGender(g);
    updateURL(selectedSpecialty, searchQuery, g);
  };

  const updateURL = (specialty: string, query: string, g: string) => {
    const params = new URLSearchParams();
    if (specialty && specialty !== 'All') params.set('specialty', specialty);
    if (query) params.set('q', query);
    if (g && g !== 'All') params.set('gender', g);
    router.push(`/doctors?${params.toString()}`);
  };

  const getImageUrl = (imagePath: string | null | undefined): string | undefined => {
    if (!imagePath) return undefined;
    if (imagePath.startsWith('http')) return imagePath;
    // API_URL is http://localhost:5000/api, imagePath is /uploads/xxx
    return `http://localhost:5000${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Find Doctor</h1>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
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
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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

          {/* Filters Row */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Gender Dropdown */}
            <select
              value={gender}
              onChange={(e) => handleGenderChange(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {genders.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            {/* Specialty Dropdown */}
            <select
              value={selectedSpecialty}
              onChange={(e) => handleSpecialtyChange(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>{specialty}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-gray-600 mb-4">{doctors.length} doctors found</p>

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
                      className="w-full h-full object-contain bg-gray-100"
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
                  <p className="text-blue-600 font-medium mb-1">{doctor.specialty}</p>
                  {doctor.bmdc_reg_no && <p className="text-xs text-gray-500 mb-1">BMDC Reg: {doctor.bmdc_reg_no}</p>}
                  <p className="text-gray-600 text-sm mb-1">{doctor.qualifications || 'No qualifications listed'}</p>
                  {doctor.field_of_concentration && <p className="text-xs text-gray-500 mb-1">Focus: {doctor.field_of_concentration}</p>}
                  <p className="text-gray-500 text-sm mb-2">Available: {doctor.available_days || 'Not specified'}</p>
                  {doctor.chambers && doctor.chambers.length > 0 && (
                    <p className="text-xs text-gray-500 mb-2">{doctor.chambers.length} chamber(s)</p>
                  )}
                  <div className="flex items-center justify-between mt-4">
                    <p className="text-xl font-bold text-green-600">${doctor.fees}</p>
                    <Link href={`/doctors/${doctor.id}`} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
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
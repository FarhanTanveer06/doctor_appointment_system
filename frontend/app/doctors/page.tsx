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
  field_of_concentration?: string;
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

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty, searchQuery, gender]);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (selectedSpecialty !== 'All') params.specialty = selectedSpecialty;
      if (searchQuery) params.q = searchQuery;
      if (gender !== 'All') params.gender = gender;

      const res = await api.get('/doctors', { params });
      let filteredDoctors: Doctor[] = res.data;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredDoctors = filteredDoctors.filter((doctor) =>
          doctor.name?.toLowerCase().includes(query) ||
          doctor.specialty?.toLowerCase().includes(query) ||
          doctor.qualifications?.toLowerCase().includes(query)
        );
      }

      setDoctors(filteredDoctors);
    } catch (error) {
      console.error('Failed to fetch doctors', error);
    } finally {
      setLoading(false);
    }
  };

  const updateURL = (specialty: string, query: string, selectedGender: string) => {
    const params = new URLSearchParams();
    if (specialty && specialty !== 'All') params.set('specialty', specialty);
    if (query) params.set('q', query);
    if (selectedGender && selectedGender !== 'All') params.set('gender', selectedGender);
    router.push(`/doctors?${params.toString()}`);
  };

  const handleSpecialtyChange = (specialty: string) => {
    setSelectedSpecialty(specialty);
    updateURL(specialty, searchQuery, gender);
  };

  const handleGenderChange = (selectedGender: string) => {
    setGender(selectedGender);
    updateURL(selectedSpecialty, searchQuery, selectedGender);
  };

  const handleSearch = () => {
    updateURL(selectedSpecialty, searchQuery, gender);
  };

  const clearFilters = () => {
    setSelectedSpecialty('All');
    setSearchQuery('');
    setGender('All');
    router.push('/doctors');
  };

  const getImageUrl = (imagePath: string | null | undefined): string | undefined => {
    if (!imagePath) return undefined;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950 px-4 py-14 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(37,99,235,0.28),transparent_32%),radial-gradient(circle_at_85%_20%,rgba(20,184,166,0.18),transparent_30%)]" />
        <div className="relative mx-auto w-full max-w-[1680px] lg:px-8">
          <p className="font-semibold text-blue-300">Doctor Directory</p>
          <div className="mt-3 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-bold md:text-5xl">Find the right specialist</h1>
              <p className="mt-4 max-w-2xl text-slate-300">
                Search verified doctors, compare specialties, review chambers, and book from one full-width directory.
              </p>
            </div>
            <div className="rounded-lg bg-white/10 p-5 ring-1 ring-white/10">
              <p className="text-3xl font-bold">{doctors.length}</p>
              <p className="text-sm text-slate-300">matching doctors</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1680px] px-4 py-8 lg:px-8">
        <div className="animate-rise mb-8 overflow-hidden rounded-lg bg-white shadow-xl shadow-slate-200/60 ring-1 ring-slate-200">
          <div className="grid gap-4 p-5 lg:grid-cols-[1.35fr_0.7fr_1fr_auto_auto] lg:items-end">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Search doctors</label>
              <input
                type="text"
                placeholder="Doctor name, specialty, qualification..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="h-12 w-full rounded-lg border border-slate-300 px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Gender</label>
              <div className="grid h-12 grid-cols-3 rounded-lg border border-slate-200 bg-slate-50 p-1">
                {genders.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleGenderChange(item)}
                    className={`rounded-md text-sm font-semibold transition ${
                      gender === item ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Specialty</label>
              <select
                value={selectedSpecialty}
                onChange={(e) => handleSpecialtyChange(e.target.value)}
                className="h-12 w-full rounded-lg border border-slate-300 px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>

            <button onClick={handleSearch} className="h-12 rounded-lg bg-blue-600 px-7 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:-translate-y-0.5 hover:bg-blue-700">
              Search
            </button>
            <button onClick={clearFilters} className="h-12 rounded-lg border border-slate-300 px-6 font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50">
              Reset
            </button>
          </div>
        </div>

        <main className="w-full">
          <div className="mb-6 flex flex-col gap-3 rounded-lg bg-white p-5 shadow-sm ring-1 ring-slate-200 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">Available Doctors</h2>
              <p className="text-sm text-slate-500">
                {loading ? 'Loading directory...' : `${doctors.length} doctors found`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-sm">
              {selectedSpecialty !== 'All' && <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">{selectedSpecialty}</span>}
              {gender !== 'All' && <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">{gender}</span>}
              {searchQuery && <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">{searchQuery}</span>}
            </div>
          </div>

          {loading ? (
            <div className="rounded-lg bg-white p-10 text-center text-slate-500 shadow-sm ring-1 ring-slate-200">Loading doctors...</div>
          ) : doctors.length === 0 ? (
            <div className="rounded-lg bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
              <h3 className="text-xl font-bold text-slate-950">No doctors found</h3>
              <p className="mt-2 text-slate-500">Try changing your search or clearing filters.</p>
              <button onClick={clearFilters} className="mt-5 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid w-full gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {doctors.map((doctor) => (
                <article key={doctor.id} className="group relative overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-950/10">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-400 opacity-0 transition group-hover:opacity-100" />
                  <div className="flex h-full flex-col">
                    <Link href={`/doctors/${doctor.id}`} className="block h-48 overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
                      {doctor.image ? (
                        <img src={getImageUrl(doctor.image)} alt={doctor.name} className="h-full w-full object-contain object-top p-2 transition duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-blue-600 text-5xl font-bold text-white">
                          {doctor.name.charAt(0)}
                        </div>
                      )}
                    </Link>

                    <div className="flex flex-1 flex-col p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link href={`/doctors/${doctor.id}`} className="text-lg font-bold text-slate-950 hover:text-blue-700">
                            {doctor.name}
                          </Link>
                          <p className="mt-1 text-sm font-medium text-blue-600">{doctor.specialty}</p>
                        </div>
                        <div className="shrink-0 rounded-lg bg-emerald-50 px-3 py-2 text-right ring-1 ring-emerald-100">
                          <p className="text-xs text-emerald-700">Fee</p>
                          <p className="font-bold text-emerald-700">${doctor.fees}</p>
                        </div>
                      </div>

                      <div className="mt-3 line-clamp-3 space-y-1 text-sm text-slate-600">
                        {doctor.bmdc_reg_no && <p>BMDC Reg: {doctor.bmdc_reg_no}</p>}
                        <p>{doctor.qualifications || 'No qualifications listed'}</p>
                        {doctor.field_of_concentration && <p>Focus: {doctor.field_of_concentration}</p>}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          {doctor.available_days || 'Availability not specified'}
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          {doctor.chambers?.length || 0} chamber(s)
                        </span>
                        {doctor.gender && (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                            {doctor.gender}
                          </span>
                        )}
                      </div>

                      <div className="mt-auto flex gap-2 pt-4">
                        <Link href={`/doctors/${doctor.id}`} className="flex-1 rounded-lg bg-blue-600 px-3 py-2.5 text-center text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
                          View & Book
                        </Link>
                        <Link href={`/doctors/${doctor.id}`} className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                          Profile
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </section>
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

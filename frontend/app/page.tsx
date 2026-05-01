'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  qualifications?: string;
  image?: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000';

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);

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

  const specialties = useMemo(() => {
    const unique = new Set(doctors.map((doctor) => doctor.specialty).filter(Boolean));
    return Array.from(unique).slice(0, 6);
  }, [doctors]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('q', searchQuery.trim());
    router.push(`/doctors?${params.toString()}`);
  };

  const getImageUrl = (imagePath: string | null | undefined): string | undefined => {
    if (!imagePath) return undefined;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,184,166,0.24),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(59,130,246,0.25),transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_52%,#111827_100%)]" />
        <div className="relative mx-auto grid min-h-[520px] max-w-7xl items-center gap-10 px-4 py-16 md:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <div className="animate-rise">
            <p className="mb-4 inline-flex rounded-full border border-teal-300/30 bg-white/10 px-4 py-2 text-sm font-medium text-teal-100">
              Trusted specialist appointments, made simple
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-white md:text-6xl">
              Book the right doctor without the waiting-room guesswork.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Browse verified specialists, compare chamber times, and manage appointments from one clean dashboard.
            </p>

            <div className="mt-8 max-w-2xl rounded-lg bg-white p-2 shadow-2xl shadow-blue-950/30">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search by doctor name or specialty"
                  className="min-h-12 flex-1 rounded-md border border-slate-200 px-4 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  onClick={handleSearch}
                  className="min-h-12 rounded-md bg-blue-600 px-6 font-semibold text-white transition hover:bg-blue-700"
                >
                  Search
                </button>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              {specialties.slice(0, 4).map((specialty) => (
                <button
                  key={specialty}
                  onClick={() => router.push(`/doctors?specialty=${encodeURIComponent(specialty)}`)}
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-100 transition hover:border-teal-300 hover:bg-teal-300/10"
                >
                  {specialty}
                </button>
              ))}
            </div>
          </div>

          <div className="animate-float hidden md:block">
            <div className="rounded-lg border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur">
              <div className="grid gap-4">
                {doctors.slice(0, 3).map((doctor, index) => (
                  <Link
                    href={`/doctors/${doctor.id}`}
                    key={doctor.id}
                    className="flex items-center gap-4 rounded-lg bg-white p-4 transition hover:-translate-y-1 hover:shadow-xl"
                    style={{ animationDelay: `${index * 120}ms` }}
                  >
                    <div className="h-16 w-16 overflow-hidden rounded-lg bg-slate-100">
                      {doctor.image ? (
                        <img src={getImageUrl(doctor.image)} alt={doctor.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-blue-600">
                          {doctor.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-950">{doctor.name}</p>
                      <p className="text-sm text-blue-600">{doctor.specialty}</p>
                      <p className="mt-1 text-xs text-slate-500">{doctor.qualifications || 'Specialist consultant'}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-slate-50 px-4 py-8">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3 lg:px-8">
          {[
            ['24/7', 'Appointment access'],
            [doctors.length || '50+', 'Listed specialists'],
            ['3 steps', 'Search, select, confirm'],
          ].map(([value, label]) => (
            <div key={label} className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <p className="text-3xl font-bold text-slate-950">{value}</p>
              <p className="mt-1 text-slate-600">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-7xl lg:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="font-semibold text-blue-600">Featured specialists</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-950">Care teams ready for your next visit</h2>
            </div>
            <Link href="/doctors" className="font-semibold text-blue-600 hover:text-blue-700">
              View all doctors
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {doctors.slice(0, 4).map((doctor) => (
              <Link
                href={`/doctors/${doctor.id}`}
                key={doctor.id}
                className="group overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="h-52 bg-slate-100">
                  {doctor.image ? (
                    <img src={getImageUrl(doctor.image)} alt={doctor.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-blue-600">
                      {doctor.name.charAt(0)}
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-slate-950">{doctor.name}</h3>
                  <p className="mt-1 text-sm text-blue-600">{doctor.specialty}</p>
                  <p className="mt-3 text-sm text-slate-500">View profile and available appointment times</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950 px-4 py-16 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3 lg:px-8">
          {[
            ['Search precisely', 'Use All Doctors to filter specialists by name, specialty, and gender.'],
            ['Book confidently', 'Choose a chamber, date, and time from each doctor profile.'],
            ['Manage easily', 'Patients and doctors can track bookings from their dashboards.'],
          ].map(([title, text], index) => (
            <div key={title} className="animate-rise rounded-lg border border-white/10 bg-white/5 p-6" style={{ animationDelay: `${index * 120}ms` }}>
              <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-teal-400 font-bold text-slate-950">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="mt-3 leading-7 text-slate-300">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

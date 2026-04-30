'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

const specialties = [
  'General Physician',
  'Dermatologist',
  'Pediatrician',
  'Neurologist',
  'Gastroenterologist',
  'Cardiologist',
];

export default function Home() {
  const router = useRouter();

  const handleSearch = (specialty: string) => {
    if (specialty) {
      router.push(`/doctors?specialty=${encodeURIComponent(specialty)}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-blue-500 text-white py-20 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">Find the Right Doctor for You</h1>
        <p className="text-xl mb-8">Book appointments with top specialists near you</p>
        <Link href="/doctors" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">
          View All Doctors
        </Link>
      </section>

      {/* Specialties Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Find by Specialty</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {specialties.map((specialty) => (
              <button
                key={specialty}
                onClick={() => handleSearch(specialty)}
                className="bg-white border-2 border-blue-500 text-blue-600 p-6 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                {specialty}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-gray-100 py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Choose a Specialist</h3>
              <p className="text-gray-600">Browse doctors by specialty and find the right one for you</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Book an Appointment</h3>
              <p className="text-gray-600">Select a date and time that works for you</p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Get Confirmation</h3>
              <p className="text-gray-600">Receive instant confirmation and reminders</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
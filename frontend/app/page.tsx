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

const heroSlides = [
  {
    image:
      'https://images.unsplash.com/photo-1580281657521-8b2d7ff421f2?auto=format&fit=crop&w=1200&q=80',
    title: 'Book a Doctor\'s Appointment in Just 10 Minutes with Sasthya Seba',
    description:
      'Say goodbye to endless phone calls and long queues. Book doctors appointments, video consultations, ambulance service, manage medical records, and more.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80',
    title: 'Video Consultation and Home Care in One Place',
    description:
      'Connect with specialists instantly, book chamber appointments, or request a doctor visit at home with a few clicks.',
  },
  {
    image:
      'https://images.unsplash.com/photo-1550831107-1553da8c8464?auto=format&fit=crop&w=1200&q=80',
    title: 'Emergency Ambulance and Diagnostic Support',
    description:
      'Access 24/7 ambulance services, diagnostic home sample collection, and trusted medical support across Bangladesh.',
  },
];

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    // Handle scrolling to sections when page loads with hash
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100); // Small delay to ensure DOM is ready
      }
    }
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
    return Array.from(unique).slice(0, 8);
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
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 py-3 shadow-sm shadow-slate-200/20 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 text-sm text-slate-700 md:px-8">
          <div className="flex flex-wrap items-center gap-2">
            {[
              'Find Doctor',
              'Find Hospital',
              'Find Ambulance',
              'Login/Register',
              'Health Checkup & Insurance',
              'Domiciliary Services',
              'Diagnostic Home Services',
              'Get the app',
              'Support',
            ].map((item) => (
              <span key={item} className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5">
                {item}
              </span>
            ))}
          </div>
        </div>
      </header>

      <main>
        <section id="home" className="relative overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.2),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.18),transparent_28%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-[1.1fr_0.9fr] lg:px-8">
            <div className="flex flex-col justify-center gap-6 py-6">
              <p className="inline-flex rounded-full border border-emerald-300/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-200">
                Book a doctor in 10 minutes
              </p>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-white md:text-6xl">
                Book a Doctor&apos;s Appointment in Just 10 Minutes with Sasthya Seba.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-300 md:text-lg">
                Say goodbye to endless phone calls and long queues. Book doctors&apos; appointments, video consultations, ambulance service, manage medical records, and more.
              </p>

              <div className="grid gap-4 sm:grid-cols-[1.4fr_0.6fr]">
                <div className="rounded-3xl border border-white/10 bg-white/10 p-3 shadow-xl shadow-slate-950/20">
                  <div className="flex gap-3">
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Search doctors, hospitals, clinics..."
                      className="w-full rounded-2xl border border-slate-700/60 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
                    />
                    <button
                      onClick={handleSearch}
                      className="rounded-2xl bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
                    >
                      Search
                    </button>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {['Video Consultancy', 'Chamber Appointment', 'Doctor At Your Home', 'Ambulance Service', 'Domiciliary Service'].slice(0, 2).map((label) => (
                    <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-100">
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-300">
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Need a Doctor to Visit your Loved One at Home? Dial - 09611 530 530</span>
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2">Emergency ambulance: 01405600700</span>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-4xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-slate-950/40">
              <img
                src={heroSlides[activeSlide].image}
                alt={heroSlides[activeSlide].title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="mb-2 text-sm uppercase tracking-[0.2em] text-emerald-300">Trusted healthcare for every moment</p>
                <h2 className="text-2xl font-bold text-white md:text-3xl">{heroSlides[activeSlide].title}</h2>
                <p className="mt-3 max-w-xl text-sm text-slate-200 md:text-base">{heroSlides[activeSlide].description}</p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => router.push('/doctors')}
                    className="rounded-full bg-emerald-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400"
                  >
                    Find Doctor
                  </button>
                  <button
                    onClick={() => router.push('/contact')}
                    className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-white transition hover:bg-white/20"
                  >
                    Support
                  </button>
                </div>
              </div>
              <div className="absolute bottom-6 right-6 flex items-center gap-2">
                {heroSlides.map((_, slideIndex) => (
                  <button
                    key={slideIndex}
                    onClick={() => setActiveSlide(slideIndex)}
                    className={`h-2.5 w-2.5 rounded-full transition ${activeSlide === slideIndex ? 'bg-emerald-400' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-10 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Health Checkup & Insurance', 'Keep your whole family covered with custom packages.'],
                ['Domiciliary Services', 'Doctor and nurse visits at home for recovery care.'],
                ['Diagnostic Home Services', 'Lab sample collection and reports delivered to your door.'],
                ['Get the app', 'Manage appointments and records from your phone.'],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-3xl border border-slate-200 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 px-4 py-14 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">Consult our top specialized doctors</p>
                <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Our doctors are ready to serve you 24/7</h2>
              </div>
              <Link href="/doctors" className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20">
                View all
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {['Gynecologist & Obstetrician', 'Medicine Specialist', 'Cardiologist', 'Pediatrician', 'General Surgeon', 'Otolaryngologists (ENT)'].map((specialty) => (
                <div key={specialty} className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:-translate-y-1 hover:shadow-xl">
                  <p className="text-sm uppercase tracking-[0.18em] text-emerald-200">{specialty}</p>
                  <p className="mt-4 text-lg font-semibold text-white">Consult Now</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-4xl border border-slate-200 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-950/10">
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">Need medical support?</p>
                  <h3 className="mt-4 text-3xl font-bold">Need a Doctor to Visit your Loved One at Home?</h3>
                  <p className="mt-4 max-w-xl text-slate-300">Request a home visit and receive care from trusted professionals with medical equipment and follow-up support.</p>
                </div>
                <div className="rounded-3xl bg-white/10 p-6 text-center">
                  <p className="text-sm uppercase tracking-[0.24em] text-emerald-200">Call us now</p>
                  <p className="mt-3 text-4xl font-bold text-white">09611 530 530</p>
                  <p className="mt-2 text-sm text-slate-300">Emergency ambulance: 01405600700</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-500">Emergency services</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950">We are ready to help at your emergency</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                ['AC Ambulance', 'Get ambulance within 30 minutes*', '24/7 affordable quality service'],
                ['ICU Ambulance', 'Get ambulance within 30 minutes*', '24/7 affordable quality service'],
                ['AIR Ambulance', 'Get ambulance within 60 minutes*', '24/7 affordable quality service'],
              ].map(([title, subtitle, text]) => (
                <div key={title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-lg font-semibold text-slate-950">{title}</p>
                  <p className="mt-3 text-sm text-slate-600">{subtitle}</p>
                  <p className="mt-4 text-sm text-slate-500">{text}</p>
                  <p className="mt-5 text-sm font-semibold text-emerald-600">Call: 01405600700</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-500">Diagnostic care</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950">Get timely, cost-effective, and high quality diagnostic care</h2>
              <p className="mt-4 text-slate-600">Book tests with top labs, get sample pick up, and share reports with doctors online.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {['CT Scan', 'Blood Tests', 'Endoscopy', 'Ultrasound', 'X-Ray', 'Microbiology'].map((label) => (
                <div key={label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                  <p className="text-lg font-semibold text-slate-950">{label}</p>
                  <p className="mt-3 text-sm text-slate-600">Check Prices</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-950 px-4 py-14 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">Mobile App</p>
                <h2 className="mt-3 text-3xl font-bold text-white">Get all the benefits of Sasthya Seba through our mobile app</h2>
                <p className="mt-4 max-w-2xl text-slate-300">Book Appointment Online, Video Call With Doctor, Get Prescription Instantly, and manage all your health needs from one app.</p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <button className="rounded-full bg-emerald-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-emerald-400">
                    Get It On Google Play
                  </button>
                  <button className="rounded-full border border-white/20 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20">
                    Download on the App Store
                  </button>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
                  <p className="text-base font-semibold text-white">Book Appointment Online</p>
                  <p className="mt-2 text-sm text-slate-300">Reserve a doctor visit or consultation in just a few taps.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
                  <p className="text-base font-semibold text-white">Video Call With Doctor</p>
                  <p className="mt-2 text-sm text-slate-300">Secure online consultations with specialists across Bangladesh.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/10 p-6">
                  <p className="text-base font-semibold text-white">Get Prescription Instantly</p>
                  <p className="mt-2 text-sm text-slate-300">Receive digital prescriptions after your consultation without delay.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-500">What people love</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950">Why people love Sasthya Seba</h2>
              <p className="mt-4 text-slate-600">We continuously improve our services based on the opinion of our users.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[
                'Very helpful. Far easier than doing same things on computer. Allows quick and easy search with speedy booking. Even maintains history of doctors visited. - Faiyaz-A-Chowdhury',
                'Dear Fatema, “Thank you so much for your diligent follow up and especially for calling me back. It is very rare that someone from customer support for any company ever reverts. Reaffirms my faith in Sasthya Seba. - Israt-Mou',
                'The service of Sasthya Seba is praiseworthy. When my grandmother was at critical moment, we were all worried to have a vehicle in that late night. - Labby Ahsan',
              ].map((quote, index) => (
                <div key={index} className="rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <p className="text-sm leading-7 text-slate-700">{quote}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="bg-slate-950 px-4 py-14 text-white sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">About DocAssist</p>
              <h2 className="mt-3 text-3xl font-bold text-white md:text-4xl">Your trusted healthcare platform</h2>
            </div>
            <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div>
                <p className="text-lg leading-8 text-slate-300">
                  Welcome to DocAssist - your trusted platform for booking appointments with qualified healthcare professionals. We connect patients with doctors across various specialties including General Physicians, Dermatologists, Pediatricians, Neurologists, Gastroenterologists, and Cardiologists.
                </p>
                <h3 className="mt-6 text-xl font-semibold text-white">Our Mission</h3>
                <p className="mt-3 text-lg leading-8 text-slate-300">
                  To provide easy access to quality healthcare by enabling seamless appointment booking between patients and doctors.
                </p>
                <h3 className="mt-6 text-xl font-semibold text-white">Why Choose Us?</h3>
                <ul className="mt-3 space-y-2 text-lg text-slate-300">
                  <li>• Wide network of specialist doctors</li>
                  <li>• Easy online booking</li>
                  <li>• Real-time appointment confirmations</li>
                  <li>• Secure and confidential</li>
                  <li>• 24/7 availability</li>
                </ul>
              </div>
              <div className="grid gap-4">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <p className="text-base font-semibold text-white">Wide Network</p>
                  <p className="mt-2 text-sm text-slate-300">Access to specialists across all major medical fields.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <p className="text-base font-semibold text-white">Easy Booking</p>
                  <p className="mt-2 text-sm text-slate-300">Book appointments in just a few clicks.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <p className="text-base font-semibold text-white">Secure Platform</p>
                  <p className="mt-2 text-sm text-slate-300">Your health data is protected and confidential.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="contact" className="bg-white px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-500">Get in touch</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950">Contact Us</h2>
              <p className="mt-4 text-slate-600">Have questions or need help? We're here to assist you.</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center">
                <div className="text-3xl mb-4">📍</div>
                <h3 className="font-semibold text-slate-950">Address</h3>
                <p className="mt-2 text-sm text-slate-600">Suvastu Chirontoni, 26 Indira Road, Farmgate</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center">
                <div className="text-3xl mb-4">📞</div>
                <h3 className="font-semibold text-slate-950">Phone</h3>
                <p className="mt-2 text-sm text-slate-600">01636656861</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center">
                <div className="text-3xl mb-4">✉️</div>
                <h3 className="font-semibold text-slate-950">Email</h3>
                <p className="mt-2 text-sm text-slate-600">farhansarkar10130@gmail.com</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center">
                <div className="text-3xl mb-4">⏰</div>
                <h3 className="font-semibold text-slate-950">Hours</h3>
                <p className="mt-2 text-sm text-slate-600">Mon-Fri: 9AM-6PM<br />Sat: 10AM-4PM</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

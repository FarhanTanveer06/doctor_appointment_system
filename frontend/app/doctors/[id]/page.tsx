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
  user_id: number;
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
  const [selectedChamber, setSelectedChamber] = useState<number | null>(null);
  const [appointmentType, setAppointmentType] = useState('new');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<any>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const isOwnDoctorProfile = user?.role === 'doctor' && doctor?.user_id === user.id;
  const selectedChamberData = doctor?.chambers?.find((chamber) => chamber.id === selectedChamber);

  useEffect(() => {
    fetchDoctor();
  }, [params.id]);

  useEffect(() => {
    if (doctor?.chambers?.length === 1 && !selectedChamber) {
      setSelectedChamber(doctor.chambers[0].id);
    }
  }, [doctor, selectedChamber]);

  useEffect(() => {
    if (doctor) {
      generateTimeSlots();
    }
  }, [selectedChamber, doctor]);

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

  const generateTimeSlots = () => {
    const slots: string[] = [];
    let startHour = 9;
    let endHour = 23;

    if (selectedChamber && doctor?.chambers) {
      const chamber = doctor.chambers.find((item) => item.id === selectedChamber);
      if (chamber?.appointment_time_start && chamber?.appointment_time_end) {
        startHour = parseInt(chamber.appointment_time_start.split(':')[0]);
        endHour = parseInt(chamber.appointment_time_end.split(':')[0]);
      }
    }

    for (let hour = startHour; hour < endHour; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    setAvailableSlots(slots);
  };

  const handleChamberChange = (chamberId: number) => {
    setSelectedChamber(chamberId);
    setAppointmentTime('');
  };

  const handleBooking = async () => {
    if (!user) {
      router.push('/login?redirect=' + encodeURIComponent(`/doctors/${params.id}`));
      return;
    }
    if (isOwnDoctorProfile) {
      alert('You cannot book an appointment with yourself');
      return;
    }
    if (!appointmentDate || !appointmentTime) {
      alert('Please select date and time');
      return;
    }
    if (doctor?.chambers && doctor.chambers.length > 0 && !selectedChamber) {
      alert('Please select a chamber');
      return;
    }

    try {
      setBooking(true);
      const bookingData: any = {
        doctorId: doctor?.id,
        appointmentDate,
        appointmentTime,
        appointmentType,
      };
      if (selectedChamber) {
        bookingData.chamberId = selectedChamber;
      }

      const response = await api.post('/appointments', bookingData);
      setConfirmedAppointment(response.data.appointment);
      setShowConfirmation(true);
    } catch (error: any) {
      alert(error.response?.data?.message || error.message || 'Failed to book appointment');
    } finally {
      setBooking(false);
    }
  };

  const getImageUrl = (imagePath: string | null | undefined): string | undefined => {
    if (!imagePath) return undefined;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  const getAppointmentTypeLabel = (type: string) => {
    switch (type) {
      case 'new': return 'New Patient';
      case 'followup': return 'Follow-up Visit';
      case 'report': return 'Report Show';
      default: return type;
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-600">Loading...</div>;
  if (!doctor) return <div className="p-10 text-center text-slate-600">Doctor not found</div>;

  if (showConfirmation && confirmedAppointment) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-3xl overflow-hidden rounded-lg bg-white shadow-xl ring-1 ring-slate-200">
          <div className="bg-emerald-600 px-8 py-10 text-center text-white">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white text-emerald-600">
              <svg className="h-9 w-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold">Appointment booked</h1>
            <p className="mt-2 text-emerald-50">Your request is now waiting for doctor confirmation.</p>
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2">
            {[
              ['Doctor', doctor.name],
              ['Specialty', doctor.specialty],
              ['Visit type', getAppointmentTypeLabel(confirmedAppointment.appointment_type || appointmentType)],
              ['Date and time', `${confirmedAppointment.appointment_date} at ${confirmedAppointment.appointment_time}`],
              ['Chamber', selectedChamberData?.chamber_name || 'Not selected'],
              ['Fee', `$${doctor.fees}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{label}</p>
                <p className="mt-1 font-semibold text-slate-950">{value}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 p-6 sm:flex-row">
            <button
              onClick={() => router.push(user?.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard')}
              className="flex-1 rounded-lg bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700"
            >
              {user?.role === 'doctor' ? 'View My Visits' : 'View My Appointments'}
            </button>
            <button
              onClick={() => {
                setShowConfirmation(false);
                setAppointmentDate('');
                setAppointmentTime('');
              }}
              className="flex-1 rounded-lg border border-slate-300 bg-white py-3 font-semibold text-slate-700 hover:bg-slate-100"
            >
              Book Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-slate-950 px-4 py-10 text-white">
        <div className="mx-auto grid max-w-screen-2xl gap-5 lg:grid-cols-[300px_1fr] lg:px-8">
          <div className="overflow-hidden rounded-4xl bg-slate-900/90 ring-1 ring-white/10 shadow-2xl shadow-slate-950/30">
            <div className="h-64 bg-slate-800">
              {doctor.image ? (
                <img src={getImageUrl(doctor.image)} alt={doctor.name} className="h-full w-full object-cover object-top" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-amber-200">
                  {doctor.name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-100 ring-1 ring-amber-100/40">{doctor.specialty}</span>
              {doctor.gender && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-200">{doctor.gender}</span>}
              {doctor.bmdc_reg_no && <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-slate-200">BMDC {doctor.bmdc_reg_no}</span>}
            </div>
            <h1 className="text-3xl font-bold md:text-4xl leading-tight">{doctor.name}</h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-300">{doctor.qualifications || 'Specialist consultant'}</p>
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Consultation fee</p>
                <p className="mt-1 text-xl font-semibold text-amber-300">${doctor.fees}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Chambers</p>
                <p className="mt-1 text-xl font-semibold text-white">{doctor.chambers?.length || 0}</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Availability</p>
                <p className="mt-1 text-xl font-semibold text-white">{doctor.available_days || 'Flexible'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-screen-2xl gap-8 px-4 py-10 lg:grid-cols-[1fr_420px] lg:px-8">
        <div className="space-y-6">
          {doctor.description && (
            <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-bold text-slate-950">About</h2>
              <p className="mt-3 leading-7 text-slate-600">{doctor.description}</p>
            </div>
          )}

          {(doctor.field_of_concentration || doctor.specializations || doctor.work_experience || doctor.education) && (
            <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-xl font-bold text-slate-950">Professional Information</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {[
                  ['Field of Concentration', doctor.field_of_concentration],
                  ['Specializations', doctor.specializations],
                  ['Work Experience', doctor.work_experience],
                  ['Education', doctor.education],
                ].filter(([, value]) => value).map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-700">{label}</p>
                    <p className="mt-2 whitespace-pre-line text-slate-600">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-xl font-bold text-slate-950">Chamber Locations</h2>
            {doctor.chambers && doctor.chambers.length > 0 ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {doctor.chambers.map((chamber) => (
                  <button
                    key={chamber.id}
                    onClick={() => handleChamberChange(chamber.id)}
                    className={`rounded-lg border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                      selectedChamber === chamber.id ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-100' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-950">{chamber.chamber_name}</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{chamber.chamber_address}</p>
                      </div>
                      {selectedChamber === chamber.id && <span className="rounded-full bg-amber-600 px-2 py-1 text-xs font-semibold text-white">Selected</span>}
                    </div>
                    <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
                      <p>Days: {chamber.available_days || 'Not specified'}</p>
                      {chamber.appointment_time_start && chamber.appointment_time_end && (
                        <p>Time: {chamber.appointment_time_start} - {chamber.appointment_time_end}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-lg bg-amber-50 p-4 text-amber-800">No chamber information available. Please contact the doctor directly.</p>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-4xl bg-slate-100 shadow-2xl ring-1 ring-slate-200/80">
            <div className="bg-slate-900 p-6 text-white">
              <h2 className="text-2xl font-bold">Book Appointment</h2>
              <p className="mt-2 text-slate-300">Select your visit type, date, and chamber slot.</p>
            </div>

            <div className="space-y-6 p-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Appointment Type</label>
                <div className="grid gap-2">
                  {[
                    { value: 'new', label: 'New Patient', desc: 'First time visit' },
                    { value: 'followup', label: 'Follow-up', desc: 'Review previous treatment' },
                    { value: 'report', label: 'Report Show', desc: 'Show test reports' },
                  ].map((type) => (
                    <label key={type.value} className={`flex cursor-pointer gap-3 rounded-3xl border p-3 transition ${appointmentType === type.value ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white hover:border-amber-300'}`}>
                      <input type="radio" name="appointmentType" value={type.value} checked={appointmentType === type.value} onChange={(e) => setAppointmentType(e.target.value)} className="mt-1" />
                      <span>
                        <span className="block font-semibold text-slate-900">{type.label}</span>
                        <span className="text-sm text-slate-500">{type.desc}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {doctor.chambers && doctor.chambers.length > 1 && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Selected Chamber</label>
                  <select value={selectedChamber || ''} onChange={(e) => handleChamberChange(Number(e.target.value))} className="w-full rounded-3xl border border-slate-300 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100">
                    <option value="">Choose a chamber</option>
                    {doctor.chambers.map((chamber) => (
                      <option key={chamber.id} value={chamber.id}>{chamber.chamber_name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Date</label>
                <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full rounded-3xl border border-slate-300 px-4 py-3 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100" />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Time</label>
                <div className="grid max-h-56 grid-cols-3 gap-2 overflow-y-auto pr-1">
                  {availableSlots.map((slot) => (
                    <button key={slot} onClick={() => setAppointmentTime(slot)} className={`rounded-3xl border py-2 text-sm font-medium transition ${appointmentTime === slot ? 'border-amber-600 bg-amber-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-amber-300'}`}>
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {(appointmentDate || appointmentTime || selectedChamberData) && (
                <div className="rounded-3xl bg-white p-4 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200">
                  <p className="font-semibold text-slate-950">Appointment Summary</p>
                  <p className="mt-2">Date: {appointmentDate || 'Not selected'}</p>
                  <p>Time: {appointmentTime || 'Not selected'}</p>
                  <p>Chamber: {selectedChamberData?.chamber_name || 'Not selected'}</p>
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={isOwnDoctorProfile || booking || !appointmentDate || !appointmentTime || (doctor.chambers && doctor.chambers.length > 0 && !selectedChamber)}
                className="w-full rounded-3xl bg-amber-600 py-3 font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isOwnDoctorProfile ? 'Cannot Book Yourself' : booking ? 'Booking...' : 'Confirm Booking'}
              </button>

              {isOwnDoctorProfile && <p className="text-center text-sm text-slate-500">You can book other doctors, but not your own profile.</p>}
              {!user && <p className="text-center text-sm text-slate-500">Please <Link href="/login" className="font-semibold text-amber-600">login</Link> to book an appointment.</p>}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

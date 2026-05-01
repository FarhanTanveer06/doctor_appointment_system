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
  const [selectedChamber, setSelectedChamber] = useState<number | null>(null);
  const [appointmentType, setAppointmentType] = useState<string>('new');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<any>(null);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotConflict, setSlotConflict] = useState<string | null>(null);

  const isOwnDoctorProfile = user?.role === 'doctor' && doctor?.user_id === user.id;

  useEffect(() => {
    fetchDoctor();
  }, [params.id]);

  useEffect(() => {
    if (doctor?.chambers?.length === 1 && !selectedChamber) {
      setSelectedChamber(doctor.chambers[0].id);
    }
  }, [doctor, selectedChamber]);

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

  // Generate available time slots based on chamber or doctor settings
  const generateTimeSlots = () => {
    const slots: string[] = [];
    let startHour = 9;
    let endHour = 23;
    
    // If chamber is selected, use chamber times
    if (selectedChamber && doctor?.chambers) {
      const chamber = doctor.chambers.find(c => c.id === selectedChamber);
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

  useEffect(() => {
    if (doctor) {
      generateTimeSlots();
    }
  }, [selectedChamber, doctor]);

  const handleChamberChange = (chamberId: number) => {
    setSelectedChamber(chamberId);
    setAppointmentTime('');
    setSlotConflict(null);
  };

  const checkSlotAvailability = async (date: string, time: string) => {
    if (!date || !time || !doctor) return;
    
    try {
      setSlotConflict(null);
      // Try to book - backend will check for conflicts
      // We'll do a preview check
    } catch (error: any) {
      if (error.response?.status === 400) {
        setSlotConflict(error.response.data.message);
      }
    }
  };

  const handleTimeChange = (time: string) => {
    setAppointmentTime(time);
    if (appointmentDate && time && doctor) {
      checkSlotAvailability(appointmentDate, time);
    }
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
        appointmentType
      };
      
      // Only add chamberId if a chamber is selected
      if (selectedChamber) {
        bookingData.chamberId = selectedChamber;
      }
      
      const response = await api.post('/appointments', bookingData);
      
      setConfirmedAppointment(response.data.appointment);
      setShowConfirmation(true);
    } catch (error: any) {
      console.error('Booking error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to book appointment';
      alert(errorMessage);
    } finally {
      setBooking(false);
    }
  };

  const getImageUrl = (imagePath: string | null | undefined): string | undefined => {
    if (!imagePath) return undefined;
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = API_URL.replace('/api', '');
    return `${baseUrl}${imagePath}`;
  };

  const getAppointmentTypeLabel = (type: string) => {
    switch (type) {
      case 'new': return 'New Patient';
      case 'followup': return 'Follow-up Visit';
      case 'report': return 'Report Show';
      default: return type;
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!doctor) return <div className="p-8 text-center">Doctor not found</div>;

  // Show confirmation modal
  if (showConfirmation && confirmedAppointment) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Appointment Confirmed!</h2>
            <p className="text-gray-600 mb-6">Your appointment has been booked successfully.</p>
            
            <div className="bg-gray-50 rounded-lg p-6 text-left mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Doctor</p>
                  <p className="font-semibold">{doctor.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Specialty</p>
                  <p className="font-semibold">{doctor.specialty}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Appointment Type</p>
                  <p className="font-semibold">{getAppointmentTypeLabel(confirmedAppointment.appointment_type || appointmentType)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date & Time</p>
                  <p className="font-semibold">{confirmedAppointment.appointment_date} at {confirmedAppointment.appointment_time}</p>
                </div>
                {selectedChamber && doctor.chambers && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Chamber</p>
                    <p className="font-semibold">{doctor.chambers.find(c => c.id === selectedChamber)?.chamber_name}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Consultation Fee</p>
                  <p className="font-semibold text-green-600">${doctor.fees}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
                    {confirmedAppointment.status || 'Pending'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => router.push(user?.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard')}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                {user?.role === 'doctor' ? 'View My Visits' : 'View My Appointments'}
              </button>
              <button onClick={() => { setShowConfirmation(false); setAppointmentDate(''); setAppointmentTime(''); }} className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300">
                Book Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-5xl mx-auto">
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

          {/* Main Content: Left - Doctor Info, Right - Chamber & Booking */}
          <div className="p-6 border-t">
            <div className="md:flex gap-6">
              {/* Left Column - Doctor Info (Chambers moved to right side) */}
              <div className="md:w-2/3">
                {/* Chambers - Now on the right side */}
                {doctor.chambers && doctor.chambers.length > 0 && (
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold mb-4">Chamber Locations</h2>
                    <div className="space-y-3">
                      {doctor.chambers.map((chamber, index) => (
                        <div 
                          key={index} 
                          onClick={() => handleChamberChange(chamber.id)}
                          className={`bg-gray-50 p-4 rounded-lg cursor-pointer transition-all ${
                            selectedChamber === chamber.id 
                              ? 'ring-2 ring-blue-500 bg-blue-50' 
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold">{chamber.chamber_name}</h3>
                              <p className="text-gray-600 text-sm">{chamber.chamber_address}</p>
                              <div className="mt-2 text-sm text-gray-500">
                                <p>Available: {chamber.available_days || 'Not specified'}</p>
                                {chamber.appointment_time_start && chamber.appointment_time_end && (
                                  <p>Time: {chamber.appointment_time_start} - {chamber.appointment_time_end}</p>
                                )}
                              </div>
                            </div>
                            {selectedChamber === chamber.id && (
                              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">Selected</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* If no chambers, show message */}
                {(!doctor.chambers || doctor.chambers.length === 0) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-yellow-800">No chamber information available. Please contact the doctor directly.</p>
                  </div>
                )}
              </div>

              {/* Right Column - Booking Section */}
              <div className="md:w-1/3">
                <div className="bg-gray-50 rounded-lg p-6 sticky top-4">
                  <h2 className="text-xl font-semibold mb-4">Book Appointment</h2>
                  
                  {/* Appointment Type Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Appointment Type</label>
                    <div className="space-y-2">
                      {[
                        { value: 'new', label: 'New Patient', desc: 'First time visit' },
                        { value: 'followup', label: 'Follow-up', desc: 'Review previous treatment' },
                        { value: 'report', label: 'Report Show', desc: 'Show test reports' }
                      ].map((type) => (
                        <label
                          key={type.value}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                            appointmentType === type.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="appointmentType"
                            value={type.value}
                            checked={appointmentType === type.value}
                            onChange={(e) => setAppointmentType(e.target.value)}
                            className="mr-3"
                          />
                          <div>
                            <p className="font-medium text-sm">{type.label}</p>
                            <p className="text-xs text-gray-500">{type.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Chamber Selection (if multiple chambers) */}
                  {doctor.chambers && doctor.chambers.length > 1 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Select Chamber</label>
                      <select
                        value={selectedChamber || ''}
                        onChange={(e) => handleChamberChange(Number(e.target.value))}
                        className="w-full border rounded-lg px-3 py-2"
                      >
                        <option value="">Select a chamber</option>
                        {doctor.chambers.map((chamber) => (
                          <option key={chamber.id} value={chamber.id}>
                            {chamber.chamber_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Date Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Select Date</label>
                    <input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  {/* Time Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Select Time</label>
                    {availableSlots.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                        {availableSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => handleTimeChange(slot)}
                            className={`py-2 px-1 text-sm rounded border transition-all ${
                              appointmentTime === slot
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white border-gray-200 hover:border-blue-300'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="time"
                        value={appointmentTime}
                        onChange={(e) => setAppointmentTime(e.target.value)}
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    )}
                  </div>

                  {/* Slot Conflict Warning */}
                  {slotConflict && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-600 text-sm">{slotConflict}</p>
                    </div>
                  )}

                  {/* Booking Summary */}
                  {appointmentDate && appointmentTime && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Selected:</strong> {appointmentDate} at {appointmentTime}
                      </p>
                      <p className="text-sm text-blue-600">
                        Type: {getAppointmentTypeLabel(appointmentType)}
                      </p>
                    </div>
                  )}

                  {/* Book Button */}
                  <button
                    onClick={handleBooking}
                    disabled={isOwnDoctorProfile || booking || !appointmentDate || !appointmentTime || (doctor.chambers && doctor.chambers.length > 0 && !selectedChamber)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                  >
                    {isOwnDoctorProfile ? 'Cannot Book Yourself' : booking ? 'Booking...' : 'Confirm Booking'}
                  </button>

                  {isOwnDoctorProfile && (
                    <p className="text-sm text-gray-500 mt-3 text-center">
                      You can book other doctors, but not your own profile.
                    </p>
                  )}

                  {!user && (
                    <p className="text-sm text-gray-500 mt-3 text-center">
                      Please <Link href="/login" className="text-blue-600 hover:underline">login</Link> to book an appointment
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

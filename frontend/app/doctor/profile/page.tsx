'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface Chamber {
  id?: number;
  chamber_name: string;
  chamber_address: string;
  available_days: string;
  appointment_time_start: string;
  appointment_time_end: string;
}

interface DoctorProfile {
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

const genders = ['Male', 'Female'];

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DoctorProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialty: '',
    qualifications: '',
    fees: 0,
    available_days: [] as string[],
    gender: 'Male',
    bmdc_reg_no: '',
    id_no: '',
    description: '',
    field_of_concentration: '',
    specializations: '',
    work_experience: '',
    education: '',
    image: null as File | null,
    chambers: [] as Chamber[],
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (!authLoading && user && user.role !== 'doctor') {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'doctor') {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/doctors/profile/me');
      const doctor = res.data.doctor;
      if (doctor) {
        setProfile(doctor);
        setFormData({
          name: doctor.name || '',
          email: doctor.email || '',
          specialty: doctor.specialty || '',
          qualifications: doctor.qualifications || '',
          fees: doctor.fees || 0,
          available_days: doctor.available_days ? doctor.available_days.split(',') : [],
          gender: doctor.gender || 'Male',
          bmdc_reg_no: doctor.bmdc_reg_no || '',
          id_no: doctor.id_no || '',
          description: doctor.description || '',
          field_of_concentration: doctor.field_of_concentration || '',
          specializations: doctor.specializations || '',
          work_experience: doctor.work_experience || '',
          education: doctor.education || '',
          image: null,
          chambers: doctor.chambers || [],
        });
        if (doctor.image) {
          setImagePreview(`${API_URL}${doctor.image}`);
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => {
      const days = prev.available_days.includes(day)
        ? prev.available_days.filter(d => d !== day)
        : [...prev.available_days, day];
      return { ...prev, available_days: days };
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleChamberChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const newChambers = [...prev.chambers];
      newChambers[index] = { ...newChambers[index], [field]: value };
      return { ...prev, chambers: newChambers };
    });
  };

  const addChamber = () => {
    setFormData(prev => ({
      ...prev,
      chambers: [...prev.chambers, { chamber_name: '', chamber_address: '', available_days: '', appointment_time_start: '', appointment_time_end: '' }]
    }));
  };

  const removeChamber = (index: number) => {
    setFormData(prev => ({
      ...prev,
      chambers: prev.chambers.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('specialty', formData.specialty);
      data.append('qualifications', formData.qualifications);
      data.append('fees', formData.fees.toString());
      data.append('availableDays', formData.available_days.join(','));
      data.append('gender', formData.gender);
      data.append('bmdc_reg_no', formData.bmdc_reg_no);
      data.append('id_no', formData.id_no);
      data.append('description', formData.description);
      data.append('field_of_concentration', formData.field_of_concentration);
      data.append('specializations', formData.specializations);
      data.append('work_experience', formData.work_experience);
      data.append('education', formData.education);
      data.append('chambers', JSON.stringify(formData.chambers));
      if (formData.image) {
        data.append('image', formData.image);
      }

      const res = await api.put('/doctors/profile/update', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage('Profile updated successfully!');
      if (res.data.doctor?.image) {
        setImagePreview(`${API_URL}${res.data.doctor.image}`);
        localStorage.setItem('doctor_image_updated', Date.now().toString());
      }
    } catch (error) {
      console.error('Failed to update profile', error);
      setMessage('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        {message && (
          <div className={`p-4 mb-4 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          {/* Profile Image */}
          <div className="mb-6 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mb-4">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="w-full h-full object-contain" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </div>
              )}
            </div>
            <label className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
              <span>Change Photo</span>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          {/* Tabs */}
          <div className="flex mb-4 border-b">
            {['basic', 'professional', 'chambers'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 capitalize ${activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600 font-semibold' : 'text-gray-600'}`}
              >
                {tab === 'basic' ? 'Basic Info' : tab === 'professional' ? 'Professional Info' : 'Chambers'}
              </button>
            ))}
          </div>

          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {genders.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">BMDC Registration No.</label>
                <input type="text" name="bmdc_reg_no" value={formData.bmdc_reg_no} onChange={handleChange} placeholder="e.g., BMDC-12345" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">ID No. (NID/Passport)</label>
                <input type="text" name="id_no" value={formData.id_no} onChange={handleChange} placeholder="e.g., 1234567890" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Fees ($)</label>
                <input type="number" name="fees" value={formData.fees} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Days</label>
                <div className="flex flex-wrap gap-2">
                  {days.map(day => (
                    <button key={day} type="button" onClick={() => handleDayToggle(day)} className={`px-3 py-1 rounded text-sm ${formData.available_days.includes(day) ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Professional Info Tab */}
          {activeTab === 'professional' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
                <select name="specialty" value={formData.specialty} onChange={handleChange} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Specialty</option>
                  {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Qualifications</label>
                <input type="text" name="qualifications" value={formData.qualifications} onChange={handleChange} placeholder="e.g., MBBS, MD, MS" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Field of Concentration</label>
                <textarea name="field_of_concentration" value={formData.field_of_concentration} onChange={handleChange} placeholder="e.g., Interventional Cardiology, Heart Failure Management" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Specializations</label>
                <textarea name="specializations" value={formData.specializations} onChange={handleChange} placeholder="e.g., Cardiac Catheterization, Angioplasty, Pacemaker Implantation" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" rows={2} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Experience</label>
                <textarea name="work_experience" value={formData.work_experience} onChange={handleChange} placeholder="e.g., Senior Consultant at Dhaka Medical College (2015-2020)" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                <textarea name="education" value={formData.education} onChange={handleChange} placeholder="e.g., MBBS (Dhaka Medical College, 2010), MD in Cardiology (BSMMU, 2015)" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description / About</label>
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Write a brief description about yourself, your approach to patient care, etc." className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" rows={4} />
              </div>
            </div>
          )}

          {/* Chambers Tab */}
          {activeTab === 'chambers' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Chamber Locations</h3>
                <button type="button" onClick={addChamber} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600">+ Add Chamber</button>
              </div>
              {formData.chambers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No chambers added yet. Click "Add Chamber" to add your chamber locations.</p>
              ) : (
                formData.chambers.map((chamber, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">Chamber {index + 1}</h4>
                      <button type="button" onClick={() => removeChamber(index)} className="text-red-500 hover:text-red-700">Remove</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chamber Name</label>
                        <input type="text" value={chamber.chamber_name} onChange={(e) => handleChamberChange(index, 'chamber_name', e.target.value)} placeholder="e.g., Popular Diagnostic Center" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <input type="text" value={chamber.chamber_address} onChange={(e) => handleChamberChange(index, 'chamber_address', e.target.value)} placeholder="e.g., House #12, Road #5, Dhanmondi, Dhaka" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Available Days</label>
                        <input type="text" value={chamber.available_days} onChange={(e) => handleChamberChange(index, 'available_days', e.target.value)} placeholder="e.g., Sat, Sun, Mon" className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                          <input type="time" value={chamber.appointment_time_start} onChange={(e) => handleChamberChange(index, 'appointment_time_start', e.target.value)} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                          <input type="time" value={chamber.appointment_time_end} onChange={(e) => handleChamberChange(index, 'appointment_time_end', e.target.value)} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <button type="submit" disabled={saving} className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
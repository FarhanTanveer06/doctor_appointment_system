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
  const [editingField, setEditingField] = useState<string | null>(null);
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
          setImagePreview(getImageUrl(doctor.image));
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

  const getImageUrl = (imagePath: string | null | undefined): string => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const startEditing = (field: string) => {
    setEditingField(field);
  };

  const cancelEditing = () => {
    setEditingField(null);
  };

  const saveSingleField = async (field: string, value: string) => {
    setSaving(true);
    setMessage('');
    try {
      const data = new FormData();
      data.append(field, value);
      if (field === 'image' && formData.image) {
        data.append('image', formData.image);
      }

      const res = await api.put('/doctors/profile/update', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMessage(`${field} updated successfully!`);
      if (res.data.doctor?.image) {
        setImagePreview(getImageUrl(res.data.doctor.image));
      }
      setEditingField(null);
      fetchProfile();
    } catch (error) {
      console.error('Failed to update field', error);
      setMessage('Failed to update. Please try again.');
    } finally {
      setSaving(false);
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

  // Render a field with display value and edit button
  const renderField = (label: string, field: string, value: string | number, type: 'text' | 'email' | 'number' | 'textarea' | 'select' = 'text', options?: string[]) => {
    const isEditing = editingField === field;
    const displayValue = value === null || value === undefined || value === '' ? 'Not set' : value;

    if (isEditing) {
      return (
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
          {type === 'textarea' ? (
            <textarea
              value={formData[field as keyof typeof formData] as string}
              onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
              className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
              rows={3}
            />
          ) : type === 'select' && options ? (
            <select
              value={formData[field as keyof typeof formData] as string}
              onChange={(e) => setFormData(prev => ({ ...prev, [field]: e.target.value }))}
              className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
            >
              {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          ) : (
            <input
              type={type}
              value={formData[field as keyof typeof formData] as string}
              onChange={(e) => setFormData(prev => ({ ...prev, [field]: type === 'number' ? parseFloat(e.target.value) : e.target.value }))}
              className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
            />
          )}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => saveSingleField(field, formData[field as keyof typeof formData] as string)}
              disabled={saving}
              className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Update'}
            </button>
            <button
              onClick={cancelEditing}
              className="bg-slate-500 text-white px-3 py-1 rounded text-sm hover:bg-slate-600"
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-3xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800">
            {displayValue}
          </div>
          <button
            onClick={() => startEditing(field)}
            className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 whitespace-nowrap"
          >
            Edit
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10">
      <div className="mx-auto max-w-screen-2xl px-6">
        <h1 className="text-4xl font-bold tracking-tight text-slate-950 mb-8">My Profile</h1>

        {message && (
          <div className={`p-4 mb-4 rounded ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        <div className="bg-white rounded-4xl p-8 shadow-[0_28px_80px_-35px_rgba(15,23,42,0.25)]">
          {/* Profile Image Section */}
          <div className="mb-8 flex flex-col items-center border-b pb-8">
            <div className="w-36 h-36 rounded-full overflow-hidden bg-slate-200 mb-4">
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
            <div className="flex gap-2">
              <label className="cursor-pointer rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition">
                <span>Change Photo</span>
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              {formData.image && (
                <button
                  onClick={async () => {
                    setSaving(true);
                    try {
                      const data = new FormData();
                      data.append('image', formData.image as File);
                      const res = await api.put('/doctors/profile/update', data, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                      });
                      setMessage('Photo updated successfully!');
                      if (res.data.doctor?.image) {
                        setImagePreview(getImageUrl(res.data.doctor.image));
                      }
                    } catch (error) {
                      setMessage('Failed to update photo. Please try again.');
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
                >
                  {saving ? 'Uploading...' : 'Update Photo'}
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex mb-6 border-b border-slate-200">
            {['basic', 'professional', 'chambers'].map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => { setActiveTab(tab); setEditingField(null); }}
                className={`px-4 py-2 capitalize ${activeTab === tab ? 'border-b-2 border-amber-500 text-amber-600 font-semibold' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {tab === 'basic' ? 'Basic Info' : tab === 'professional' ? 'Professional Info' : 'Chambers'}
              </button>
            ))}
          </div>

          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div>
              {renderField('Name', 'name', formData.name)}
              {renderField('Email', 'email', formData.email, 'email')}
              {renderField('Gender', 'gender', formData.gender, 'select', genders)}
              {renderField('BMDC Registration No.', 'bmdc_reg_no', formData.bmdc_reg_no)}
              {renderField('ID No. (NID/Passport)', 'id_no', formData.id_no)}
              {renderField('Consultation Fees ($)', 'fees', formData.fees.toString(), 'number')}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-2">Available Days</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {days.map(day => (
                    <span key={day} className={`px-3 py-1 rounded-full text-sm ${formData.available_days.includes(day) ? 'bg-amber-500 text-slate-950' : 'bg-slate-200 text-slate-600'}`}>
                      {day.substring(0, 3)}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => startEditing('available_days')}
                  className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400 transition"
                >
                  Edit
                </button>
              </div>
            </div>
          )}

          {/* Professional Info Tab */}
          {activeTab === 'professional' && (
            <div>
              {renderField('Specialty', 'specialty', formData.specialty, 'select', specialties)}
              {renderField('Qualifications', 'qualifications', formData.qualifications)}
              {renderField('Field of Concentration', 'field_of_concentration', formData.field_of_concentration, 'textarea')}
              {renderField('Specializations', 'specializations', formData.specializations, 'textarea')}
              {renderField('Work Experience', 'work_experience', formData.work_experience, 'textarea')}
              {renderField('Education', 'education', formData.education, 'textarea')}
              {renderField('Description / About', 'description', formData.description, 'textarea')}
            </div>
          )}

          {/* Chambers Tab */}
          {activeTab === 'chambers' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Chamber Locations</h3>
                <button type="button" onClick={addChamber} className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition">+ Add Chamber</button>
              </div>
              {formData.chambers.length === 0 ? (
                <p className="text-slate-500 text-center py-4">No chambers added yet. Click "Add Chamber" to add your chamber locations.</p>
              ) : (
                formData.chambers.map((chamber, index) => (
                  <div key={index} className="rounded-4xl border border-slate-200 bg-slate-50 p-6 mb-4 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-slate-950">Chamber {index + 1}</p>
                        <p className="mt-2 text-sm text-slate-600">Enter chamber details and availability for patient bookings.</p>
                      </div>
                      <button type="button" onClick={() => removeChamber(index)} className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition">
                        Remove
                      </button>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Chamber Name</label>
                        <input type="text" value={chamber.chamber_name} onChange={(e) => handleChamberChange(index, 'chamber_name', e.target.value)} placeholder="e.g., Popular Diagnostic Center" className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                        <input type="text" value={chamber.chamber_address} onChange={(e) => handleChamberChange(index, 'chamber_address', e.target.value)} placeholder="e.g., House #12, Road #5, Dhanmondi, Dhaka" className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Available Days</label>
                        <input type="text" value={chamber.available_days} onChange={(e) => handleChamberChange(index, 'available_days', e.target.value)} placeholder="e.g., Sat, Sun, Mon" className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200" />
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                          <input type="time" value={chamber.appointment_time_start} onChange={(e) => handleChamberChange(index, 'appointment_time_start', e.target.value)} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                          <input type="time" value={chamber.appointment_time_end} onChange={(e) => handleChamberChange(index, 'appointment_time_end', e.target.value)} className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-200" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
              {formData.chambers.length > 0 && (
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    setMessage('');
                    try {
                      const data = new FormData();
                      data.append('chambers', JSON.stringify(formData.chambers));
                      const res = await api.put('/doctors/profile/update', data, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                      });
                      setMessage('Chambers updated successfully!');
                    } catch (error) {
                      setMessage('Failed to update chambers. Please try again.');
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={saving}
                  className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 mt-4"
                >
                  {saving ? 'Saving...' : 'Save All Chambers'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
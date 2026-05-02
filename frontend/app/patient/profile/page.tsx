'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface PatientProfile {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  profile_image?: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '') : 'http://localhost:5000';

export default function PatientProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [savedFormData, setSavedFormData] = useState(formData);
  const [editingFields, setEditingFields] = useState({
    name: false,
    email: false,
    phone: false,
    address: false,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (!authLoading && user && user.role !== 'patient') {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.role === 'patient') {
      fetchProfile();
    }
  }, [user]);

  const getImageUrl = (imagePath: string | null | undefined): string | null => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  const fetchProfile = async () => {
    try {
      const res = await api.get('/patients/profile/me');
      const profile: PatientProfile = res.data.patient;
      const loadedForm = {
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
      };
      setFormData(loadedForm);
      setSavedFormData(loadedForm);
      setEditingFields({ name: false, email: false, phone: false, address: false });
      setImagePreview(getImageUrl(profile.profile_image || null));
    } catch (error) {
      console.error('Failed to fetch patient profile', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImage(file);
    setImagePreview(file ? URL.createObjectURL(file) : imagePreview);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('address', formData.address);
      if (image) {
        data.append('image', image);
      }

      const res = await api.put('/patients/profile/update', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.user) {
        updateUser(res.data.user);
      }
      setMessage('Profile updated successfully');
      setImage(null);
      fetchProfile();
    } catch (error: any) {
      setMessage(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-6">
            <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="relative h-36 w-36 overflow-hidden rounded-full bg-slate-100 ring-4 ring-slate-200 shadow">
                  {imagePreview ? (
                    <img src={imagePreview} alt={formData.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl font-bold text-slate-400">
                      {formData.name.charAt(0) || 'P'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xl font-semibold text-slate-950">{formData.name || 'Patient'}</p>
                  <p className="mt-1 text-sm text-slate-500">Patient profile</p>
                </div>
                <label className="inline-flex cursor-pointer items-center justify-center rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100">
                  Change Photo
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
            </div>

            <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-slate-950">Profile Summary</h2>
              <p className="mt-3 text-sm text-slate-600">Update your personal details, email, and contact information here.</p>
              <div className="mt-6 grid gap-4">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Registered email</p>
                  <p className="mt-2 text-sm text-slate-900">{formData.email || 'Not set'}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Phone</p>
                  <p className="mt-2 text-sm text-slate-900">{formData.phone || 'Not set'}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Address</p>
                  <p className="mt-2 text-sm text-slate-900 whitespace-pre-line">{formData.address || 'Not set'}</p>
                </div>
              </div>
            </div>
          </aside>

          <main className="space-y-6">
            <div className="rounded-4xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-emerald-500">Profile Management</p>
                  <h1 className="mt-3 text-3xl font-bold text-slate-950">Edit your patient profile</h1>
                </div>
                <p className="text-sm text-slate-500">Each field can be updated independently in its card.</p>
              </div>
            </div>

            {message && (
              <div className={`rounded-3xl px-5 py-4 text-sm ${message.includes('success') ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid gap-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {[
                      {
                    key: 'name',
                    label: 'Full Name',
                    description: 'Your display name shown on appointments.',
                    input: (
                      <input
                        value={formData.name}
                        readOnly={!editingFields.name}
                        onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                        className={`w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${!editingFields.name ? 'cursor-not-allowed opacity-80' : ''}`}
                      />
                    ),
                  },
                  {
                    key: 'email',
                    label: 'Email Address',
                    description: 'Your login email and notification address.',
                    input: (
                      <input
                        type="email"
                        value={formData.email}
                        readOnly={!editingFields.email}
                        onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                        className={`w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${!editingFields.email ? 'cursor-not-allowed opacity-80' : ''}`}
                      />
                    ),
                  },
                  {
                    key: 'phone',
                    label: 'Mobile Number',
                    description: 'Update the number used for SMS reminders.',
                    input: (
                      <input
                        value={formData.phone}
                        readOnly={!editingFields.phone}
                        onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                        placeholder="+880..."
                        className={`w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${!editingFields.phone ? 'cursor-not-allowed opacity-80' : ''}`}
                      />
                    ),
                  },
                  {
                    key: 'address',
                    label: 'Address',
                    description: 'Your home address for appointment logistics.',
                    input: (
                      <textarea
                        value={formData.address}
                        readOnly={!editingFields.address}
                        onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                        rows={4}
                        className={`w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${!editingFields.address ? 'cursor-not-allowed opacity-80' : ''}`}
                        placeholder="House, road, area, city"
                      />
                    ),
                  },
                ].map((field) => (
                  <div key={field.key} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950">{field.label}</p>
                        <p className="mt-1 text-sm text-slate-500">{field.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const isEditing = !editingFields[field.key as keyof typeof editingFields];
                          if (!isEditing) {
                            setFormData((prev) => ({ ...prev, [field.key]: savedFormData[field.key as keyof typeof savedFormData] }));
                          }
                          setEditingFields((prev) => ({
                            ...prev,
                            [field.key]: isEditing,
                          }));
                        }}
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] transition ${editingFields[field.key as keyof typeof editingFields] ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}
                      >
                        {editingFields[field.key as keyof typeof editingFields] ? 'Lock' : 'Edit'}
                      </button>
                    </div>
                    <div className="mt-5">{field.input}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => router.push('/patient/dashboard')}
                  className="rounded-3xl border border-slate-300 bg-slate-50 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-3xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </div>
  );
}

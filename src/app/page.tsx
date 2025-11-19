'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { PDFDownloadLink } from '@react-pdf/renderer';
import DonationReceipt from '@/components/DonationReceipt';

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    date: new Date().toISOString().split('T')[0],
    email: '',
    organization: '',
    address: '',
    phone: '',
    estimatedValue: '',
    items: [''],
  });
  const [isClient] = useState(() => typeof window !== 'undefined');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState<'idle' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    
    const validItems = formData.items.filter(item => item.trim() !== '');
    if (validItems.length === 0) {
      newErrors.items = 'At least one item description is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (formData.phone) {
      const digits = formData.phone.replace(/\D/g, '');
      if (digits.length < 10) {
        newErrors.phone = 'Invalid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (submissionState !== 'idle') {
      setSubmissionState('idle');
      setFeedbackMessage('');
    }
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleItemChange = (index: number, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = value;
    setFormData(prev => ({ ...prev, items: newItems }));
    if (errors.items) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.items;
        return newErrors;
      });
    }
  };

  const addItem = () => {
    setFormData(prev => ({ ...prev, items: [...prev.items, ''] }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const saveDonation = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmissionState('idle');
    setFeedbackMessage('');
    const saveReq = {
      name: formData.name,
      date: formData.date,
      email: formData.email,
      organization: formData.organization,
      address: formData.address,
      phone: formData.phone,
      estimatedValue: formData.estimatedValue,
      itemDescription: formData.items.filter(i => i.trim()).join('; '),
    };

    try {
      const res = await fetch('/api/save-donation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveReq),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to save donation');
      setSubmissionState('success');
      setFeedbackMessage("Thank you for supporting Hope's Corner. Your submission has been received.");
    } catch (err) {
      setSubmissionState('error');
      setFeedbackMessage('We were unable to save this donation. Please review the details and try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderDownloadLink = (variant: 'primary' | 'secondary' = 'primary') => {
    const baseStyles =
      variant === 'primary'
        ? 'w-full flex justify-center py-3 px-4 rounded-2xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 transition'
        : 'inline-flex justify-center py-2.5 px-4 rounded-xl text-sm font-semibold text-emerald-800 bg-white shadow-sm ring-1 ring-inset ring-emerald-200 hover:text-emerald-900 hover:bg-emerald-50 transition';

    if (!isClient || !formData.name) {
      return (
        <p className="text-sm text-slate-400">
          Enter donor details to enable the receipt download.
        </p>
      );
    }

    return (
      <PDFDownloadLink
        document={
          <DonationReceipt
            name={formData.name}
            date={formData.date}
            email={formData.email}
            organization={formData.organization}
            address={formData.address}
            phone={formData.phone}
            estimatedValue={formData.estimatedValue}
            itemDescription={formData.items.filter(i => i.trim()).join('\n')}
            logoUrl={window.location.origin + '/logo.png'}
          />
        }
        fileName={`donation-receipt-${formData.name.replace(/\s+/g, '-').toLowerCase()}-${formData.date}.pdf`}
        className={baseStyles}
      >
        {({ loading }) => (loading ? 'Preparing receipt…' : 'Download Receipt')}
      </PDFDownloadLink>
    );
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Image
              src="/logo.png"
              alt="Hope's Corner logo"
              width={180}
              height={62}
              priority
            />
          </div>
        </div>

        {submissionState === 'success' ? (
          <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-200 bg-emerald-50 p-8 shadow-xl text-center">
            <h2 className="text-2xl font-bold text-emerald-900 mb-4">Thank you for submitting!</h2>
            <p className="text-emerald-800 mb-6">{feedbackMessage}</p>
            <div className="flex justify-center">
              {renderDownloadLink('primary')}
            </div>
            <button
              onClick={() => setSubmissionState('idle')}
              className="mt-6 text-sm text-emerald-700 hover:text-emerald-900 underline"
            >
              Submit another donation
            </button>
          </div>
        ) : (
          <div>
            <section className="mx-auto max-w-2xl rounded-3xl border border-slate-100 bg-white/90 p-8 shadow-xl shadow-slate-100">
              <form className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-slate-900">
              Donor Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              className={`mt-2 block w-full rounded-2xl border ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-200'} bg-white/80 px-4 py-3 text-base text-slate-900 shadow-sm focus:ring-2`}
              placeholder="John Doe"
            />
            {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-semibold text-slate-900">
              Date of Donation
            </label>
            <input
              type="date"
              name="date"
              id="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-slate-900">
              Email (Optional)
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className={`mt-2 block w-full rounded-2xl border ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-200'} bg-white/80 px-4 py-3 text-base text-slate-900 shadow-sm focus:ring-2`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="organization" className="block text-sm font-semibold text-slate-900">
              Organization (Optional)
            </label>
            <input
              type="text"
              name="organization"
              id="organization"
              value={formData.organization}
              onChange={handleChange}
              className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="Organization name"
            />
          </div>

          <div>
            <label htmlFor="address" className="block text-sm font-semibold text-slate-900">
              Address (Optional)
            </label>
            <input
              type="text"
              name="address"
              id="address"
              value={formData.address}
              onChange={handleChange}
              className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="Street address"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-semibold text-slate-900">
              Phone (Optional)
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`mt-2 block w-full rounded-2xl border ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-200'} bg-white/80 px-4 py-3 text-base text-slate-900 shadow-sm focus:ring-2`}
              placeholder="(555) 123-4567"
            />
            {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
          </div>

          <div>
            <label htmlFor="estimatedValue" className="block text-sm font-semibold text-slate-900">
              Estimated Value ($)
            </label>
            <input
              type="number"
              name="estimatedValue"
              id="estimatedValue"
              value={formData.estimatedValue}
              onChange={handleChange}
              className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="100.00"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Item Description
            </label>
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => handleItemChange(index, e.target.value)}
                    className={`block w-full rounded-2xl border ${errors.items ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-emerald-500 focus:ring-emerald-200'} bg-white/80 px-4 py-3 text-base text-slate-900 shadow-sm focus:ring-2`}
                    placeholder={`Item ${index + 1}`}
                  />
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition"
                      aria-label="Remove item"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addItem}
              className="mt-3 text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              + Add another item
            </button>
            {errors.items && <p className="mt-1 text-xs text-rose-600">{errors.items}</p>}
          </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={saveDonation}
                  disabled={isSubmitting}
                  className="w-full flex justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Submitting…' : 'Submit Form'}
                </button>
                <p className="mt-2 text-sm text-slate-500">
                  Submitted entries are securely logged in Hope&apos;s Corner records.
                </p>
              </div>
            </form>
          </section>
            {submissionState === 'error' && (
              <div className="mt-6 rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900 shadow-lg">
                <p className="font-semibold">Submission failed</p>
                <p className="text-sm">{feedbackMessage}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

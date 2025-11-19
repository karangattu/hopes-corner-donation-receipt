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
    amount: '',
    donationType: '',
    description: '',
  });
  const [isClient] = useState(() => typeof window !== 'undefined');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionState, setSubmissionState] = useState<'idle' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (submissionState !== 'idle') {
      setSubmissionState('idle');
      setFeedbackMessage('');
    }
  };

  const saveDonation = async () => {
    setIsSubmitting(true);
    setSubmissionState('idle');
    setFeedbackMessage('');
    const saveReq = {
      name: formData.name,
      date: formData.date,
      email: formData.email,
      donationType: formData.donationType,
      amount: formData.amount,
      description: formData.description,
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
            amount={formData.amount}
            donationType={formData.donationType}
            description={formData.description}
          />
        }
        fileName={`donation-receipt-${formData.name.replace(/\s+/g, '-').toLowerCase()}-${formData.donationType || 'donation'}-${formData.date}.pdf`}
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
              src="https://images.squarespace-cdn.com/content/v1/5622cd82e4b0501d40689558/cdab4aef-0027-40b7-9737-e2f893586a6a/Hopes_Corner_Logo_Green.png"
              alt="Hope's Corner logo"
              width={180}
              height={62}
              priority
            />
          </div>
        </div>

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
              className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="John Doe"
            />
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
              className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="donationType" className="block text-sm font-semibold text-slate-900">
              Type of Donation
            </label>
            <select
              id="donationType"
              name="donationType"
              value={formData.donationType}
              onChange={handleChange}
              className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
            >
              <option value="">Select donation type</option>
              <option value="Cash">Cash</option>
              <option value="Merchandise">Merchandise</option>
              <option value="Service">Service</option>
            </select>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-semibold text-slate-900">
              Amount ($)
            </label>
            <input
              type="number"
              name="amount"
              id="amount"
              value={formData.amount}
              onChange={handleChange}
              className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="100.00"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-slate-900">
              Description (Optional)
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-base text-slate-900 shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
              placeholder="General donation"
            />
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
        </div>

        {submissionState !== 'idle' && (
          <div
            className={`rounded-3xl border p-6 shadow-lg ${
              submissionState === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : 'border-rose-200 bg-rose-50 text-rose-900'
            }`}
          >
            <p className="text-lg font-semibold">
              {submissionState === 'success' ? 'Thank you for submitting!' : 'Submission failed'}
            </p>
            <p className="mt-2 text-sm">{feedbackMessage}</p>
            {submissionState === 'success' && (
              <div className="mt-4">{renderDownloadLink('secondary')}</div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const saveDonation = async () => {
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
      alert('Saved donation entry to SharePoint');
    } catch (err) {
      alert('Failed to save donation entry, check console for details');
      console.error(err);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">

        <form className="space-y-6">
          <div className="flex items-center justify-center mb-4">
            <Image src="https://images.squarespace-cdn.com/content/v1/5622cd82e4b0501d40689558/cdab4aef-0027-40b7-9737-e2f893586a6a/Hopes_Corner_Logo_Green.png" alt="Hope's Corner logo" width={140} height={48} priority />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Donor Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date of Donation
            </label>
            <input
              type="date"
              name="date"
              id="date"
              required
              value={formData.date}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email (Optional)
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="donationType" className="block text-sm font-medium text-gray-700">
              Type of Donation
            </label>
            <select
              id="donationType"
              name="donationType"
              value={formData.donationType}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
            >
              <option value="">Select donation type</option>
              <option value="Cash">Cash</option>
              <option value="Merchandise">Merchandise</option>
              <option value="Service">Service</option>
            </select>
          </div>

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
              Amount ($)
            </label>
            <input
              type="number"
              name="amount"
              id="amount"
              value={formData.amount}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              placeholder="100.00"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description (Optional)
            </label>
            <textarea
              name="description"
              id="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
              placeholder="General donation"
            />
          </div>

          <div className="pt-4 flex flex-col gap-2">
            {isClient && formData.name ? (
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
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {({ loading }) =>
                  loading ? 'Generating Receipt...' : 'Download Receipt'
                }
              </PDFDownloadLink>
            ) : (
              <button
                disabled
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-400 cursor-not-allowed"
              >
                Enter Name to Download
              </button>
            )}

            <button
              type="button"
              onClick={saveDonation}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              Save Donation to SharePoint
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

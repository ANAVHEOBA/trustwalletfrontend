'use client';

import { useState, useEffect } from 'react';
import { CreateWalletModal } from '@/components/wallet/CreateWalletModal';

export default function Home() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Show the modal automatically when the page loads
    setShowModal(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-6">Trust Wallet</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Your Gateway to the World of Cryptocurrency
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-transform duration-200"
          >
            Create New Wallet
          </button>
        </div>
      </div>

      <CreateWalletModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}

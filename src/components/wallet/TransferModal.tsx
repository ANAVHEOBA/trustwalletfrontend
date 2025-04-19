import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { transferCrypto } from '@/lib/api';
import type { CryptoBalance, TransferResponse, APIError, APIResponse } from '@/lib/types';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: CryptoBalance;
}

function isAPIError(response: APIResponse<TransferResponse>): response is APIError {
  return !response.success && 'error' in response;
}

export function TransferModal({ isOpen, onClose, balance }: TransferModalProps) {
  const [step, setStep] = useState<'form' | 'confirmation' | 'success'>('form');
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [transferResult, setTransferResult] = useState<TransferResponse['data'] | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!toAddress || !amount) {
      setError('Please fill in all fields');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (numAmount > balance.amount) {
      setError('Insufficient balance');
      return;
    }

    const token = localStorage.getItem('wallet_token');
    if (!token) {
      setError('Authentication error. Please try again.');
      return;
    }

    const response = await transferCrypto(toAddress, numAmount, balance.symbol, token);

    if (isAPIError(response)) {
      setError(response.error);
      return;
    }

    setTransferResult(response.data);
    setStep('success');
  };

  const renderContent = () => {
    switch (step) {
      case 'form':
        return (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Send {balance.symbol}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Available Balance: {balance.amount} {balance.symbol}
              </p>
            </div>

            {error && (
              <p className="text-red-500 mb-4 text-sm">{error}</p>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Recipient Address</label>
                <input
                  type="text"
                  value={toAddress}
                  onChange={(e) => setToAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="any"
                    min="0"
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="absolute right-3 top-2 text-gray-500">
                    {balance.symbol}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors mt-6"
            >
              Send {balance.symbol}
            </button>
          </form>
        );

      case 'success':
        return transferResult ? (
          <div className="text-center">
            <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h3 className="text-xl font-bold mb-4">Transfer Request Submitted</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {transferResult.message}
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-left mb-6">
              <p className="text-sm mb-2">
                <strong>Contact Email:</strong> {transferResult.contactEmail}
              </p>
              <p className="text-sm mb-2">
                <strong>Subject:</strong> {transferResult.emailSubject}
              </p>
              <p className="text-sm">
                <strong>Amount:</strong> {transferResult.requestDetails.amount} {transferResult.requestDetails.symbol}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Send ${balance.symbol}`}
    >
      {renderContent()}
    </Modal>
  );
} 
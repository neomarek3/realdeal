"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VerificationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [idImage, setIdImage] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);

  const handleIdImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setIdImage(e.target.files[0]);
    }
  };

  const handleSelfieImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelfieImage(e.target.files[0]);
    }
  };

  const handleStepOne = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idImage) {
      setError('Please upload an image of your ID card');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleStepTwo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selfieImage) {
      setError('Please upload a selfie photo');
      return;
    }
    setError('');
    handleSubmit();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    // Mock verification process
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      // In a real application, you would upload the images to a server and process them
    }, 2000);
  };

  if (success) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow">
          <div className="text-center">
            <svg 
              className="mx-auto h-12 w-12 text-green-500" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <h2 className="mt-2 text-3xl font-bold">Verification Submitted</h2>
            <p className="mt-2 text-gray-600">
              Your verification request has been submitted successfully. We will review your information and update your account status shortly.
            </p>
          </div>
          <div className="mt-5">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Account Verification</h2>
          <p className="mt-2 text-gray-600">Verify your identity to unlock all features</p>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded border border-red-200">
            {error}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center">
            <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <div className="ml-2 text-sm font-medium">ID Verification</div>
          </div>
          <div className="flex-1 mx-4 h-0.5 bg-gray-200"></div>
          <div className="flex items-center">
            <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= 2 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <div className="ml-2 text-sm font-medium">Selfie Verification</div>
          </div>
        </div>
        
        {step === 1 && (
          <form className="mt-8 space-y-6" onSubmit={handleStepOne}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload your ID card (front side)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="id-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        id="id-upload"
                        name="id-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleIdImageChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
              {idImage && (
                <p className="mt-2 text-sm text-gray-500">
                  Selected file: {idImage.name}
                </p>
              )}
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Continue
              </button>
            </div>
          </form>
        )}
        
        {step === 2 && (
          <form className="mt-8 space-y-6" onSubmit={handleStepTwo}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload a selfie photo
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="selfie-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                    >
                      <span>Upload a file</span>
                      <input
                        id="selfie-upload"
                        name="selfie-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleSelfieImageChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
              {selfieImage && (
                <p className="mt-2 text-sm text-gray-500">
                  Selected file: {selfieImage.name}
                </p>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {loading ? 'Processing...' : 'Submit Verification'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { AxiosError } from 'axios';

const SignupPage = () => {
  const { login } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/request-otp', { name, email });
      setIsOtpSent(true);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      login(data.token);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || 'Failed to verify OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href =  `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/google`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
            <h1 className="text-3xl font-bold">Create an Account</h1>
        </div>
        
        {error && <p className="text-red-500 text-center">{error}</p>}

        <form onSubmit={isOtpSent ? handleVerifyOtp : handleRequestOtp} className="space-y-4">
            {!isOtpSent && (
                <>
                    <input value={name} onChange={e => setName(e.target.value)} type="text" placeholder="Enter your name" required className="w-full p-3 border rounded-md" />
                    <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Enter your email" required className="w-full p-3 border rounded-md" />
                </>
            )}
            
            {isOtpSent && (
                <input value={otp} onChange={e => setOtp(e.target.value)} type="text" placeholder="Enter OTP" required className="w-full p-3 border rounded-md" />
            )}
          
            <button type="submit" disabled={loading} className="w-full py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                {loading ? 'Loading...' : isOtpSent ? 'Verify OTP' : 'Get OTP'}
            </button>
        </form>
        
        <div className="relative text-center"><span className="px-2 text-gray-500 bg-white">OR</span></div>

        <button onClick={handleGoogleSignup} className="w-full py-3 font-semibold border rounded-md flex items-center justify-center">
          Sign up with Google
        </button>
      </div>
    </div>
  );
};

export default SignupPage;
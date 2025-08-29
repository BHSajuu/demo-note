import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { AxiosError } from 'axios';

const SignupPage = () => {
  const { login } = useAuth();
  
  // Form state - matching Figma design fields exactly
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle OTP request for signup - updated to include DOB
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/request-otp', { 
        name, 
        email, 
        dateOfBirth,
        isSignin: false 
      });
      setIsOtpSent(true);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || 'Failed to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification for signup
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp });
      login(data.token);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || 'Failed to verify code.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google signup - keeping as requested
  const handleGoogleSignup = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Image section matching Figma */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img 
          src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
          alt="Note taking workspace" 
          className="w-full h-full object-cover"
        />
        {/* Overlay matching Figma design */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20"></div>
      </div>

      {/* Right side - Form section exactly matching Figma */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-white">
        <div className="w-full max-w-[400px]">
          {/* Header matching Figma typography */}
          <div className="mb-8">
            <h1 className="text-[32px] font-bold text-[#1F2937] mb-2 leading-tight">
              Create Account
            </h1>
            <p className="text-[16px] text-[#6B7280] leading-relaxed">
              Join thousands of users who organize their thoughts with NoteTaker
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-[12px]">
              <p className="text-red-600 text-[14px]">{error}</p>
            </div>
          )}

          {/* Success message when OTP is sent */}
          {isOtpSent && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-[12px]">
              <p className="text-green-600 text-[14px]">
                Verification code sent to {email}. Please check your inbox.
              </p>
            </div>
          )}

          {/* Main form matching Figma design exactly */}
          <form onSubmit={isOtpSent ? handleVerifyOtp : handleRequestOtp} className="space-y-6">
            {!isOtpSent && (
              <>
                {/* Full Name input - matching Figma */}
                <div>
                  <label htmlFor="name" className="block text-[14px] font-medium text-[#374151] mb-2">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                    className="w-full h-[48px] px-4 border border-[#D1D5DB] rounded-[8px] focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-all duration-200 outline-none text-[16px] placeholder-[#9CA3AF]"
                  />
                </div>

                {/* Email input - matching Figma */}
                <div>
                  <label htmlFor="email" className="block text-[14px] font-medium text-[#374151] mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="w-full h-[48px] px-4 border border-[#D1D5DB] rounded-[8px] focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-all duration-200 outline-none text-[16px] placeholder-[#9CA3AF]"
                  />
                </div>

                {/* Date of Birth input - new field from Figma */}
                <div>
                  <label htmlFor="dateOfBirth" className="block text-[14px] font-medium text-[#374151] mb-2">
                    Date of Birth
                  </label>
                  <input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                    className="w-full h-[48px] px-4 border border-[#D1D5DB] rounded-[8px] focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-all duration-200 outline-none text-[16px]"
                  />
                </div>
              </>
            )}

            {/* OTP input - shown after OTP is sent, matching Figma */}
            {isOtpSent && (
              <div>
                <label htmlFor="otp" className="block text-[14px] font-medium text-[#374151] mb-2">
                  Verification Code
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  required
                  maxLength={6}
                  className="w-full h-[48px] px-4 border border-[#D1D5DB] rounded-[8px] focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-all duration-200 outline-none text-[16px] text-center tracking-[0.2em]"
                />
              </div>
            )}

            {/* Submit button - exact Figma styling */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-[48px] bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-[#93C5FD] text-white font-semibold rounded-[8px] transition-all duration-200 focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 outline-none text-[16px]"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isOtpSent ? 'Verifying...' : 'Sending Code...'}
                </div>
              ) : (
                isOtpSent ? 'Verify & Create Account' : 'Send Verification Code'
              )}
            </button>
          </form>

          {/* Divider - matching Figma */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-[#E5E7EB]"></div>
            <span className="px-4 text-[14px] text-[#6B7280] bg-white">or</span>
            <div className="flex-1 border-t border-[#E5E7EB]"></div>
          </div>

          {/* Google signup button - keeping as requested, matching Figma styling */}
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full h-[48px] border border-[#D1D5DB] hover:border-[#9CA3AF] hover:bg-[#F9FAFB] text-[#374151] font-medium rounded-[8px] transition-all duration-200 flex items-center justify-center space-x-3 focus:ring-2 focus:ring-[#6B7280] focus:ring-offset-2 outline-none text-[16px]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Sign in link - matching Figma */}
          <div className="mt-8 text-center">
            <p className="text-[14px] text-[#6B7280]">
              Already have an account?{' '}
              <Link 
                to="/signin" 
                className="text-[#3B82F6] hover:text-[#2563EB] font-medium transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
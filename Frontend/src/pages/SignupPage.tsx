import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { AxiosError } from 'axios';

const SignupPage = () => {
  const { login } = useAuth();
  
  // Form state - matching exact Figma design fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle OTP request for signup - includes all required fields from Figma
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Send signup request with name, email, and DOB as per Figma design
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

  // Handle Google signup - keeping direct Google auth as requested
  const handleGoogleSignup = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - Form section matching exact Figma layout */}
      <div className="w-1/2 flex flex-col justify-center px-16 py-12">
        {/* HD Logo and branding - exact Figma positioning */}
        <div className="mb-16">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">HD</span>
          </div>
        </div>

        {/* Form container with exact Figma styling */}
        <div className="max-w-md">
          {/* Header - exact Figma typography */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Sign up
            </h1>
            <p className="text-gray-500 text-base">
              Sign up to enjoy the feature of HD
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Form with exact Figma field layout */}
          <form onSubmit={isOtpSent ? handleVerifyOtp : handleRequestOtp} className="space-y-6">
            {!isOtpSent ? (
              <>
                {/* Your Name field - exact Figma styling */}
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jonas Khanwald"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  />
                </div>

                {/* Date of Birth field - exact Figma styling with calendar icon */}
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Date of Birth</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>

                {/* Email field - exact Figma styling */}
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jonas_kahnwald@gmail.com"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  />
                </div>
              </>
            ) : (
              /* OTP field - exact Figma styling with eye icon */
              <div>
                <div className="relative">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="OTP"
                    required
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Submit button - exact Figma blue button styling */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isOtpSent ? 'Verifying...' : 'Sending...'}
                </div>
              ) : (
                isOtpSent ? 'Sign up' : 'Get OTP'
              )}
            </button>
          </form>

          {/* Sign in link - exact Figma positioning and styling */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link 
                to="/signin" 
                className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Image section with exact Figma styling */}
      <div className="w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900">
          {/* Abstract blue wave pattern matching Figma design */}
          <div className="absolute inset-0 opacity-80">
            <img 
              src="https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
              alt="Abstract blue waves" 
              className="w-full h-full object-cover mix-blend-overlay"
            />
          </div>
          {/* Additional blue overlay to match exact Figma color */}
          <div className="absolute inset-0 bg-blue-600/60"></div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
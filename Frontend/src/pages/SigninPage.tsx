import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { AxiosError } from 'axios';

const SigninPage = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle OTP request for signin - validates existing user
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Request OTP for existing user signin
      await api.post('/auth/request-otp', { email, isSignin: true });
      setIsOtpSent(true);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification for signin
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-otp', { email, otp, keepLoggedIn });
      login(data.token);
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || 'Failed to verify OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP functionality
  const handleResendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/request-otp', { email, isSignin: true });
      // Show success message or update UI to indicate OTP was resent
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      setError(axiosError.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Google signin - keeping direct Google auth as requested
  const handleGoogleSignin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5001'}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left side - Form section with responsive design */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 lg:px-16 py-8 lg:py-12">
        {/* HD Logo and branding - exact Figma positioning */}
        <div className="mb-8 lg:mb-16">
          <div className="flex items-center mb-2">
            {/* HD Logo with blue star icon matching Figma */}
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900">HD</span>
          </div>
        </div>

        {/* Form container with exact Figma styling */}
        <div className="max-w-md mx-auto lg:mx-0 w-full">
          {/* Header - exact Figma typography */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Sign in
            </h1>
            <p className="text-gray-500 text-base">
              Please login to continue to your account.
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
              /* Email field - exact Figma styling */
              <div>
                <label className="block text-sm text-gray-500 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jonas_kahnwald@gmail.com"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-all duration-200"
                />
              </div>
            ) : (
              <>
                {/* OTP field - exact Figma styling with eye icon */}
                <div>
                  <label className="block text-sm text-gray-500 mb-2">OTP</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="OTP"
                      required
                      maxLength={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-all duration-200"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Resend OTP link - exact Figma styling */}
                <div className="text-left">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium transition-colors duration-200"
                  >
                    Resend OTP
                  </button>
                </div>

                {/* Keep me logged in checkbox - exact Figma styling */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="keepLoggedIn"
                    checked={keepLoggedIn}
                    onChange={(e) => setKeepLoggedIn(e.target.checked)}
                    className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="keepLoggedIn" className="ml-2 text-sm text-gray-700">
                    Keep me logged in
                  </label>
                </div>
              </>
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
                  {isOtpSent ? 'Signing in...' : 'Sending...'}
                </div>
              ) : (
                isOtpSent ? 'Sign in' : 'Get OTP'
              )}
            </button>
          </form>

          {/* Google signin option - keeping as requested */}
          {!isOtpSent && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>
              
              <button
                onClick={handleGoogleSignin}
                className="mt-4 w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>
          )}

          {/* Create account link - exact Figma positioning and styling */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Need an account?{' '}
              <Link 
                to="/" 
                className="text-blue-500 hover:text-blue-600 font-medium transition-colors duration-200"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Image section with exact Figma styling - hidden on mobile */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
          {/* Blue abstract wave pattern matching Figma design */}
          <div className="absolute inset-0">
            <img 
              src="https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
              alt="Abstract blue waves" 
              className="w-full h-full object-cover opacity-80"
            />
          </div>
          {/* Blue overlay to match exact Figma color */}
          <div className="absolute inset-0 bg-blue-600/40"></div>
        </div>
      </div>
    </div>
  );
};

export default SigninPage;
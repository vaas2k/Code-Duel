'use client';
import { useState } from 'react';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import axios, { Axios, AxiosError } from 'axios';

export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: Change Password, 4: Success
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    //@ts-ignore
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      });
    }
  };

  const handleSendCode = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});
    setSuccess('');

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/forget-password`, formData);
      console.log("forget Response : ", response);
      if (response.status === 200) {
        setStep(2); // Move to code verification step
        setSuccess('Verification code sent to your email!');
      } else {
        setErrors({ general: response.data.msg || 'Failed to send verification code' });
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          setErrors({ general: 'Invalid email' });
          return;
        }
        if (error.response?.status === 501) {
          setErrors({ general: 'Error Sending Verification Code' });
          return;
        }
      }
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/verify-account`, {
        email: formData.email,
        code: formData.code
      });

      console.log("verification res : ", response);
      if (response.status == 200) {
        setStep(3); // Move to password change step
        setSuccess('Code verified successfully! Now set your new password.');
      } else {
        setErrors({ general: response.data.msg || 'Invalid verification code' });
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          setErrors({ general: 'Invalid verification code' });
          return;
        }
      }
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      setErrors({ general: 'Passwords do not match' });
      setIsSubmitting(false);
      return;
    }

    // Validate password strength (optional)
    if (formData.newPassword.length < 6) {
      setErrors({ general: 'Password must be at least 6 characters long' });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/reset-password`, {
        email: formData.email,
        newPassword: formData.newPassword
      });

      console.log("password reset response : ", response);
      if (response.status == 200) {
        setStep(4); // Move to success step
        setSuccess('Password reset successfully! You can now sign in with your new password.');
      } else {
        setErrors({ general: response.data.msg || 'Failed to reset password' });
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          setErrors({ general: 'Invalid request' });
          return;
        }
        if (error.response?.status === 401) {
          setErrors({ general: 'Verification code expired or invalid' });
          return;
        }
      }
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 to-slate-800 transition-colors">
      <div className="max-w-md w-full flex rounded-xl overflow-hidden shadow-lg border border-slate-700">
        {/* Form Panel */}
        <div className="w-full p-8 flex flex-col justify-center bg-slate-800 rounded-xl">
          {/* Back Button */}
          <Link
            href="/signin"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 self-start"
          >
            <ArrowLeft size={16} />
            <span className="text-sm">Back to Sign In</span>
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">
              {step === 1 && 'Reset Your Password'}
              {step === 2 && 'Enter Verification Code'}
              {step === 3 && 'Set New Password'}
              {step === 4 && 'Password Reset Success!'}
            </h1>
            <p className="text-slate-400 text-sm">
              {step === 1 && 'Enter your email address and we\'ll send you a verification code'}
              {step === 2 && 'Enter the 6-digit code sent to your email'}
              {step === 3 && 'Enter your new password'}
              {step === 4 && 'Your password has been reset successfully'}
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4">
              <div className="flex items-center gap-2 justify-center text-green-400 text-sm bg-green-500/20 py-3 px-4 rounded-lg border border-green-500/30">
                <CheckCircle2 size={16} />
                <span>{success}</span>
              </div>
            </div>
          )}

          {/* General Error Message */}
          {errors.general && (
            <div className="mb-4">
              <div className="flex items-center gap-2 justify-center text-red-400 text-sm bg-red-500/20 py-3 px-4 rounded-lg border border-red-500/30">
                <AlertCircle size={16} />
                <span>{errors.general}</span>
              </div>
            </div>
          )}

          {/* Step 1: Email Input */}
          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div className="space-y-2">
                {errors.email ? (
                  <div className="flex items-center gap-1 text-red-400 text-xs">
                    <AlertCircle size={14} />
                    <span>{errors.email}</span>
                  </div>
                ) : (
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                    Email Address
                  </label>
                )}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-slate-700 text-white ${
                      errors.email ? "border-red-500" : "border-slate-600"
                    }`}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending Code..." : "Send Verification Code"}
              </Button>
            </form>
          )}

          {/* Step 2: Code Verification */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="space-y-2">
                {errors.code ? (
                  <div className="flex items-center gap-1 text-red-400 text-xs">
                    <AlertCircle size={14} />
                    <span>{errors.code}</span>
                  </div>
                ) : (
                  <label htmlFor="code" className="block text-sm font-medium text-slate-300">
                    Verification Code
                  </label>
                )}
                <div className="relative">
                  <input
                    id="code"
                    name="code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={formData.code}
                    onChange={handleChange}
                    maxLength={6}
                    className={`w-full pl-4 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-slate-700 text-white text-center text-lg tracking-widest ${
                      errors.code ? "border-red-500" : "border-slate-600"
                    }`}
                    required
                  />
                </div>
                <p className="text-xs text-slate-400 text-center mt-2">
                  Check your email for the verification code
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Verifying..." : "Verify Code"}
                </Button>
              </div>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isSubmitting}
                  className="text-blue-400 hover:text-blue-300 text-sm transition-colors disabled:opacity-50"
                >
                  Resend Code
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Change Password */}
          {step === 3 && (
            <form onSubmit={handleChangePassword} className="space-y-6">
              <div className="space-y-4">
                {/* New Password */}
                <div className="space-y-2">
                  <label htmlFor="newPassword" className="block text-sm font-medium text-slate-300">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter new password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-slate-700 text-white"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-10 pr-12 py-3 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-slate-700 text-white"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </form>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Password Reset Successful!</h3>
                <p className="text-slate-400 text-sm">
                  Your password has been reset successfully. You can now sign in with your new password.
                </p>
              </div>

              <div className="flex gap-3">
                <Link
                  href="/signin"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-center"
                >
                  Sign In Now
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Button component
const Button = ({ children, className, ...props }: any) => (
  <button className={`px-4 py-2 rounded-lg font-medium transition-colors ${className}`} {...props}>
    {children}
  </button>
);
'use client';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Mail, Lock, Eye, EyeOff, Github, Twitter, Facebook, User2Icon, AlertCircle, ChartNoAxesColumnIncreasing, CheckCircle, Shield, User, Zap } from 'lucide-react';
import Link from 'next/link';
import * as z from 'zod';
import axios from 'axios';
import { useRouter } from 'next/navigation'
import Loader from '../ui/Loader';

// Define form schema
const formSchema = z.object({
  username: z.string()
    .min(4, { message: "Username must be at least 4 characters long" })
    .max(100, { message: "Username must be less than 100 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string()
    .min(6, { message: "Password must be at least 6 characters long" })
    // .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      // message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    // }),
,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Define error type
type FormErrors = {
  username?: string[];
  email?: string[];
  password?: string[];
  confirmPassword?: string[];
};

const Create_Account = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing in the field
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form data
      const validatedData = formSchema.parse(formData);

      // If validation passes, submit the form
      console.log('Form submitted:', validatedData);

      // Here you would typically make an API call
      // await axios.post('/api/register', validatedData);
       const req = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/create-account`,formData);

      console.log(req.data);
      if(req.status === 200)  {
        // user saved and code sent to email for verification , direct user to verify email page
        setTimeout(() => {
          router.push(`/verify-email?email=${formData.email}`);
        }, 2000);
      }

      // Reset form after successful submission
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      setErrors({});

    } catch (err) {
      if (err instanceof z.ZodError) {
        // Format Zod errors into a more usable structure
        const formattedErrors: FormErrors = {};
        err.issues.forEach((error: any) => {
          const fieldName = error.path[0] as keyof FormErrors;
          if (!formattedErrors[fieldName]) {
            formattedErrors[fieldName] = [error.message];
          } else {
            formattedErrors[fieldName]!.push(error.message);
          }
        });
        setErrors(formattedErrors);
      } else if (err instanceof axios.AxiosError) {
        // set formatted errors from backend
        if(err.response && err.response.data == 'Username already in use') {
          setErrors({ username: ['Username already in use'] });
        }
        else if(err.response && err.response.data == 'Email already in use') {
          setErrors({ email: ['Email already in use'] });
        }

      } else {
        console.error('Unexpected error:', err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-6xl w-full flex rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
        {/* Left Panel - Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 lg:p-12 bg-gradient-to-b from-gray-800 to-gray-900">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Join the Arena</h1>
            <p className="text-gray-400 text-sm">
              Create your account and start your competitive coding journey
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl bg-gray-700/50 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.username ? 'border-red-500' : 'border-gray-600'
                  }`}
                  required
                />
              </div>
              {errors.username && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.username}</span>
                </div>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl bg-gray-700/50 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.email ? 'border-red-500' : 'border-gray-600'
                  }`}
                  required
                />
              </div>
              {errors.email && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.email}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3 rounded-xl bg-gray-700/50 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.password ? 'border-red-500' : 'border-gray-600'
                  }`}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.password}</span>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3 rounded-xl bg-gray-700/50 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                  }`}
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <div className="flex items-center gap-2 mt-2 text-sm text-red-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>{errors.confirmPassword}</span>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-70"
            >
              {isSubmitting ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5" />
                  Create Account
                </span>
              )}
            </Button>
          </form>

          {/* Terms and Login Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm mb-4">
              By creating an account, you agree to our{' '}
              <Link href="/terms" className="text-blue-400 hover:text-blue-300 transition-colors">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-400 hover:text-blue-300 transition-colors">
                Privacy Policy
              </Link>
            </p>
            
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link 
                href="/signin" 
                className="text-white font-medium hover:text-blue-400 transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>

          {/* Features List */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Free forever</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Real-time battles</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Global ranking</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Team competitions</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Hero */}
        <div className="hidden md:block w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-gray-900/20 z-10"></div>
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/code-battle.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          ></div>
          
          <div className="relative z-20 h-full flex flex-col justify-center p-8 lg:p-12">
            <div className="max-w-md">
              <div className="mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mb-6 shadow-xl">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Enter the Competitive Arena
                </h2>
                <p className="text-gray-300 text-lg mb-6">
                  Join thousands of developers testing their skills in real-time coding battles.
                  Compete, learn, and grow with every challenge.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="text-2xl font-bold text-blue-400">10K+</div>
                  <div className="text-sm text-gray-300">Active Coders</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="text-2xl font-bold text-green-400">50K+</div>
                  <div className="text-sm text-gray-300">Battles Fought</div>
                </div>
              </div>

              {/* Testimonial */}
              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"></div>
                  <div>
                    <div className="font-medium text-white">Alex Chen</div>
                    <div className="text-sm text-gray-400">Rank #24 • Diamond Tier</div>
                  </div>
                </div>
                <p className="text-gray-300 italic">
                  "The most engaging way to improve coding skills. Real competition makes learning exciting!"
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

};

export default Create_Account;
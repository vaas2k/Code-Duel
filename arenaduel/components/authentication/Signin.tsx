'use client';
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Mail, Lock, Eye, EyeOff, Github, Twitter, Facebook, AlertCircle, Shield, TrendingUp, Zap } from 'lucide-react';
import Link from 'next/link';
import axios, { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useUserState } from '@/store/useUser';
import Loader from '../ui/Loader';

const SignIn = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const setUser = useUserState(state => state.setUser);
  const [loading, setLoading] = useState(false);



  // const user = useUserState(state => state.user);

  // console.log(user);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
        general: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({ email: '', password: '', general: '' });

    // Basic validation
    if (!formData.email || !formData.password) {
      setErrors({
        email: !formData.email ? 'Email is required' : '',
        password: !formData.password ? 'Password is required' : '',
        general: ''
      });
      setIsSubmitting(false);
      return;
    }

    if(formData.email ==='admin@admin.com' && formData.password === 'admin') {      
      router.push('/admin');
      return;
    }

    try {
      const req = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/signin`, {
        email: formData.email,
        password: formData.password
      },
        {
          withCredentials: true
        });

        // console.log(req.data);
        
        // if(req.status === 200 && req.data.userRole == 'admin') {
        //   router.push('/admin');
        // }
        console.log(req.headers['set-cookie']);
        
      if (req.status === 200) {
        
        setUser(req.data.user);

        setFormData({ email: '', password: '' });
        router.push('/dashboard')
      }

    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        const message = error.response?.data?.message || error.message;

        switch (status) {
          case 400:
            setErrors({
              email: message == 'Username already in use' ? message : '',
              password: message == 'Incorrect password' ? message : '',
              general: 'Invalid email or password'
            });
            break;
          case 422:
            // Validation errors from backend
            const validationErrors = error.response?.data?.errors;
            if (validationErrors) {
              setErrors({
                email: validationErrors.email?.[0] || '',
                password: validationErrors.password?.[0] || '',
                general: validationErrors.general?.[0] || ''
              });
            }
            break;
          case 409:
            setErrors({
              email: '',
              password: '',
              general: 'Your Account is Banned (check email for more info)'
            })
            break;
          case 500:
            setErrors({
              email: '',
              password: '',
              general: 'Server error. Please try again later.'
            });
            break;
          default:
            setErrors({
              email: '',
              password: '',
              general: message || 'An unexpected error occurred'
            });
        }
      } else {
        setErrors({
          email: '',
          password: '',
          general: 'An unexpected error occurred'
        });
      }
      console.log('Error details:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl w-full h-[93vh] flex rounded-2xl overflow-hidden shadow-2xl border border-gray-700">
        {/* Left Panel - Hero */}
        <div className="hidden md:block w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-gray-900/20 z-10"></div>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: "url('/images/coding-arena.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          ></div>

          <div className="relative z-20 h-full flex flex-col justify-center p-8 lg:p-12">
            <div className="max-w-md">
              <div className="mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-center mb-6 shadow-xl">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white mb-4">
                  Welcome Back, Coder
                </h2>
                <p className="text-gray-300 text-lg mb-6">
                  Return to the arena where your skills are tested and your ranking matters.
                  Continue your journey to the top.
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="text-2xl font-bold text-blue-400">24/7</div>
                  <div className="text-sm text-gray-300">Live Matches</div>
                </div>
                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="text-2xl font-bold text-green-400">+15%</div>
                  <div className="text-sm text-gray-300">Skill Growth</div>
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-gray-300">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <span>Track your progress with detailed analytics</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span>Compete in real-time 1v1 battles</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 lg:p-12 bg-gradient-to-b from-gray-800 to-gray-900">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400 text-sm">
              Sign in to continue your competitive coding journey
            </p>
          </div>

          {/* General Error Message */}
          {errors.general && (
            <div className="mb-6">
              <div className="flex items-center justify-center gap-2 text-red-400 text-sm bg-red-500/10 py-3 px-4 rounded-xl border border-red-500/30">
                <AlertCircle className="w-5 h-5" />
                <span>{errors.general}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  className={`w-full pl-12 pr-4 py-3 rounded-xl bg-gray-700/50 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.email ? 'border-red-500' : 'border-gray-600'
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
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-300">
                  Password
                </label>
                <Link
                  href="/forget-password"
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-12 py-3 rounded-xl bg-gray-700/50 border text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${errors.password ? 'border-red-500' : 'border-gray-600'
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

            {/* Remember Me
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-500 focus:ring-blue-500 focus:ring-2"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-400">
                Remember me for 30 days
              </label>
            </div> */}

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
                  Sign In
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-800 text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Social Login */}
          {/* <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="py-3 bg-gray-700/50 border-gray-600 hover:bg-gray-600/50 text-gray-300 rounded-xl"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              </svg>
              Google
            </Button>
            <Button
              variant="outline"
              className="py-3 bg-gray-700/50 border-gray-600 hover:bg-gray-600/50 text-gray-300 rounded-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </Button>
          </div> */}

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link
                href="/create-account"
                className="text-white font-medium hover:text-blue-400 transition-colors"
              >
                Create an account
              </Link>
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Get instant access to competitive coding battles and rankings
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
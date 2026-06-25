'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2, Lock, Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useSearchParams } from 'next/navigation';

const VerifyEmail = () => {
    const [code, setCode] = useState(['', '', '', '']);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams()
    const email = searchParams.get('email') || '';

    useEffect(() => {
        // Focus first input on mount
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d?$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setError('');
        setSuccess('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');
        const numbers = pastedData.replace(/\D/g, '').split('').slice(0, 4);

        if (numbers.length === 4) {
            const newCode = [...code];
            numbers.forEach((num, index) => {
                newCode[index] = num;
            });
            setCode(newCode);
            inputRefs.current[5]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        const verificationCode = code.join('');

        if (verificationCode.length !== 4) {
            setError('Please enter the complete 4-digit code');
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/verify-account`, {
                email,
                code: verificationCode
            });

            if (response.status === 200) {
                setSuccess('Email verified successfully! Redirecting...');
                setTimeout(() => {
                    router.push('/signin');
                }, 2000);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid verification code. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResendCode = async () => {
        if (resendCooldown > 0) return;

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/resend-verification`);
            setResendCooldown(60); // 60 seconds cooldown
            setSuccess('Verification code sent successfully!');
            setError('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to resend code. Please try again.');
        }
    };

    const isCodeComplete = code.every(digit => digit !== '');

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-950 transition-colors">
            <div className="max-w-6xl w-full flex flex-col lg:flex-row rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
                
                {/* Left Panel - Form */}
                <div className="w-full lg:w-1/2 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-center">
                    {/* Back Button */}
                    <div className="mb-8">
                        <Button
                            variant="ghost"
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Login
                        </Button>
                    </div>

                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="relative">
                                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                    <Mail className="w-7 h-7 text-white" />
                                </div>
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                    <Shield className="w-3 h-3 text-white" />
                                </div>
                            </div>
                        </div>
                        
                        <h1 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 dark:text-white mb-3">
                            Verify Your Email
                        </h1>
                        <p className="text-center text-gray-600 dark:text-gray-400 text-sm sm:text-[15px] mb-2">
                            Enter the 4-digit code sent to
                        </p>
                        <p className="text-center font-medium text-indigo-600 dark:text-indigo-400 text-sm sm:text-[15px] mb-6">
                            {email || 'your email address'}
                        </p>
                        
                        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                            <Lock className="w-3 h-3" />
                            <span>Secure verification process</span>
                        </div>
                    </div>

                    {/* Verification Form */}
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Code Inputs */}
                        <div className="space-y-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                                Verification Code
                            </label>

                            <div className="flex justify-center gap-3 sm:gap-4">
                                {code.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={(el) => {
                                            inputRefs.current[index] = el;
                                        }}
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        onPaste={handlePaste}
                                        className="w-16 h-16 sm:w-18 sm:h-18 text-center text-2xl font-bold border-2 border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-3 focus:ring-indigo-500/30 focus:border-indigo-500 outline-none transition-all duration-200 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600"
                                        required
                                    />
                                ))}
                            </div>
                            
                            <p className="text-center text-xs text-gray-500 dark:text-gray-500 mt-4">
                                Type the 4-digit code or paste it directly
                            </p>
                        </div>

                        {/* Messages */}
                        {error && (
                            <div className="animate-fadeIn flex items-center gap-3 justify-center text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 py-3 px-4 rounded-xl border border-red-200 dark:border-red-800/50">
                                <AlertCircle size={18} className="flex-shrink-0" />
                                <span className="text-center">{error}</span>
                            </div>
                        )}

                        {success && (
                            <div className="animate-fadeIn flex items-center gap-3 justify-center text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 py-3 px-4 rounded-xl border border-green-200 dark:border-green-800/50">
                                <CheckCircle2 size={18} className="flex-shrink-0" />
                                <span className="text-center">{success}</span>
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isSubmitting || !isCodeComplete}
                            className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 dark:from-indigo-700 dark:to-purple-800 dark:hover:from-indigo-600 dark:hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Verifying...
                                </span>
                            ) : (
                                'Verify Email'
                            )}
                        </Button>
                    </form>

                    {/* Resend Code Section */}
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-zinc-800">
                        <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-4">
                            Didn't receive the code?
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button
                                variant="outline"
                                onClick={handleResendCode}
                                disabled={resendCooldown > 0}
                                className="w-full sm:w-auto px-6 py-2.5 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 rounded-xl"
                            >
                                {resendCooldown > 0
                                    ? `Resend in ${resendCooldown}s`
                                    : 'Resend Code'
                                }
                            </Button>
                            <Link
                                href="/support"
                                className="text-sm text-gray-500 dark:text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors underline underline-offset-2"
                            >
                                Need help?
                            </Link>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-600">
                            By verifying your email, you agree to our{' '}
                            <Link href="/terms" className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300">
                                Terms of Service
                            </Link>{' '}
                            and{' '}
                            <Link href="/privacy" className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300">
                                Privacy Policy
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Right Panel - Graphics & Info */}
                <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-8 md:p-12 flex-col justify-center relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: `radial-gradient(circle at 25px 25px, white 2%, transparent 0%), radial-gradient(circle at 75px 75px, white 2%, transparent 0%)`,
                            backgroundSize: '100px 100px'
                        }} />
                    </div>
                    
                    {/* Animated Elements */}
                    <div className="absolute top-10 right-10 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse" />
                    <div className="absolute bottom-10 left-10 w-32 h-32 bg-purple-400/10 rounded-full blur-xl animate-pulse delay-1000" />
                    
                    <div className="relative z-10 max-w-md mx-auto text-center text-white">
                        {/* Icon Container */}
                        <div className="mb-8">
                            <div className="inline-flex items-center justify-center p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 shadow-2xl">
                                <div className="relative">
                                    <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
                                        <Mail className="w-10 h-10 text-white" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                                        <CheckCircle2 className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <h2 className="text-2xl md:text-3xl font-bold mb-6">
                            Secure Account Verification
                        </h2>
                        
                        <div className="space-y-4 mb-8">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                </div>
                                <p className="text-left text-white/90">
                                    Protects your account from unauthorized access
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                </div>
                                <p className="text-left text-white/90">
                                    Ensures you receive important notifications
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <CheckCircle2 className="w-3 h-3 text-white" />
                                </div>
                                <p className="text-left text-white/90">
                                    Required for full platform access
                                </p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <div className="text-2xl font-bold">99.9%</div>
                                <div className="text-xs opacity-80">Success Rate</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <div className="text-2xl font-bold">10s</div>
                                <div className="text-xs opacity-80">Delivery Time</div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <div className="text-2xl font-bold">24/7</div>
                                <div className="text-xs opacity-80">Support</div>
                            </div>
                        </div>

                        {/* Quote */}
                        <div className="italic text-white/80 text-sm border-t border-white/20 pt-6">
                            "Verification adds an essential layer of security to your account, ensuring you have full control over your data."
                        </div>
                    </div>
                </div>
            </div>

            {/* Global Styles for Animation */}
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};

export default VerifyEmail;
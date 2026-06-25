'use client';
import React, { useState } from 'react';
import { Bug, MessageSquare, AlertTriangle, CheckCircle, Send, Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axios, { AxiosError } from 'axios';
import { useUserState } from '@/store/useUser';

const FeedbackPage = () => {
  const [formData, setFormData] = useState({
    issueType: 'bug',
    title: '',
    description: '',
    email: '',
    severity: 'medium',
    anonymous: false,
    includeScreenshot: false
  });

  const [satisfaction, setSatisfaction] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const user = useUserState((state) => state.user);

  const issueTypes = [
    { id: 'bug', label: 'Bug Report', icon: Bug, description: 'Something isn\'t working as expected' },
    { id: 'feature', label: 'Feature Request', icon: MessageSquare, description: 'Suggest a new feature or improvement' },
    { id: 'ui', label: 'UI/UX Issue', icon: AlertTriangle, description: 'Design or user experience problem' },
    { id: 'performance', label: 'Performance', icon: CheckCircle, description: 'Slow loading or lag issues' }
  ];

  const severityLevels = [
    { level: 'low', label: 'Low', description: 'Minor issue, doesn\'t affect usage', color: 'bg-green-500' },
    { level: 'medium', label: 'Medium', description: 'Some functionality affected', color: 'bg-yellow-500' },
    { level: 'high', label: 'High', description: 'Critical issue affecting gameplay', color: 'bg-orange-500' },
    { level: 'critical', label: 'Critical', description: 'Cannot use the platform', color: 'bg-red-500' }
  ];

  const satisfactionLevels = [
    { value: 1, label: 'Very Dissatisfied', emoji: '😞' },
    { value: 2, label: 'Dissatisfied', emoji: '😕' },
    { value: 3, label: 'Neutral', emoji: '😐' },
    { value: 4, label: 'Satisfied', emoji: '🙂' },
    { value: 5, label: 'Very Satisfied', emoji: '😄' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }


    console.log(formData);
    setIsSubmitting(true);

    try {

      const req = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/add-feedback`,{
        userID: user?.id,
        ...formData
      });

      if (req.status === 200 || req.status === 201) {
        toast.success('Thank you for your feedback! We\'ll review it soon.');

        // Reset form
        setFormData({
          issueType: 'bug',
          title: '',
          description: '',
          email: '',
          severity: 'medium',
          anonymous: false,
          includeScreenshot: false
        });
      }

    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data.message);
      }
    }


    setSatisfaction(null);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Feedback & Bug Reports
          </h1>
          <p className="text-gray-400">
            Help us improve the platform by reporting issues or suggesting features
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Issue Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    What type of feedback are you providing?
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {issueTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, issueType: type.id }))}
                          className={`p-4 rounded-xl border-2 transition-all ${formData.issueType === type.id
                            ? 'border-cyan-500 bg-cyan-500/10'
                            : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                            }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Icon className={`h-6 w-6 ${formData.issueType === type.id ? 'text-cyan-400' : 'text-gray-400'
                              }`} />
                            <span className="font-medium text-sm">{type.label}</span>
                            <span className="text-xs text-gray-400 text-center">{type.description}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Brief description of the issue"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Description Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Detailed Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    placeholder="Please describe the issue in detail. Include steps to reproduce if it's a bug."
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                    required
                  />
                  <p className="mt-2 text-sm text-gray-400">
                    Include specific details like error messages, page URLs, or what you were trying to do.
                  </p>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="We'll contact you if we need more details"
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>

                {/* Severity Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    How severe is this issue?
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {severityLevels.map((severity) => (
                      <button
                        key={severity.level}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, severity: severity.level }))}
                        className={`p-3 rounded-lg border transition-all ${formData.severity === severity.level
                          ? 'border-cyan-500 bg-cyan-500/10'
                          : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${severity.color}`}></div>
                          <span className="font-medium text-sm">{severity.label}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1 text-left">{severity.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Satisfaction Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">
                    Overall, how satisfied are you with the platform?
                  </label>
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-2">
                      {satisfactionLevels.map((level) => (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => setSatisfaction(level.value)}
                          className={`p-3 rounded-lg border transition-all transform hover:scale-105 ${satisfaction === level.value
                            ? 'border-cyan-500 bg-cyan-500/10 scale-105'
                            : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                            }`}
                        >
                          <div className="flex flex-col items-center">
                            <span className="text-2xl">{level.emoji}</span>
                            <span className="text-xs text-gray-400 mt-1">{level.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="anonymous"
                      checked={formData.anonymous}
                      onChange={handleChange}
                      className="w-4 h-4 text-cyan-500 bg-gray-800 border-gray-700 rounded focus:ring-cyan-600 focus:ring-offset-gray-900"
                    />
                    <span className="text-sm text-gray-300">Submit anonymously</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="includeScreenshot"
                      checked={formData.includeScreenshot}
                      onChange={handleChange}
                      className="w-4 h-4 text-cyan-500 bg-gray-800 border-gray-700 rounded focus:ring-cyan-600 focus:ring-offset-gray-900"
                    />
                    <span className="text-sm text-gray-300">I've attached a screenshot</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Submit Feedback
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column - Information */}
          <div className="space-y-6">
            {/* Tips Card */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Tips for Effective Feedback
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-300">Be specific and detailed</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-300">Include steps to reproduce bugs</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-300">Add screenshots when possible</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-gray-300">Describe what you expected to happen</span>
                </li>
              </ul>
            </div>

            {/* Common Issues */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Common Issues</h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-900/30 rounded-lg">
                  <h4 className="font-medium text-cyan-300 text-sm">Game Connection Issues</h4>
                  <p className="text-xs text-gray-400 mt-1">Check your internet connection and try refreshing</p>
                </div>
                <div className="p-3 bg-gray-900/30 rounded-lg">
                  <h4 className="font-medium text-cyan-300 text-sm">Matchmaking Delays</h4>
                  <p className="text-xs text-gray-400 mt-1">Peak hours may cause longer queue times</p>
                </div>
                <div className="p-3 bg-gray-900/30 rounded-lg">
                  <h4 className="font-medium text-cyan-300 text-sm">Score Calculation</h4>
                  <p className="text-xs text-gray-400 mt-1">Scores update after match completion</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 backdrop-blur-lg rounded-2xl border border-cyan-700/30 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Feedback Stats</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-300">Bugs Fixed</span>
                    <span className="text-lg font-bold text-cyan-300">94%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-300">Feature Requests</span>
                    <span className="text-lg font-bold text-cyan-300">78%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-300">Average Response Time</span>
                    <span className="text-lg font-bold text-cyan-300">24h</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 p-6">
              <h3 className="text-lg font-bold text-white mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Matchmaking</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-400">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Code Execution</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-400">Operational</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-300">Leaderboards</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-400">Operational</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-8 bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700 p-6">
          <h3 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-900/30 rounded-lg">
              <h4 className="font-medium text-cyan-300 mb-2">How long does it take to get a response?</h4>
              <p className="text-sm text-gray-400">We typically respond within 24-48 hours for critical issues.</p>
            </div>
            <div className="p-4 bg-gray-900/30 rounded-lg">
              <h4 className="font-medium text-cyan-300 mb-2">Can I track my bug report?</h4>
              <p className="text-sm text-gray-400">Yes, we provide a tracking ID for each submission.</p>
            </div>
            <div className="p-4 bg-gray-900/30 rounded-lg">
              <h4 className="font-medium text-cyan-300 mb-2">What information should I include?</h4>
              <p className="text-sm text-gray-400">Browser, OS, steps to reproduce, and screenshots help us most.</p>
            </div>
            <div className="p-4 bg-gray-900/30 rounded-lg">
              <h4 className="font-medium text-cyan-300 mb-2">Do you prioritize certain issues?</h4>
              <p className="text-sm text-gray-400">Critical bugs affecting all users are prioritized.</p>
            </div>
          </div>
        </div>
      </div>

      <Toaster position="top-right" />
    </div>
  );
};

export default FeedbackPage;
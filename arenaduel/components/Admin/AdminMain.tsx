// app/admin/dashboard/page.tsx (updated)
'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from './Header';
import OverviewTab from './OverviewTab';
import UsersTab from './UsersTab';
import FeedbackTab from './FeedbackTab';
import MatchesTab from './MatchesTabs';
import SessionsTab from './SessionsTab';
import StatsCards from './StatsCards';
import LoadingSpinner from './LoadingSpinner';
import Sidebar from './SideBar';
import { Problem, TestCase } from './types';
import ProblemsTab from './ProblemsTab';

// Add problems to state
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'feedback' | 'matches' | 'sessions' | 'problems'>('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [matches, setMatches] = useState([]);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('today');

  // app/admin/dashboard/page.tsx
useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, usersRes, feedbackRes, matchesRes, problemsRes] = await Promise.allSettled([  // Use allSettled instead of all
                axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin-stats`),
                axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin-users`),
                axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin-feedbacks`),
                axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin-matches`),
                axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin-problems`),
            ]);

            // Handle each response individually
            if (statsRes.status === 'fulfilled') {
                setStats(statsRes.value.data.getStats);
            } else {
                console.error('Stats fetch failed:', statsRes.reason);
                setStats(null);
            }

            if (usersRes.status === 'fulfilled') {
                setUsers(usersRes.value.data.getUsers);
            } else {
                console.error('Users fetch failed:', usersRes.reason);
            }

            if (feedbackRes.status === 'fulfilled') {
                setFeedback(feedbackRes.value.data.getFeedbacks);
            } else {
                console.error('Feedback fetch failed:', feedbackRes.reason);
            }

            if (matchesRes.status === 'fulfilled') {
                setMatches(matchesRes.value.data.getMatches);
            } else {
                console.error('Matches fetch failed:', matchesRes.reason);
            }

            if (problemsRes.status === 'fulfilled') {
                setProblems(problemsRes.value.data.problems);
            } else {
                console.error('Problems fetch failed:', problemsRes.reason);
            }

        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
}, []);

  // Problem CRUD handlers
  const handleProblemCreate = async (problemData: any) => {
    console.log(problemData);
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin-add_problem`, problemData);
      if (response.status === 200) {
        setProblems(prev => [...prev, response.data.problem]);
        return response.data.problem;
      }
    } catch (error) {
      console.error('Error creating problem:', error);
      throw error;
    }
  };

  const handleProblemUpdate = async (problemData: any) => {
    try {

      console.log(problemData);

      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin-update_problem`, {
        // id : id,
        problemData : problemData
      });
      if(response.status === 200) {
        window.location.reload();
        console.log(response.data);
      } 
      // setProblems(prev => prev.map(p => p.id === id ? response.data : p));
      // return response.data;
    } catch (error) {
      console.error('Error updating problem:', error);
      throw error;
    }
  };

  const handleProblemDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this problem?')) return;

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin-delete_problem`,{
        id: id
      });
      // setProblems(prev => prev.filter(p => p.id !== id));

      window.location.reload();
    } catch (error) {
      console.error('Error deleting problem:', error);
      throw error;
    }
  };

  const handleTestCaseAdd = async (problemId: number, testCase: TestCase) => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin-add_testCase`,
        {
          testCase,
          problemId
        }
      );
      if (response.status == 200) {
        console.log(response.data.msg);
      }

      // Update problem's test case count
      // setProblems(prev => prev.map(p => {
      //   if (p.id === problemId) {
      //     return {
      //       ...p,
      //       hiddenTestCasesCount: (p.hiddenTestCasesCount || 0) + 1
      //     };
      //   }
      //   return p;
      // }));

      // return response.data;
    } catch (error) {
      console.error('Error adding test case:', error);
      throw error;
    }
  };

  const handleTestCaseDelete = async (problemId: number, testCaseId: number) => {
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/problems/${problemId}/test-cases/${testCaseId}`
      );

      setProblems(prev => prev.map(p => {
        if (p.id === problemId) {
          return {
            ...p,
            hiddenTestCasesCount: Math.max(0, (p.hiddenTestCasesCount || 0) - 1)
          };
        }
        return p;
      }));
    } catch (error) {
      console.error('Error deleting test case:', error);
      throw error;
    }
  };

  const handleTestCasesBulkUpload = async (problemId: number, files: File[]) => {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/problems/${problemId}/test-cases/bulk`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setProblems(prev => prev.map(p => {
        if (p.id === problemId) {
          return {
            ...p,
            hiddenTestCasesCount: (p.hiddenTestCasesCount || 0) + response.data.count
          };
        }
        return p;
      }));

      return response.data;
    } catch (error) {
      console.error('Error bulk uploading test cases:', error);
      throw error;
    }
  };


  const handleUserBan = async (userId: string, ban: boolean) => {
    try {

      console.log(userId, ban);

      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin-user-activity`,
        {
          userId,
          ban,
          type: ban ? 'ban' : 'unban'
        });

      if (res.status === 200) {
        window.location.reload();
      }

    } catch (error) {
      console.log(error);
    }
  }

  const handleFeedbackResolve = async (feedbackId: number) => {
    try {

      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin-feedback-activity`,
        {
          feedbackId,
          type: 'resolve'
        });

      if (res.status === 200) {
        window.location.reload();
      }


    } catch (error) {
        console.log(error);
        throw error;
    }
  }
  
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} />

      <div className="md:ml-64 p-6">
        <Header
          activeTab={activeTab}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          dateRange={dateRange}
          setDateRange={setDateRange}
        />

        <StatsCards stats={stats} />

        <div className="space-y-6">
          {activeTab === 'overview' && (
            <OverviewTab users={users} feedback={feedback} />
          )}

          {activeTab === 'users' && (
            <UsersTab
              users={users}
              onBanUser={handleUserBan}
            />
          )}

          {activeTab === 'feedback' && (
            <FeedbackTab
              feedback={feedback}
              onResolveFeedback={handleFeedbackResolve}
            />
          )}

          {activeTab === 'matches' && (
            <MatchesTab matches={matches} />
          )}

          {activeTab === 'problems' && (
            <ProblemsTab
              problems={problems}
              onProblemCreate={handleProblemCreate}
              onProblemUpdate={handleProblemUpdate}
              onProblemDelete={handleProblemDelete}
              onTestCaseAdd={handleTestCaseAdd}
              onTestCaseDelete={handleTestCaseDelete}
              onTestCasesBulkUpload={handleTestCasesBulkUpload}
            />
          )}

          {activeTab === 'sessions' && (
            <SessionsTab />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n/config';
import FeatureForm from './components/FeatureForm';
import FeatureList from './components/FeatureList';

export type SortBy = 'recent' | 'votes';

export interface FeatureRequest {
  id: number;
  title: string;
  description: string;
  votes: number;
  created_at: Date;
  is_deleted: boolean;
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const [features, setFeatures] = useState<FeatureRequest[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('recent');
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchFeatures = async () => {
    try {
      const response = await fetch(`/api/features?sortBy=${sortBy}`);
      if (response.ok) {
        const data = await response.json();
        setFeatures(data);
      }
    } catch (error) {
      console.error('Error fetching features:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, [sortBy]);

  const handleFeatureCreated = () => {
    fetchFeatures();
  };

  const handleVote = async (featureId: number) => {
    try {
      const userId = `user_${Math.random().toString(36).substr(2, 9)}`;
      const response = await fetch(`/api/features/${featureId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          userName: 'Anonymous User',
          userAvatar: `https://i.pravatar.cc/150?u=${userId}`,
        }),
      });

      if (response.ok) {
        fetchFeatures();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to vote');
    }
  };

  const handleDelete = async (featureId: number) => {
    if (!confirm('Are you sure you want to delete this feature request?')) {
      return;
    }

    try {
      const response = await fetch(`/api/features/${featureId}`, {
        method: 'DELETE',
        headers: {
          'x-user-admin': isAdmin.toString(),
        },
      });

      if (response.ok) {
        fetchFeatures();
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete');
    }
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'de' ? 'en' : 'de');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-end mb-4">
            <button
              onClick={toggleLanguage}
              className="px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all font-medium text-gray-700"
            >
              {i18n.language === 'de' ? '🇬🇧 EN' : '🇩🇪 DE'}
            </button>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🚀 {t('title')}
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            {t('subtitle')}
          </p>
          
          {/* Admin Toggle */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700">
                Admin Mode
              </span>
            </label>
          </div>
        </div>

        {/* Feature Submission Form */}
        <div className="mb-12">
          <FeatureForm onFeatureCreated={handleFeatureCreated} />
        </div>

        {/* Sort Controls */}
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Feature Requests
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('recent')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                sortBy === 'recent'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t('sort.newest')}
            </button>
            <button
              onClick={() => setSortBy('votes')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                sortBy === 'votes'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t('sort.mostVoted')}
            </button>
          </div>
        </div>

        {/* Feature List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-600">Loading features...</p>
          </div>
        ) : (
          <FeatureList
            features={features}
            onVote={handleVote}
            onDelete={isAdmin ? handleDelete : undefined}
          />
        )}
      </div>
    </div>
  );
}




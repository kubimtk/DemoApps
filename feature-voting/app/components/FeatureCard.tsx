'use client';

import { useState, useEffect } from 'react';
import { FeatureRequest } from '../page';

interface Vote {
  id: number;
  user_id: string;
  user_name: string;
  user_avatar: string;
}

interface FeatureCardProps {
  feature: FeatureRequest;
  onVote: (featureId: number) => void;
  onDelete?: (featureId: number) => void;
}

export default function FeatureCard({ feature, onVote, onDelete }: FeatureCardProps) {
  const [voters, setVoters] = useState<Vote[]>([]);
  const [showVoters, setShowVoters] = useState(false);
  const [loadingVoters, setLoadingVoters] = useState(false);

  const fetchVoters = async () => {
    if (voters.length > 0) {
      setShowVoters(!showVoters);
      return;
    }

    setLoadingVoters(true);
    try {
      const response = await fetch(`/api/features/${feature.id}/vote`);
      if (response.ok) {
        const data = await response.json();
        setVoters(data);
        setShowVoters(true);
      }
    } catch (error) {
      console.error('Error fetching voters:', error);
    } finally {
      setLoadingVoters(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
      <div className="flex items-start gap-4">
        {/* Vote Button */}
        <button
          onClick={() => onVote(feature.id)}
          className="flex flex-col items-center gap-1 min-w-[60px] px-4 py-3 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg hover:from-indigo-100 hover:to-purple-100 transition-all group"
        >
          <svg
            className="w-6 h-6 text-indigo-600 group-hover:scale-110 transition-transform"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-xl font-bold text-indigo-600">
            {feature.votes}
          </span>
        </button>

        {/* Feature Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-xl font-bold text-gray-900">
              {feature.title}
            </h3>
            {onDelete && (
              <button
                onClick={() => onDelete(feature.id)}
                className="text-red-600 hover:text-red-700 transition-colors ml-4"
                title="Delete feature (Admin)"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>

          <p className="text-gray-600 mb-4">{feature.description}</p>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>📅 {formatDate(feature.created_at)}</span>
            {feature.votes > 0 && (
              <button
                onClick={fetchVoters}
                className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
              >
                👥 {feature.votes} {feature.votes === 1 ? 'Vote' : 'Votes'}
                {loadingVoters && (
                  <span className="animate-spin">⏳</span>
                )}
              </button>
            )}
          </div>

          {/* Voter List */}
          {showVoters && voters.length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Voters
              </h4>
              <div className="flex flex-wrap gap-2">
                {voters.map((voter) => (
                  <div
                    key={voter.id}
                    className="flex items-center gap-2 bg-white px-3 py-2 rounded-full shadow-sm"
                  >
                    <img
                      src={voter.user_avatar}
                      alt={voter.user_name}
                      className="w-6 h-6 rounded-full"
                    />
                    <span className="text-sm text-gray-700">
                      {voter.user_name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




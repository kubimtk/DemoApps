'use client';

import { useTranslation } from 'react-i18next';
import { FeatureRequest } from '../page';
import FeatureCard from './FeatureCard';

interface FeatureListProps {
  features: FeatureRequest[];
  onVote: (featureId: number) => void;
  onDelete?: (featureId: number) => void;
}

export default function FeatureList({ features, onVote, onDelete }: FeatureListProps) {
  const { t } = useTranslation();

  if (features.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {t('empty.title')}
        </h3>
        <p className="text-gray-600">
          {t('empty.hint')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {features.map((feature) => (
        <FeatureCard
          key={feature.id}
          feature={feature}
          onVote={onVote}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

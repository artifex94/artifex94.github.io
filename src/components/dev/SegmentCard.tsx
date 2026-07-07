import React from 'react';
import { Plus } from 'lucide-react';
import type { Segment } from '../../data/business';

interface SegmentCardProps {
  segment: Segment;
  isActive: boolean;
  onToggle: () => void;
}

// A rubro card. It stays fixed in its grid cell — never resizes or moves. The
// description opens in a full-width strip below the card's row (see SegmentGrid),
// so the grid never reflows: only the rows underneath shift down. Active state
// is a highlighted border; the "+" rotates to "×".
export const SegmentCard: React.FC<SegmentCardProps> = ({ segment, isActive, onToggle }) => {
  const Icon = segment.icon;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isActive}
      aria-controls={isActive ? 'segment-detail' : undefined}
      className={`group relative flex min-h-[44px] w-full flex-col gap-3 border bg-surface p-5 pr-12 text-left transition-[border-color,box-shadow] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        isActive
          ? 'border-accent shadow-[0_0_20px_rgba(255,107,0,0.15)]'
          : 'border-line hover:border-accent hover:shadow-[0_0_20px_rgba(255,107,0,0.2)]'
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute right-4 top-5 text-accent transition-transform duration-300 ${
          isActive ? 'rotate-45' : 'group-hover:rotate-90'
        }`}
      >
        <Plus className="h-5 w-5" />
      </span>
      <Icon
        className={`h-7 w-7 transition-colors ${isActive ? 'text-accent' : 'text-accent/70 group-hover:text-accent'}`}
        aria-hidden="true"
      />
      <h3 className={`font-bold transition-colors ${isActive ? 'text-accent' : 'text-white group-hover:text-accent'}`}>
        {segment.title}
      </h3>
      <p className="text-sm leading-relaxed text-primary/85">{segment.hook}</p>
    </button>
  );
};

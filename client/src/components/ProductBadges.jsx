import { Flame, Sparkles, Star } from 'lucide-react';

const badgeDefinitions = [
  {
    key: 'newArrival',
    label: 'New arrival',
    Icon: Sparkles,
    className: 'rigora-badge-new',
  },
  {
    key: 'bestSeller',
    label: 'Best seller',
    Icon: Flame,
    className: 'rigora-badge-best',
  },
  {
    key: 'featured',
    label: 'Rigora pick',
    Icon: Star,
    className: 'rigora-badge-featured',
  },
];

export default function ProductBadges({ product }) {
  const badges = badgeDefinitions.filter(({ key }) => product[key]).slice(0, 2);

  if (!badges.length) return null;

  return (
    <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-wrap gap-2">
      {badges.map(({ key, label, Icon, className }) => (
        <span key={key} className={`rigora-badge ${className}`}>
          <Icon size={12} aria-hidden="true" />
          {label}
        </span>
      ))}
    </div>
  );
}

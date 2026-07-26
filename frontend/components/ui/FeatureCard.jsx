'use client';

import Link from 'next/link';
import BlobPanel from './BlobPanel';
import Button from './Button';

export default function FeatureCard({ title, desc, accent = 'indigo', href, onClick, badge, size = 'large' }) {
  const isLarge = size === 'large';

  const handleClick = (e) => {
    if (onClick) {
      e.preventDefault();
      onClick(href);
    }
  };

  return (
    <BlobPanel
      accentColor={accent}
      className={`flex flex-col justify-between space-y-4 hover:scale-[1.02] transition-transform ${
        isLarge ? 'p-8 min-h-[280px]' : 'p-5 min-h-[200px]'
      }`}
    >
      <div>
        {badge && (
          <div className="flex justify-between items-center mb-3">
            <span
              className={`font-bold uppercase tracking-wider rounded-full bg-white/80 border border-slate-200 text-slate-700 shadow-xs ${
                isLarge ? 'text-sm px-4 py-1' : 'text-xs px-3 py-0.5'
              }`}
            >
              {badge}
            </span>
          </div>
        )}

        <h3 className={`font-serif font-bold text-[#2E2A26] ${isLarge ? 'text-2xl mt-2' : 'text-lg mt-1'}`}>
          {title}
        </h3>

        <p className={`text-slate-700 leading-relaxed mt-2 ${isLarge ? 'text-base font-normal' : 'text-xs font-normal'}`}>
          {desc}
        </p>
      </div>

      <div className="pt-2">
        {onClick ? (
          <Button
            accentColor={accent}
            onClick={handleClick}
            className={`w-full font-medium ${isLarge ? '!py-4 text-base' : '!py-2.5 text-xs'}`}
          >
            Launch Module →
          </Button>
        ) : (
          <Link href={href}>
            <Button
              accentColor={accent}
              className={`w-full font-medium ${isLarge ? '!py-4 text-base' : '!py-2.5 text-xs'}`}
            >
              Launch Module →
            </Button>
          </Link>
        )}
      </div>
    </BlobPanel>
  );
}

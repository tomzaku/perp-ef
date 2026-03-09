import type { Difficulty } from '../types/question';

interface SearchBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  difficulty: Difficulty | 'All';
  onDifficultyChange: (val: Difficulty | 'All') => void;
  company: string;
  onCompanyChange: (val: string) => void;
  companies: string[];
  subcategory: string;
  onSubcategoryChange: (val: string) => void;
  subcategories: string[];
}

export function SearchBar({
  search,
  onSearchChange,
  difficulty,
  onDifficultyChange,
  company,
  onCompanyChange,
  companies,
  subcategory,
  onSubcategoryChange,
  subcategories,
}: SearchBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
      {/* Search */}
      <div className="relative w-full sm:flex-1 sm:min-w-[200px]">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">
          /
        </span>
        <input
          type="text"
          placeholder="Search questions..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-bg-tertiary border border-border rounded-lg pl-8 pr-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 focus:ring-1 focus:ring-accent-cyan/20 transition-all"
        />
      </div>

      {/* Difficulty */}
      <select
        value={difficulty}
        onChange={(e) => onDifficultyChange(e.target.value as Difficulty | 'All')}
        className="flex-1 min-w-0 sm:flex-none bg-bg-tertiary border border-border rounded-lg px-3 py-2.5 text-sm text-text-secondary focus:outline-none focus:border-accent-cyan/50 cursor-pointer"
      >
        <option value="All">All Levels</option>
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
      </select>

      {/* Company */}
      <select
        value={company}
        onChange={(e) => onCompanyChange(e.target.value)}
        className="flex-1 min-w-0 sm:flex-none bg-bg-tertiary border border-border rounded-lg px-3 py-2.5 text-sm text-text-secondary focus:outline-none focus:border-accent-cyan/50 cursor-pointer"
      >
        <option value="All">All Companies</option>
        {companies.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      {/* Subcategory */}
      {subcategories.length > 0 && (
        <select
          value={subcategory}
          onChange={(e) => onSubcategoryChange(e.target.value)}
          className="flex-1 min-w-0 sm:flex-none bg-bg-tertiary border border-border rounded-lg px-3 py-2.5 text-sm text-text-secondary focus:outline-none focus:border-accent-cyan/50 cursor-pointer"
        >
          <option value="All">All Topics</option>
          {subcategories.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

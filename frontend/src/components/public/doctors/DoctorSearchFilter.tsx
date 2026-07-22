import React from 'react';
import { Search, Filter, RotateCcw, SortAsc } from 'lucide-react';
import { DoctorQueryFilter } from '../../../lib/public-doctors';

interface DoctorSearchFilterProps {
  filters: DoctorQueryFilter;
  onFilterChange: (updated: DoctorQueryFilter) => void;
  onReset: () => void;
  departmentOptions: Array<{ slug: string; name: string }>;
}

export const DoctorSearchFilter: React.FC<DoctorSearchFilterProps> = ({
  filters,
  onFilterChange,
  onReset,
  departmentOptions,
}) => {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        
        {/* 1. Search Bar Input */}
        <div className="lg:col-span-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by doctor name or qualification..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all font-medium"
          />
        </div>

        {/* 2. Department Select Dropdown */}
        <div className="lg:col-span-3">
          <select
            value={filters.department || 'ALL'}
            onChange={(e) => onFilterChange({ ...filters, department: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all cursor-pointer"
          >
            <option value="ALL">All Clinical Departments</option>
            {departmentOptions.map((dept) => (
              <option key={dept.slug} value={dept.slug}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>

        {/* 3. Availability Day Dropdown */}
        <div className="lg:col-span-2">
          <select
            value={filters.availability || 'ALL'}
            onChange={(e) => onFilterChange({ ...filters, availability: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all cursor-pointer"
          >
            <option value="ALL">All Available Days</option>
            {daysOfWeek.map((day) => (
              <option key={day} value={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        {/* 4. Sort Selector */}
        <div className="lg:col-span-2">
          <select
            value={filters.sortBy || 'experience_desc'}
            onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as any })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all cursor-pointer"
          >
            <option value="experience_desc">Experience: High to Low</option>
            <option value="experience_asc">Experience: Low to High</option>
            <option value="name_asc">Name: A to Z</option>
          </select>
        </div>

        {/* 5. Reset Filter Button */}
        <div className="lg:col-span-1 flex justify-end">
          <button
            onClick={onReset}
            className="w-full lg:w-auto px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors inline-flex items-center justify-center gap-1.5"
            title="Reset Filters"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="lg:hidden">Reset</span>
          </button>
        </div>

      </div>
    </div>
  );
};

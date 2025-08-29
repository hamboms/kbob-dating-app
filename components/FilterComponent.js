// components/FilterComponent.js
'use client';

import { useState } from 'react';

export default function FilterComponent({ onApplyFilter }) {
  const [filters, setFilters] = useState({
    gender: '',
    minAge: '',
    maxAge: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    onApplyFilter(filters);
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-md mb-8 flex flex-col sm:flex-row items-center gap-4">
      <div className="flex-1 w-full">
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">성별</label>
        <select
          id="gender"
          name="gender"
          value={filters.gender}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">모두</option>
          <option value="male">남성</option>
          <option value="female">여성</option>
        </select>
      </div>
      <div className="flex-1 w-full">
        <label className="block text-sm font-medium text-gray-700 mb-1">나이 범위</label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            name="minAge"
            placeholder="최소"
            value={filters.minAge}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <span>-</span>
          <input
            type="number"
            name="maxAge"
            placeholder="최대"
            value={filters.maxAge}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
      <button
        onClick={handleApply}
        className="w-full sm:w-auto bg-blue-500 text-white font-bold py-2 px-6 rounded-md hover:bg-blue-600 transition-colors mt-4 sm:mt-0"
      >
        적용
      </button>
    </div>
  );
}

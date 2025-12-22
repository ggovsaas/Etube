'use client';

import React, { useState, useEffect } from 'react';

interface CityFilterProps {
  cities: string[];
  initialCity?: string;
  onChange: (city: string) => void;
}

export default function CityFilter({ cities, initialCity = '', onChange }: CityFilterProps) {
  const [selectedCity, setSelectedCity] = useState(initialCity);

  // Only sync from props on mount or when initialCity actually changes from external source
  useEffect(() => {
    setSelectedCity(initialCity);
  }, [initialCity]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value;
    setSelectedCity(newCity);
    onChange(newCity);
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
      <select
        value={selectedCity}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700"
      >
        <option value="">Todas as cidades</option>
        {cities.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}

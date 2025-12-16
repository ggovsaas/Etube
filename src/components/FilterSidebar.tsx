import React from 'react';
import { ChangeEvent } from 'react';
import CityFilter from './CityFilter';

interface FilterSidebarProps {
  showFilters: boolean;
  search: string;
  onSearchChange: (e: ChangeEvent<HTMLInputElement>) => void;
  city: string;
  onCityChange: (city: string) => void;
  cities: string[];
  categories: { name: string; count: number; checked: boolean }[];
  onCategoryChange: (category: string) => void;
  priceRange: { min: string; max: string };
  onPriceChange: (range: { min: string; max: string }) => void;
  ages: { label: string; checked: boolean }[];
  onAgeChange: (label: string) => void;
  availability: { label: string; checked: boolean }[];
  onAvailabilityChange: (label: string) => void;
  hairColors: { label: string; checked: boolean }[];
  onHairColorChange: (label: string) => void;
  eyeColors: { label: string; checked: boolean }[];
  onEyeColorChange: (label: string) => void;
  ethnicities: { label: string; checked: boolean }[];
  onEthnicityChange: (label: string) => void;
  bodyTypes: { label: string; checked: boolean }[];
  onBodyTypeChange: (label: string) => void;
  onClear: () => void;
}

const FilterSidebar = React.memo(function FilterSidebar({
  showFilters,
  search,
  onSearchChange,
  city,
  onCityChange,
  cities,
  categories,
  onCategoryChange,
  priceRange,
  onPriceChange,
  ages,
  onAgeChange,
  availability,
  onAvailabilityChange,
  hairColors,
  onHairColorChange,
  eyeColors,
  onEyeColorChange,
  ethnicities,
  onEthnicityChange,
  bodyTypes,
  onBodyTypeChange,
  onClear,
}: FilterSidebarProps) {
  return (
    <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
      <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
        
        {/* Quick Search */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Pesquisa Rápida</label>
          <div className="relative">
            <input
              type="text"
              placeholder="Nome, características..."
              value={search}
              onChange={onSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700 placeholder-gray-500"
            />
            <i className="fas fa-search absolute left-3 top-3 text-gray-400"></i>
          </div>
        </div>

        {/* City Filter - Isolated component */}
        <CityFilter
          cities={cities}
          initialCity={city}
          onChange={onCityChange}
        />

        {/* Category Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
          <div className="space-y-2">
            {(Array.isArray(categories) ? categories : []).map((cat) => (
              <label key={cat.name} className="flex items-center text-gray-700">
                <input
                  type="checkbox"
                  checked={cat.checked}
                  onChange={() => onCategoryChange(cat.name)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 text-sm">{cat.name}</span>
                <span className="ml-auto text-xs text-gray-500">({cat.count})</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Faixa de Preço</label>
          <div className="px-3 py-2">
            <div className="flex items-center space-x-4 mb-3">
              <input
                type="number"
                placeholder="Min"
                value={priceRange.min}
                onChange={e => onPriceChange({ ...priceRange, min: e.target.value })}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-gray-700 placeholder-gray-500"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder="Max"
                value={priceRange.max}
                onChange={e => onPriceChange({ ...priceRange, max: e.target.value })}
                className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-gray-700 placeholder-gray-500"
              />
              <span className="text-sm text-gray-500">€/hora</span>
            </div>
          </div>
        </div>

        {/* Age Range */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Idade</label>
          <div className="space-y-2">
            {(Array.isArray(ages) ? ages : []).map((age) => (
              <label key={age.label} className="flex items-center text-gray-700">
                <input
                  type="checkbox"
                  checked={age.checked}
                  onChange={() => onAgeChange(age.label)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 text-sm">{age.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Availability */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Disponibilidade</label>
          <div className="space-y-2">
            {(Array.isArray(availability) ? availability : []).map((a) => (
              <label key={a.label} className="flex items-center text-gray-700">
                <input
                  type="checkbox"
                  checked={a.checked}
                  onChange={() => onAvailabilityChange(a.label)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 text-sm">{a.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Hair Color */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Cor do Cabelo</label>
          <div className="space-y-2">
            {(Array.isArray(hairColors) ? hairColors : []).map((hair) => (
              <label key={hair.label} className="flex items-center text-gray-700">
                <input
                  type="checkbox"
                  checked={hair.checked}
                  onChange={() => onHairColorChange(hair.label)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 text-sm">{hair.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Eye Color */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Cor dos Olhos</label>
          <div className="space-y-2">
            {(Array.isArray(eyeColors) ? eyeColors : []).map((eye) => (
              <label key={eye.label} className="flex items-center text-gray-700">
                <input
                  type="checkbox"
                  checked={eye.checked}
                  onChange={() => onEyeColorChange(eye.label)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 text-sm">{eye.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Ethnicity */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Etnia</label>
          <div className="space-y-2">
            {(Array.isArray(ethnicities) ? ethnicities : []).map((ethnicity) => (
              <label key={ethnicity.label} className="flex items-center text-gray-700">
                <input
                  type="checkbox"
                  checked={ethnicity.checked}
                  onChange={() => onEthnicityChange(ethnicity.label)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 text-sm">{ethnicity.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Body Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Corpo</label>
          <div className="space-y-2">
            {(Array.isArray(bodyTypes) ? bodyTypes : []).map((bodyType) => (
              <label key={bodyType.label} className="flex items-center text-gray-700">
                <input
                  type="checkbox"
                  checked={bodyType.checked}
                  onChange={() => onBodyTypeChange(bodyType.label)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="ml-2 text-sm">{bodyType.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Clear Filters */}
        <button
          type="button"
          onClick={onClear}
          className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition"
        >
          <i className="fas fa-times mr-2"></i>Limpar Filtros
        </button>
      </div>
    </div>
  );
});

export default FilterSidebar;
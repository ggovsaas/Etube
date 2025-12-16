'use client';

import React, { Suspense, useState, useEffect, useMemo, useCallback, ChangeEvent } from 'react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import ProfileGrid from '@/components/ProfileGrid';
import ProfileList from '@/components/ProfileList';
import FilterSidebar from '@/components/FilterSidebar';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from '@/hooks/useLocale';
import { getCities } from '@/lib/i18n';
import type { Profile } from '@/components/ProfileGrid';

function PerfisContent() {
  const { locale } = useLocale();
  const localeCities = getCities(locale);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Real profiles state
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);

  // Fetch profiles from API with locale filtering
  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError('');
      // Pass locale to filter profiles by country
      const response = await fetch(`/api/profiles?locale=${locale}`);
      
      const data = await response.json();
      
      // Handle error in response
      if (data.error) {
        console.error('API error:', data.error);
        setError(data.error);
        setAllProfiles([]);
        return;
      }
      
      // Transform API data to match Profile interface
      const transformedProfiles: Profile[] = (data.profiles || []).map((profile: any) => ({
        id: profile.id,
        listingId: profile.listingId || null, // Include listing ID for navigation
        name: profile.name || 'Unknown',
        age: profile.age || 0,
        city: profile.city || 'Unknown',
        height: profile.height || 0,
        weight: profile.weight || 0,
        price: profile.price || profile.pricePerHour || 0,
        rating: profile.rating || 0,
        reviews: profile.reviews || 0,
        isOnline: profile.isOnline || false,
        isVerified: profile.isVerified || false,
        image: profile.imageUrl || '/placeholder-profile.jpg',
        description: profile.description || 'No description available'
      }));
      
      setAllProfiles(transformedProfiles);
    } catch (err) {
      console.error('Error fetching profiles:', err);
      setError('Failed to load profiles. Please try again later.');
      setAllProfiles([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch profiles on component mount
  useEffect(() => {
    fetchProfiles();
  }, []);

  // Calculate filter counts dynamically
  const calculateFilterCounts = (): { name: string; count: number; checked: boolean }[] => {
    const counts = {
      feminino: allProfiles.filter(p => !p.name.toLowerCase().includes('trans')).length,
      milf: allProfiles.filter(p => p.age >= 36).length,
      trans: allProfiles.filter(p => p.name.toLowerCase().includes('trans')).length,
      vip: allProfiles.filter(p => p.price >= 200).length,
    };

    return [
      { name: 'Feminino', count: counts.feminino, checked: false },
      { name: 'MILF', count: counts.milf, checked: false },
      { name: 'Trans', count: counts.trans, checked: false },
      { name: 'VIP', count: counts.vip, checked: false },
    ];
  };

  // Filter state
  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  
  // Update categories with real counts
  const [categories, setCategories] = useState<{ name: string; count: number; checked: boolean }[]>(calculateFilterCounts());
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [ages, setAges] = useState([
    { label: '18-25', checked: false },
    { label: '26-35', checked: false },
    { label: '36-45', checked: false },
    { label: '45+', checked: false },
  ]);
  const [availability, setAvailability] = useState([
    { label: 'Online agora', checked: false },
    { label: 'Verificado', checked: false },
    { label: 'Com fotos', checked: false },
  ]);
  const [hairColors, setHairColors] = useState([
    { label: 'Loiro', checked: false },
    { label: 'Moreno', checked: false },
    { label: 'Ruivo', checked: false },
    { label: 'Preto', checked: false },
    { label: 'Castanho', checked: false },
  ]);
  const [eyeColors, setEyeColors] = useState([
    { label: 'Azul', checked: false },
    { label: 'Verde', checked: false },
    { label: 'Castanho', checked: false },
    { label: 'Preto', checked: false },
    { label: 'Cinza', checked: false },
  ]);
  const [ethnicities, setEthnicities] = useState([
    { label: 'Caucasiana', checked: false },
    { label: 'Africana', checked: false },
    { label: 'Asiática', checked: false },
    { label: 'Latina', checked: false },
    { label: 'Mista', checked: false },
  ]);
  const [bodyTypes, setBodyTypes] = useState([
    { label: 'Magra', checked: false },
    { label: 'Atlética', checked: false },
    { label: 'Curvilínea', checked: false },
    { label: 'Plus Size', checked: false },
    { label: 'Voluptuosa', checked: false },
  ]);

  // Cities should be memoized, not stateful
  const cities = useMemo(() => localeCities.map(c => c.name), [localeCities]);

  // Filtering logic
  const filteredProfiles = allProfiles.filter(profile => {
    // Search
    if (search && !profile.name.toLowerCase().includes(search.toLowerCase()) && !profile.city.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    // City
    if (city && profile.city.toLowerCase() !== city.toLowerCase()) {
      return false;
    }
    // Categories (improved logic)
    const selectedCategories = categories.filter(c => c.checked).map(c => c.name);
    if (selectedCategories.length > 0) {
      const matchesCategory = selectedCategories.some(category => {
        switch (category) {
          case 'MILF':
            return profile.age >= 36;
          case 'Trans':
            return profile.name.toLowerCase().includes('trans');
          case 'VIP':
            return profile.price >= 200;
          case 'Feminino':
            return !profile.name.toLowerCase().includes('trans');
          default:
            return false;
        }
      });
      if (!matchesCategory) return false;
    }
    // Price
    if (priceRange.min && profile.price < Number(priceRange.min)) return false;
    if (priceRange.max && profile.price > Number(priceRange.max)) return false;
    // Age
    const selectedAges = ages.filter(a => a.checked).map(a => a.label);
    if (selectedAges.length > 0) {
      const ageMatch = selectedAges.some(label => {
        if (label === '18-25') return profile.age >= 18 && profile.age <= 25;
        if (label === '26-35') return profile.age >= 26 && profile.age <= 35;
        if (label === '36-45') return profile.age >= 36 && profile.age <= 45;
        if (label === '45+') return profile.age >= 46;
        return false;
      });
      if (!ageMatch) return false;
    }
    // Availability
    const selectedAvail = availability.filter(a => a.checked).map(a => a.label);
    if (selectedAvail.length > 0) {
      if (selectedAvail.includes('Online agora') && !profile.isOnline) return false;
      if (selectedAvail.includes('Verificado') && !profile.isVerified) return false;
      // 'Com fotos' always true in mock
    }
    // Hair Color (mock filtering - in real app this would use actual profile data)
    const selectedHairColors = hairColors.filter(h => h.checked).map(h => h.label);
    if (selectedHairColors.length > 0) {
      // Mock: assign hair colors based on profile ID for demo
      const mockHairColors = ['Loiro', 'Moreno', 'Ruivo', 'Preto', 'Castanho'];
      const profileHairColor = mockHairColors[profile.id % mockHairColors.length];
      if (!selectedHairColors.includes(profileHairColor)) return false;
    }
    // Eye Color (mock filtering)
    const selectedEyeColors = eyeColors.filter(e => e.checked).map(e => e.label);
    if (selectedEyeColors.length > 0) {
      const mockEyeColors = ['Azul', 'Verde', 'Castanho', 'Preto', 'Cinza'];
      const profileEyeColor = mockEyeColors[profile.id % mockEyeColors.length];
      if (!selectedEyeColors.includes(profileEyeColor)) return false;
    }
    // Ethnicity (mock filtering)
    const selectedEthnicities = ethnicities.filter(e => e.checked).map(e => e.label);
    if (selectedEthnicities.length > 0) {
      const mockEthnicities = ['Caucasiana', 'Africana', 'Asiática', 'Latina', 'Mista'];
      const profileEthnicity = mockEthnicities[profile.id % mockEthnicities.length];
      if (!selectedEthnicities.includes(profileEthnicity)) return false;
    }
    return true;
  });

  // Pagination state (must come after filteredProfiles is declared)
  const [currentPage, setCurrentPage] = useState(1);
  const profilesPerPage = 12;
  const totalPages = Math.ceil(filteredProfiles.length / profilesPerPage);
  const paginatedProfiles = filteredProfiles.slice((currentPage - 1) * profilesPerPage, currentPage * profilesPerPage);

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();

    if (search) params.set('search', search);
    if (city) params.set('city', city);

    categories.forEach(cat => { if (cat.checked) params.append('categoria', cat.name.toLowerCase()); });
    if (priceRange.min) params.set('preco-min', priceRange.min);
    if (priceRange.max) params.set('preco-max', priceRange.max);
    ages.forEach(age => { if (age.checked) params.append('idade', age.label); });
    availability.forEach(a => { if (a.checked) params.append('disponibilidade', a.label.toLowerCase().replace(' ', '-')); });
    hairColors.forEach(hair => { if (hair.checked) params.append('cabelo', hair.label.toLowerCase()); });
    eyeColors.forEach(eye => { if (eye.checked) params.append('olhos', eye.label.toLowerCase()); });
    ethnicities.forEach(ethnicity => { if (ethnicity.checked) params.append('etnia', ethnicity.label.toLowerCase()); });
    bodyTypes.forEach(bodyType => { if (bodyType.checked) params.append('corpo', bodyType.label.toLowerCase()); });

    router.replace(`?${params.toString()}`);
  }, [search, city, categories, priceRange, ages, availability, hairColors, eyeColors, ethnicities, bodyTypes, router]);

  // Sync state from URL on mount
  useEffect(() => {
    const params = searchParams;

    setSearch(params.get('search') || '');

    // Read and normalize city from URL (support legacy 'cidade' param)
    const urlCity = params.get('city') || params.get('cidade') || '';
    if (urlCity) {
      // Normalize: find matching city from available cities (case-insensitive)
      const matchingCity = cities.find(c => c.toLowerCase() === urlCity.toLowerCase());
      setCity(matchingCity || urlCity);
    }

    const categoriaParams = params.getAll('categoria');
    setCategories(prev => prev.map(cat => ({
      ...cat,
      checked: categoriaParams.includes(cat.name.toLowerCase())
    })));

    setPriceRange({
      min: params.get('preco-min') || '',
      max: params.get('preco-max') || ''
    });

    const idadeParams = params.getAll('idade');
    setAges(prev => prev.map(age => ({
      ...age,
      checked: idadeParams.includes(age.label)
    })));

    const disponibilidadeParams = params.getAll('disponibilidade');
    setAvailability(prev => prev.map(a => ({
      ...a,
      checked: disponibilidadeParams.includes(a.label.toLowerCase().replace(' ', '-'))
    })));

    const cabeloParams = params.getAll('cabelo');
    setHairColors(prev => prev.map(hair => ({
      ...hair,
      checked: cabeloParams.includes(hair.label.toLowerCase())
    })));

    const olhosParams = params.getAll('olhos');
    setEyeColors(prev => prev.map(eye => ({
      ...eye,
      checked: olhosParams.includes(eye.label.toLowerCase())
    })));

    const etniaParams = params.getAll('etnia');
    setEthnicities(prev => prev.map(ethnicity => ({
      ...ethnicity,
      checked: etniaParams.includes(ethnicity.label.toLowerCase())
    })));

    const corpoParams = params.getAll('corpo');
    setBodyTypes(prev => prev.map(bodyType => ({
      ...bodyType,
      checked: corpoParams.includes(bodyType.label.toLowerCase())
    })));
  }, [searchParams, cities]);

  // Handlers
  const handleCategoryChange = (name: string) => {
    setCategories(categories.map(cat => cat.name === name ? { ...cat, checked: !cat.checked } : cat));
  };
  const handleAgeChange = (label: string) => {
    setAges(ages.map(age => age.label === label ? { ...age, checked: !age.checked } : age));
  };
  const handleAvailabilityChange = (label: string) => {
    setAvailability(availability.map(a => a.label === label ? { ...a, checked: !a.checked } : a));
  };
  const handleHairColorChange = (label: string) => {
    setHairColors(hairColors.map(hair => hair.label === label ? { ...hair, checked: !hair.checked } : hair));
  };
  const handleEyeColorChange = (label: string) => {
    setEyeColors(eyeColors.map(eye => eye.label === label ? { ...eye, checked: !eye.checked } : eye));
  };
  const handleEthnicityChange = (label: string) => {
    setEthnicities(ethnicities.map(ethnicity => ethnicity.label === label ? { ...ethnicity, checked: !ethnicity.checked } : ethnicity));
  };
  const handleBodyTypeChange = (label: string) => {
    setBodyTypes(bodyTypes.map(bodyType => bodyType.label === label ? { ...bodyType, checked: !bodyType.checked } : bodyType));
  };

  // City change handler - receives city string directly from CityFilter
  const handleCityChange = useCallback((newCity: string) => {
    setCity(newCity);
  }, []);

  const handleClear = useCallback(() => {
    setSearch('');
    setCity('');
    setCategories(categories.map(cat => ({ ...cat, checked: false })));
    setPriceRange({ min: '', max: '' });
    setAges(ages.map(age => ({ ...age, checked: false })));
    setAvailability(availability.map(a => ({ ...a, checked: false })));
    setHairColors(hairColors.map(hair => ({ ...hair, checked: false })));
    setEyeColors(eyeColors.map(eye => ({ ...eye, checked: false })));
    setEthnicities(ethnicities.map(ethnicity => ({ ...ethnicity, checked: false })));
    setBodyTypes(bodyTypes.map(bodyType => ({ ...bodyType, checked: false })));
  }, [categories, ages, availability, hairColors, eyeColors, ethnicities, bodyTypes]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Header Section */}
      <div className="bg-white py-8 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Todos os Perfis
              </h1>
              <p className="text-gray-600 mt-2">
                Encontrados <span className="font-semibold text-red-600">{filteredProfiles.length}</span> perfis
              </p>
            </div>
            
            {/* View Toggle & Sort */}
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              {/* Filter Toggle */}
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <i className="fas fa-filter mr-2"></i>Filtros
              </button>
              
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-md transition text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                  aria-label="Ver em grade"
                >
                  <i className="fas fa-th-large"></i>
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-md transition text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500 ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                  aria-label="Ver em lista"
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>
              
              {/* Sort Dropdown */}
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-700 placeholder-gray-500 bg-white"
              >
                <option value="recent">Mais Recentes</option>
                <option value="popular">Mais Populares</option>
                <option value="price-low">Preço: Menor</option>
                <option value="price-high">Preço: Maior</option>
                <option value="rating">Melhor Avaliação</option>
                <option value="name">Nome A-Z</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters and Banner */}
          <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
            <FilterSidebar
              showFilters={showFilters}
              search={search}
              onSearchChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              city={city}
              onCityChange={handleCityChange}
              cities={cities}
              categories={categories}
              onCategoryChange={handleCategoryChange}
              priceRange={priceRange}
              onPriceChange={setPriceRange}
              ages={ages}
              onAgeChange={handleAgeChange}
              availability={availability}
              onAvailabilityChange={handleAvailabilityChange}
              hairColors={hairColors}
              onHairColorChange={handleHairColorChange}
              eyeColors={eyeColors}
              onEyeColorChange={handleEyeColorChange}
              ethnicities={ethnicities}
              onEthnicityChange={handleEthnicityChange}
              bodyTypes={bodyTypes}
              onBodyTypeChange={handleBodyTypeChange}
              onClear={handleClear}
            />
            {/* Single Sidebar Banner (only on lg+) */}
            <div className="hidden lg:block relative rounded-lg overflow-hidden border border-gray-200">
              <img
                src="/banners/colombian-banner.jpg"
                alt="Promoção Webcams Premium"
                className="w-full h-[365px] object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-8 gap-3">
                <h3 className="text-2xl font-bold text-white drop-shadow text-center">Webcams Premium</h3>
                <p className="text-white text-base drop-shadow text-center leading-tight max-w-xs">
                  Assista transmissões ao vivo ou agende uma sessão exclusiva com as melhores performers da Colômbia!
                </p>
                <button className="bg-red-600 text-white px-5 py-2 rounded font-semibold hover:bg-red-700 transition text-base mt-2">
                  Agendar Webcam
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-12">
                <p>Loading profiles...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-600">
                {error}
              </div>
            ) : viewMode === 'grid' ? <ProfileGrid profiles={paginatedProfiles} /> : <ProfileList profiles={paginatedProfiles} />}

            {/* Horizontal Banner below grid/list, above pagination */}
            <div className="mt-8 mb-6 relative rounded-xl overflow-hidden border border-gray-200 max-w-4xl mx-auto">
              <img
                src="/banners/colombian-banner.jpg"
                alt="Promoção Webcams Premium"
                className="w-full h-32 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-6 gap-2">
                <h2 className="text-xl font-bold text-white drop-shadow">Webcams Premium</h2>
                <p className="text-sm text-white drop-shadow text-center max-w-xl">
                  Assista transmissões ao vivo ou agende uma sessão exclusiva com as melhores performers da Colômbia!
                </p>
                <button className="bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700 transition text-sm mt-1 shadow-lg">
                  Agendar Webcam
                </button>
              </div>
            </div>

            {/* Pagination */}
            <div className="mt-12 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  className="px-3 py-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`px-3 py-2 rounded-lg ${currentPage === i + 1 ? 'bg-red-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="px-3 py-2 rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div />}> 
      <PerfisContent />
    </Suspense>
  );
}
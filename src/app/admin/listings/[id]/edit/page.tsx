'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormData {
  // Basic Info
  name: string;
  age: string;
  city: string;
  neighborhood: string;
  phone: string;
  description: string;
  whatsappEnabled: boolean;
  telegramEnabled: boolean;
  
  // Social Media Links
  onlyfans: string;
  privacy: string;
  instagram: string;
  twitter: string;
  tiktok: string;
  snapchat: string;
  telegramChannel: string;
  whatsappBusiness: string;
  manyvids: string;
  chaturbate: string;
  myfreecams: string;
  livejasmin: string;
  linkHubUrl: string;
  
  // Physical Details
  gender: string;
  preference: string;
  weight: string;
  height: string;
  ethnicity: string;
  eyeColor: string;
  shoeSize: string;
  tattoos: string;
  piercings: string;
  smoker: string;
  languages: string[];
  
  // Additional Physical Attributes
  bodyType: string;
  hairColor: string;
  breastSize: string;
  breastType: string;
  
  // Services
  services: string[];
  
  // Additional Details
  minDuration: string;
  advanceNotice: string;
  acceptsCard: string;
  regularDiscount: string;
  
  // Pricing (Optional)
  showPricing: boolean;
  pricing: {
    local: {
      oneHour: string;
      twoHours: string;
      overnight: string;
      fifteenMin?: string;
      thirtyMin?: string;
    };
    travel: {
      oneHour: string;
      twoHours: string;
      overnight: string;
      fifteenMin?: string;
      thirtyMin?: string;
    };
  };
  
  // Media
  photos: File[];
  galleryMedia: File[];
  comparisonMedia: File[];
  voiceNoteUrl: string;
  voiceNoteFile: File | null;

  // Listing specific
  status: string;
  price: string;
}

const STATUSES = ['PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED'];

export default function EditListing({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listingData, setListingData] = useState<any>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: '',
    city: '',
    neighborhood: '',
    phone: '',
    description: '',
    whatsappEnabled: false,
    telegramEnabled: false,
    onlyfans: '',
    privacy: '',
    instagram: '',
    twitter: '',
    tiktok: '',
    snapchat: '',
    telegramChannel: '',
    whatsappBusiness: '',
    manyvids: '',
    chaturbate: '',
    myfreecams: '',
    livejasmin: '',
    linkHubUrl: '',
    gender: '',
    preference: '',
    weight: '',
    height: '',
    ethnicity: '',
    eyeColor: '',
    shoeSize: '',
    tattoos: '',
    piercings: '',
    smoker: '',
    languages: [],
    bodyType: '',
    hairColor: '',
    breastSize: '',
    breastType: '',
    services: [],
    minDuration: '',
    advanceNotice: '',
    acceptsCard: '',
    regularDiscount: '',
    showPricing: false,
    pricing: {
      local: { oneHour: '', twoHours: '', overnight: '' },
      travel: { oneHour: '', twoHours: '', overnight: '' }
    },
    photos: [],
    galleryMedia: [],
    comparisonMedia: [],
    voiceNoteUrl: '',
    voiceNoteFile: null,
    status: 'ACTIVE',
    price: '',
  });

  const steps = [
    { number: 1, title: 'Informações Básicas' },
    { number: 2, title: 'Detalhes Físicos' },
    { number: 3, title: 'Serviços' },
    { number: 4, title: 'Preços (Opcional)' },
    { number: 5, title: 'Fotos' }
  ];

  useEffect(() => {
    if (id !== 'new') {
      fetchListing();
    } else {
      setLoading(false);
    }
  }, [id]);

  const fetchListing = async () => {
    try {
      const response = await fetch(`/api/admin/listings/${id}`);
      if (!response.ok) throw new Error('Failed to fetch listing');
      const data = await response.json();
      setListingData(data);
      
      // Pre-populate form with existing data
      const profile = data.user?.profile;
      const listing = data;
      
      setFormData({
        name: profile?.name || listing.title || '',
        age: String(profile?.age || listing.age || ''),
        city: profile?.city || listing.city || '',
        neighborhood: profile?.neighborhood || '',
        phone: profile?.phone || listing.phone || '',
        description: profile?.description || listing.description || '',
        whatsappEnabled: profile?.whatsappEnabled || false,
        telegramEnabled: profile?.telegramEnabled || false,
        onlyfans: profile?.onlyfans || '',
        privacy: profile?.privacy || '',
        instagram: profile?.instagram || '',
        twitter: profile?.twitter || '',
        tiktok: profile?.tiktok || '',
        snapchat: profile?.snapchat || '',
        telegramChannel: profile?.telegramChannel || '',
        whatsappBusiness: profile?.whatsappBusiness || '',
        manyvids: profile?.manyvids || '',
        chaturbate: profile?.chaturbate || '',
        myfreecams: profile?.myfreecams || '',
        livejasmin: profile?.livejasmin || '',
        linkHubUrl: profile?.linkHubUrl || '',
        gender: profile?.gender || '',
        preference: profile?.preference || '',
        weight: profile?.weight || '',
        height: profile?.height || '',
        ethnicity: profile?.ethnicity || '',
        eyeColor: profile?.eyeColor || '',
        shoeSize: profile?.shoeSize || '',
        tattoos: profile?.tattoos || '',
        piercings: profile?.piercings || '',
        smoker: profile?.smoker || '',
        languages: profile?.languages ? (
          typeof profile.languages === 'string' 
            ? (profile.languages.startsWith('[') ? JSON.parse(profile.languages) : profile.languages.split(',').map(l => l.trim()))
            : profile.languages
        ) : [],
        bodyType: profile?.bodyType || '',
        hairColor: profile?.hairColor || '',
        breastSize: profile?.breastSize || '',
        breastType: profile?.breastType || '',
        services: listing.services ? (
          typeof listing.services === 'string' 
            ? (listing.services.startsWith('[') ? JSON.parse(listing.services) : listing.services.split(',').map(s => s.trim()))
            : listing.services
        ) : [],
        minDuration: listing.minDuration || '',
        advanceNotice: listing.advanceNotice || '',
        acceptsCard: listing.acceptsCard ? 'Sim' : 'Não',
        regularDiscount: listing.regularDiscount || '',
        showPricing: false,
        pricing: {
          local: { oneHour: '', twoHours: '', overnight: '' },
          travel: { oneHour: '', twoHours: '', overnight: '' }
        },
        photos: [],
        galleryMedia: [],
        comparisonMedia: [],
        voiceNoteUrl: profile?.voiceNoteUrl || '',
        status: listing.status || 'ACTIVE',
        price: String(listing.price || ''),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep !== steps.length) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const formDataToSend = new FormData();
      
      // Add all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'photos' || key === 'galleryMedia' || key === 'comparisonMedia') {
          (value as File[]).forEach((file) => {
            formDataToSend.append(key, file);
          });
        } else if (key === 'voiceNoteFile') {
          if (value) {
            formDataToSend.append('voiceNoteFile', value as File);
          }
        } else if (key === 'pricing') {
          formDataToSend.append('pricing', JSON.stringify(value));
        } else if (key === 'services') {
          formDataToSend.append('services', JSON.stringify(value));
        } else if (key === 'languages') {
          formDataToSend.append('languages', JSON.stringify(value));
        } else if (typeof value === 'boolean') {
          formDataToSend.append(key, value.toString());
        } else if (value !== null && value !== undefined) {
          formDataToSend.append(key, value as string);
        }
      });

      formDataToSend.append('listingId', id);

      const response = await fetch(`/api/admin/listings/${id}/update-full`, {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update listing');
      }
      
      router.push('/admin/listings');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update listing');
      setSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (loading) return (
    <div className="p-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );

  if (error && !listingData) return (
    <div className="p-8 text-red-600">Error: {error}</div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Edit Listing</h1>
          <Link
            href="/admin/listings"
            className="text-gray-600 hover:text-gray-800"
          >
            Back to Listings
          </Link>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step.number
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {step.number}
                  </div>
                  <span className="mt-2 text-xs text-center text-gray-600 max-w-[100px]">
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step.number ? 'bg-red-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
                </div>
              )}

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-6">Informações Básicas</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                  <label className="block text-sm font-medium text-gray-700">Idade *</label>
                <input
                    type="number"
                    min="18"
                    max="99"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  required
                />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Cidade *</label>
                  <select
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    required
                  >
                    <option value="">Selecione uma cidade</option>
                    <option value="Lisboa">Lisboa</option>
                    <option value="Porto">Porto</option>
                    <option value="Braga">Braga</option>
                    <option value="Coimbra">Coimbra</option>
                    <option value="Faro">Faro</option>
                    <option value="Aveiro">Aveiro</option>
                    <option value="Leiria">Leiria</option>
                    <option value="Setúbal">Setúbal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Bairro *</label>
                <input
                  type="text"
                  value={formData.neighborhood}
                  onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  placeholder="Ex: Bairro Alto, Cedofeita"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Telefone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Descrição *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={6}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.whatsappEnabled}
                    onChange={(e) => handleInputChange('whatsappEnabled', e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">WhatsApp Habilitado</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.telegramEnabled}
                    onChange={(e) => handleInputChange('telegramEnabled', e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Telegram Habilitado</span>
                </label>
              </div>

              {/* Social Media Links */}
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium text-gray-900">Redes Sociais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Instagram</label>
                    <input
                      type="url"
                      value={formData.instagram}
                      onChange={(e) => handleInputChange('instagram', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Twitter</label>
                    <input
                      type="url"
                      value={formData.twitter}
                      onChange={(e) => handleInputChange('twitter', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="https://twitter.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">OnlyFans</label>
                    <input
                      type="url"
                      value={formData.onlyfans}
                      onChange={(e) => handleInputChange('onlyfans', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="https://onlyfans.com/..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">TikTok</label>
                    <input
                      type="url"
                      value={formData.tiktok}
                      onChange={(e) => handleInputChange('tiktok', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="https://tiktok.com/..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Physical Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-6">Detalhes Físicos</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Género</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    <option value="">Selecione</option>
                    <option value="Feminino">Feminino</option>
                    <option value="Masculino">Masculino</option>
                    <option value="Trans">Trans</option>
                  </select>
                </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700">Preferência</label>
                  <select
                    value={formData.preference}
                    onChange={(e) => handleInputChange('preference', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    <option value="">Selecione</option>
                    <option value="Heterossexual">Heterossexual</option>
                    <option value="Homossexual">Homossexual</option>
                    <option value="Bissexual">Bissexual</option>
                </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Altura (cm)</label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="165"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Peso (kg)</label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Etnia</label>
                  <select
                    value={formData.ethnicity}
                    onChange={(e) => handleInputChange('ethnicity', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    <option value="">Selecione</option>
                    <option value="Latina">Latina</option>
                    <option value="Caucasiana">Caucasiana</option>
                    <option value="Africana">Africana</option>
                    <option value="Asiática">Asiática</option>
                    <option value="Mista">Mista</option>
                  </select>
                </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700">Cor dos Olhos</label>
                  <select
                    value={formData.eyeColor}
                    onChange={(e) => handleInputChange('eyeColor', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    <option value="">Selecione</option>
                    <option value="Castanhos">Castanhos</option>
                    <option value="Azuis">Azuis</option>
                    <option value="Verdes">Verdes</option>
                    <option value="Cinzentos">Cinzentos</option>
                </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cor do Cabelo</label>
                  <select
                    value={formData.hairColor}
                    onChange={(e) => handleInputChange('hairColor', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    <option value="">Selecione</option>
                    <option value="Preto">Preto</option>
                    <option value="Castanho">Castanho</option>
                    <option value="Loiro">Loiro</option>
                    <option value="Ruivo">Ruivo</option>
                    <option value="Grisalho">Grisalho</option>
                    <option value="Colorido">Colorido</option>
                    <option value="Moreno">Moreno</option>
                    <option value="Claro">Claro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de Corpo</label>
                  <select
                    value={formData.bodyType}
                    onChange={(e) => handleInputChange('bodyType', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    <option value="">Selecione</option>
                    <option value="Magra">Magra</option>
                    <option value="Normal">Normal</option>
                    <option value="Atlética">Atlética</option>
                    <option value="Curvilínea">Curvilínea</option>
                    <option value="Plus Size">Plus Size</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tamanho de Peito</label>
                  <select
                    value={formData.breastSize}
                    onChange={(e) => handleInputChange('breastSize', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    <option value="">Selecione</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                    <option value="G">G</option>
                  </select>
            </div>
          </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tatuagens</label>
                  <select
                    value={formData.tattoos}
                    onChange={(e) => handleInputChange('tattoos', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    <option value="">Selecione</option>
                    <option value="Nenhuma">Nenhuma</option>
                    <option value="1-3">1-3 tatuagens</option>
                    <option value="4-7">4-7 tatuagens</option>
                    <option value="8-15">8-15 tatuagens</option>
                    <option value="16+">16+ tatuagens</option>
                    <option value="Coberta">Coberta de tatuagens</option>
                  </select>
                </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700">Fumador/a</label>
                  <select
                    value={formData.smoker}
                    onChange={(e) => handleInputChange('smoker', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    <option value="">Selecione</option>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Idiomas</label>
                <div className="mt-1 p-3 border border-gray-300 rounded-md bg-white">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['Português', 'Inglês', 'Espanhol', 'Francês', 'Alemão', 'Italiano', 'Russo', 'Chinês', 'Japonês', 'Árabe'].map((lang) => (
                      <label key={lang} className="flex items-center text-sm">
                        <input
                          type="checkbox"
                          checked={formData.languages.includes(lang)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              handleInputChange('languages', [...formData.languages, lang]);
                            } else {
                              handleInputChange('languages', formData.languages.filter(l => l !== lang));
                            }
                          }}
                          className="rounded border-gray-300 text-red-600 focus:ring-red-500 mr-2"
                        />
                        {lang}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Services */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-6">Serviços</h2>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Serviços Oferecidos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'Acompanhante social',
                    'Massagem relaxante',
                    'Jantar romântico',
                    'Eventos sociais',
                    'Massagem terapêutica',
                    'Acompanhante VIP',
                    'Serviços especiais',
                    'Outcall (Deslocações)',
                    'Incall (Meu local)',
                    'Dupla',
                    'Beijo grego',
                    'Chuva dourada',
                    'Ejaculação no corpo',
                    'Fetiches',
                    'Inversão',
                    'Massagem tântrica',
                    'Namoradinha',
                    'Oral sem camisinha',
                    'Sadomasoquismo',
                    'Sexo oral',
                    'Videochamada',
                    'Beijos na boca',
                    'Dupla penetração',
                    'Fantasia e disfarces',
                    'Gozo facial',
                    'Massagem erótica',
                    'Masturbação',
                    'Oral até o final',
                    'Rapidinha',
                    'Sexo anal',
                    'Striptease',
                    'Video e foto'
                  ].map((service) => (
                    <label key={service} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                        checked={formData.services.includes(service)}
                    onChange={() => handleServiceToggle(service)}
                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{service}</span>
                </label>
              ))}
            </div>
          </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Duração mínima</label>
                  <select
                    value={formData.minDuration}
                    onChange={(e) => handleInputChange('minDuration', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    <option value="">Selecione</option>
                    <option value="15 minutos">15 minutos</option>
                    <option value="30 minutos">30 minutos</option>
                    <option value="1 hora">1 hora</option>
                    <option value="2 horas">2 horas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Aviso prévio</label>
                  <select
                    value={formData.advanceNotice}
                    onChange={(e) => handleInputChange('advanceNotice', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    <option value="">Selecione</option>
                    <option value="15 minutos">15 minutos</option>
                    <option value="30 minutos">30 minutos</option>
                    <option value="45 minutos">45 minutos</option>
                    <option value="60 minutos">60 minutos</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Aceita cartão</label>
                  <select
                    value={formData.acceptsCard}
                    onChange={(e) => handleInputChange('acceptsCard', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    <option value="">Selecione</option>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
          </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700">Desconto para regulares (opcional)</label>
                  <select
                    value={formData.regularDiscount}
                    onChange={(e) => handleInputChange('regularDiscount', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                  >
                    <option value="">Selecione</option>
                    <option value="5%">5%</option>
                    <option value="10%">10%</option>
                    <option value="15%">15%</option>
                    <option value="20%">20%</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nota de Voz (Opcional)
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Adicione uma gravação de voz para que os clientes possam ouvir você. Isso ajuda a criar mais confiança.
                </p>
                <div className="flex items-center gap-4">
                  <input
                    type="url"
                    value={formData.voiceNoteUrl}
                    onChange={(e) => handleInputChange('voiceNoteUrl', e.target.value)}
                    className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                    placeholder="URL do arquivo de áudio (ou faça upload abaixo)"
                  />
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        // Save the file to upload to server
                        setFormData(prev => ({ ...prev, voiceNoteFile: file }));
                        // Create a preview URL for display
                        const url = URL.createObjectURL(file);
                        handleInputChange('voiceNoteUrl', url);
                      }
                    }}
                    className="text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                  />
                </div>
                {formData.voiceNoteUrl && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-700">
                      <i className="fas fa-check-circle mr-2"></i>
                      Nota de voz configurada
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Pricing */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-6">Preços (Opcional)</h2>
              
              <div className="flex items-center space-x-3 mb-6">
                <input
                  type="checkbox"
                  checked={formData.showPricing}
                  onChange={(e) => handleInputChange('showPricing', e.target.checked)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label className="text-lg font-medium text-gray-900">
                  Mostrar preços no perfil
                </label>
              </div>

              {formData.showPricing && (
                <>
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Preços Locais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">1 Hora</label>
                        <input
                          type="number"
                          value={formData.pricing.local.oneHour}
                          onChange={(e) => handleInputChange('pricing', {
                            ...formData.pricing,
                            local: { ...formData.pricing.local, oneHour: e.target.value }
                          })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                          placeholder="€"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">2 Horas</label>
                        <input
                          type="number"
                          value={formData.pricing.local.twoHours}
                          onChange={(e) => handleInputChange('pricing', {
                            ...formData.pricing,
                            local: { ...formData.pricing.local, twoHours: e.target.value }
                          })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                          placeholder="€"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Noite Inteira</label>
                        <input
                          type="number"
                          value={formData.pricing.local.overnight}
                          onChange={(e) => handleInputChange('pricing', {
                            ...formData.pricing,
                            local: { ...formData.pricing.local, overnight: e.target.value }
                          })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                          placeholder="€"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Preços para Deslocações</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">1 Hora</label>
                        <input
                          type="number"
                          value={formData.pricing.travel.oneHour}
                          onChange={(e) => handleInputChange('pricing', {
                            ...formData.pricing,
                            travel: { ...formData.pricing.travel, oneHour: e.target.value }
                          })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                          placeholder="€"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">2 Horas</label>
                        <input
                          type="number"
                          value={formData.pricing.travel.twoHours}
                          onChange={(e) => handleInputChange('pricing', {
                            ...formData.pricing,
                            travel: { ...formData.pricing.travel, twoHours: e.target.value }
                          })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                          placeholder="€"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Noite Inteira</label>
                        <input
                          type="number"
                          value={formData.pricing.travel.overnight}
                          onChange={(e) => handleInputChange('pricing', {
                            ...formData.pricing,
                            travel: { ...formData.pricing.travel, overnight: e.target.value }
                          })}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                          placeholder="€"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="border-t pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Preço Base (€/hora)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                      placeholder="€"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                >
                  {STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              </div>
              </div>
            </div>
          )}

          {/* Step 5: Photos */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-6">Fotos</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fotos Principais</label>
                <p className="text-xs text-gray-500 mb-3">
                  Fotos existentes serão mantidas. Adicione novas fotos para substituir ou adicionar.
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    handleInputChange('photos', files);
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                />
                {formData.photos.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    {formData.photos.length} foto(s) selecionada(s)
                  </p>
                )}
          </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Galeria</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    handleInputChange('galleryMedia', files);
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                />
                {formData.galleryMedia.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    {formData.galleryMedia.length} foto(s) selecionada(s)
                  </p>
                )}
          </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vídeos de Comparação</label>
                <input
                  type="file"
                  multiple
                  accept="video/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    handleInputChange('comparisonMedia', files);
                  }}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                />
                {formData.comparisonMedia.length > 0 && (
                  <p className="mt-2 text-sm text-gray-600">
                    {formData.comparisonMedia.length} vídeo(s) selecionado(s)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            {currentStep < steps.length ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Próximo
              </button>
            ) : (
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
} 

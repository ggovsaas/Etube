'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormData {
  // Basic Info
  name: string;
  age: string;
  city: string;
  neighborhood: string; // NEW: Bairro
  phone: string;
  description: string;
  whatsappEnabled: boolean; // NEW: WhatsApp toggle
  telegramEnabled: boolean; // NEW: Telegram toggle
  
  // Social Media Links (Individual Platforms)
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
  // Linktree, Bio.link, Beacons, etc. will be auto-detected from this field
  linkHubUrl: string; // Generic field for Linktree, Bio.link, Beacons, etc.
  
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
  
  // NEW: Additional Physical Attributes
  bodyType: string;
  hairColor: string;
  breastSize: string;
  breastType: string;
  
  // NEW: Personality Tags
  personalityTags: string[];
  
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
}

export default function CriarAnuncioPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [manualSubmitClicked, setManualSubmitClicked] = useState(false);
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
    personalityTags: [],
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
    comparisonMedia: []
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();

  // Smart link detection function
  const detectPlatform = (url: string) => {
    if (!url) return '';
    
    try {
      const domain = new URL(url).hostname.toLowerCase();
      
      const platforms: Record<string, string> = {
        'linktr.ee': 'Linktree',
        'bio.link': 'Bio.link',
        'beacons.ai': 'Beacons',
        'carrd.co': 'Carrd',
        'linkr.com.br': 'Linkr',
        'meu.link': 'Meu.link',
        'lnk.bio': 'Lnk.bio',
        'linkfy.com.br': 'Linkfy',
        'milkshake.app': 'Milkshake',
        'tap.bio': 'Tap.bio'
      };
      
      return platforms[domain] || 'Link Hub';
    } catch {
      return 'Link Hub';
    }
  };

  // Load saved form data from localStorage on component mount
  useEffect(() => {
    // Load saved data from localStorage
    const savedData = localStorage.getItem('criarAnuncioFormData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsedData }));
      } catch (error) {
        console.error('Error loading saved form data:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Handle clicking outside emoji picker to close it
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.emoji-picker-container')) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('criarAnuncioFormData', JSON.stringify(formData));
  }, [formData]);

  // Check if there's saved data and show notification
  useEffect(() => {
    const savedFormData = localStorage.getItem('criarAnuncioFormData');
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData);
        if (parsed.name || parsed.description) {
          // Show a subtle notification that data was restored
          console.log('Form data restored from previous session');
        }
      } catch (error) {
        console.error('Error checking saved form data:', error);
      }
    }
  }, []);

  // Monitor step changes to prevent automatic form submission
  useEffect(() => {
    console.log('Step changed to:', currentStep);
    setManualSubmitClicked(false); // Reset manual submit flag on step change
    if (currentStep === 5) {
      console.log('Step 5 reached - preventing any automatic form submission');
      // Disable form submission until user explicitly clicks submit
      if (formRef.current) {
        formRef.current.addEventListener('submit', (e) => {
          if (!e.isTrusted) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Automatic form submission blocked');
          }
        }, { capture: true });
      }
    }
  }, [currentStep]);

  const steps = [
    { number: 1, title: 'Informações Básicas' },
    { number: 2, title: 'Detalhes Físicos' },
    { number: 3, title: 'Serviços' },
    { number: 4, title: 'Preços (Opcional)' },
    { number: 5, title: 'Fotos' }
  ];

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const insertEmoji = (emoji: string) => {
    const textarea = document.getElementById('description-textarea') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const text = formData.description;
    const before = text.substring(0, start);
    const after = text.substring(start);
    const newText = before + emoji + after;
    handleInputChange('description', newText);
    
    // Set focus back to textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
    
    setShowEmojiPicker(false);
  };

  const handlePricingChange = (type: 'local' | 'travel', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        [type]: {
          ...prev.pricing[type],
          [field]: value
        }
      }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData(prev => ({
        ...prev,
        photos: Array.from(e.target.files || [])
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newFiles].slice(0, 10) // Keep max 10 files
      }));
    }
  };

  const moveToGallery = (index: number) => {
    const file = formData.photos[index];
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
      galleryMedia: [...prev.galleryMedia, file]
    }));
  };

  const moveToComparison = (index: number) => {
    const file = formData.photos[index];
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
      comparisonMedia: [...prev.comparisonMedia, file]
    }));
  };

  const moveFromGallery = (index: number) => {
    const file = formData.galleryMedia[index];
    setFormData(prev => ({
      ...prev,
      galleryMedia: prev.galleryMedia.filter((_, i) => i !== index),
      photos: [...prev.photos, file]
    }));
  };

  const moveFromComparison = (index: number) => {
    const file = formData.comparisonMedia[index];
    setFormData(prev => ({
      ...prev,
      comparisonMedia: prev.comparisonMedia.filter((_, i) => i !== index),
      photos: [...prev.photos, file]
    }));
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

  const handleFileUploadClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // The actual file selection is handled by the onChange event on the input
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Form submission triggered manually');
    console.log('Current step:', currentStep, 'Total steps:', steps.length);
    console.log('Manual submit clicked:', manualSubmitClicked);
    
    // Only proceed if we're on the last step and user clicked the submit button
    if (currentStep !== steps.length) {
      console.log('Form submission blocked - not on last step');
      return;
    }
    
    // Only proceed if manual submit was clicked
    if (!manualSubmitClicked) {
      console.log('Form submission blocked - manual submit not clicked');
      return;
    }
    
    // Additional check to ensure this is a manual submission
    if (!e.isTrusted) {
      console.log('Form submission blocked - not a trusted event');
      return;
    }
    
    console.log('Proceeding with form submission...');
    setLoading(true);
    setError('');

    try {
      // Check if user is authenticated by trying to get their profile
      const authCheck = await fetch('/api/user/profile');
      
      if (!authCheck.ok) {
        // User is not authenticated, show auth modal
        setShowAuthModal(true);
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      
      // Add all form data
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'photos') {
          (value as File[]).forEach((file) => {
            formDataToSend.append('photos', file);
          });
        } else if (key === 'galleryMedia') {
          (value as File[]).forEach((file) => {
            formDataToSend.append('galleryMedia', file);
          });
        } else if (key === 'comparisonMedia') {
          (value as File[]).forEach((file) => {
            formDataToSend.append('comparisonMedia', file);
          });
        } else if (key === 'pricing') {
          formDataToSend.append('pricing', JSON.stringify(value));
        } else if (key === 'services') {
          formDataToSend.append('services', JSON.stringify(value));
        } else if (key === 'personalityTags') {
          formDataToSend.append('personalityTags', JSON.stringify(value));
        } else {
          formDataToSend.append(key, value as string);
        }
      });

      console.log('Sending form data to API...');
      const response = await fetch('/api/listings/create', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create listing');
      }

      console.log('Listing created successfully');
      // Clear saved form data after successful submission
      localStorage.removeItem('criarAnuncioFormData');
      router.push('/dashboard');

    } catch (error) {
      console.error('Error creating listing:', error);
      setError(error instanceof Error ? error.message : 'Failed to create listing');
    } finally {
      setLoading(false);
      setManualSubmitClicked(false); // Reset the flag
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                placeholder="Seu nome"
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  placeholder="25"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Cidade *</label>
                <select
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
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
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                placeholder="Ex: Bairro Alto, Cedofeita"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Telefone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                placeholder="+351 912 345 678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Descrição *</label>
              
              {/* Rich Text Toolbar */}
              <div className="flex items-center space-x-2 mb-2 p-2 bg-gray-50 rounded-t-lg border border-gray-300">
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('description-textarea') as HTMLTextAreaElement;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const text = formData.description;
                    const before = text.substring(0, start);
                    const selected = text.substring(start, end);
                    const after = text.substring(end);
                    const newText = before + '**' + selected + '**' + after;
                    handleInputChange('description', newText);
                    // Set focus back to textarea
                    setTimeout(() => {
                      textarea.focus();
                      textarea.setSelectionRange(start + 2, end + 2);
                    }, 0);
                  }}
                  className="px-3 py-1 text-sm font-bold bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                  title="Bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('description-textarea') as HTMLTextAreaElement;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const text = formData.description;
                    const before = text.substring(0, start);
                    const selected = text.substring(start, end);
                    const after = text.substring(end);
                    const newText = before + '*' + selected + '*' + after;
                    handleInputChange('description', newText);
                    // Set focus back to textarea
                    setTimeout(() => {
                      textarea.focus();
                      textarea.setSelectionRange(start + 1, end + 1);
                    }, 0);
                  }}
                  className="px-3 py-1 text-sm italic bg-green-500 hover:bg-green-600 text-white rounded transition-colors"
                  title="Italic"
                >
                  I
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const textarea = document.getElementById('description-textarea') as HTMLTextAreaElement;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;
                    const text = formData.description;
                    const before = text.substring(0, start);
                    const selected = text.substring(start, end);
                    const after = text.substring(end);
                    const newText = before + '_' + selected + '_' + after;
                    handleInputChange('description', newText);
                    // Set focus back to textarea
                    setTimeout(() => {
                      textarea.focus();
                      textarea.setSelectionRange(start + 1, end + 1);
                    }, 0);
                  }}
                  className="px-3 py-1 text-sm underline bg-purple-500 hover:bg-purple-600 text-white rounded transition-colors"
                  title="Underline"
                >
                  U
                </button>
                <span className="text-gray-400">|</span>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors"
                    title="Add Emoji"
                  >
                    😊
                  </button>
                  
                  {/* Emoji Picker Dropdown */}
                  {showEmojiPicker && (
                    <div className="emoji-picker-container absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-3 min-w-[280px]">
                      <div className="text-sm text-gray-600 mb-2">Escolha um emoji:</div>
                      <div className="grid grid-cols-8 gap-2 mb-3">
                        {['😊', '💕', '🔥', '✨', '💋', '👄', '💦', '🍑', '💯', '⭐', '💎', '🌹', '💖', '😍', '🥵', '🥺', '😘', '😉', '😋', '😎', '🤗', '🤩', '😇', '😌'].map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => insertEmoji(emoji)}
                            className="w-8 h-8 text-lg hover:bg-gray-100 rounded transition-colors flex items-center justify-center"
                            title={emoji}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">Ou digite um emoji personalizado:</div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Digite um emoji..."
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-yellow-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target as HTMLInputElement;
                              if (input.value.trim()) {
                                insertEmoji(input.value.trim());
                                input.value = '';
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.querySelector('input[placeholder="Digite um emoji..."]') as HTMLInputElement;
                            if (input && input.value.trim()) {
                              insertEmoji(input.value.trim());
                              input.value = '';
                            }
                          }}
                          className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors"
                        >
                          OK
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <textarea
                id="description-textarea"
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="mt-0 block w-full px-3 py-2 border border-gray-300 rounded-b-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                placeholder="Conte um pouco sobre você, sua personalidade, experiência... Use **texto** para negrito, *texto* para itálico, _texto_ para sublinhado"
              />
              
              {/* Preview */}
              {formData.description && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                  <p className="text-gray-600 mb-1">Prévia:</p>
                  <div className="text-gray-900">
                    {formData.description
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/_(.*?)_/g, '<u>$1</u>')
                      .split('\n').map((line, i) => (
                        <p key={i} dangerouslySetInnerHTML={{ __html: line }} />
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.whatsappEnabled}
                onChange={(e) => handleInputChange('whatsappEnabled', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">
                Permitir contato via WhatsApp
              </label>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.telegramEnabled}
                onChange={(e) => handleInputChange('telegramEnabled', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="text-sm text-gray-700">
                Permitir contato via Telegram
              </label>
            </div>

            {/* Social Media Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Linktree/Bio.link</label>
                <input
                  type="url"
                  value={formData.linkHubUrl}
                  onChange={(e) => handleInputChange('linkHubUrl', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  placeholder="https://linktr.ee/seu_nome"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {detectPlatform(formData.linkHubUrl)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">OnlyFans</label>
                <input
                  type="url"
                  value={formData.onlyfans}
                  onChange={(e) => handleInputChange('onlyfans', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  placeholder="https://onlyfans.com/seu_nome"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {detectPlatform(formData.onlyfans)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Instagram</label>
                <input
                  type="url"
                  value={formData.instagram}
                  onChange={(e) => handleInputChange('instagram', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  placeholder="https://instagram.com/seu_nome"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {detectPlatform(formData.instagram)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Twitter</label>
                <input
                  type="url"
                  value={formData.twitter}
                  onChange={(e) => handleInputChange('twitter', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  placeholder="https://twitter.com/seu_nome"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {detectPlatform(formData.twitter)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">TikTok</label>
                <input
                  type="url"
                  value={formData.tiktok}
                  onChange={(e) => handleInputChange('tiktok', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  placeholder="https://tiktok.com/@seu_nome"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {detectPlatform(formData.tiktok)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Snapchat</label>
                <input
                  type="url"
                  value={formData.snapchat}
                  onChange={(e) => handleInputChange('snapchat', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  placeholder="https://snapchat.com/add/seu_nome"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {detectPlatform(formData.snapchat)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Telegram Channel</label>
                <input
                  type="url"
                  value={formData.telegramChannel}
                  onChange={(e) => handleInputChange('telegramChannel', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  placeholder="https://t.me/seu_nome"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {detectPlatform(formData.telegramChannel)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">WhatsApp Business</label>
                <input
                  type="url"
                  value={formData.whatsappBusiness}
                  onChange={(e) => handleInputChange('whatsappBusiness', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  placeholder="https://wa.me/seu_numero"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {detectPlatform(formData.whatsappBusiness)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">ManyVids</label>
                <input
                  type="url"
                  value={formData.manyvids}
                  onChange={(e) => handleInputChange('manyvids', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  placeholder="https://manyvids.com/seu_nome"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {detectPlatform(formData.manyvids)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Chaturbate</label>
                <input
                  type="url"
                  value={formData.chaturbate}
                  onChange={(e) => handleInputChange('chaturbate', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  placeholder="https://chaturbate.com/seu_nome"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {detectPlatform(formData.chaturbate)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">MyFreeCams</label>
                <input
                  type="url"
                  value={formData.myfreecams}
                  onChange={(e) => handleInputChange('myfreecams', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  placeholder="https://myfreecams.com/seu_nome"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {detectPlatform(formData.myfreecams)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">LiveJasmin</label>
                <input
                  type="url"
                  value={formData.livejasmin}
                  onChange={(e) => handleInputChange('livejasmin', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  placeholder="https://livejasmin.com/seu_nome"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {detectPlatform(formData.livejasmin)}
                </p>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Gênero</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleInputChange('gender', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                >
                  <option value="">Selecione</option>
                  <option value="Heterossexual">Heterossexual</option>
                  <option value="Homossexual">Homossexual</option>
                  <option value="Bissexual">Bissexual</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Peso (kg)</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  placeholder={formData.gender === 'Masculino' ? '75' : formData.gender === 'Feminino' ? '55' : '65'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Altura (m)</label>
                <input
                  type="text"
                  value={formData.height}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  placeholder={formData.gender === 'Masculino' ? '1.75' : formData.gender === 'Feminino' ? '1.68' : '1.70'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Etnia</label>
                <select
                  value={formData.ethnicity}
                  onChange={(e) => handleInputChange('ethnicity', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                >
                  <option value="">Selecione</option>
                  <option value="Castanhos">Castanhos</option>
                  <option value="Azuis">Azuis</option>
                  <option value="Verdes">Verdes</option>
                  <option value="Cinzentos">Cinzentos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Cor do Cabelo</label>
                <select
                  value={formData.hairColor}
                  onChange={(e) => handleInputChange('hairColor', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Calçado</label>
                <input
                  type="number"
                  value={formData.shoeSize}
                  onChange={(e) => handleInputChange('shoeSize', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  placeholder={formData.gender === 'Masculino' ? '42' : formData.gender === 'Feminino' ? '37' : '39'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Piercings</label>
                <input
                  type="text"
                  value={formData.piercings}
                  onChange={(e) => handleInputChange('piercings', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                  placeholder={formData.gender === 'Masculino' ? 'Orelha, nariz' : formData.gender === 'Feminino' ? 'Orelhas, umbigo' : 'Orelhas'}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tatuagens</label>
                <select
                  value={formData.tattoos}
                  onChange={(e) => handleInputChange('tattoos', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
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
                <label className="block text-sm font-medium text-gray-700">
                  {formData.gender === 'Masculino' ? 'Fumador' : formData.gender === 'Feminino' ? 'Fumadora' : 'Fumador/a'}
                </label>
                <select
                  value={formData.smoker}
                  onChange={(e) => handleInputChange('smoker', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                >
                  <option value="">Selecione</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>
            </div>

            {/* Languages - Multi-select dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Idiomas</label>
              <div className="mt-1 p-3 border border-gray-300 rounded-md bg-white">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {['Português', 'Inglês', 'Espanhol', 'Francês', 'Alemão', 'Italiano', 'Russo', 'Chinês', 'Japonês', 'Árabe'].map((lang) => (
                    <label key={lang} className="flex items-center text-sm text-gray-900">
                      <input
                        type="checkbox"
                        checked={formData.languages.includes(lang)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              languages: [...prev.languages, lang]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              languages: prev.languages.filter(l => l !== lang)
                            }));
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mr-2"
                      />
                      {lang}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Personality Tags - Improved */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Tags de Personalidade</label>
              <div className="mt-1">
                <input
                  type="text"
                  placeholder="Digite uma tag e pressione Enter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      const tag = input.value.trim();
                      if (tag && !formData.personalityTags.includes(tag)) {
                        setFormData(prev => ({
                          ...prev,
                          personalityTags: [...prev.personalityTags, tag]
                        }));
                        input.value = '';
                      }
                    }
                  }}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                />
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {formData.personalityTags.map((tag, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                      {tag}
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          personalityTags: prev.personalityTags.filter((_, i) => i !== index)
                        }))}
                        className="ml-1 text-blue-800 hover:text-blue-900 text-xs font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Physical Attributes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Corpo</label>
                <select
                  value={formData.bodyType}
                  onChange={(e) => handleInputChange('bodyType', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Tipo de Peito</label>
                <select
                  value={formData.breastType}
                  onChange={(e) => handleInputChange('breastType', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                >
                  <option value="">Selecione</option>
                  <option value="Natural">Natural</option>
                  <option value="Silicone">Silicone</option>
                  <option value="Misto">Misto</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Serviços Oferecidos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  // Basic Services
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
                  
                  // Enhanced Services (like competitor)
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
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                >
                  <option value="">Selecione</option>
                  <option value="1 hora">1 hora</option>
                  <option value="2 horas">2 horas</option>
                  <option value="1 dia">1 dia</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Aceita cartão</label>
                <select
                  value={formData.acceptsCard}
                  onChange={(e) => handleInputChange('acceptsCard', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                >
                  <option value="">Selecione</option>
                  <option value="Sim">Sim</option>
                  <option value="Não">Não</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Desconto para regulares</label>
                <select
                  value={formData.regularDiscount}
                  onChange={(e) => handleInputChange('regularDiscount', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                >
                  <option value="">Selecione</option>
                  <option value="5%">5%</option>
                  <option value="10%">10%</option>
                  <option value="15%">15%</option>
                  <option value="20%">20%</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.showPricing}
                onChange={(e) => handleInputChange('showPricing', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="text-lg font-medium text-gray-900">
                Mostrar preços no perfil
              </label>
            </div>

            {formData.showPricing ? (
              <div className="space-y-8">
                {/* Minimum Duration Pricing */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Tarifas - Duração Mínima</h3>
                  <div className="space-y-4">
                    {formData.minDuration === '15 minutos' && (
                      <div className="flex items-center space-x-4">
                        <span className="w-20 text-sm font-medium text-gray-700">15 min:</span>
                        <input
                          type="number"
                          value={formData.pricing.local.fifteenMin || ''}
                          onChange={(e) => handlePricingChange('local', 'fifteenMin', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                          placeholder="80"
                        />
                        <span className="text-sm text-gray-500">€</span>
                      </div>
                    )}
                    {formData.minDuration === '30 minutos' && (
                      <div className="flex items-center space-x-4">
                        <span className="w-20 text-sm font-medium text-gray-700">30 min:</span>
                        <input
                          type="number"
                          value={formData.pricing.local.thirtyMin || ''}
                          onChange={(e) => handlePricingChange('local', 'thirtyMin', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                          placeholder="120"
                        />
                        <span className="text-sm text-gray-500">€</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Tarifas - Meu Local</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <span className="w-20 text-sm font-medium text-gray-700">1 hora:</span>
                      <input
                        type="number"
                        value={formData.pricing.local.oneHour}
                        onChange={(e) => handlePricingChange('local', 'oneHour', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                        placeholder="150"
                      />
                      <span className="text-sm text-gray-500">€</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="w-20 text-sm font-medium text-gray-700">2 horas:</span>
                      <input
                        type="number"
                        value={formData.pricing.local.twoHours}
                        onChange={(e) => handlePricingChange('local', 'twoHours', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                        placeholder="280"
                      />
                      <span className="text-sm text-gray-500">€</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="w-20 text-sm font-medium text-gray-700">Pernoite:</span>
                      <input
                        type="number"
                        value={formData.pricing.local.overnight}
                        onChange={(e) => handlePricingChange('local', 'overnight', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                        placeholder="800"
                      />
                      <span className="text-sm text-gray-500">€</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Tarifas - Deslocação</h3>
                  <div className="space-y-4">
                    {/* Minimum Duration Travel Pricing */}
                    {formData.minDuration === '15 minutos' && (
                      <div className="flex items-center space-x-4">
                        <span className="w-20 text-sm font-medium text-gray-700">15 min:</span>
                        <input
                          type="number"
                          value={formData.pricing.travel.fifteenMin || ''}
                          onChange={(e) => handlePricingChange('travel', 'fifteenMin', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                          placeholder="100"
                        />
                        <span className="text-sm text-gray-500">€</span>
                      </div>
                    )}
                    {formData.minDuration === '30 minutos' && (
                      <div className="flex items-center space-x-4">
                        <span className="w-20 text-sm font-medium text-gray-700">30 min:</span>
                        <input
                          type="number"
                          value={formData.pricing.travel.thirtyMin || ''}
                          onChange={(e) => handlePricingChange('travel', 'thirtyMin', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                          placeholder="150"
                        />
                        <span className="text-sm text-gray-500">€</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-4">
                      <span className="w-20 text-sm font-medium text-gray-700">1 hora:</span>
                      <input
                        type="number"
                        value={formData.pricing.travel.oneHour}
                        onChange={(e) => handlePricingChange('travel', 'oneHour', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                        placeholder="200"
                      />
                      <span className="text-sm text-gray-500">€</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="w-20 text-sm font-medium text-gray-700">2 horas:</span>
                      <input
                        type="number"
                        value={formData.pricing.travel.twoHours}
                        onChange={(e) => handlePricingChange('travel', 'twoHours', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                        placeholder="350"
                      />
                      <span className="text-sm text-gray-500">€</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="w-20 text-sm font-medium text-gray-700">Pernoite:</span>
                      <input
                        type="number"
                        value={formData.pricing.travel.overnight}
                        onChange={(e) => handlePricingChange('travel', 'overnight', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900"
                        placeholder="1000"
                      />
                      <span className="text-sm text-gray-500">€</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  Você pode optar por não mostrar preços publicamente e discutir valores via WhatsApp ou chamada.
                </p>
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload de Mídia</h3>
              <p className="text-gray-600">
                Use os controles de upload acima para adicionar fotos e vídeos ao seu anúncio.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Criar Anúncio Grátis</h2>
            <p className="text-gray-600">Complete os passos para criar seu perfil</p>
          </div>

          {/* Progress Steps - Fixed Layout */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-2">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    currentStep >= step.number ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.number}
                  </div>
                  <span className={`ml-2 text-xs font-medium ${
                    currentStep >= step.number ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      currentStep > step.number ? 'bg-red-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* File Upload Section - Outside the form */}
          {currentStep === 5 && (
            <div className="space-y-8 mb-6">
              {/* Two Column Layout with Separate Upload Widgets */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Galeria de Mídia Upload */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-2xl">🖼️</div>
                    <div>
                      <h3 className="text-lg font-bold text-blue-900">Galeria de Mídia</h3>
                      <p className="text-sm text-blue-700">Fotos e vídeos do perfil ({formData.galleryMedia.length})</p>
                    </div>
                  </div>
                  
                  {/* Upload Widget for Gallery */}
                  <div className="bg-white border-2 border-dashed border-blue-300 rounded-lg p-6 text-center mb-4">
                    <div className="space-y-3">
                      <div className="text-2xl">📸</div>
                      <h4 className="text-sm font-medium text-blue-900">Adicionar à Galeria</h4>
                      <p className="text-xs text-blue-600">Fotos e vídeos para o perfil público</p>
                      <div className="flex justify-center">
                        <label 
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg cursor-pointer transition duration-200 text-sm"
                          onClick={handleFileUploadClick}
                        >
                          <input
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            onChange={(e) => {
                              if (e.target.files) {
                                const newFiles = Array.from(e.target.files);
                                setFormData(prev => ({
                                  ...prev,
                                  galleryMedia: [...prev.galleryMedia, ...newFiles].slice(0, 10)
                                }));
                              }
                            }}
                            className="hidden"
                          />
                          Escolher Arquivos
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Gallery Files Display */}
                  <div className="space-y-3 min-h-[200px]">
                    {formData.galleryMedia.map((file, index) => (
                      <div key={`gallery-${index}`} className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {file.type.startsWith('image/') ? (
                            <img
                              src={URL.createObjectURL(file)}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-lg">🎥</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {file.type.startsWith('image/') ? '📷 Foto' : '🎥 Vídeo'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              galleryMedia: prev.galleryMedia.filter((_, i) => i !== index)
                            }));
                          }}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                    
                    {formData.galleryMedia.length === 0 && (
                      <div className="text-center py-8 text-blue-600">
                        <div className="text-2xl mb-2">📁</div>
                        <p className="text-sm">Nenhum arquivo na galeria</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mídia de Comparação Upload */}
                <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="text-2xl">📊</div>
                    <div>
                      <h3 className="text-lg font-bold text-purple-900">Mídia de Comparação</h3>
                      <p className="text-sm text-purple-700">Vídeos para comparação ({formData.comparisonMedia.length})</p>
                    </div>
                  </div>
                  
                  {/* Upload Widget for Comparison */}
                  <div className="bg-white border-2 border-dashed border-purple-300 rounded-lg p-6 text-center mb-4">
                    <div className="space-y-3">
                      <div className="text-2xl">🎥</div>
                      <h4 className="text-sm font-medium text-purple-900">Adicionar à Comparação</h4>
                      <p className="text-xs text-purple-600">Vídeos especiais para demonstração</p>
                      <div className="flex justify-center">
                        <label 
                          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg cursor-pointer transition duration-200 text-sm"
                          onClick={handleFileUploadClick}
                        >
                          <input
                            type="file"
                            multiple
                            accept="video/*"
                            onChange={(e) => {
                              if (e.target.files) {
                                const newFiles = Array.from(e.target.files);
                                setFormData(prev => ({
                                  ...prev,
                                  comparisonMedia: [...prev.comparisonMedia, ...newFiles].slice(0, 5)
                                }));
                              }
                            }}
                            className="hidden"
                          />
                          Escolher Vídeos
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Comparison Files Display */}
                  <div className="space-y-3 min-h-[200px]">
                    {formData.comparisonMedia.map((file, index) => (
                      <div key={`comparison-${index}`} className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-lg">🎥</span>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">🎥 Vídeo de comparação</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              comparisonMedia: prev.comparisonMedia.filter((_, i) => i !== index)
                            }));
                          }}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                    
                    {formData.comparisonMedia.length === 0 && (
                      <div className="text-center py-8 text-purple-600">
                        <div className="text-2xl mb-2">📁</div>
                        <p className="text-sm">Nenhum vídeo de comparação</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Info Section */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="text-yellow-600 text-lg">ℹ️</div>
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium mb-1">Como organizar suas mídias:</p>
                    <ul className="space-y-1">
                      <li>• <strong>Galeria de Mídia:</strong> Fotos e vídeos que aparecem no seu perfil público</li>
                      <li>• <strong>Mídia de Comparação:</strong> Vídeos especiais para a seção de comparação</li>
                      <li>• <strong>Dica:</strong> Use fotos de alta qualidade na Galeria e vídeos demonstrativos na Comparação</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          <form 
            ref={formRef}
            onSubmit={handleSubmit} 
            className="space-y-6"
            onKeyDown={(e) => {
              // Prevent form submission on Enter key
              if (e.key === 'Enter' && currentStep !== steps.length) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
          >
            {renderStepContent()}

            <div className="flex items-center justify-between pt-6">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
              >
                Anterior
              </button>

              <div className="flex space-x-4">
                <Link
                  href="/dashboard"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition duration-200"
                >
                  Cancelar
                </Link>

                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
                  >
                    Próximo
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    onClick={(e) => {
                      console.log('Submit button clicked manually');
                      setManualSubmitClicked(true);
                      // Only allow submission if this is a manual click
                      if (!e.isTrusted) {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Submit blocked - not a trusted event');
                        return;
                      }
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200 disabled:opacity-50"
                  >
                    {loading ? 'Criando...' : 'Criar Anúncio'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Login Necessário
              </h3>
              <p className="text-gray-600 mb-6">
                Para publicar seu anúncio, você precisa estar logado. Suas informações foram salvas e estarão disponíveis após o login.
              </p>
              
              <div className="space-y-3">
                <Link
                  href="/login"
                  className="block w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                >
                  Fazer Login
                </Link>
                
                <Link
                  href="/criar-perfil"
                  className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200"
                >
                  Criar Conta
                </Link>
                
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="block w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition duration-200"
                >
                  Continuar Editando
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
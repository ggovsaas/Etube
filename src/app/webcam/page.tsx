'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Eye, Star, Filter, Grid, List, Search, Users, MapPin, Clock } from 'lucide-react';

interface Performer {
  id: number;
  name: string;
  age: number;
  location: string;
  viewers: number;
  category: string;
  tags: string[];
  rating: number;
  isOnline: boolean;
  thumb: string;
  lastSeen: string;
}

const WebcamDirectory = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [performers, setPerformers] = useState<Performer[]>([]);

  // Mock data for performers
  useEffect(() => {
    const mockPerformers = [
      {
        id: 1,
        name: 'Luna_Star',
        age: 24,
        location: 'Colômbia',
        viewers: 2847,
        category: 'female',
        tags: ['latina', 'dança', 'interativo'],
        rating: 4.8,
        isOnline: true,
        thumb: 'https://images.unsplash.com/photo-1494790108755-2616c4e1e8c7?w=300&h=400&fit=crop&crop=face',
        lastSeen: 'Online agora'
      },
      {
        id: 2,
        name: 'AlexFit',
        age: 28,
        location: 'Brasil',
        viewers: 1923,
        category: 'male',
        tags: ['fitness', 'musculoso', 'chat'],
        rating: 4.6,
        isOnline: true,
        thumb: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=face',
        lastSeen: 'Online agora'
      },
      {
        id: 3,
        name: 'SophieBloom',
        age: 22,
        location: 'Ucrânia',
        viewers: 3156,
        category: 'female',
        tags: ['loira', 'jovem', 'estudante'],
        rating: 4.9,
        isOnline: true,
        thumb: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=400&fit=crop&crop=face',
        lastSeen: 'Online agora'
      },
      {
        id: 4,
        name: 'CoupleHot',
        age: 26,
        location: 'Espanha',
        viewers: 4201,
        category: 'couple',
        tags: ['casal', 'interativo', 'espanhol'],
        rating: 4.7,
        isOnline: false,
        thumb: 'https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=300&h=400&fit=crop&crop=faces',
        lastSeen: '2 horas atrás'
      },
      {
        id: 5,
        name: 'MiaRose',
        age: 21,
        location: 'Romênia',
        viewers: 1687,
        category: 'female',
        tags: ['morena', 'pequena', 'tímida'],
        rating: 4.5,
        isOnline: true,
        thumb: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=400&fit=crop&crop=face',
        lastSeen: 'Online agora'
      },
      {
        id: 6,
        name: 'BigMike',
        age: 32,
        location: 'EUA',
        viewers: 856,
        category: 'male',
        tags: ['americano', 'maduro', 'daddy'],
        rating: 4.3,
        isOnline: true,
        thumb: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=400&fit=crop&crop=face',
        lastSeen: 'Online agora'
      }
    ];
    setPerformers(mockPerformers);
  }, []);

  const categories = [
    { id: 'all', name: 'Todos', count: performers.length },
    { id: 'female', name: 'Feminino', count: performers.filter(p => p.category === 'female').length },
    { id: 'male', name: 'Masculino', count: performers.filter(p => p.category === 'male').length },
    { id: 'couple', name: 'Casais', count: performers.filter(p => p.category === 'couple').length }
  ];

  const filteredPerformers = performers.filter(performer => {
    const matchesCategory = selectedCategory === 'all' || performer.category === selectedCategory;
    const matchesSearch = performer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         performer.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedPerformers = [...filteredPerformers].sort((a, b) => {
    switch (sortBy) {
      case 'popularity':
        return b.viewers - a.viewers;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.id - a.id;
      default:
        return 0;
    }
  });

  const PerformerCard = ({ performer }: { performer: Performer }) => (
    <div className="group relative bg-gray-900 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
      {/* Status indicator */}
      <div className={`absolute top-3 left-3 z-20 px-2 py-1 rounded-full text-xs font-bold ${
        performer.isOnline ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'
      }`}>
        {performer.isOnline ? 'AO VIVO' : 'OFFLINE'}
      </div>
      {/* Viewer count */}
      <div className="absolute top-3 right-3 z-20 bg-black/60 px-2 py-1 rounded-full text-xs text-white flex items-center gap-1">
        <Eye size={12} />
        {performer.viewers.toLocaleString()}
      </div>
      {/* Thumbnail */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img 
          src={performer.thumb} 
          alt={performer.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        {/* Always visible Enter Room button, centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full font-semibold shadow-lg">
            Entrar na Sala
          </button>
        </div>
      </div>
      {/* Card content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-bold text-lg truncate">{performer.name}</h3>
          <div className="flex items-center gap-1">
            <Star className="text-yellow-400 fill-current" size={16} />
            <span className="text-yellow-400 text-sm font-semibold">{performer.rating}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
          <span>{performer.age} anos</span>
          <span>•</span>
          <div className="flex items-center gap-1">
            <MapPin size={12} />
            <span>{performer.location}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {performer.tags.slice(0, 3).map(tag => (
            <span key={tag} className="bg-gray-700 text-gray-300 px-2 py-1 rounded-full text-xs">
              #{tag}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-gray-400">
            <Clock size={12} />
            <span>{performer.lastSeen}</span>
          </div>
          <button className="text-red-500 hover:text-red-400 transition-colors">
            <Heart size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      {/* Header */}
      <div className="bg-black/90 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-red-600">
              Webcams ao Vivo
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Users size={16} />
              <span>{performers.filter(p => p.isOnline).length} modelos online</span>
            </div>
          </div>
          {/* Search and filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Pesquisar performers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
              />
            </div>
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-red-600"
              >
                <option value="popularity">Mais Populares</option>
                <option value="rating">Melhor Avaliadas</option>
                <option value="newest">Mais Recentes</option>
              </select>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className="lg:w-64 space-y-6">
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                <Filter size={20} />
                Categorias
              </h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                      selectedCategory === category.id
                        ? 'bg-red-600 text-white'
                        : 'hover:bg-gray-800 text-gray-300'
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className="text-sm opacity-75">({category.count})</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Featured tags */}
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-gray-800">
              <h3 className="text-lg font-semibold mb-4 text-white">Tags Populares</h3>
              <div className="flex flex-wrap gap-2">
                {['latina', 'loira', 'jovem', 'maduro', 'casal', 'interativo', 'dança', 'chat'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSearchTerm(tag)}
                    className="bg-gray-800 hover:bg-red-600 text-gray-300 hover:text-white px-3 py-1 rounded-full text-sm transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Main content */}
          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-white">
                {selectedCategory === 'all' ? 'Todos os Performers' : `${categories.find(c => c.id === selectedCategory)?.name} Performers`}
              </h2>
              <p className="text-gray-400">
                {sortedPerformers.length} performer{sortedPerformers.length !== 1 ? 's' : ''} encontrados
              </p>
            </div>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedPerformers.map(performer => (
                  <PerformerCard key={performer.id} performer={performer} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedPerformers.map(performer => (
                  <div key={performer.id} className="bg-gray-900/80 backdrop-blur-sm rounded-xl p-4 border border-gray-800 flex items-center gap-4 hover:bg-gray-900 transition-colors">
                    <div className="relative">
                      <img 
                        src={performer.thumb} 
                        alt={performer.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${
                        performer.isOnline ? 'bg-red-600' : 'bg-gray-700'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-white">{performer.name}</h3>
                      <p className="text-gray-400 text-sm">{performer.age} anos • {performer.location}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1">
                          <Eye size={14} />
                          <span className="text-sm">{performer.viewers.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="text-yellow-400 fill-current" size={14} />
                          <span className="text-sm">{performer.rating}</span>
                        </div>
                      </div>
                    </div>
                    <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors">
                      Entrar na Sala
                    </button>
                  </div>
                ))}
              </div>
            )}
            {sortedPerformers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">Nenhum performer encontrado</div>
                <p className="text-gray-500">Tente ajustar sua pesquisa ou filtros</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebcamDirectory; 
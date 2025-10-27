'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Profile {
  id: string;
  name: string;
  age: number;
  city: string;
  height: number;
  weight: number;
  price: number;
  pricePerHour: number;
  rating: number;
  reviews: number;
  isOnline: boolean;
  isVerified: boolean;
  imageUrl: string;
  description: string;
  createdAt: string;
}

export default function Home() {
  const [topProfiles, setTopProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [searchCategory, setSearchCategory] = useState('');

  // Fetch top profiles
  useEffect(() => {
    const fetchTopProfiles = async () => {
      try {
        const response = await fetch('/api/profiles?limit=8');
        if (response.ok) {
          const data = await response.json();
          setTopProfiles(data.profiles || []);
        }
      } catch (error) {
        console.error('Error fetching top profiles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopProfiles();
  }, []);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchCity || searchCategory) {
      const params = new URLSearchParams();
      if (searchCity) params.set('cidade', searchCity);
      if (searchCategory) params.set('categoria', searchCategory);
      window.location.href = `/perfis?${params.toString()}`;
    } else {
      window.location.href = '/perfis';
    }
  };

  const categories = [
    { name: 'Feminino', image: 'photo-1494790108755-2616c19a1d3e' },
    { name: 'MILF', image: 'photo-1506863530036-1efeddceb993' },
    { name: 'Trans', image: 'photo-1529626455594-4ff0802cfb7e' },
    { name: 'VIP', image: 'photo-1506629905057-f39b5c4d3d03' }
  ];

  const cities = [
    { name: 'Lisboa', image: 'photo-1555881400-74d7acaacd8b' },
    { name: 'Porto', image: 'photo-1555881400-69d7acaacd9c' },
    { name: 'Coimbra', image: 'photo-1555881400-83d7acaacd7a' },
    { name: 'Braga', image: 'photo-1555881400-92d7acaacd6f' }
  ];

  const features = [
    { icon: 'fa-search', title: 'Filtros Avançados', desc: 'Busca personalizada por cidade, categoria e preferências' },
    { icon: 'fa-shield-alt', title: 'Perfis Verificados', desc: 'Todos os perfis passam por verificação rigorosa' },
    { icon: 'fa-star', title: 'Sistema de Avaliações', desc: 'Avaliações reais de outros utilizadores' },
    { icon: 'fa-mobile-alt', title: 'Totalmente Responsivo', desc: 'Acesso perfeito em qualquer dispositivo' }
  ];

  const popularCategories = [
    'Acompanhantes Femininas',
    'MILF',
    'Universitárias',
    'Trans',
    'VIP',
    'Massagens',
    'Casais',
    'Maduras'
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-screen bg-gradient-to-r from-red-900 to-pink-800 flex items-center">
        <div className="absolute inset-0 bg-black opacity-50"></div>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519501025264-65ba15a82390?ixlib=rb-4.0.3&auto=format&fit=crop&w=2064&q=80')" }}></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex justify-end">
            <div className="text-right text-white max-w-xl">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Encontre a
                <span className="text-pink-300"> Companhia Perfeita</span>
              </h1>
              
              {/* Statistics */}
              <div className="flex justify-end space-x-8 mb-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-300">1000+</div>
                  <div className="text-sm text-white font-medium">Perfis Ativos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-300">50+</div>
                  <div className="text-sm text-white font-medium">Cidades</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-300">24/7</div>
                  <div className="text-sm text-white font-medium">Disponível</div>
                </div>
              </div>
              
              {/* Search Bar */}
              <div className="bg-white bg-opacity-95 rounded-lg p-4 backdrop-blur-sm shadow-lg">
                <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <select 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white"
                    value={searchCity}
                    onChange={(e) => setSearchCity(e.target.value)}
                  >
                    <option value="" disabled>Selecione a cidade</option>
                    <option value="lisboa">Lisboa</option>
                    <option value="porto">Porto</option>
                    <option value="coimbra">Coimbra</option>
                    <option value="braga">Braga</option>
                    <option value="aveiro">Aveiro</option>
                    <option value="faro">Faro</option>
                  </select>
                  <select 
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-transparent text-gray-900 bg-white"
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                  >
                    <option value="" disabled>Categoria</option>
                    <option value="feminino">Feminino</option>
                    <option value="masculino">Masculino</option>
                    <option value="trans">Trans</option>
                    <option value="milf">MILF</option>
                    <option value="vip">VIP</option>
                  </select>
                  <button 
                    type="submit"
                    className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-medium shadow-lg"
                  >
                    <i className="fas fa-search mr-2"></i>Pesquisar
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Escorts Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Top Acompanhantes</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Descubra os perfis mais populares e bem avaliados da nossa plataforma</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {loading ? (
              <p>Carregando perfis...</p>
            ) : topProfiles.length === 0 ? (
              <p>Nenhum perfil encontrado.</p>
            ) : (
              topProfiles.map((profile, index) => (
                <Link href={`/perfis/${profile.id}`} key={profile.id}>
                  <div className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                    <div className="aspect-w-3 aspect-h-4">
                      <img 
                        src={profile.imageUrl || 'https://via.placeholder.com/400x600'}
                        alt={profile.name}
                        className="w-full h-80 object-cover"
                      />
                    </div>
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-xl font-bold mb-2">{profile.name}</h3>
                        <div className="flex justify-between items-center text-sm">
                          <span>Idade: {profile.age} anos</span>
                          <span>Cidade: {profile.city}</span>
                        </div>
                        <div className="mt-2 text-pink-300 font-bold text-lg">€{profile.pricePerHour || profile.price || '0'}/hora</div>
                      </div>
                    </div>
                    
                    {/* Always visible name */}
                    <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {profile.name}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Variety Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Variedade para Todos os Gostos</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Explore diferentes categorias e encontre exatamente o que procura</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.map((category, index) => (
              <div key={index} className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="aspect-w-4 aspect-h-5">
                  <img 
                    src={`https://images.unsplash.com/${category.image}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`}
                    alt={category.name}
                    className="w-full h-64 object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent">
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-2xl font-bold text-white">{category.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portal Features Section */}
      <section className="py-16 bg-red-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Funcionalidades do Portal</h2>
            <p className="text-xl text-red-100 max-w-3xl mx-auto">Tudo o que precisa para encontrar a companhia ideal</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center text-white">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-lg mb-4">
                  <i className={`fas ${feature.icon} text-2xl`}></i>
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-red-100">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* City Coverage Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Cobertura Nacional</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Presente nas principais cidades de Portugal</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {cities.map((city, index) => (
              <div key={index} className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="aspect-w-4 aspect-h-3">
                  <img 
                    src={`https://images.unsplash.com/${city.image}?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80`}
                    alt={city.name}
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent">
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-bold text-white">{city.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Adult Entertainment Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Entretenimento Adulto de Qualidade</h2>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            O nosso portal oferece uma plataforma segura e discreta para conectar pessoas adultas em Portugal. 
            Todos os serviços são destinados exclusivamente a maiores de 18 anos, com total respeito pela privacidade 
            e dignidade de todos os utilizadores.
          </p>
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Categorias Populares</h2>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4">
            {popularCategories.map((category, index) => (
              <a 
                key={index}
                href="#" 
                className="inline-block bg-white text-gray-700 px-6 py-3 rounded-full shadow-md hover:shadow-lg hover:bg-red-600 hover:text-white transition-all duration-300 font-medium"
              >
                {category}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-r from-red-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Pronto para Começar?</h2>
          <p className="text-xl text-white mb-8 max-w-2xl mx-auto">
            Crie o seu perfil hoje e comece a conectar-se com milhares de utilizadores em Portugal
          </p>
          <Link 
            href="/criar-perfil"
            className="inline-block bg-white text-red-600 px-8 py-4 rounded-lg text-lg font-bold hover:bg-gray-100 transition-colors duration-300 shadow-lg"
          >
            Cadastrar Perfil Agora
          </Link>
        </div>
      </section>
    </main>
  );
} 
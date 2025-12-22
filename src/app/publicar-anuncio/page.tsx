"use client";

import React, { useState, ChangeEvent } from "react";
import Image from "next/image";

export default function PublicarAnuncioPage() {
  // Form state
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [media, setMedia] = useState<File[]>([]);
  const [comparisonMedia, setComparisonMedia] = useState<File | null>(null);
  const [comparisonPreview, setComparisonPreview] = useState<string | null>(null);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  // Handle media uploads
  const handleMediaChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setMedia(files);
      setMediaPreviews(files.map(file => URL.createObjectURL(file)));
    }
  };

  const handleComparisonMediaChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setComparisonMedia(e.target.files[0]);
      setComparisonPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  // Handle form submit (mock)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-2">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Publicar Anúncio</h1>
        <p className="text-center text-gray-600 mb-8">Preencha os campos abaixo para criar o seu perfil. Seu anúncio será revisado antes de ser publicado.</p>
        {success ? (
          <div className="bg-green-100 border border-green-300 text-green-800 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Anúncio enviado com sucesso!</h2>
            <p>Sua submissão está em revisão. Entraremos em contato em breve.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name, Age, City, Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-red-500" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Idade</label>
                <input type="number" min="18" max="80" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-red-500" value={age} onChange={e => setAge(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-red-500" value={city} onChange={e => setCity(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-red-500" value={category} onChange={e => setCategory(e.target.value)} required>
                  <option value="">Selecione</option>
                  <option value="Feminino">Feminino</option>
                  <option value="Trans">Trans</option>
                  <option value="MILF">MILF</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
            </div>
            {/* Price, WhatsApp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preço por hora (€)</label>
                <input type="number" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-red-500" value={price} onChange={e => setPrice(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp/Contacto</label>
                <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-red-500" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} required />
              </div>
            </div>
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-red-500" value={description} onChange={e => setDescription(e.target.value)} rows={4} required placeholder="Fale sobre você, seus serviços, diferenciais, etc." />
            </div>
            {/* Media Uploads */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fotos e Vídeos</label>
              <input type="file" accept="image/*,video/*" multiple className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" onChange={handleMediaChange} />
              {mediaPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-3">
                  {mediaPreviews.map((src, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="Preview" className="object-cover w-full h-full" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Comparison Media Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mídia de Comparação <span className="text-xs text-gray-400">(vídeo vertical, 9:16)</span></label>
              <input type="file" accept="video/*" className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100" onChange={handleComparisonMediaChange} />
              {comparisonPreview && (
                <div className="mt-4 flex justify-center">
                  <div className="relative max-w-[220px] w-full">
                    <video
                      src={comparisonPreview}
                      className="w-full h-[390px] bg-gray-200 rounded-2xl object-cover border-2 border-red-600 shadow-lg"
                      controls
                      style={{ aspectRatio: '9/16' }}
                    />
                    {/* Overlay mimicking profile page */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-white text-sm font-bold">
                          {name ? name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2) : "AN"}
                        </div>
                        <span className="text-white font-medium drop-shadow-lg">{name || "Seu Nome"}</span>
                      </div>
                    </div>
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
                      <div className="h-full w-1/3 bg-red-600"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Submit Button */}
            <div className="pt-4 text-center">
              <button type="submit" className="bg-red-600 text-white px-8 py-3 rounded-lg font-bold text-lg shadow hover:bg-red-700 transition">Publicar Anúncio</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 
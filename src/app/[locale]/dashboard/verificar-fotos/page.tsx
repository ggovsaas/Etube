'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/hooks/useLocale';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function VerificarFotosPage() {
  const { locale } = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [beneficiosOpen, setBeneficiosOpen] = useState(true);
  const [comoConseguirOpen, setComoConseguirOpen] = useState(true);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('type', 'VERIFICATION');

      const response = await fetch('/api/verification/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert(locale === 'pt' ? 'Foto enviada com sucesso! Nossa equipe verificará em até 24 horas.' : '¡Foto enviada con éxito! Nuestro equipo la verificará en un plazo de 24 horas.');
        setUploadedFile(null);
        setPreview(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        alert(locale === 'pt' ? 'Erro ao enviar foto. Tente novamente.' : 'Error al enviar foto. Inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert(locale === 'pt' ? 'Erro ao enviar foto. Tente novamente.' : 'Error al enviar foto. Inténtalo de nuevo.');
    } finally {
      setUploading(false);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{locale === 'pt' ? 'Carregando...' : 'Cargando...'}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{locale === 'pt' ? 'Acesso Negado' : 'Acceso Denegado'}</h2>
          <p className="text-gray-600 mb-4">{locale === 'pt' ? 'Você precisa estar logado para acessar esta página.' : 'Necesitas estar conectado para acceder a esta página.'}</p>
          <Link href={`/${locale}/login`} className="text-indigo-600 hover:text-indigo-500">
            {locale === 'pt' ? 'Fazer Login' : 'Iniciar Sesión'}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-600 mb-8">
          {locale === 'pt' ? 'Verificar Fotos' : 'Verificar fotos'}
        </h1>

        {/* Beneficios Section */}
        <div className="bg-white rounded-lg shadow mb-6">
          <button
            onClick={() => setBeneficiosOpen(!beneficiosOpen)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors rounded-t-lg"
          >
            <h2 className="text-xl font-semibold text-gray-900">
              {locale === 'pt' ? 'Benefícios' : 'Beneficios'}
            </h2>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${beneficiosOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {beneficiosOpen && (
            <div className="px-6 pb-6 space-y-6">
              {/* Benefit 1 */}
              <div className="flex gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {locale === 'pt' 
                      ? '1. Gera confiança e seu post se destaca no listado'
                      : '1. Generas confianza y tu post destaca en el listado'}
                  </h3>
                  <p className="text-gray-700 mb-2">
                    {locale === 'pt' 
                      ? 'Seus clientes saberão que suas fotos são reais.'
                      : 'Tus clientes sabrán que tus fotos son reales.'}
                  </p>
                  <p className="text-gray-700">
                    {locale === 'pt' 
                      ? 'O símbolo de verificado no post e nos listados chamará a atenção'
                      : 'El símbolo de verificado en el post y en los listados llamará la atención'}
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 min-w-[200px]">
                  <p className="text-sm text-blue-800 font-medium">
                    {locale === 'pt' 
                      ? 'Este post tem fotos verificadas por EscortTube!'
                      : 'Este post tiene fotos verificadas por EscortTube!'}
                  </p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="flex gap-6">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {locale === 'pt' 
                      ? '2. Listado de fotos verificadas gratuito.'
                      : '2. Listado de fotos verificadas gratuito.'}
                  </h3>
                  <p className="text-gray-700">
                    {locale === 'pt' 
                      ? 'Você se promove gratuitamente em nosso diretório verificado.'
                      : 'Te promocionas gratis en nuestro directorio verificado.'}
                  </p>
                </div>
                <div className="flex items-center gap-2 min-w-[200px]">
                  <svg className="w-8 h-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-purple-600">
                    {locale === 'pt' ? 'Está verificado' : 'Está verificado'}
                  </span>
                </div>
              </div>

              {/* Benefit 3 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {locale === 'pt' 
                    ? '3. Te aplicaremos una subida gratis'
                    : '3. Te aplicaremos una subida gratis'}
                </h3>
                <p className="text-gray-700 mb-2">
                  {locale === 'pt' 
                    ? 'No momento em que nossa equipe verificar seu post, aplicaremos uma subida gratuita.'
                    : 'En el momento en el que nuestro equipo verifique tu post te aplicaremos una subida gratis.'}
                </p>
                <p className="text-gray-700">
                  {locale === 'pt' 
                    ? 'Esta subida só se aplicará na primeira vez que verificarmos seu post.'
                    : 'Esta subida sólo se aplicará la primera vez que verifiquemos tu post.'}
                </p>
              </div>

              {/* Benefit 4 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {locale === 'pt' 
                    ? '4. Servicio gratuito rápido y sencillo'
                    : '4. Servicio gratuito rápido y sencillo'}
                </h3>
                <p className="text-gray-700">
                  {locale === 'pt' 
                    ? 'Verificaremos seus posts em um prazo de 24 horas e de forma gratuita.'
                    : 'Verificaremos tus posts en un plazo de 24 horas y de forma gratuita.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Cómo conseguir la verificación Section */}
        <div className="bg-white rounded-lg shadow mb-6">
          <button
            onClick={() => setComoConseguirOpen(!comoConseguirOpen)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors rounded-t-lg"
          >
            <h2 className="text-xl font-semibold text-gray-900">
              {locale === 'pt' ? 'Como conseguir a verificação' : 'Cómo conseguir la verificación'}
            </h2>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${comoConseguirOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {comoConseguirOpen && (
            <div className="px-6 pb-6 space-y-6">
              {/* Requirement 1 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {locale === 'pt' 
                    ? '1. Tienes que tener como mínimo 3 fotos en tu post'
                    : '1. Tienes que tener como mínimo 3 fotos en tu post'}
                </h3>
                <p className="text-gray-700">
                  {locale === 'pt' 
                    ? 'Si tienes menos fotos edita tu post ahora y añade más fotos únicas. No puede haber fotos repetidas.'
                    : 'Si tienes menos fotos edita tu post ahora y añade más fotos únicas. No puede haber fotos repetidas.'}
                </p>
              </div>

              {/* Requirement 2 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {locale === 'pt' 
                    ? '2. Sólo puede postearse una persona en todo el post'
                    : '2. Sólo puede postearse una persona en todo el post'}
                </h3>
                <p className="text-gray-700">
                  {locale === 'pt' 
                    ? 'Si hay más de una persona, o hay fotos donde no haya personas, borra esas fotos antes de solicitar la verificación.'
                    : 'Si hay más de una persona, o hay fotos donde no haya personas, borra esas fotos antes de solicitar la verificación.'}
                </p>
              </div>

              {/* Requirement 3 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {locale === 'pt' 
                    ? '3. Hazte una foto con un cartel como este'
                    : '3. Hazte una foto con un cartel como este'}
                </h3>
                <p className="text-gray-700 mb-2">
                  {locale === 'pt' 
                    ? `Escribe en él: Escorttube ${getCurrentDate()}`
                    : `Escribe en él: Escorttube ${getCurrentDate()}`}
                </p>
                <p className="text-gray-700 mb-4">
                  {locale === 'pt' 
                    ? 'Tu cara debe ser visible y puedes coger el cartel con las manos, colocarlo en la pared o sobre un mueble.'
                    : 'Tu cara debe ser visible y puedes coger el cartel con las manos, colocarlo en la pared o sobre un mueble.'}
                </p>
                <p className="text-gray-600 italic">
                  {locale === 'pt' 
                    ? 'Esta foto no se verá en tu post, solo te la pedimos para poder verificar las fotos.'
                    : 'Esta foto no se verá en tu post, solo te la pedimos para poder verificar las fotos.'}
                </p>
                
                {/* Example Image */}
                <div className="mt-4 bg-gray-100 rounded-lg p-4 flex justify-center">
                  <div className="bg-white rounded-lg shadow-sm p-2 max-w-xs">
                    <img
                      src="/example-sign.jpg"
                      alt={locale === 'pt' ? 'Exemplo de foto com cartel' : 'Ejemplo de foto con cartel'}
                      className="w-full rounded"
                      onError={(e) => {
                        // Fallback if image doesn't exist
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="aspect-[3/4] bg-gray-200 rounded flex items-center justify-center">
                              <div class="text-center">
                                <div class="bg-white rounded-lg p-4 mb-2 inline-block shadow">
                                  <p class="text-sm font-semibold text-gray-800">Escorttube</p>
                                  <p class="text-xs text-gray-600">${getCurrentDate()}</p>
                                </div>
                                <p class="text-xs text-gray-500 mt-2">${locale === 'pt' ? 'Exemplo de foto' : 'Ejemplo de foto'}</p>
                              </div>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* File Upload Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              {locale === 'pt' ? 'Subir foto con cartel' : 'Subir foto con cartel'}
            </h2>
          </div>
          
          <div className="p-6">
            {!preview ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                  isDragging 
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
                }`}
              >
                <svg
                  className="mx-auto h-12 w-12 text-gray-400 mb-4"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <p className="text-gray-600 mb-2">
                  {locale === 'pt' 
                    ? 'Arraste e solte sua foto aqui ou clique para selecionar'
                    : 'Arrastra y suelta tu foto aquí o haz clic para seleccionar'}
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  {locale === 'pt' 
                    ? 'PNG, JPG, GIF até 10MB'
                    : 'PNG, JPG, GIF hasta 10MB'}
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg transition duration-200"
                >
                  {locale === 'pt' ? 'Selecionar Arquivo' : 'Seleccionar Archivo'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full max-w-md mx-auto rounded-lg shadow-md"
                  />
                  <button
                    onClick={removeFile}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={removeFile}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
                  >
                    {locale === 'pt' ? 'Remover' : 'Remover'}
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading 
                      ? (locale === 'pt' ? 'Enviando...' : 'Enviando...')
                      : (locale === 'pt' ? 'Enviar Foto' : 'Enviar Foto')
                    }
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}



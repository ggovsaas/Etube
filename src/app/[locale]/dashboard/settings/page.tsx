'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/hooks/useLocale';
import DashboardLayout from '@/components/DashboardLayout';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  profile?: {
    id: string;
    name: string;
  };
}

interface SettingsData {
  // Account Settings
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  
  // Privacy Settings
  profileVisibility: 'public' | 'private' | 'friends';
  showEmail: boolean;
  showPhone: boolean;
  allowMessages: boolean;
  
  // Notification Settings
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  newMessageNotifications: boolean;
  listingUpdateNotifications: boolean;
  
  // Language & Region
  preferredLanguage: string;
  timezone: string;
}

export default function SettingsPage() {
  const { locale } = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'account' | 'privacy' | 'notifications' | 'language'>('account');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const [settings, setSettings] = useState<SettingsData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    newMessageNotifications: true,
    listingUpdateNotifications: true,
    preferredLanguage: locale || 'pt',
    timezone: 'Europe/Lisbon',
  });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        // Load saved settings if available
        // For now, using defaults
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof SettingsData, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    if (settings.newPassword !== settings.confirmPassword) {
      setErrorMessage(locale === 'pt' ? 'As senhas não coincidem.' : 'Las contraseñas no coinciden.');
      setSaving(false);
      return;
    }

    if (settings.newPassword.length < 8) {
      setErrorMessage(locale === 'pt' ? 'A senha deve ter pelo menos 8 caracteres.' : 'La contraseña debe tener al menos 8 caracteres.');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: settings.currentPassword,
          newPassword: settings.newPassword,
        }),
      });

      if (response.ok) {
        setSuccessMessage(locale === 'pt' ? 'Senha alterada com sucesso!' : '¡Contraseña cambiada con éxito!');
        setSettings(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const error = await response.json();
        setErrorMessage(error.message || (locale === 'pt' ? 'Erro ao alterar senha.' : 'Error al cambiar contraseña.'));
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setErrorMessage(locale === 'pt' ? 'Erro ao alterar senha.' : 'Error al cambiar contraseña.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async (section: string) => {
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          section,
          settings: settings,
        }),
      });

      if (response.ok) {
        setSuccessMessage(locale === 'pt' ? 'Configurações salvas com sucesso!' : '¡Configuración guardada con éxito!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        const error = await response.json();
        setErrorMessage(error.message || (locale === 'pt' ? 'Erro ao salvar configurações.' : 'Error al guardar configuración.'));
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setErrorMessage(locale === 'pt' ? 'Erro ao salvar configurações.' : 'Error al guardar configuración.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
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
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {locale === 'pt' ? 'Configurações' : 'Configuración'}
        </h1>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
            {successMessage}
          </div>
        )}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'account', label: locale === 'pt' ? 'Conta' : 'Cuenta', icon: '🔐' },
                { id: 'privacy', label: locale === 'pt' ? 'Privacidade' : 'Privacidad', icon: '🔒' },
                { id: 'notifications', label: locale === 'pt' ? 'Notificações' : 'Notificaciones', icon: '🔔' },
                { id: 'language', label: locale === 'pt' ? 'Idioma' : 'Idioma', icon: '🌐' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-600 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Account Settings Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {locale === 'pt' ? 'Alterar Senha' : 'Cambiar Contraseña'}
                </h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {locale === 'pt' ? 'Senha Atual' : 'Contraseña Actual'} *
                    </label>
                    <input
                      type="password"
                      value={settings.currentPassword}
                      onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {locale === 'pt' ? 'Nova Senha' : 'Nueva Contraseña'} *
                    </label>
                    <input
                      type="password"
                      value={settings.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      required
                      minLength={8}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      {locale === 'pt' ? 'Mínimo de 8 caracteres' : 'Mínimo de 8 caracteres'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {locale === 'pt' ? 'Confirmar Nova Senha' : 'Confirmar Nueva Contraseña'} *
                    </label>
                    <input
                      type="password"
                      value={settings.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving 
                      ? (locale === 'pt' ? 'Salvando...' : 'Guardando...')
                      : (locale === 'pt' ? 'Alterar Senha' : 'Cambiar Contraseña')
                    }
                  </button>
                </form>
              </div>
            )}

            {/* Privacy Settings Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {locale === 'pt' ? 'Configurações de Privacidade' : 'Configuración de Privacidad'}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {locale === 'pt' ? 'Visibilidade do Perfil' : 'Visibilidad del Perfil'}
                    </label>
                    <select
                      value={settings.profileVisibility}
                      onChange={(e) => handleInputChange('profileVisibility', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="public">{locale === 'pt' ? 'Público' : 'Público'}</option>
                      <option value="private">{locale === 'pt' ? 'Privado' : 'Privado'}</option>
                      <option value="friends">{locale === 'pt' ? 'Apenas Amigos' : 'Solo Amigos'}</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {locale === 'pt' ? 'Mostrar Email' : 'Mostrar Email'}
                      </label>
                      <p className="text-sm text-gray-500">
                        {locale === 'pt' ? 'Permitir que outros usuários vejam seu email' : 'Permitir que otros usuarios vean tu email'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.showEmail}
                        onChange={(e) => handleInputChange('showEmail', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {locale === 'pt' ? 'Mostrar Telefone' : 'Mostrar Teléfono'}
                      </label>
                      <p className="text-sm text-gray-500">
                        {locale === 'pt' ? 'Permitir que outros usuários vejam seu telefone' : 'Permitir que otros usuarios vean tu teléfono'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.showPhone}
                        onChange={(e) => handleInputChange('showPhone', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {locale === 'pt' ? 'Permitir Mensagens' : 'Permitir Mensajes'}
                      </label>
                      <p className="text-sm text-gray-500">
                        {locale === 'pt' ? 'Permitir que outros usuários enviem mensagens' : 'Permitir que otros usuarios envíen mensajes'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.allowMessages}
                        onChange={(e) => handleInputChange('allowMessages', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                  <button
                    onClick={() => handleSaveSettings('privacy')}
                    disabled={saving}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving 
                      ? (locale === 'pt' ? 'Salvando...' : 'Guardando...')
                      : (locale === 'pt' ? 'Salvar' : 'Guardar')
                    }
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {locale === 'pt' ? 'Configurações de Notificações' : 'Configuración de Notificaciones'}
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {locale === 'pt' ? 'Notificações por Email' : 'Notificaciones por Email'}
                      </label>
                      <p className="text-sm text-gray-500">
                        {locale === 'pt' ? 'Receber notificações por email' : 'Recibir notificaciones por email'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {locale === 'pt' ? 'Notificações Push' : 'Notificaciones Push'}
                      </label>
                      <p className="text-sm text-gray-500">
                        {locale === 'pt' ? 'Receber notificações push no navegador' : 'Recibir notificaciones push en el navegador'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.pushNotifications}
                        onChange={(e) => handleInputChange('pushNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {locale === 'pt' ? 'Emails de Marketing' : 'Emails de Marketing'}
                      </label>
                      <p className="text-sm text-gray-500">
                        {locale === 'pt' ? 'Receber emails promocionais e ofertas' : 'Recibir emails promocionales y ofertas'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.marketingEmails}
                        onChange={(e) => handleInputChange('marketingEmails', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {locale === 'pt' ? 'Notificações de Nova Mensagem' : 'Notificaciones de Nuevo Mensaje'}
                      </label>
                      <p className="text-sm text-gray-500">
                        {locale === 'pt' ? 'Receber notificações quando receber novas mensagens' : 'Recibir notificaciones cuando recibas nuevos mensajes'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.newMessageNotifications}
                        onChange={(e) => handleInputChange('newMessageNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {locale === 'pt' ? 'Notificações de Atualização de Anúncio' : 'Notificaciones de Actualización de Anuncio'}
                      </label>
                      <p className="text-sm text-gray-500">
                        {locale === 'pt' ? 'Receber notificações sobre atualizações nos seus anúncios' : 'Recibir notificaciones sobre actualizaciones en tus anuncios'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.listingUpdateNotifications}
                        onChange={(e) => handleInputChange('listingUpdateNotifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                    </label>
                  </div>
                  <button
                    onClick={() => handleSaveSettings('notifications')}
                    disabled={saving}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving 
                      ? (locale === 'pt' ? 'Salvando...' : 'Guardando...')
                      : (locale === 'pt' ? 'Salvar' : 'Guardar')
                    }
                  </button>
                </div>
              </div>
            )}

            {/* Language & Region Tab */}
            {activeTab === 'language' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {locale === 'pt' ? 'Idioma e Região' : 'Idioma y Región'}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {locale === 'pt' ? 'Idioma Preferido' : 'Idioma Preferido'}
                    </label>
                    <select
                      value={settings.preferredLanguage}
                      onChange={(e) => handleInputChange('preferredLanguage', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="pt">Português</option>
                      <option value="es">Español</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {locale === 'pt' ? 'Fuso Horário' : 'Zona Horaria'}
                    </label>
                    <select
                      value={settings.timezone}
                      onChange={(e) => handleInputChange('timezone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="Europe/Lisbon">Europe/Lisbon (WET/WEST)</option>
                      <option value="Europe/Madrid">Europe/Madrid (CET/CEST)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  <button
                    onClick={() => handleSaveSettings('language')}
                    disabled={saving}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving 
                      ? (locale === 'pt' ? 'Salvando...' : 'Guardando...')
                      : (locale === 'pt' ? 'Salvar' : 'Guardar')
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


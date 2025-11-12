'use client';

import { useState, useEffect } from 'react';
import { AppSettings } from '@/types';
import { BetterAuthStorageService } from '@/lib/better-auth-storage';
import { StatisticsPeriod } from '@/lib/date-utils';
import Link from 'next/link';

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings>({
    sound: true,
    vibration: true,
    desktop: false,
    statisticsPeriod: 'daily'
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const loadSettings = () => {
      const savedSettings = BetterAuthStorageService.getSettings();
      setSettings(savedSettings);
    };

    loadSettings();
  }, []);

  const handleSettingChange = (key: keyof AppSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    setHasChanges(true);
  };

  const handleSave = () => {
    BetterAuthStorageService.saveSettings(settings);
    setHasChanges(false);

    // Show success feedback
    const button = document.getElementById('save-button');
    if (button) {
      button.textContent = 'Salvo!';
      button.classList.add('bg-green-600', 'hover:bg-green-700');
      button.classList.remove('bg-blue-600', 'hover:bg-blue-700');

      setTimeout(() => {
        button.textContent = 'Salvar Configurações';
        button.classList.remove('bg-green-600', 'hover:bg-green-700');
        button.classList.add('bg-blue-600', 'hover:bg-blue-700');
      }, 2000);
    }
  };

  const handleCancel = () => {
    const savedSettings = BetterAuthStorageService.getSettings();
    setSettings(savedSettings);
    setHasChanges(false);
  };

  const getPeriodLabel = (period: StatisticsPeriod): string => {
    switch (period) {
      case 'daily':
        return 'Diário (Hoje)';
      case 'weekly':
        return 'Semanal (Esta Semana)';
      case 'monthly':
        return 'Mensal (Este Mês)';
      default:
        return 'Diário (Hoje)';
    }
  };

  const getPeriodDescription = (period: StatisticsPeriod): string => {
    switch (period) {
      case 'daily':
        return 'Mostra estatísticas apenas do dia atual';
      case 'weekly':
        return 'Mostra estatísticas da semana atual (segunda a domingo)';
      case 'monthly':
        return 'Mostra estatísticas do mês atual';
      default:
        return 'Mostra estatísticas apenas do dia atual';
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
            <p className="mt-1 text-sm text-gray-600">
              Gerencie as preferências do sistema
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Voltar
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        {/* Statistics Period Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Estatísticas do Dashboard
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período das Estatísticas
                </label>
                <select
                  value={settings.statisticsPeriod}
                  onChange={(e) => handleSettingChange('statisticsPeriod', e.target.value as StatisticsPeriod)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="daily">{getPeriodLabel('daily')}</option>
                  <option value="weekly">{getPeriodLabel('weekly')}</option>
                  <option value="monthly">{getPeriodLabel('monthly')}</option>
                </select>
                <p className="mt-2 text-sm text-gray-500">
                  {getPeriodDescription(settings.statisticsPeriod)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Notificações
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label htmlFor="sound" className="text-sm font-medium text-gray-700">
                    Som
                  </label>
                  <p className="text-sm text-gray-500">
                    Reproduzir som de notificação para novos pedidos
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="sound"
                  checked={settings.sound}
                  onChange={(e) => handleSettingChange('sound', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label htmlFor="vibration" className="text-sm font-medium text-gray-700">
                    Vibração
                  </label>
                  <p className="text-sm text-gray-500">
                    Vibrar em dispositivos móveis para novas notificações
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="vibration"
                  checked={settings.vibration}
                  onChange={(e) => handleSettingChange('vibration', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label htmlFor="desktop" className="text-sm font-medium text-gray-700">
                    Notificações Desktop
                  </label>
                  <p className="text-sm text-gray-500">
                    Mostrar notificações do navegador (requer permissão)
                  </p>
                </div>
                <input
                  type="checkbox"
                  id="desktop"
                  checked={settings.desktop}
                  onChange={(e) => handleSettingChange('desktop', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save/Cancel Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                disabled={!hasChanges}
                className={`inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                  hasChanges
                    ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                    : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
                }`}
              >
                Cancelar
              </button>
              <button
                id="save-button"
                onClick={handleSave}
                disabled={!hasChanges}
                className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                  hasChanges
                    ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
                </svg>
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">Sobre as Configurações</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>
              <strong>Período das Estatísticas:</strong> Define qual período de tempo será exibido nos cards de estatísticas do dashboard.
            </p>
            <p>
              <strong>Notificações:</strong> Controla como você será alertado sobre novos pedidos e atualizações de status.
            </p>
            <p>
              <strong>Configurações:</strong> Todas as configurações são salvas localmente no seu navegador e persistem entre sessões.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
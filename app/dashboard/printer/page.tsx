'use client';

import { useState, useEffect } from 'react';
import { PrinterConfig } from '@/types/printer';
import { usePrinter } from '@/hooks/usePrinter';
import Link from 'next/link';

export default function PrinterSettings() {
  const { status, connect, disconnect, setConfig, getConfig, isLoading, error, clearQueue, queue } = usePrinter();
  const [config, setConfigState] = useState<PrinterConfig>({
    type: 'epson',
    width: 42,
    connectionType: 'usb',
    baudRate: 9100
  });

  useEffect(() => {
    const savedConfig = getConfig();
    if (savedConfig) {
      setConfigState(savedConfig);
    }
  }, [getConfig]);

  const handleSaveConfig = () => {
    setConfig(config);
    alert('Configurações da impressora salvas com sucesso!');
  };

  const handleConnect = async () => {
    try {
      await connect();
      alert('Impressora conectada com sucesso!');
    } catch (error) {
      alert(`Erro ao conectar impressora: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      alert('Impressora desconectada com sucesso!');
    } catch (error) {
      alert(`Erro ao desconectar impressora: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  const handleClearQueue = () => {
    clearQueue();
    alert('Fila de impressão limpa com sucesso!');
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurações da Impressora</h1>
            <p className="mt-1 text-sm text-gray-600">
              Gerencie a conexão e configurações da impressora térmica
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

      {/* Status da Impressora */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Status da Impressora</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg border-2 ${
              status.connected
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  status.connected ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Conexão</p>
                  <p className="text-sm text-gray-600">
                    {status.connected ? 'Conectada' : 'Desconectada'}
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-lg border-2 ${
              status.ready
                ? 'bg-green-50 border-green-200'
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${
                  status.ready ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Pronta</p>
                  <p className="text-sm text-gray-600">
                    {status.ready ? 'Sim' : 'Não'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg border-2 border-gray-200">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-3 bg-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Fila</p>
                  <p className="text-sm text-gray-600">
                    {queue?.jobs?.length || 0} jobs
                  </p>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                <strong>Erro:</strong> {error}
              </p>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            {!status.connected ? (
              <button
                onClick={handleConnect}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Conectando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    Conectar
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleDisconnect}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Desconectar
              </button>
            )}

            <button
              onClick={handleClearQueue}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Limpar Fila
            </button>
          </div>
        </div>
      </div>

      {/* Configurações da Impressora */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Configurações da Impressora</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Impressora
              </label>
              <select
                value={config.type}
                onChange={(e) => setConfigState(prev => ({ ...prev, type: e.target.value as 'epson' | 'star' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="epson">Epson</option>
                <option value="star">Star</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Largura do Papel (caracteres)
              </label>
              <select
                value={config.width}
                onChange={(e) => setConfigState(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={32}>32 caracteres</option>
                <option value={42}>42 caracteres</option>
                <option value={48}>48 caracteres</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Conexão
              </label>
              <select
                value={config.connectionType}
                onChange={(e) => setConfigState(prev => ({ ...prev, connectionType: e.target.value as 'usb' | 'network' | 'bluetooth' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="usb">USB</option>
                <option value="network">Rede</option>
                <option value="bluetooth">Bluetooth</option>
              </select>
            </div>

            {config.connectionType === 'network' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço IP
                </label>
                <input
                  type="text"
                  value={config.networkAddress || ''}
                  onChange={(e) => setConfigState(prev => ({ ...prev, networkAddress: e.target.value }))}
                  placeholder="192.168.1.100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Baud Rate
              </label>
              <select
                value={config.baudRate}
                onChange={(e) => setConfigState(prev => ({ ...prev, baudRate: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={9600}>9600</option>
                <option value={19200}>19200</option>
                <option value={38400}>38400</option>
                <option value={57600}>57600</option>
                <option value={115200}>115200</option>
                <option value={9100}>9100 (Padrão)</option>
              </select>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleSaveConfig}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
              </svg>
              Salvar Configurações
            </button>
          </div>
        </div>
      </div>

      {/* Informações de Uso */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3">Como Usar</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• <strong>Cozinha:</strong> Comandas são impressas automaticamente quando os pedidos mudam para "Preparando"</p>
          <p>• <strong>Delivery:</strong> Recibos são impressos automaticamente quando os pedidos ficam "Prontos" ou "Entregues"</p>
          <p>• <strong>Dashboard:</strong> Use os botões de impressão na tabela de pedidos para imprimir manualmente</p>
          <p>• <strong>USB:</strong> Certifique-se de que o navegador suporta Web Serial API (Chrome/Edge recomendados)</p>
          <p>• <strong>Configuração:</strong> Ajuste as configurações da impressora conforme o modelo utilizado</p>
        </div>
      </div>
    </div>
  );
}
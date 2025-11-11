'use client';

import { useState, useEffect } from 'react';
import { MenuItem } from '@/types';
import { StorageService } from '@/lib/storage';
import Link from 'next/link';

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'food' as 'food' | 'drink' | 'dessert',
    description: '',
    isAvailable: true,
    preparationTime: '15',
    costPrice: '',
    allergens: [] as string[],
    spicyLevel: '0' as '0' | '1' | '2' | '3',
    vegetarian: false,
    glutenFree: false,
    organic: false
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'food' | 'drink' | 'dessert'>('all');
  const [filterAvailability, setFilterAvailability] = useState<'all' | 'available' | 'unavailable'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'category' | 'preparationTime'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<'none' | 'delete' | 'available' | 'unavailable'>('none');

  useEffect(() => {
    loadMenuItems();
  }, []);

  const loadMenuItems = () => {
    const items = StorageService.getMenuItems();
    setMenuItems(items);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      category: 'food',
      description: '',
      isAvailable: true,
      preparationTime: '15',
      costPrice: '',
      allergens: [],
      spicyLevel: '0',
      vegetarian: false,
      glutenFree: false,
      organic: false
    });
    setEditingItem(null);
  };

  const openForm = (item?: MenuItem) => {
    if (item) {
      setFormData({
        name: item.name,
        price: item.price.toString(),
        category: item.category,
        description: item.description || '',
        isAvailable: item.isAvailable,
        preparationTime: item.preparationTime.toString(),
        costPrice: (item as any).costPrice?.toString() || '',
        allergens: (item as any).allergens || [],
        spicyLevel: (item as any).spicyLevel || '0',
        vegetarian: (item as any).vegetarian || false,
        glutenFree: (item as any).glutenFree || false,
        organic: (item as any).organic || false
      });
      setEditingItem(item);
    } else {
      resetForm();
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const menuItem: MenuItem & {
      costPrice?: number;
      allergens?: string[];
      spicyLevel?: string;
      vegetarian?: boolean;
      glutenFree?: boolean;
      organic?: boolean;
    } = {
      id: editingItem ? editingItem.id : Date.now().toString(),
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category,
      description: formData.description,
      isAvailable: formData.isAvailable,
      preparationTime: parseInt(formData.preparationTime),
      costPrice: formData.costPrice ? parseFloat(formData.costPrice) : undefined,
      allergens: formData.allergens,
      spicyLevel: formData.spicyLevel,
      vegetarian: formData.vegetarian,
      glutenFree: formData.glutenFree,
      organic: formData.organic
    };

    StorageService.saveMenuItem(menuItem);
    loadMenuItems();
    closeForm();
  };

  const deleteItem = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este item do cardápio? Esta ação não pode ser desfeita.')) {
      const items = menuItems.filter(item => item.id !== id);
      localStorage.setItem('atavi-menu-items', JSON.stringify(items));
      loadMenuItems();
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    }
  };

  const duplicateItem = (item: MenuItem) => {
    const duplicatedItem: MenuItem = {
      ...item,
      id: Date.now().toString(),
      name: `${item.name} (Cópia)`
    };
    StorageService.saveMenuItem(duplicatedItem);
    loadMenuItems();
  };

  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const selectAllItems = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item.id));
    }
  };

  const executeBulkAction = () => {
    if (bulkAction === 'none' || selectedItems.length === 0) return;

    let confirmMessage = '';
    switch (bulkAction) {
      case 'delete':
        confirmMessage = `Tem certeza que deseja excluir ${selectedItems.length} itens?`;
        break;
      case 'available':
        confirmMessage = `Deseja marcar ${selectedItems.length} itens como disponíveis?`;
        break;
      case 'unavailable':
        confirmMessage = `Deseja marcar ${selectedItems.length} itens como indisponíveis?`;
        break;
    }

    if (confirm(confirmMessage)) {
      selectedItems.forEach(id => {
        const item = menuItems.find(item => item.id === id);
        if (item) {
          if (bulkAction === 'delete') {
            deleteItem(id);
          } else {
            const updatedItem = { 
              ...item, 
              isAvailable: bulkAction === 'available' 
            };
            StorageService.saveMenuItem(updatedItem);
          }
        }
      });
      
      if (bulkAction !== 'delete') {
        loadMenuItems();
      }
      setSelectedItems([]);
      setBulkAction('none');
    }
  };

  const exportMenu = () => {
    const dataStr = JSON.stringify(menuItems, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `cardapio_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importMenu = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedItems = JSON.parse(event.target?.result as string);
        if (Array.isArray(importedItems)) {
          if (confirm(`Importar ${importedItems.length} itens? Isso irá substituir o cardápio atual.`)) {
            importedItems.forEach(item => {
              StorageService.saveMenuItem({
                ...item,
                id: Date.now().toString() + Math.random()
              });
            });
            loadMenuItems();
          }
        }
      } catch (error) {
        alert('Erro ao importar arquivo. Verifique o formato JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const toggleAvailability = (id: string) => {
    const item = menuItems.find(item => item.id === id);
    if (item) {
      const updatedItem = { ...item, isAvailable: !item.isAvailable };
      StorageService.saveMenuItem(updatedItem);
      loadMenuItems();
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    const matchesAvailability = filterAvailability === 'all' || 
      (filterAvailability === 'available' && item.isAvailable) ||
      (filterAvailability === 'unavailable' && !item.isAvailable);
    return matchesSearch && matchesCategory && matchesAvailability;
  }).sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'price':
        comparison = a.price - b.price;
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      case 'preparationTime':
        comparison = a.preparationTime - b.preparationTime;
        break;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'food': return 'bg-orange-100 text-orange-800';
      case 'drink': return 'bg-blue-100 text-blue-800';
      case 'dessert': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'food': return 'Comida';
      case 'drink': return 'Bebida';
      case 'dessert': return 'Sobremesa';
      default: return category;
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Cardápio</h1>
            <p className="mt-1 text-sm text-gray-600">
              Gerencie os itens do seu cardápio
            </p>
          </div>
          <div className="flex space-x-3">
            <Link
              href="/dashboard"
              className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Voltar
            </Link>
            <button
              onClick={() => openForm()}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Novo Item
            </button>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar item..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">Todas</option>
                <option value="food">Comidas</option>
                <option value="drink">Bebidas</option>
                <option value="dessert">Sobremesas</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Disponibilidade</label>
              <select
                value={filterAvailability}
                onChange={(e) => setFilterAvailability(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">Todas</option>
                <option value="available">Disponíveis</option>
                <option value="unavailable">Indisponíveis</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              >
                <option value="name">Nome</option>
                <option value="price">Preço</option>
                <option value="category">Categoria</option>
                <option value="preparationTime">Tempo de Prep.</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ordem</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
              >
                <option value="asc">Crescente</option>
                <option value="desc">Decrescente</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                  onChange={selectAllItems}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Selecionar todos ({selectedItems.length})
                </span>
              </label>
              
              {selectedItems.length > 0 && (
                <div className="flex items-center space-x-2">
                  <select
                    value={bulkAction}
                    onChange={(e) => setBulkAction(e.target.value as any)}
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                  >
                    <option value="none">Ações em lote</option>
                    <option value="available">Marcar como disponível</option>
                    <option value="unavailable">Marcar como indisponível</option>
                    <option value="delete">Excluir selecionados</option>
                  </select>
                  <button
                    onClick={executeBulkAction}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
                    disabled={bulkAction === 'none'}
                  >
                    Executar
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <label className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md cursor-pointer hover:bg-gray-200">
                <input
                  type="file"
                  accept=".json"
                  onChange={importMenu}
                  className="hidden"
                />
                Importar Cardápio
              </label>
              <button
                onClick={exportMenu}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
              >
                Exportar Cardápio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum item encontrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterCategory !== 'all' 
              ? 'Tente ajustar os filtros' 
              : 'Comece adicionando itens ao cardápio'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className={`bg-white rounded-lg shadow-md overflow-hidden border-2 ${
              selectedItems.includes(item.id) ? 'border-red-500' : 'border-transparent'
            }`}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded mt-1"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(item.category)}`}>
                          {getCategoryText(item.category)}
                        </span>
                        {(item as any).vegetarian && (
                          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            🌱 Vegano
                          </span>
                        )}
                        {(item as any).glutenFree && (
                          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            🌾 Sem Glúten
                          </span>
                        )}
                        {(item as any).spicyLevel && (item as any).spicyLevel !== '0' && (
                          <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            {'🌶️'.repeat(parseInt((item as any).spicyLevel))}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => duplicateItem(item)}
                      className="p-1.5 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200"
                      title="Duplicar"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => toggleAvailability(item.id)}
                      className={`p-1.5 rounded-md ${
                        item.isAvailable 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                      title={item.isAvailable ? 'Disponível' : 'Indisponível'}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => openForm(item)}
                      className="p-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                      title="Editar"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="p-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                      title="Excluir"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 01 16.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {item.description && (
                  <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                )}

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  {(item as any).costPrice && (
                    <div className="bg-gray-50 p-2 rounded">
                      <span className="text-gray-500">Custo:</span>
                      <span className="font-medium text-gray-900 ml-1">
                        R$ {(item as any).costPrice.toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="bg-gray-50 p-2 rounded">
                    <span className="text-gray-500">Margem:</span>
                    <span className="font-medium text-gray-900 ml-1">
                      {(item as any).costPrice 
                        ? `${(((item.price - (item as any).costPrice) / item.price * 100).toFixed(1))}%`
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>

                {(item as any).allergens && (item as any).allergens.length > 0 && (
                  <div className="mb-3">
                    <span className="text-xs text-gray-500 mb-1 block">Alérgenos:</span>
                    <div className="flex flex-wrap gap-1">
                      {(item as any).allergens.map((allergen: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">
                      R$ {item.price.toFixed(2)}
                    </span>
                    <div className="text-xs text-gray-500">
                      ⏱️ {item.preparationTime} min
                    </div>
                  </div>
                  <div className={`px-2 py-1 text-xs font-medium rounded ${
                    item.isAvailable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.isAvailable ? 'Disponível' : 'Indisponível'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingItem ? 'Editar Item' : 'Novo Item'}
              </h2>
              <button
                onClick={closeForm}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="Ex: Hambúrguer Tradicional"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço de Venda *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    placeholder="25.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço de Custo
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    placeholder="15.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tempo de Prep. (min) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                    placeholder="15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="food">Comida</option>
                    <option value="drink">Bebida</option>
                    <option value="dessert">Sobremesa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="Descreva o item (ingredientes, preparo, etc.)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nível de Pimenta
                </label>
                <select
                  value={formData.spicyLevel}
                  onChange={(e) => setFormData({ ...formData, spicyLevel: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                >
                  <option value="0">Não picante</option>
                  <option value="1">Levemente picante 🌶️</option>
                  <option value="2">Picante 🌶️🌶️</option>
                  <option value="3">Muito picante 🌶️🌶️🌶️</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alérgenos (separados por vírgula)
                </label>
                <input
                  type="text"
                  value={formData.allergens.join(', ')}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    allergens: e.target.value.split(',').map(a => a.trim()).filter(a => a) 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500"
                  placeholder="Glúten, Lactose, Amendoim"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
                    Item disponível para venda
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="vegetarian"
                    checked={formData.vegetarian}
                    onChange={(e) => setFormData({ ...formData, vegetarian: e.target.checked })}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="vegetarian" className="ml-2 block text-sm text-gray-700">
                    🌱 Vegetariano/Vegano
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="glutenFree"
                    checked={formData.glutenFree}
                    onChange={(e) => setFormData({ ...formData, glutenFree: e.target.checked })}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="glutenFree" className="ml-2 block text-sm text-gray-700">
                    🌾 Sem Glúten
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="organic"
                    checked={formData.organic}
                    onChange={(e) => setFormData({ ...formData, organic: e.target.checked })}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="organic" className="ml-2 block text-sm text-gray-700">
                    🌿 Orgânico
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700"
                >
                  {editingItem ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
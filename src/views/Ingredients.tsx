import { useState, useEffect } from 'react';
import { Plus, X, Save, Package, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Ingredient = {
  id: string;
  name: string;
  category: string;
  supplier: string;
  cost_per_kg: number;
  description: string;
  created_at: string;
};

export function Ingredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [filteredIngredients, setFilteredIngredients] = useState<Ingredient[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    category: 'ferment',
    supplier: '',
    cost_per_kg: '',
    description: '',
  });

  const categories = [
    { value: 'ferment', label: 'Fermento' },
    { value: 'rennet', label: 'Coalho' },
    { value: 'salt', label: 'Sal' },
    { value: 'additive', label: 'Aditivo' },
    { value: 'stabilizer', label: 'Estabilizante' },
    { value: 'other', label: 'Outros' },
  ];

  useEffect(() => {
    loadIngredients();
  }, []);

  useEffect(() => {
    filterIngredients();
  }, [searchTerm, selectedCategory, ingredients]);

  const loadIngredients = async () => {
    try {
      const { data } = await supabase
        .from('ingredients')
        .select('*')
        .order('name', { ascending: true });

      if (data) {
        setIngredients(data);
        setFilteredIngredients(data);
      }
    } catch (error) {
      console.error('Error loading ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterIngredients = () => {
    let filtered = [...ingredients];

    if (searchTerm) {
      filtered = filtered.filter(
        (ing) =>
          ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ing.supplier.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((ing) => ing.category === selectedCategory);
    }

    setFilteredIngredients(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase.from('ingredients').insert({
        name: formData.name,
        category: formData.category,
        supplier: formData.supplier,
        cost_per_kg: parseFloat(formData.cost_per_kg),
        description: formData.description,
      });

      if (error) throw error;

      setShowModal(false);
      setFormData({
        name: '',
        category: 'ferment',
        supplier: '',
        cost_per_kg: '',
        description: '',
      });
      loadIngredients();
    } catch (error) {
      console.error('Error creating ingredient:', error);
    }
  };

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      ferment: 'bg-purple-100 text-purple-700',
      rennet: 'bg-blue-100 text-blue-700',
      salt: 'bg-gray-100 text-gray-700',
      additive: 'bg-yellow-100 text-yellow-700',
      stabilizer: 'bg-green-100 text-green-700',
      other: 'bg-pink-100 text-pink-700',
    };

    const label = categories.find((c) => c.value === category)?.label || category;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[category] || styles.other}`}>
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Biblioteca de Insumos</h1>
          <p className="text-gray-600 mt-1">Gerencie os ingredientes e suas especificações</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span className="font-medium">Novo Insumo</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nome ou fornecedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {filteredIngredients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Package size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Nenhum insumo encontrado</p>
          <p className="text-sm text-gray-400 mt-1">Adicione novos insumos à biblioteca</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIngredients.map((ingredient) => (
            <div
              key={ingredient.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Package size={20} className="text-blue-600" />
                </div>
                {getCategoryBadge(ingredient.category)}
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{ingredient.name}</h3>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Fornecedor</span>
                  <span className="font-medium text-gray-900">{ingredient.supplier}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Custo/kg</span>
                  <span className="font-semibold text-green-600">
                    R$ {ingredient.cost_per_kg.toFixed(2)}
                  </span>
                </div>
              </div>

              {ingredient.description && (
                <p className="text-sm text-gray-600 line-clamp-2">{ingredient.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Novo Insumo</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Insumo
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Fermento Lático L-450"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custo por kg (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.cost_per_kg}
                    onChange={(e) => setFormData({ ...formData, cost_per_kg: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fornecedor</label>
                <input
                  type="text"
                  required
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nome do fornecedor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição (opcional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Informações adicionais sobre o insumo..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Save size={18} />
                  <span>Salvar Insumo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

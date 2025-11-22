import { useState, useEffect } from 'react';
import { Plus, X, Save, Beaker } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type Experiment = {
  id: string;
  name: string;
  objective: string;
  status: string;
  created_at: string;
};

type Treatment = {
  name: string;
  ingredients: { name: string; quantity: string }[];
};

export function Experiments() {
  const { user } = useAuth();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    objective: '',
    baseFormula: '',
  });
  const [treatments, setTreatments] = useState<Treatment[]>([
    { name: 'Tratamento A', ingredients: [{ name: '', quantity: '' }] },
  ]);

  useEffect(() => {
    if (user?.id) {
      loadExperiments();
    }
  }, [user?.id]);

  const loadExperiments = async () => {
    try {
      const { data } = await supabase
        .from('experiments')
        .select('*')
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false });

      if (data) setExperiments(data);
    } catch (error) {
      console.error('Error loading experiments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addTreatment = () => {
    const nextLetter = String.fromCharCode(65 + treatments.length);
    setTreatments([...treatments, { name: `Tratamento ${nextLetter}`, ingredients: [{ name: '', quantity: '' }] }]);
  };

  const addIngredient = (treatmentIndex: number) => {
    const newTreatments = [...treatments];
    newTreatments[treatmentIndex].ingredients.push({ name: '', quantity: '' });
    setTreatments(newTreatments);
  };

  const updateIngredient = (treatmentIndex: number, ingredientIndex: number, field: 'name' | 'quantity', value: string) => {
    const newTreatments = [...treatments];
    newTreatments[treatmentIndex].ingredients[ingredientIndex][field] = value;
    setTreatments(newTreatments);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { data: experiment, error: expError } = await supabase
        .from('experiments')
        .insert({
          name: formData.name,
          objective: formData.objective,
          base_formula: { formula: formData.baseFormula },
          status: 'planning',
          created_by: user.id,
        })
        .select()
        .single();

      if (expError) throw expError;

      for (const treatment of treatments) {
        await supabase.from('treatments').insert({
          experiment_id: experiment.id,
          name: treatment.name,
          formula: { ingredients: treatment.ingredients },
        });
      }

      setShowModal(false);
      setFormData({ name: '', objective: '', baseFormula: '' });
      setTreatments([{ name: 'Tratamento A', ingredients: [{ name: '', quantity: '' }] }]);
      loadExperiments();
    } catch (error) {
      console.error('Error creating experiment:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      planning: 'bg-gray-100 text-gray-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      validated: 'bg-blue-100 text-blue-700',
    };
    return styles[status as keyof typeof styles] || styles.planning;
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
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Experimentos</h1>
          <p className="text-gray-600 mt-1">Gerencie seus experimentos de formulação</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span className="font-medium">Novo Experimento</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {experiments.map((exp) => (
          <div key={exp.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Beaker size={20} className="text-blue-600" />
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(exp.status)}`}>
                {exp.status === 'planning' ? 'Planejamento' : exp.status === 'in_progress' ? 'Em Andamento' : 'Concluído'}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{exp.name}</h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">{exp.objective}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{new Date(exp.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Novo Experimento</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Experimento
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ex: Muçarela com baixo teor de sódio"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Objetivo da Inovação
                  </label>
                  <textarea
                    required
                    value={formData.objective}
                    onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Descreva o objetivo do experimento..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fórmula Base
                  </label>
                  <input
                    type="text"
                    value={formData.baseFormula}
                    onChange={(e) => setFormData({ ...formData, baseFormula: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Receita base utilizada"
                  />
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Tratamentos</h3>
                  <button
                    type="button"
                    onClick={addTreatment}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    + Adicionar Tratamento
                  </button>
                </div>

                <div className="space-y-4">
                  {treatments.map((treatment, tIndex) => (
                    <div key={tIndex} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-gray-900">{treatment.name}</h4>
                        <button
                          type="button"
                          onClick={() => addIngredient(tIndex)}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          + Ingrediente
                        </button>
                      </div>

                      <div className="space-y-2">
                        {treatment.ingredients.map((ing, iIndex) => (
                          <div key={iIndex} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={ing.name}
                              onChange={(e) => updateIngredient(tIndex, iIndex, 'name', e.target.value)}
                              placeholder="Nome do ingrediente"
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                            <input
                              type="text"
                              value={ing.quantity}
                              onChange={(e) => updateIngredient(tIndex, iIndex, 'quantity', e.target.value)}
                              placeholder="Quantidade (kg/g)"
                              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
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
                  <span>Criar Experimento</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

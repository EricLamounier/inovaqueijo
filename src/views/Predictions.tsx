import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, DollarSign, Target, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Experiment = {
  id: string;
  name: string;
  objective: string;
};

type Prediction = {
  id: string;
  experiment_id: string;
  recommended_ingredients: any;
  predicted_scores: any;
  confidence_level: number;
  reasoning: string;
  created_at: string;
};

export function Predictions() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<string>('');
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExperiments();
  }, []);

  const loadExperiments = async () => {
    try {
      const { data } = await supabase
        .from('experiments')
        .select('id, name, objective')
        .eq('status', 'planning')
        .order('created_at', { ascending: false });

      if (data) setExperiments(data);
    } catch (error) {
      console.error('Error loading experiments:', error);
    }
  };

  const generatePrediction = async () => {
    if (!selectedExperiment) return;

    setLoading(true);
    try {
      const mockPrediction = {
        experiment_id: selectedExperiment,
        recommended_ingredients: {
          primary: [
            { name: 'Estabilizante Z', quantity: '0.5 kg', cost: 15.0 },
            { name: 'Coalho Microbiano Premium', quantity: '0.2 kg', cost: 28.5 },
            { name: 'Fermento Lático L-450', quantity: '0.3 kg', cost: 12.0 },
          ],
          alternatives: [
            { name: 'Cloreto de Cálcio', quantity: '0.1 kg', cost: 8.5 },
          ],
        },
        predicted_scores: {
          flavor: 4.5,
          texture: 4.3,
          aroma: 4.2,
          overall: 4.4,
        },
        confidence_level: 87,
        reasoning: 'Com base em 45 experimentos similares, esta combinação tem alta probabilidade de alcançar os objetivos. O Estabilizante Z demonstrou excelente desempenho em produtos com baixo teor de sódio, mantendo a elasticidade desejada. O Coalho Microbiano Premium garante consistência no processo de coagulação.',
      };

      const { data, error } = await supabase
        .from('ai_predictions')
        .insert(mockPrediction)
        .select()
        .single();

      if (error) throw error;
      if (data) setPrediction(data);
    } catch (error) {
      console.error('Error generating prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Predições IA</h1>
        <p className="text-gray-600 mt-1">Recomendações inteligentes para otimização de fórmulas</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start space-x-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Sparkles size={20} className="text-purple-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Gerador de Recomendações</h2>
            <p className="text-sm text-gray-600">
              Selecione um experimento em planejamento para receber sugestões otimizadas pela IA
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecione o Experimento
            </label>
            <select
              value={selectedExperiment}
              onChange={(e) => setSelectedExperiment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="">Escolha um experimento...</option>
              {experiments.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  {exp.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={generatePrediction}
              disabled={!selectedExperiment || loading}
              className="w-full inline-flex items-center justify-center space-x-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Gerando...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Gerar Predição</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {prediction && (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Nível de Confiança da IA</h3>
              <div className="flex items-center space-x-2">
                <div className="text-3xl font-bold text-purple-600">{prediction.confidence_level}%</div>
                <Target size={24} className="text-purple-600" />
              </div>
            </div>
            <div className="w-full bg-white rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-blue-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${prediction.confidence_level}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp size={20} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Notas Previstas</h3>
              </div>

              <div className="space-y-3">
                {Object.entries(prediction.predicted_scores).map(([key, value]) => {
                  const labels: Record<string, string> = {
                    flavor: 'Sabor',
                    texture: 'Textura',
                    aroma: 'Aroma',
                    overall: 'Geral',
                  };

                  return (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{labels[key]}</span>
                        <span className="font-semibold text-gray-900">{value} / 5.0</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${((value as number) / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <DollarSign size={20} className="text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Ingredientes Recomendados</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Principais</h4>
                  {prediction.recommended_ingredients.primary.map((ing: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{ing.name}</p>
                        <p className="text-xs text-gray-500">{ing.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-green-600">
                        R$ {ing.cost.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {prediction.recommended_ingredients.alternatives && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Alternativos</h4>
                    {prediction.recommended_ingredients.alternatives.map((ing: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{ing.name}</p>
                          <p className="text-xs text-gray-500">{ing.quantity}</p>
                        </div>
                        <span className="text-sm font-semibold text-green-600">
                          R$ {ing.cost.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start space-x-3">
              <AlertCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Análise da IA</h3>
                <p className="text-sm text-blue-800 leading-relaxed">{prediction.reasoning}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Award, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Experiment = {
  id: string;
  name: string;
};

type Treatment = {
  id: string;
  name: string;
  total_cost: number;
};

type SensoryData = {
  treatment_name: string;
  avg_flavor: number;
  avg_texture: number;
  avg_aroma: number;
  avg_overall: number;
  std_dev: number;
  evaluations_count: number;
};

export function Analysis() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [selectedExperiment, setSelectedExperiment] = useState<string>('');
  const [analysisData, setAnalysisData] = useState<SensoryData[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExperiments();
  }, []);

  const loadExperiments = async () => {
    try {
      const { data } = await supabase
        .from('experiments')
        .select('id, name')
        .in('status', ['completed', 'validated'])
        .order('created_at', { ascending: false });

      if (data) setExperiments(data);
    } catch (error) {
      console.error('Error loading experiments:', error);
    }
  };

  const loadAnalysis = async () => {
    if (!selectedExperiment) return;

    setLoading(true);
    try {
      const { data: treatmentsData } = await supabase
        .from('treatments')
        .select('id, name, total_cost')
        .eq('experiment_id', selectedExperiment);

      if (treatmentsData) {
        setTreatments(treatmentsData);

        const mockAnalysis: SensoryData[] = treatmentsData.map((t, idx) => ({
          treatment_name: t.name,
          avg_flavor: 3.8 + idx * 0.3,
          avg_texture: 4.0 + idx * 0.2,
          avg_aroma: 3.9 + idx * 0.25,
          avg_overall: 3.9 + idx * 0.25,
          std_dev: 0.4 - idx * 0.05,
          evaluations_count: 8 + idx * 2,
        }));

        setAnalysisData(mockAnalysis);
      }
    } catch (error) {
      console.error('Error loading analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedExperiment) {
      loadAnalysis();
    }
  }, [selectedExperiment]);

  const bestTreatment = analysisData.length > 0
    ? analysisData.reduce((prev, current) => (prev.avg_overall > current.avg_overall ? prev : current))
    : null;

  const getBarWidth = (value: number, max: number = 5) => {
    return `${(value / max) * 100}%`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Análises</h1>
        <p className="text-gray-600 mt-1">Compare resultados e tome decisões baseadas em dados</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <BarChart3 size={20} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Análise Comparativa</h2>
            <p className="text-sm text-gray-600">
              Selecione um experimento concluído para visualizar os resultados estatísticos
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Selecione o Experimento
          </label>
          <select
            value={selectedExperiment}
            onChange={(e) => setSelectedExperiment(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Escolha um experimento...</option>
            {experiments.map((exp) => (
              <option key={exp.id} value={exp.id}>
                {exp.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {!loading && analysisData.length > 0 && (
        <>
          {bestTreatment && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-green-900 mb-1">
                    Tratamento Vencedor: {bestTreatment.treatment_name}
                  </h3>
                  <p className="text-sm text-green-700">
                    Nota geral média: <span className="font-bold">{bestTreatment.avg_overall.toFixed(2)}</span> / 5.0
                    {' '}com <span className="font-bold">{bestTreatment.evaluations_count}</span> avaliações
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Desvio padrão: <span className="font-bold">{bestTreatment.std_dev.toFixed(2)}</span>
                    {' '}(consistência {bestTreatment.std_dev < 0.5 ? 'excelente' : 'boa'})
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp size={20} className="text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Comparação de Notas Sensoriais</h3>
              </div>

              <div className="space-y-6">
                {['avg_flavor', 'avg_texture', 'avg_aroma', 'avg_overall'].map((metric) => {
                  const labels: Record<string, string> = {
                    avg_flavor: 'Sabor',
                    avg_texture: 'Textura',
                    avg_aroma: 'Aroma',
                    avg_overall: 'Geral',
                  };

                  return (
                    <div key={metric}>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">{labels[metric]}</h4>
                      <div className="space-y-2">
                        {analysisData.map((data, idx) => (
                          <div key={idx}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="text-gray-600">{data.treatment_name}</span>
                              <span className="font-semibold text-gray-900">
                                {data[metric as keyof SensoryData].toFixed(2)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className={`h-2.5 rounded-full ${
                                  idx === 0 ? 'bg-blue-600' : idx === 1 ? 'bg-green-600' : 'bg-purple-600'
                                }`}
                                style={{ width: getBarWidth(data[metric as keyof SensoryData] as number) }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <DollarSign size={20} className="text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Análise de Custo</h3>
                </div>

                <div className="space-y-3">
                  {treatments.map((treatment, idx) => {
                    const sensoryData = analysisData[idx];
                    const roi = sensoryData ? (sensoryData.avg_overall / treatment.total_cost) * 100 : 0;

                    return (
                      <div key={treatment.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{treatment.name}</h4>
                          <span className="text-lg font-bold text-green-600">
                            R$ {treatment.total_cost.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">ROI (Nota/Custo)</span>
                          <span className="font-semibold text-gray-900">{roi.toFixed(2)}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Consistência das Avaliações</h3>

                <div className="space-y-3">
                  {analysisData.map((data, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{data.treatment_name}</p>
                        <p className="text-xs text-gray-500">{data.evaluations_count} avaliações</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">σ = {data.std_dev.toFixed(2)}</p>
                        <p className={`text-xs ${data.std_dev < 0.5 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {data.std_dev < 0.5 ? 'Excelente' : 'Boa'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">σ (sigma)</span> representa o desvio padrão.
                    Valores menores indicam maior consistência entre os avaliadores.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

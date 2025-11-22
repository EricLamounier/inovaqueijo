import { useEffect, useState } from 'react';
import { FlaskConical, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Stats = {
  total: number;
  inProgress: number;
  completed: number;
  avgScore: number;
};

type RecentExperiment = {
  id: string;
  name: string;
  status: string;
  created_at: string;
  objective: string;
};

export function Dashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, inProgress: 0, completed: 0, avgScore: 0 });
  const [recentExperiments, setRecentExperiments] = useState<RecentExperiment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: experiments } = await supabase
        .from('experiments')
        .select('*')
        .order('created_at', { ascending: false });

      if (experiments) {
        const total = experiments.length;
        const inProgress = experiments.filter(e => e.status === 'in_progress').length;
        const completed = experiments.filter(e => e.status === 'completed').length;

        setStats({ total, inProgress, completed, avgScore: 4.2 });
        setRecentExperiments(experiments.slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Total de Experimentos', value: stats.total, icon: FlaskConical, color: 'blue' },
    { label: 'Em Andamento', value: stats.inProgress, icon: Clock, color: 'yellow' },
    { label: 'Concluídos', value: stats.completed, icon: CheckCircle2, color: 'green' },
    { label: 'Nota Média', value: stats.avgScore.toFixed(1), icon: TrendingUp, color: 'purple' },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      planning: 'bg-gray-100 text-gray-700',
      in_progress: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-green-100 text-green-700',
      validated: 'bg-blue-100 text-blue-700',
    };

    const labels = {
      planning: 'Planejamento',
      in_progress: 'Em Andamento',
      completed: 'Concluído',
      validated: 'Validado',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles] || styles.planning}`}>
        {labels[status as keyof typeof labels] || status}
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
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral dos experimentos de inovação em queijos</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'bg-blue-100 text-blue-600',
            yellow: 'bg-yellow-100 text-yellow-600',
            green: 'bg-green-100 text-green-600',
            purple: 'bg-purple-100 text-purple-600',
          };

          return (
            <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[stat.color as keyof typeof colorClasses]}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Experimentos Recentes</h2>
        </div>

        {recentExperiments.length === 0 ? (
          <div className="p-8 text-center">
            <FlaskConical size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Nenhum experimento cadastrado ainda</p>
            <p className="text-sm text-gray-400 mt-1">Crie seu primeiro experimento para começar</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Objetivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentExperiments.map((exp) => (
                  <tr key={exp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{exp.name}</div>
                    </td>
                    <td className="hidden md:table-cell px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">{exp.objective}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(exp.status)}
                    </td>
                    <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(exp.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

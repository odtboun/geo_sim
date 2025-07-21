'use client';

import { useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { type GeothermalResults } from '@/lib/geothermal-calculations';
import ScientificTables from './ScientificTables';
import { ChartBarIcon, TableCellsIcon } from '@heroicons/react/24/solid';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface ResultsDashboardProps {
  results: GeothermalResults;
}

export default function ResultsDashboard({ results }: ResultsDashboardProps) {
  const [activeTab, setActiveTab] = useState<'charts' | 'tables'>('charts');

  // Prepare histogram data
  const createHistogram = () => {
    const data = results.monteCarloResults;
    const bins = 20;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binWidth = (max - min) / bins;
    
    const histogram = new Array(bins).fill(0);
    const binLabels = [];
    
    for (let i = 0; i < bins; i++) {
      const binStart = min + i * binWidth;
      binLabels.push(`${binStart.toFixed(1)}`);
    }
    
    data.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binWidth), bins - 1);
      histogram[binIndex]++;
    });
    
    return {
      labels: binLabels,
      datasets: [{
        label: 'Frequency',
        data: histogram,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      }]
    };
  };

  // Prepare percentile data
  const percentileData = {
    labels: ['P5', 'P10', 'P25', 'P50', 'P75', 'P90', 'P95'],
    datasets: [{
      label: 'Power Generation (MW)',
      data: [
        results.statistics.percentiles.p5,
        results.statistics.percentiles.p10,
        results.statistics.percentiles.p25,
        results.statistics.percentiles.p50,
        results.statistics.percentiles.p75,
        results.statistics.percentiles.p90,
        results.statistics.percentiles.p95
      ],
      backgroundColor: [
        'rgba(239, 68, 68, 0.6)',   // P5 - red
        'rgba(245, 158, 11, 0.6)',  // P10 - amber
        'rgba(251, 191, 36, 0.6)',  // P25 - yellow
        'rgba(34, 197, 94, 0.6)',   // P50 - green
        'rgba(251, 191, 36, 0.6)',  // P75 - yellow
        'rgba(245, 158, 11, 0.6)',  // P90 - amber
        'rgba(239, 68, 68, 0.6)'    // P95 - red
      ],
      borderColor: [
        'rgba(239, 68, 68, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(251, 191, 36, 1)',
        'rgba(34, 197, 94, 1)',
        'rgba(251, 191, 36, 1)',
        'rgba(245, 158, 11, 1)',
        'rgba(239, 68, 68, 1)'
      ],
      borderWidth: 2
    }]
  };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'white'
        }
      },
      title: {
        display: true,
        text: 'Monte Carlo Results Distribution',
        color: 'white'
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white'
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  };

  const percentileOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Risk Assessment - Percentile Analysis',
        color: 'white'
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        callbacks: {
          label: (context) => `${context.parsed.y.toFixed(1)} MW`
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        ticks: {
          color: 'rgba(255, 255, 255, 0.7)',
          callback: (value) => `${value} MW`
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  };

  const formatCurrency = (amount: number): string => {
    if (amount >= 1e9) return `$${(amount / 1e9).toFixed(1)}B`;
    if (amount >= 1e6) return `$${(amount / 1e6).toFixed(0)}M`;
    if (amount >= 1e3) return `$${(amount / 1e3).toFixed(0)}K`;
    return `$${amount.toFixed(0)}`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(0)}K`;
    return num.toFixed(0);
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-2">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('charts')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'charts'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-blue-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <ChartBarIcon className="h-5 w-5" />
            <span>Executive Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeTab === 'tables'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-blue-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <TableCellsIcon className="h-5 w-5" />
            <span>Scientific Data Tables</span>
          </button>
        </div>
      </div>

      {activeTab === 'charts' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
          <div className="text-2xl font-bold text-blue-400">
            {results.baseCase.powerMWe.toFixed(1)} MW
          </div>
          <div className="text-sm text-blue-200">Base Case</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
          <div className="text-2xl font-bold text-green-400">
            {results.statistics.percentiles.p50.toFixed(1)} MW
          </div>
          <div className="text-sm text-green-200">P50 (Probable)</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
          <div className="text-2xl font-bold text-orange-400">
            {results.statistics.percentiles.p10.toFixed(1)} MW
          </div>
          <div className="text-sm text-orange-200">P10 (Conservative)</div>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4">
          <div className="text-2xl font-bold text-purple-400">
            {(results.statistics.std / results.statistics.mean * 100).toFixed(0)}%
          </div>
          <div className="text-sm text-purple-200">Uncertainty</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Histogram */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
          <div className="h-64">
            <Bar data={createHistogram()} options={chartOptions} />
          </div>
        </div>

        {/* Percentile Chart */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
          <div className="h-64">
            <Bar data={percentileData} options={percentileOptions} />
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Technical Results */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Technical Analysis</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Mean Power Output:</span>
              <span className="text-white font-semibold">{results.statistics.mean.toFixed(1)} MW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Standard Deviation:</span>
              <span className="text-white font-semibold">{results.statistics.std.toFixed(1)} MW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Minimum:</span>
              <span className="text-white font-semibold">{results.statistics.min.toFixed(1)} MW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Maximum:</span>
              <span className="text-white font-semibold">{results.statistics.max.toFixed(1)} MW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Coefficient of Variation:</span>
              <span className="text-white font-semibold">{(results.statistics.std / results.statistics.mean * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Economic Results */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Economic Analysis</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-300">Annual Generation:</span>
              <span className="text-white font-semibold">{formatNumber(results.economics.annualGeneration)} MWh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Annual Revenue:</span>
              <span className="text-green-400 font-semibold">{formatCurrency(results.economics.annualRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Lifetime Generation:</span>
              <span className="text-white font-semibold">{formatNumber(results.economics.lifetimeGeneration)} MWh</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Lifetime Revenue:</span>
              <span className="text-green-400 font-semibold">{formatCurrency(results.economics.lifetimeRevenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Price Assumption:</span>
              <span className="text-gray-400">$0.08/kWh</span>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Probability Analysis</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-black/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              {(results.statistics.probabilities.aboveBase * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-300">Above Base Case</div>
          </div>
          <div className="text-center p-3 bg-black/20 rounded-lg">
            <div className="text-2xl font-bold text-green-400 mb-1">
              {(results.statistics.probabilities.above10MW * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-300">Above 10 MW</div>
          </div>
          <div className="text-center p-3 bg-black/20 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400 mb-1">
              {(results.statistics.probabilities.above25MW * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-300">Above 25 MW</div>
          </div>
          <div className="text-center p-3 bg-black/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-400 mb-1">
              {(results.statistics.probabilities.above50MW * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-300">Above 50 MW</div>
          </div>
        </div>
      </div>
        </div>
      )}

      {activeTab === 'tables' && (
        <ScientificTables results={results} />
      )}
    </div>
  );
} 
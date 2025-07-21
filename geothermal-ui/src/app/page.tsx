'use client';

import { useState, useEffect } from 'react';
import { runMonteCarloSimulation, defaultParameters, type GeothermalInput, type GeothermalResults } from '@/lib/geothermal-calculations';
import ParameterForm from '@/components/ParameterForm';
import ResultsDashboard from '@/components/ResultsDashboard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FireIcon, ChartBarIcon } from '@heroicons/react/24/solid';

export default function Home() {
  const [parameters, setParameters] = useState<GeothermalInput>(defaultParameters);
  const [results, setResults] = useState<GeothermalResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const runSimulation = async () => {
    setIsCalculating(true);
    
    // Add a small delay to show loading state for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const simulationResults = runMonteCarloSimulation(parameters);
      setResults(simulationResults);
      setHasRun(true);
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  // Run initial calculation with default parameters
  useEffect(() => {
    if (!hasRun) {
      runSimulation();
    }
  }, [hasRun, runSimulation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-3">
            <FireIcon className="h-10 w-10 text-orange-400" />
            <div>
              <h1 className="text-3xl font-bold text-white">Geothermal Power Evaluation</h1>
              <p className="text-blue-200 mt-1">Executive Investment Analysis Platform</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Parameters Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <ChartBarIcon className="h-6 w-6 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">Project Parameters</h2>
              </div>
              
              <ParameterForm
                parameters={parameters}
                onParametersChange={setParameters}
                onRunSimulation={runSimulation}
                isCalculating={isCalculating}
              />
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {isCalculating ? (
              <LoadingSpinner />
            ) : results ? (
              <ResultsDashboard results={results} />
            ) : (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-12 text-center">
                <FireIcon className="h-16 w-16 text-orange-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Ready to Evaluate</h3>
                <p className="text-blue-200">
                                     Adjust parameters and click &quot;Run Evaluation&quot; to analyze geothermal potential.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Executive Summary */}
        {results && (
          <div className="mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Executive Summary</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Key Metrics */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-1">
                    {results.statistics.percentiles.p50.toFixed(1)} MW
                  </div>
                  <div className="text-sm text-blue-200">Most Likely Power</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-1">
                    ${(results.economics.lifetimeRevenue / 1e6).toFixed(0)}M
                  </div>
                  <div className="text-sm text-green-200">Lifetime Revenue</div>
                </div>
                
                <div className="text-center">
                                     <div className="text-3xl font-bold text-orange-400 mb-1">
                     {(results.statistics.probabilities.above50MW * 100).toFixed(0)}%
                   </div>
                   <div className="text-sm text-orange-200">Probability &gt; 50 MW</div>
                </div>
                
                <div className="text-center">
                  <div className={`text-3xl font-bold mb-1 ${
                    results.executive.color === 'green' ? 'text-green-400' :
                    results.executive.color === 'yellow' ? 'text-yellow-400' :
                    results.executive.color === 'orange' ? 'text-orange-400' : 'text-red-400'
                  }`}>
                    {results.executive.confidence}
                  </div>
                  <div className="text-sm text-gray-200">Confidence Level</div>
                </div>
              </div>
              
              {/* Recommendation */}
              <div className="mt-8 p-6 bg-black/20 rounded-lg border border-white/10">
                <div className="flex items-start space-x-4">
                  <div className={`w-4 h-4 rounded-full mt-1 ${
                    results.executive.color === 'green' ? 'bg-green-400' :
                    results.executive.color === 'yellow' ? 'bg-yellow-400' :
                    results.executive.color === 'orange' ? 'bg-orange-400' : 'bg-red-400'
                  }`}></div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Investment Recommendation
                    </h3>
                    <p className="text-gray-200 text-lg">
                      {results.executive.recommendation}
                    </p>
                    <p className="text-sm text-gray-300 mt-2">
                      Based on P10 conservative estimate of {results.statistics.percentiles.p10.toFixed(1)} MW
                      and {results.executive.confidence.toLowerCase()} confidence analysis.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-blue-200 text-sm">
          <p>
            Professional geothermal power evaluation using volumetric method for liquid-dominated reservoirs.
          </p>
          <p className="mt-1">
            Based on scientific methodology by Pocasangre & Fujimitsu (2018).
          </p>
        </div>
      </div>
    </div>
  );
}

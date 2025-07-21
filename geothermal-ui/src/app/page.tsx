'use client';

import { useState, useEffect, useCallback } from 'react';
// Import original UI types and scientific adapter
import { defaultParameters, type GeothermalInput, type GeothermalResults } from '@/lib/geothermal-calculations';
import { runScientificSimulationWithBasicInput } from '@/lib/scientific-adapter';
import ParameterForm from '@/components/ParameterForm';
import ResultsDashboard from '@/components/ResultsDashboard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Settings, TrendingUp, Building2 } from 'lucide-react';

export default function Home() {
  const [parameters, setParameters] = useState<GeothermalInput>(defaultParameters);
  const [results, setResults] = useState<GeothermalResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const runSimulation = useCallback(async () => {
    setIsCalculating(true);
    
    // Add a small delay to show loading state for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const simulationResults = runScientificSimulationWithBasicInput(parameters);
      setResults(simulationResults);
      setHasRun(true);
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [parameters]);

  // Run initial calculation with default parameters
  useEffect(() => {
    if (!hasRun) {
      runSimulation();
    }
  }, [hasRun, runSimulation]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Professional Corporate Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-gray-900 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Geothermal Power Assessment</h1>
                <p className="text-gray-600 mt-1">Professional Investment Analysis Platform</p>
              </div>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              <Building2 className="h-3 w-3 mr-1" />
              Enterprise Edition
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Parameters Panel */}
          <div className="lg:col-span-1">
            <Card className="h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <span>Project Parameters</span>
                </CardTitle>
                <CardDescription>
                  Configure reservoir and plant characteristics for analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ParameterForm
                  parameters={parameters}
                  onParametersChange={setParameters}
                  onRunSimulation={runSimulation}
                  isCalculating={isCalculating}
                />
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            {isCalculating ? (
              <LoadingSpinner />
            ) : results ? (
              <ResultsDashboard results={results} />
            ) : (
              <Card className="p-12 text-center">
                <CardContent className="pt-6">
                  <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready for Analysis</h3>
                  <p className="text-gray-600">
                    Configure project parameters and run evaluation to generate comprehensive geothermal assessment.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Executive Summary */}
        {results && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900">Executive Summary</CardTitle>
                <CardDescription>
                  Key performance indicators and investment metrics for decision making
                </CardDescription>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>
        )}

        {/* Professional Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm border-t border-gray-200 pt-8">
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

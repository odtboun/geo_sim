'use client';

import { useState, useEffect, useCallback } from 'react';
import { defaultParameters, type GeothermalInput, type GeothermalResults } from '@/lib/geothermal-calculations';
import { runScientificSimulationWithBasicInput } from '@/lib/scientific-adapter';
import ParameterForm from '@/components/ParameterForm';
import ResultsDashboard from '@/components/ResultsDashboard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarHeader, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { BarChart3, Settings, TrendingUp, Building2, DollarSign, Zap, AlertTriangle, CheckCircle, Calculator, Play } from 'lucide-react';

export default function Home() {
  const [parameters, setParameters] = useState<GeothermalInput>(defaultParameters);
  const [results, setResults] = useState<GeothermalResults | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const runSimulation = useCallback(async () => {
    setIsCalculating(true);
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

  useEffect(() => {
    if (!hasRun) {
      runSimulation();
    }
  }, [hasRun, runSimulation]);

  const getRecommendationIcon = (color: string) => {
    switch (color) {
      case 'green': return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'yellow': return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case 'orange': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      default: return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
  };

  const getRecommendationColor = (color: string) => {
    switch (color) {
      case 'green': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'yellow': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'orange': return 'text-orange-700 bg-orange-50 border-orange-200';
      default: return 'text-red-700 bg-red-50 border-red-200';
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        {/* Professional Sidebar */}
        <Sidebar className="border-r border-gray-200">
          <SidebarHeader className="border-b border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-slate-900 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Geothermal Assessment</h1>
                <p className="text-sm text-gray-600">Professional Analysis</p>
              </div>
            </div>
            <Badge variant="secondary" className="mt-3 w-fit px-2 py-1">
              <Building2 className="h-3 w-3 mr-1" />
              Enterprise
            </Badge>
          </SidebarHeader>
          
          <SidebarContent className="p-6">
            {/* PRIMARY ACTION - RUN BUTTON AT TOP */}
            <div className="pb-4 mb-6 border-b border-gray-200">
              <Button
                onClick={runSimulation}
                disabled={isCalculating}
                className="w-full py-3 text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-lg"
                size="sm"
              >
                {isCalculating ? (
                  <>
                    <Calculator className="h-4 w-4 mr-2 animate-spin" />
                    Running Analysis...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Simulation
                  </>
                )}
              </Button>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-4">
                <Settings className="h-5 w-5 text-gray-700" />
                <h2 className="text-lg font-semibold text-gray-900">Project Parameters</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Configure reservoir and plant characteristics for comprehensive analysis
              </p>
            </div>
            
            <ParameterForm
              parameters={parameters}
              onParametersChange={setParameters}
            />
          </SidebarContent>
        </Sidebar>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <SidebarTrigger />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">Geothermal Power Assessment</h1>
                  <p className="text-gray-600">Professional Investment Analysis Platform</p>
                </div>
              </div>
              
              {/* Editable Price - Top Right */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">$</span>
                <input
                  type="number"
                  step="0.001"
                  value={parameters.powerPlant.electricityPrice.toFixed(3)}
                  onChange={(e) => {
                    const newParams = { ...parameters };
                    newParams.powerPlant.electricityPrice = parseFloat(e.target.value) || 0.08;
                    setParameters(newParams);
                  }}
                  className="w-16 text-right text-sm font-semibold text-gray-900 bg-transparent border-none outline-none focus:bg-gray-50 rounded px-1"
                />
                <span className="text-sm text-gray-500">/kWh</span>
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 space-y-6 overflow-auto">
            {/* COMPACT Executive Summary - INVESTMENT RECOMMENDATION FIRST */}
            {results && (
              <Card className="border-l-4 border-l-slate-900">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-gray-900 flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-slate-700" />
                        <span>Executive Summary</span>
                      </CardTitle>
                      <CardDescription className="text-gray-600 text-sm">
                        Critical investment metrics for decision making
                      </CardDescription>
                    </div>
                    <Badge variant={results.executive.color === 'green' ? 'default' : 'secondary'} className="px-2 py-1 text-xs">
                      {results.executive.riskLevel.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* COMPACT STACKED LAYOUT: Recommendation Banner + Metrics Grid */}
                  
                                     {/* TOP: Investment Recommendation Banner (Ultra Compact) */}
                   <Card className={`border ${getRecommendationColor(results.executive.color)}`}>
                     <CardContent className="px-3 py-2">
                       <div className="flex items-center space-x-3">
                         {getRecommendationIcon(results.executive.color)}
                         <div className="flex-1 min-w-0">
                           <div className="flex items-baseline space-x-2 mb-1">
                             <h3 className="text-sm font-bold">Investment Recommendation:</h3>
                             <span className="text-sm font-medium">{results.executive.recommendation}</span>
                           </div>
                           <p className="text-xs opacity-90 leading-tight">
                             Conservative P10: {results.statistics.percentiles.p10.toFixed(1)} MW • 
                             Confidence: {results.executive.confidence} • 
                             Risk: {results.executive.riskLevel.replace('_', ' ')}
                           </p>
                         </div>
                       </div>
                     </CardContent>
                   </Card>

                  {/* BOTTOM: Key Metrics in Responsive Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                         <Card className="border-slate-200">
                       <CardContent className="px-2 py-2 text-center">
                         <div className="flex items-center justify-center mb-1">
                           <Zap className="h-3 w-3 text-slate-600" />
                         </div>
                         <div className="text-base font-bold text-slate-900">
                           {results.statistics.percentiles.p50.toFixed(1)} MW
                         </div>
                         <div className="text-xs text-slate-600">Expected (P50)</div>
                       </CardContent>
                     </Card>

                     <Card className="border-emerald-200">
                       <CardContent className="px-2 py-2 text-center">
                         <div className="flex items-center justify-center mb-1">
                           <DollarSign className="h-3 w-3 text-emerald-600" />
                         </div>
                         <div className="text-base font-bold text-emerald-900">
                           ${(results.economics.lifetimeRevenue / 1e6).toFixed(0)}M
                         </div>
                         <div className="text-xs text-emerald-700">Revenue ({results.input.powerPlant.lifespan}yr)</div>
                       </CardContent>
                     </Card>

                     <Card className="border-blue-200">
                       <CardContent className="px-2 py-2 text-center">
                         <div className="flex items-center justify-center mb-1">
                           <BarChart3 className="h-3 w-3 text-blue-600" />
                         </div>
                         <div className="text-base font-bold text-blue-900">
                           {results.statistics.percentiles.p10.toFixed(1)} MW
                         </div>
                         <div className="text-xs text-blue-700">Conservative (P10)</div>
                       </CardContent>
                     </Card>

                     <Card className="border-amber-200">
                       <CardContent className="px-2 py-2 text-center">
                         <div className="flex items-center justify-center mb-1">
                           <TrendingUp className="h-3 w-3 text-amber-600" />
                         </div>
                         <div className="text-base font-bold text-amber-900">
                           {results.executive.confidence}
                         </div>
                         <div className="text-xs text-amber-700">Confidence Level</div>
                       </CardContent>
                     </Card>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analysis Dashboard */}
            {isCalculating ? (
              <LoadingSpinner />
            ) : results ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl text-gray-900 flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-gray-700" />
                    <span>Detailed Analysis & Charts</span>
                  </CardTitle>
                  <CardDescription>
                    Comprehensive technical analysis with Monte Carlo simulation results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResultsDashboard results={results} />
                </CardContent>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <CardContent className="pt-6">
                  <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready for Analysis</h3>
                  <p className="text-gray-600">
                    Configure project parameters in the sidebar and run evaluation to generate comprehensive assessment.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Professional Footer */}
            <div className="text-center text-gray-500 text-sm border-t border-gray-200 pt-6">
              <p className="font-medium">
                Professional geothermal power evaluation using volumetric method for liquid-dominated reservoirs
              </p>
              <p className="mt-1">
                Based on peer-reviewed methodology by Pocasangre & Fujimitsu (2018) • Enterprise-grade Monte Carlo analysis
              </p>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

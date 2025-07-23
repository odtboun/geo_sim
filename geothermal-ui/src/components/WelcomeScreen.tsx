import React from 'react';
import { type GeothermalInput } from '@/lib/geothermal-calculations';
import ParameterForm from './ParameterForm';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Calculator, ExternalLink } from 'lucide-react';

interface WelcomeScreenProps {
  parameters: GeothermalInput;
  onParametersChange: (parameters: GeothermalInput) => void;
  onRunSimulation: () => void;
  isCalculating: boolean;
}

export default function WelcomeScreen({ parameters, onParametersChange, onRunSimulation, isCalculating }: WelcomeScreenProps) {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex flex-col">
        {/* Header with price input */}
        <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
          <div className="flex flex-col space-y-3 md:space-y-0 md:flex-row md:items-center md:justify-between max-w-7xl mx-auto">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Geothermal Power Assessment</h1>
              <p className="text-base md:text-lg text-gray-600">Analysis with Monte Carlo Simulation</p>
            </div>
            {/* Price input */}
            <div className="flex items-center space-x-2 md:flex-shrink-0">
              <span className="text-sm text-gray-500 hidden sm:inline">Electricity Price Assumption:</span>
              <span className="text-sm text-gray-500 sm:hidden">Price:</span>
              <span className="text-sm text-gray-500">$</span>
              <input
                type="number"
                step="0.001"
                value={parameters.powerPlant.electricityPrice}
                onChange={(e) => {
                  const newParams = { ...parameters };
                  newParams.powerPlant.electricityPrice = parseFloat(e.target.value) || 0.08;
                  onParametersChange(newParams);
                }}
                className="w-20 text-right text-sm font-semibold text-gray-900 bg-white border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <span className="text-sm text-gray-500">/kWh</span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* ParameterForm: all parameters, full screen */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Project Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                <ParameterForm
                  parameters={parameters}
                  onParametersChange={onParametersChange}
                />
              </CardContent>
            </Card>

            {/* Run button */}
            <div className="text-center pt-4">
              <Button 
                onClick={onRunSimulation}
                disabled={isCalculating}
                size="lg"
                className="px-8 py-6 text-lg"
              >
                {isCalculating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Running Simulation...
                  </>
                ) : (
                  <>
                    <Calculator className="h-5 w-5 mr-3" />
                    Run Geothermal Assessment
                  </>
                )}
              </Button>
            </div>

            {/* Academic reference */}
            <div className="text-center pt-8 border-t border-gray-200">
              <p className="text-gray-600">
                Based on peer-reviewed methodology by {' '}
                <a 
                  href="https://doi.org/10.1016/J.GEOTHERMICS.2018.07.009" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center space-x-1 hover:underline"
                >
                  <span>Pocasangre & Fujimitsu (2018)</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
} 
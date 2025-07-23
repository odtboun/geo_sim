import React from 'react';
import { type GeothermalInput } from '@/lib/geothermal-calculations';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Calculator, ExternalLink, Info } from 'lucide-react';

interface WelcomeScreenProps {
  parameters: GeothermalInput;
  onParametersChange: (parameters: GeothermalInput) => void;
  onRunSimulation: () => void;
  isCalculating: boolean;
}

// Info icon with tooltip/popover (reuse from ParameterForm if available)
function InfoHelp({ children, title }: { children: React.ReactNode; title: string }) {
  // Simple always-tooltip for brevity; can be replaced with mobile-friendly popover if needed
  return (
    <span className="ml-2 align-middle">
      <span className="group relative inline-block">
        <Info className="h-4 w-4 text-gray-400 group-hover:text-gray-700 cursor-pointer" />
        <span className="absolute z-10 hidden group-hover:block bg-white border border-gray-200 rounded shadow-lg p-3 text-xs text-gray-700 w-64 left-1/2 -translate-x-1/2 mt-2">
          <span className="font-semibold block mb-1">{title}</span>
          {children}
        </span>
      </span>
    </span>
  );
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
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Run button above all cards */}
            <div className="flex justify-center pb-4">
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

            {/* Responsive two-column layout */}
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Left: Reservoir Properties */}
              <div className="flex-1 min-w-0">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-semibold text-gray-900">Reservoir Properties</CardTitle>
                    <InfoHelp title="Reservoir Parameters">
                      <ul className="space-y-1">
                        <li><strong>Area:</strong> Size of the geothermal reservoir</li>
                        <li><strong>Thickness:</strong> Depth of the productive zone</li>
                        <li><strong>Porosity:</strong> Rock void space (0-1 scale)</li>
                        <li><strong>Temperature:</strong> Initial reservoir temperature</li>
                        <li><strong>Abandon Temp:</strong> Minimum viable temperature</li>
                        <li><strong>Rock/Fluid Density & Heat Cap.:</strong> Thermophysical properties</li>
                      </ul>
                    </InfoHelp>
                  </CardHeader>
                  <CardContent>
                    {/* Reservoir fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Area (km²)</label>
                        <input type="number" step="0.1" value={parameters.reservoir.area} onChange={e => onParametersChange({ ...parameters, reservoir: { ...parameters.reservoir, area: parseFloat(e.target.value) || 0 } })} className="w-full border rounded px-2 py-1" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Thickness (m)</label>
                        <input type="number" step="1" value={parameters.reservoir.thickness} onChange={e => onParametersChange({ ...parameters, reservoir: { ...parameters.reservoir, thickness: parseFloat(e.target.value) || 0 } })} className="w-full border rounded px-2 py-1" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Temp (°C)</label>
                        <input type="number" step="1" value={parameters.reservoir.reservoirTemp} onChange={e => onParametersChange({ ...parameters, reservoir: { ...parameters.reservoir, reservoirTemp: parseFloat(e.target.value) || 0 } })} className="w-full border rounded px-2 py-1" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Abandon (°C)</label>
                        <input type="number" step="1" value={parameters.reservoir.abandonTemp} onChange={e => onParametersChange({ ...parameters, reservoir: { ...parameters.reservoir, abandonTemp: parseFloat(e.target.value) || 0 } })} className="w-full border rounded px-2 py-1" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Porosity (0-1)</label>
                        <input type="number" step="0.01" value={parameters.reservoir.porosity} onChange={e => onParametersChange({ ...parameters, reservoir: { ...parameters.reservoir, porosity: parseFloat(e.target.value) || 0 } })} className="w-full border rounded px-2 py-1" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Rock Density</label>
                        <input type="number" step="1" value={parameters.thermodynamic.rockDensity} onChange={e => onParametersChange({ ...parameters, thermodynamic: { ...parameters.thermodynamic, rockDensity: parseFloat(e.target.value) || 0 } })} className="w-full border rounded px-2 py-1" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Fluid Density</label>
                        <input type="number" step="0.1" value={parameters.thermodynamic.fluidDensity} onChange={e => onParametersChange({ ...parameters, thermodynamic: { ...parameters.thermodynamic, fluidDensity: parseFloat(e.target.value) || 0 } })} className="w-full border rounded px-2 py-1" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Rock Heat Cap.</label>
                        <input type="number" step="0.01" value={parameters.thermodynamic.rockSpecificHeat} onChange={e => onParametersChange({ ...parameters, thermodynamic: { ...parameters.thermodynamic, rockSpecificHeat: parseFloat(e.target.value) || 0 } })} className="w-full border rounded px-2 py-1" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Fluid Heat Cap.</label>
                        <input type="number" step="0.01" value={parameters.thermodynamic.fluidSpecificHeat} onChange={e => onParametersChange({ ...parameters, thermodynamic: { ...parameters.thermodynamic, fluidSpecificHeat: parseFloat(e.target.value) || 0 } })} className="w-full border rounded px-2 py-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right: Power Plant (top), Simulation (bottom) */}
              <div className="flex flex-col gap-6 flex-1 min-w-0">
                {/* Power Plant */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-semibold text-gray-900">Power Plant</CardTitle>
                    <InfoHelp title="Power Plant Parameters">
                      <ul className="space-y-1">
                        <li><strong>Recovery Factor:</strong> Energy extraction efficiency</li>
                        <li><strong>Conversion Efficiency:</strong> Heat to electricity conversion rate</li>
                        <li><strong>Plant Factor:</strong> Operational capacity factor (0-1)</li>
                        <li><strong>Lifespan:</strong> Project operational lifetime in years</li>
                      </ul>
                    </InfoHelp>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Recovery Factor</label>
                        <input type="number" step="0.01" value={parameters.powerPlant.recoveryFactor} onChange={e => onParametersChange({ ...parameters, powerPlant: { ...parameters.powerPlant, recoveryFactor: parseFloat(e.target.value) || 0 } })} className="w-full border rounded px-2 py-1" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Conversion Eff.</label>
                        <input type="number" step="0.001" value={parameters.powerPlant.conversionEfficiency} onChange={e => onParametersChange({ ...parameters, powerPlant: { ...parameters.powerPlant, conversionEfficiency: parseFloat(e.target.value) || 0 } })} className="w-full border rounded px-2 py-1" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Plant Factor</label>
                        <input type="number" step="0.01" value={parameters.powerPlant.plantCapacityFactor} onChange={e => onParametersChange({ ...parameters, powerPlant: { ...parameters.powerPlant, plantCapacityFactor: parseFloat(e.target.value) || 0 } })} className="w-full border rounded px-2 py-1" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Lifespan (years)</label>
                        <input type="number" step="1" value={parameters.powerPlant.lifespan} onChange={e => onParametersChange({ ...parameters, powerPlant: { ...parameters.powerPlant, lifespan: parseInt(e.target.value) || 0 } })} className="w-full border rounded px-2 py-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Simulation */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-lg font-semibold text-gray-900">Simulation</CardTitle>
                    <InfoHelp title="Simulation Parameters">
                      <ul className="space-y-1">
                        <li><strong>Monte Carlo Iterations:</strong> Number of simulation runs for uncertainty analysis (higher = more accurate but slower)</li>
                      </ul>
                    </InfoHelp>
                  </CardHeader>
                  <CardContent>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Monte Carlo Iterations</label>
                      <input type="number" step="100" value={parameters.simulation.iterations} onChange={e => onParametersChange({ ...parameters, simulation: { ...parameters.simulation, iterations: parseInt(e.target.value) || 0 } })} className="w-full border rounded px-2 py-1" />
                    </div>
                  </CardContent>
                </Card>
              </div>
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
import React from 'react';
import { type GeothermalInput } from '@/lib/geothermal-calculations';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { Calculator, Info, ExternalLink } from 'lucide-react';

interface WelcomeScreenProps {
  parameters: GeothermalInput;
  onParametersChange: (parameters: GeothermalInput) => void;
  onRunSimulation: () => void;
  isCalculating: boolean;
}

// Mobile-friendly info component (reused from ParameterForm)
function InfoHelp({ children, title }: { children: React.ReactNode; title: string }) {
  const isMobile = useIsMobile();

  const content = (
    <div className="text-sm">
      <p className="font-semibold mb-2">{title}:</p>
      {children}
    </div>
  );

  if (isMobile) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button className="p-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 active:bg-gray-200">
            <Info className="h-4 w-4 text-gray-500 hover:text-gray-700" />
          </button>
        </PopoverTrigger>
        <PopoverContent 
          side="top" 
          align="end"
          className="w-80 max-w-[calc(100vw-2rem)] mx-2"
          sideOffset={10}
        >
          {content}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <button className="p-1 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <Info className="h-4 w-4 text-gray-500 hover:text-gray-700" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

export default function WelcomeScreen({ parameters, onParametersChange, onRunSimulation, isCalculating }: WelcomeScreenProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateParameter = (section: string, field: string, value: any) => {
    const newParams = { ...parameters };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (newParams as any)[section][field] = value;
    onParametersChange(newParams);
  };

  const formatNumber = (value: number): string => {
    if (value === 0) return '0';
    if (value < 0.001) return value.toExponential(2);
    if (value < 0.1) return value.toFixed(4);
    if (value < 1) return value.toFixed(3);
    if (value < 100) return value.toFixed(2);
    return value.toFixed(0);
  };

  const parseNumber = (value: string): number => {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  };

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


            {/* Input sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Reservoir Properties */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <CardTitle className="flex-1">Reservoir Properties</CardTitle>
                                         <InfoHelp title="Reservoir Parameters">
                       <ul className="space-y-1">
                         <li><strong>Area:</strong> Size of the geothermal reservoir</li>
                         <li><strong>Thickness:</strong> Depth of the productive zone</li>
                         <li><strong>Porosity:</strong> Rock void space (0-1 scale)</li>
                         <li><strong>Temperature:</strong> Initial reservoir temperature</li>
                         <li><strong>Abandon Temp:</strong> Minimum viable temperature</li>
                         <li><strong>Rock Density:</strong> Density of reservoir rock</li>
                       </ul>
                     </InfoHelp>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="area">Area (km²)</Label>
                      <Input
                        id="area"
                        type="number"
                        step="0.1"
                        value={formatNumber(parameters.reservoir.area)}
                        onChange={(e) => updateParameter('reservoir', 'area', parseNumber(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="thickness">Thickness (m)</Label>
                      <Input
                        id="thickness"
                        type="number"
                        step="1"
                        value={formatNumber(parameters.reservoir.thickness)}
                        onChange={(e) => updateParameter('reservoir', 'thickness', parseNumber(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="porosity">Porosity</Label>
                      <Input
                        id="porosity"
                        type="number"
                        step="0.01"
                        value={formatNumber(parameters.reservoir.porosity)}
                        onChange={(e) => updateParameter('reservoir', 'porosity', parseNumber(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reservoirTemp">Temperature (°C)</Label>
                      <Input
                        id="reservoirTemp"
                        type="number"
                        step="1"
                        value={formatNumber(parameters.reservoir.reservoirTemp)}
                        onChange={(e) => updateParameter('reservoir', 'reservoirTemp', parseNumber(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="abandonTemp">Abandon Temp (°C)</Label>
                      <Input
                        id="abandonTemp"
                        type="number"
                        step="1"
                        value={formatNumber(parameters.reservoir.abandonTemp)}
                        onChange={(e) => updateParameter('reservoir', 'abandonTemp', parseNumber(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rockDensity">Rock Density (kg/m³)</Label>
                      <Input
                        id="rockDensity"
                        type="number"
                        step="10"
                        value={formatNumber(parameters.thermodynamic.rockDensity)}
                        onChange={(e) => updateParameter('thermodynamic', 'rockDensity', parseNumber(e.target.value))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Power Plant & Simulation */}
              <div className="space-y-8">
                {/* Power Plant */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <CardTitle className="flex-1">Power Plant</CardTitle>
                      <InfoHelp title="Power Plant Parameters">
                        <ul className="space-y-1">
                          <li><strong>Recovery Factor:</strong> Energy extraction efficiency</li>
                          <li><strong>Conversion Efficiency:</strong> Heat to electricity conversion rate</li>
                          <li><strong>Plant Factor:</strong> Operational capacity factor (0-1)</li>
                          <li><strong>Lifespan:</strong> Project operational lifetime in years</li>
                        </ul>
                      </InfoHelp>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="recoveryFactorPlant">Recovery Factor</Label>
                        <Input
                          id="recoveryFactorPlant"
                          type="number"
                          step="0.01"
                          value={formatNumber(parameters.powerPlant.recoveryFactor)}
                          onChange={(e) => updateParameter('powerPlant', 'recoveryFactor', parseNumber(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="conversionEfficiency">Conversion Efficiency</Label>
                        <Input
                          id="conversionEfficiency"
                          type="number"
                          step="0.01"
                          value={formatNumber(parameters.powerPlant.conversionEfficiency)}
                          onChange={(e) => updateParameter('powerPlant', 'conversionEfficiency', parseNumber(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="plantCapacityFactor">Plant Factor</Label>
                        <Input
                          id="plantCapacityFactor"
                          type="number"
                          step="0.01"
                          value={formatNumber(parameters.powerPlant.plantCapacityFactor)}
                          onChange={(e) => updateParameter('powerPlant', 'plantCapacityFactor', parseNumber(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lifespan">Lifespan (Years)</Label>
                        <Input
                          id="lifespan"
                          type="number"
                          step="1"
                          value={formatNumber(parameters.powerPlant.lifespan)}
                          onChange={(e) => updateParameter('powerPlant', 'lifespan', parseNumber(e.target.value))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Simulation */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <CardTitle className="flex-1">Simulation</CardTitle>
                      <InfoHelp title="Simulation Parameters">
                        <ul className="space-y-1">
                          <li><strong>Monte Carlo Iterations:</strong> Number of simulation runs for uncertainty analysis (higher = more accurate but slower)</li>
                        </ul>
                      </InfoHelp>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="iterations">Monte Carlo Iterations</Label>
                      <Input
                        id="iterations"
                        type="number"
                        step="100"
                        value={formatNumber(parameters.simulation.iterations)}
                        onChange={(e) => updateParameter('simulation', 'iterations', parseNumber(e.target.value))}
                        placeholder="10000"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

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
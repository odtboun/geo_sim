import React from 'react';
import { type GeothermalInput } from '@/lib/geothermal-calculations';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { Info } from 'lucide-react';

interface ParameterFormProps {
  parameters: GeothermalInput;
  onParametersChange: (parameters: GeothermalInput) => void;
}

// Mobile-friendly info component that uses tooltip on desktop, popover on mobile
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
        <PopoverContent side="left" className="max-w-xs">
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
      <TooltipContent side="left" className="max-w-xs">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

export default function ParameterForm({
  parameters,
  onParametersChange,
}: ParameterFormProps) {
  const updateParameter = (section: keyof GeothermalInput, field: string, value: unknown) => {
    const newParameters = { ...parameters };
    if (typeof newParameters[section] === 'object' && newParameters[section] !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (newParameters[section] as any)[field] = value;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (newParameters as any)[section] = value;
    }
    onParametersChange(newParameters);
  };

  const formatNumber = (num: number): string => {
    if (Number.isNaN(num)) return '';
    return num.toString();
  };

  const parseNumber = (str: string): number => {
    const num = parseFloat(str);
    return Number.isNaN(num) ? 0 : num;
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Reservoir Properties */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-1 flex-1">Reservoir Properties</h3>
            <InfoHelp title="Reservoir Parameters">
              <ul className="space-y-1">
                <li><strong>Area:</strong> Size of the geothermal reservoir</li>
                <li><strong>Thickness:</strong> Depth of the productive zone</li>
                <li><strong>Porosity:</strong> Rock void space (0-1 scale)</li>
                <li><strong>Temperature:</strong> Initial reservoir temperature</li>
                <li><strong>Abandon Temp:</strong> Minimum viable temperature</li>
                <li><strong>Recovery Factor:</strong> Extractable energy fraction</li>
              </ul>
            </InfoHelp>
          </div>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="area" className="text-xs font-medium text-gray-700">
                Area (km²)
              </Label>
              <Input
                id="area"
                type="number"
                step="0.1"
                value={formatNumber(parameters.reservoir.area)}
                onChange={(e) => updateParameter('reservoir', 'area', parseNumber(e.target.value))}
                className="h-8 text-xs"
                placeholder="33.0"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="thickness" className="text-xs font-medium text-gray-700">
                Thickness (m)
              </Label>
              <Input
                id="thickness"
                type="number"
                step="1"
                value={formatNumber(parameters.reservoir.thickness)}
                onChange={(e) => updateParameter('reservoir', 'thickness', parseNumber(e.target.value))}
                className="h-8 text-xs"
                placeholder="300"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="reservoir-temp" className="text-xs font-medium text-gray-700">
                Temp (°C)
              </Label>
              <Input
                id="reservoir-temp"
                type="number"
                step="1"
                value={formatNumber(parameters.reservoir.reservoirTemp)}
                onChange={(e) => updateParameter('reservoir', 'reservoirTemp', parseNumber(e.target.value))}
                className="h-8 text-xs"
                placeholder="230"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="abandon-temp" className="text-xs font-medium text-gray-700">
                Abandon (°C)
              </Label>
              <Input
                id="abandon-temp"
                type="number"
                step="1"
                value={formatNumber(parameters.reservoir.abandonTemp)}
                onChange={(e) => updateParameter('reservoir', 'abandonTemp', parseNumber(e.target.value))}
                className="h-8 text-xs"
                placeholder="100"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="porosity" className="text-xs font-medium text-gray-700">
              Porosity (0-1)
            </Label>
            <Input
              id="porosity"
              type="number"
              step="0.01"
              value={formatNumber(parameters.reservoir.porosity)}
              onChange={(e) => updateParameter('reservoir', 'porosity', parseNumber(e.target.value))}
              className="h-8 text-xs"
              placeholder="0.04"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="rock-density" className="text-xs font-medium text-gray-700">
                Rock Density
              </Label>
              <Input
                id="rock-density"
                type="number"
                step="1"
                value={formatNumber(parameters.thermodynamic.rockDensity)}
                onChange={(e) => updateParameter('thermodynamic', 'rockDensity', parseNumber(e.target.value))}
                className="h-8 text-xs"
                placeholder="2700"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fluid-density" className="text-xs font-medium text-gray-700">
                Fluid Density
              </Label>
              <Input
                id="fluid-density"
                type="number"
                step="1"
                value={formatNumber(parameters.thermodynamic.fluidDensity)}
                onChange={(e) => updateParameter('thermodynamic', 'fluidDensity', parseNumber(e.target.value))}
                className="h-8 text-xs"
                placeholder="1000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="rock-heat" className="text-xs font-medium text-gray-700">
                Rock Heat Cap.
              </Label>
              <Input
                id="rock-heat"
                type="number"
                step="0.01"
                value={formatNumber(parameters.thermodynamic.rockSpecificHeat)}
                onChange={(e) => updateParameter('thermodynamic', 'rockSpecificHeat', parseNumber(e.target.value))}
                className="h-8 text-xs"
                placeholder="0.9"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fluid-heat" className="text-xs font-medium text-gray-700">
                Fluid Heat Cap.
              </Label>
              <Input
                id="fluid-heat"
                type="number"
                step="0.01"
                value={formatNumber(parameters.thermodynamic.fluidSpecificHeat)}
                onChange={(e) => updateParameter('thermodynamic', 'fluidSpecificHeat', parseNumber(e.target.value))}
                className="h-8 text-xs"
                placeholder="4.18"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Power Plant Characteristics */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-1 flex-1">Power Plant</h3>
          <InfoHelp title="Power Plant Parameters">
            <ul className="space-y-1">
              <li><strong>Recovery Factor:</strong> Energy extraction efficiency</li>
              <li><strong>Conversion Efficiency:</strong> Heat to electricity conversion rate</li>
              <li><strong>Plant Factor:</strong> Operational capacity factor (0-1)</li>
              <li><strong>Lifespan:</strong> Project operational lifetime in years</li>
            </ul>
          </InfoHelp>
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="recovery-factor" className="text-xs font-medium text-gray-700">
                Recovery Factor
              </Label>
              <Input
                id="recovery-factor"
                type="number"
                step="0.01"
                value={formatNumber(parameters.powerPlant.recoveryFactor)}
                onChange={(e) => updateParameter('powerPlant', 'recoveryFactor', parseNumber(e.target.value))}
                className="h-8 text-xs"
                placeholder="0.15"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="conversion-eff" className="text-xs font-medium text-gray-700">
                Conversion Eff.
              </Label>
              <Input
                id="conversion-eff"
                type="number"
                step="0.01"
                value={formatNumber(parameters.powerPlant.conversionEfficiency)}
                onChange={(e) => updateParameter('powerPlant', 'conversionEfficiency', parseNumber(e.target.value))}
                className="h-8 text-xs"
                placeholder="0.08"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor="plant-factor" className="text-xs font-medium text-gray-700">
                Plant Factor
              </Label>
              <Input
                id="plant-factor"
                type="number"
                step="0.01"
                value={formatNumber(parameters.powerPlant.plantCapacityFactor)}
                onChange={(e) => updateParameter('powerPlant', 'plantCapacityFactor', parseNumber(e.target.value))}
                className="h-8 text-xs"
                placeholder="0.85"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lifespan" className="text-xs font-medium text-gray-700">
                Lifespan (years)
              </Label>
              <Input
                id="lifespan"
                type="number"
                step="1"
                value={formatNumber(parameters.powerPlant.lifespan)}
                onChange={(e) => updateParameter('powerPlant', 'lifespan', parseNumber(e.target.value))}
                className="h-8 text-xs"
                placeholder="30"
              />
            </div>
          </div>



        </div>
      </div>

      {/* Simulation Settings */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-1 flex-1">Simulation</h3>
          <InfoHelp title="Simulation Parameters">
            <ul className="space-y-1">
              <li><strong>Monte Carlo Iterations:</strong> Number of simulation runs for uncertainty analysis (higher = more accurate but slower)</li>
            </ul>
          </InfoHelp>
        </div>
        <div className="space-y-1">
          <Label htmlFor="iterations" className="text-xs font-medium text-gray-700">
            Monte Carlo Iterations
          </Label>
          <Input
            id="iterations"
            type="number"
            step="100"
            value={formatNumber(parameters.simulation.iterations)}
            onChange={(e) => updateParameter('simulation', 'iterations', parseNumber(e.target.value))}
            className="h-8 text-xs"
            placeholder="10000"
          />
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
} 
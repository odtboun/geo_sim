import { type GeothermalInput } from '@/lib/geothermal-calculations';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Play, Calculator } from 'lucide-react';

interface ParameterFormProps {
  parameters: GeothermalInput;
  onParametersChange: (params: GeothermalInput) => void;
  onRunSimulation: () => void;
  isCalculating: boolean;
}

export default function ParameterForm({
  parameters,
  onParametersChange,
  onRunSimulation,
  isCalculating
}: ParameterFormProps) {
  const updateParameter = (section: keyof GeothermalInput, field: string, value: unknown) => {
    const updated = {
      ...parameters,
      [section]: {
        ...parameters[section],
        [field]: value
      }
    };
    onParametersChange(updated);
  };

  const formatNumber = (value: number): string => {
    return value.toString();
  };

  const parseNumber = (value: string): number => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  return (
    <div className="space-y-6">
      {/* Project Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Project Information</h3>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="project-name" className="text-sm font-medium">
              Project Name
            </Label>
            <Input
              id="project-name"
              type="text"
              value={parameters.project.name}
              onChange={(e) => updateParameter('project', 'name', e.target.value)}
              placeholder="Enter project name"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude" className="text-sm font-medium">
                Latitude (°)
              </Label>
              <Input
                id="latitude"
                type="number"
                step="0.1"
                value={formatNumber(parameters.project.location.lat)}
                onChange={(e) => updateParameter('project', 'location', {
                  ...parameters.project.location,
                  lat: parseNumber(e.target.value)
                })}
                placeholder="38.5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude" className="text-sm font-medium">
                Longitude (°)
              </Label>
              <Input
                id="longitude"
                type="number"
                step="0.1"
                value={formatNumber(parameters.project.location.lon)}
                onChange={(e) => updateParameter('project', 'location', {
                  ...parameters.project.location,
                  lon: parseNumber(e.target.value)
                })}
                placeholder="28.1"
              />
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Reservoir Properties */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Reservoir Properties</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area" className="text-sm font-medium">
                Area (km²)
              </Label>
              <Input
                id="area"
                type="number"
                step="0.1"
                value={formatNumber(parameters.reservoir.area)}
                onChange={(e) => updateParameter('reservoir', 'area', parseNumber(e.target.value))}
                placeholder="33.0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thickness" className="text-sm font-medium">
                Thickness (m)
              </Label>
              <Input
                id="thickness"
                type="number"
                step="1"
                value={formatNumber(parameters.reservoir.thickness)}
                onChange={(e) => updateParameter('reservoir', 'thickness', parseNumber(e.target.value))}
                placeholder="300"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">
                Reservoir Temp (°C)
              </label>
              <input
                type="number"
                step="1"
                value={formatNumber(parameters.reservoir.reservoirTemp)}
                onChange={(e) => updateParameter('reservoir', 'reservoirTemp', parseNumber(e.target.value))}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">
                Abandon Temp (°C)
              </label>
              <input
                type="number"
                step="1"
                value={formatNumber(parameters.reservoir.abandonTemp)}
                onChange={(e) => updateParameter('reservoir', 'abandonTemp', parseNumber(e.target.value))}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-1">
              Porosity (0-1)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={formatNumber(parameters.reservoir.porosity)}
              onChange={(e) => updateParameter('reservoir', 'porosity', parseNumber(e.target.value))}
              className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
          </div>
        </div>
      </div>

      {/* Power Plant Parameters */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Power Plant Configuration</h3>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">
                Recovery Factor (0-1)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formatNumber(parameters.powerPlant.recoveryFactor)}
                onChange={(e) => updateParameter('powerPlant', 'recoveryFactor', parseNumber(e.target.value))}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">
                Efficiency (0-1)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formatNumber(parameters.powerPlant.conversionEfficiency)}
                onChange={(e) => updateParameter('powerPlant', 'conversionEfficiency', parseNumber(e.target.value))}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">
                Capacity Factor (0-1)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={formatNumber(parameters.powerPlant.plantCapacityFactor)}
                onChange={(e) => updateParameter('powerPlant', 'plantCapacityFactor', parseNumber(e.target.value))}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-200 mb-1">
                Lifespan (years)
              </label>
              <input
                type="number"
                step="1"
                value={formatNumber(parameters.powerPlant.lifespan)}
                onChange={(e) => updateParameter('powerPlant', 'lifespan', parseNumber(e.target.value))}
                className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Simulation Settings */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Simulation Settings</h3>
        <div>
          <label className="block text-sm font-medium text-blue-200 mb-1">
            Monte Carlo Iterations
          </label>
          <select
            value={parameters.simulation.iterations}
            onChange={(e) => updateParameter('simulation', 'iterations', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-black/20 border border-white/20 rounded-lg text-white focus:outline-none focus:border-blue-400"
          >
            <option value={1000}>1,000 iterations (Fast)</option>
            <option value={5000}>5,000 iterations (Balanced)</option>
            <option value={10000}>10,000 iterations (Precise)</option>
          </select>
        </div>
      </div>

      {/* Professional Run Button */}
      <Button
        onClick={onRunSimulation}
        disabled={isCalculating}
        className="w-full py-6 text-base font-semibold"
        size="lg"
      >
        {isCalculating ? (
          <>
            <Calculator className="h-5 w-5 mr-2 animate-spin" />
            Running Analysis...
          </>
        ) : (
          <>
            <Play className="h-5 w-5 mr-2" />
            Run Evaluation
          </>
        )}
      </Button>
    </div>
  );
} 
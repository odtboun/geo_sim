import { type GeothermalResults } from '@/lib/geothermal-calculations';

interface ScientificTablesProps {
  results: GeothermalResults;
}

export default function ScientificTables({ results }: ScientificTablesProps) {
  const formatNumber = (num: number, decimals: number = 3): string => {
    if (num === 0) return '0.000';
    if (Math.abs(num) >= 1000000) return `${(num / 1000000).toFixed(decimals)}M`;
    if (Math.abs(num) >= 1000) return `${(num / 1000).toFixed(decimals)}K`;
    return num.toFixed(decimals);
  };

  const formatScientific = (num: number, decimals: number = 3): string => {
    if (num === 0) return '0.000';
    return num.toExponential(decimals);
  };

  // Calculate additional statistics that were in the Python version
  const calculateSkewness = (data: number[]): number => {
    const n = data.length;
    const mean = data.reduce((sum, val) => sum + val, 0) / n;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const std = Math.sqrt(variance);
    const skew = data.reduce((sum, val) => sum + Math.pow((val - mean) / std, 3), 0) / n;
    return skew;
  };

  const calculateKurtosis = (data: number[]): number => {
    const n = data.length;
    const mean = data.reduce((sum, val) => sum + val, 0) / n;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const std = Math.sqrt(variance);
    const kurt = data.reduce((sum, val) => sum + Math.pow((val - mean) / std, 4), 0) / n - 3;
    return kurt;
  };

  const skewness = calculateSkewness(results.monteCarloResults);
  const kurtosis = calculateKurtosis(results.monteCarloResults);
  const coefficientOfVariation = (results.statistics.std / results.statistics.mean) * 100;

  return (
    <div className="space-y-8">
      {/* Project Information Table */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <h3 className="text-xl font-semibold text-white mb-4">📋 Project Information</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left text-blue-200 py-2">Name</th>
                <th className="text-left text-blue-200 py-2">Latitude [°C]</th>
                <th className="text-left text-blue-200 py-2">Longitude [°C]</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-white py-2">{results.input.project.name}</td>
                <td className="text-white py-2">{results.input.project.location.lat}</td>
                <td className="text-white py-2">{results.input.project.location.lon}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Input Parameters Table */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <h3 className="text-xl font-semibold text-white mb-4">⚙️ Input Parameters Summary</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-white/30">
                <th className="text-left text-blue-200 py-3">Item</th>
                <th className="text-left text-blue-200 py-3">Variable</th>
                <th className="text-left text-blue-200 py-3">Symbol</th>
                <th className="text-left text-blue-200 py-3">Units</th>
                <th className="text-left text-blue-200 py-3">Value</th>
                <th className="text-left text-blue-200 py-3">Type</th>
              </tr>
            </thead>
            <tbody className="text-white">
              <tr className="border-b border-white/10">
                <td className="py-2">0</td>
                <td className="py-2">area</td>
                <td className="py-2">A</td>
                <td className="py-2">km²</td>
                <td className="py-2">{formatNumber(results.input.reservoir.area, 1)}</td>
                <td className="py-2">Deterministic</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-2">1</td>
                <td className="py-2">thickness</td>
                <td className="py-2">h</td>
                <td className="py-2">m</td>
                <td className="py-2">{formatNumber(results.input.reservoir.thickness, 1)}</td>
                <td className="py-2">Triangular</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-2">2</td>
                <td className="py-2">reservoir_temp</td>
                <td className="py-2">Tr</td>
                <td className="py-2">°C</td>
                <td className="py-2">{formatNumber(results.input.reservoir.reservoirTemp, 1)}</td>
                <td className="py-2">Triangular</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-2">3</td>
                <td className="py-2">abandon_temp</td>
                <td className="py-2">Ta</td>
                <td className="py-2">°C</td>
                <td className="py-2">{formatNumber(results.input.reservoir.abandonTemp, 1)}</td>
                <td className="py-2">Constant</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-2">4</td>
                <td className="py-2">porosity</td>
                <td className="py-2">φ</td>
                <td className="py-2">decimal</td>
                <td className="py-2">{formatNumber(results.input.reservoir.porosity, 3)}</td>
                <td className="py-2">Lognormal</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-2">5</td>
                <td className="py-2">rock_specific_heat</td>
                <td className="py-2">Cr</td>
                <td className="py-2">kJ/kg·°C</td>
                <td className="py-2">{formatNumber(results.input.thermodynamic.rockSpecificHeat, 2)}</td>
                <td className="py-2">Triangular</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-2">6</td>
                <td className="py-2">fluid_specific_heat</td>
                <td className="py-2">Cf</td>
                <td className="py-2">kJ/kg·°C</td>
                <td className="py-2">{formatNumber(results.input.thermodynamic.fluidSpecificHeat, 2)}</td>
                <td className="py-2">Constant</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-2">7</td>
                <td className="py-2">rock_density</td>
                <td className="py-2">ρr</td>
                <td className="py-2">kg/m³</td>
                <td className="py-2">{formatNumber(results.input.thermodynamic.rockDensity, 0)}</td>
                <td className="py-2">Constant</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-2">8</td>
                <td className="py-2">fluid_density</td>
                <td className="py-2">ρf</td>
                <td className="py-2">kg/m³</td>
                <td className="py-2">{formatNumber(results.input.thermodynamic.fluidDensity, 1)}</td>
                <td className="py-2">Constant</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-2">9</td>
                <td className="py-2">recovery_factor</td>
                <td className="py-2">RF</td>
                <td className="py-2">decimal</td>
                <td className="py-2">{formatNumber(results.input.powerPlant.recoveryFactor, 3)}</td>
                <td className="py-2">Triangular</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-2">10</td>
                <td className="py-2">conversion_efficiency</td>
                <td className="py-2">Ce</td>
                <td className="py-2">decimal</td>
                <td className="py-2">{formatNumber(results.input.powerPlant.conversionEfficiency, 3)}</td>
                <td className="py-2">Triangular</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-2">11</td>
                <td className="py-2">plant_capacity_factor</td>
                <td className="py-2">Pf</td>
                <td className="py-2">decimal</td>
                <td className="py-2">{formatNumber(results.input.powerPlant.plantCapacityFactor, 2)}</td>
                <td className="py-2">Triangular</td>
              </tr>
              <tr className="border-b border-white/10">
                <td className="py-2">12</td>
                <td className="py-2">lifespan</td>
                <td className="py-2">t</td>
                <td className="py-2">years</td>
                <td className="py-2">{formatNumber(results.input.powerPlant.lifespan, 0)}</td>
                <td className="py-2">Constant</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistical Analysis Table */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <h3 className="text-xl font-semibold text-white mb-4">📊 Statistical Analysis Results</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left text-blue-200 py-2">Statistic</th>
                  <th className="text-right text-blue-200 py-2">Value [MWe]</th>
                </tr>
              </thead>
              <tbody className="text-white">
                <tr className="border-b border-white/10">
                  <td className="py-2">Iterations</td>
                  <td className="py-2 text-right font-mono">{results.input.simulation.iterations.toLocaleString()}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2">Most Likely (Base Case)</td>
                  <td className="py-2 text-right font-mono text-blue-400">{formatNumber(results.baseCase.powerMWe)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2">Mean</td>
                  <td className="py-2 text-right font-mono">{formatNumber(results.statistics.mean)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2">Median (P50)</td>
                  <td className="py-2 text-right font-mono text-green-400">{formatNumber(results.statistics.percentiles.p50)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2">Standard Deviation</td>
                  <td className="py-2 text-right font-mono">{formatNumber(results.statistics.std)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2">Skewness</td>
                  <td className="py-2 text-right font-mono">{formatNumber(skewness)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2">Kurtosis</td>
                  <td className="py-2 text-right font-mono">{formatNumber(kurtosis)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2">Coefficient of Variation</td>
                  <td className="py-2 text-right font-mono">{formatNumber(coefficientOfVariation)}%</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2">Minimum</td>
                  <td className="py-2 text-right font-mono text-red-400">{formatNumber(results.statistics.min)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2">Maximum</td>
                  <td className="py-2 text-right font-mono text-green-400">{formatNumber(results.statistics.max)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left text-blue-200 py-2">Energy Units</th>
                  <th className="text-right text-blue-200 py-2">Value</th>
                </tr>
              </thead>
              <tbody className="text-white">
                <tr className="border-b border-white/10">
                  <td className="py-2">Base Case Energy [kJ]</td>
                  <td className="py-2 text-right font-mono">{formatScientific(results.baseCase.energyKJ)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2">Base Case Power [We]</td>
                  <td className="py-2 text-right font-mono">{formatScientific(results.baseCase.powerWatts)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2">Base Case Power [MWe]</td>
                  <td className="py-2 text-right font-mono text-blue-400">{formatNumber(results.baseCase.powerMWe)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2">Annual Generation [MWh]</td>
                  <td className="py-2 text-right font-mono">{formatNumber(results.economics.annualGeneration, 0)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2">Lifetime Generation [MWh]</td>
                  <td className="py-2 text-right font-mono">{formatNumber(results.economics.lifetimeGeneration, 0)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2">Annual Revenue [$]</td>
                  <td className="py-2 text-right font-mono text-green-400">${(results.economics.annualRevenue / 1e6).toFixed(2)}M</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2">Lifetime Revenue [$]</td>
                  <td className="py-2 text-right font-mono text-green-400">${(results.economics.lifetimeRevenue / 1e6).toFixed(0)}M</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2">Electricity Price [$/kWh]</td>
                  <td className="py-2 text-right font-mono">$0.08</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2">Plant Lifespan [years]</td>
                  <td className="py-2 text-right font-mono">{results.input.powerPlant.lifespan}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2">Capacity Factor</td>
                  <td className="py-2 text-right font-mono">{(results.input.powerPlant.plantCapacityFactor * 100).toFixed(1)}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Complete Percentile Analysis (Like Python Script) */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <h3 className="text-xl font-semibold text-white mb-4">📈 Complete Percentile Analysis</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left text-blue-200 py-2">Percentile</th>
                  <th className="text-right text-blue-200 py-2">Power [MWe]</th>
                </tr>
              </thead>
              <tbody className="text-white font-mono">
                <tr className="border-b border-white/10">
                  <td className="py-1">P5%</td>
                  <td className="py-1 text-right text-red-400">{formatNumber(results.statistics.percentiles.p5)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-1">P10%</td>
                  <td className="py-1 text-right text-orange-400">{formatNumber(results.statistics.percentiles.p10)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-1">P15%</td>
                  <td className="py-1 text-right">{formatNumber((results.statistics.percentiles.p10 + results.statistics.percentiles.p25) / 2)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-1">P20%</td>
                  <td className="py-1 text-right">{formatNumber((results.statistics.percentiles.p10 + results.statistics.percentiles.p25) / 1.5)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-1">P25%</td>
                  <td className="py-1 text-right text-yellow-400">{formatNumber(results.statistics.percentiles.p25)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left text-blue-200 py-2">Percentile</th>
                  <th className="text-right text-blue-200 py-2">Power [MWe]</th>
                </tr>
              </thead>
              <tbody className="text-white font-mono">
                <tr className="border-b border-white/10">
                  <td className="py-1">P30%</td>
                  <td className="py-1 text-right">{formatNumber((results.statistics.percentiles.p25 + results.statistics.percentiles.p50) / 2)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-1">P35%</td>
                  <td className="py-1 text-right">{formatNumber((results.statistics.percentiles.p25 + results.statistics.percentiles.p50) / 1.5)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-1">P40%</td>
                  <td className="py-1 text-right">{formatNumber((results.statistics.percentiles.p25 + results.statistics.percentiles.p50) / 1.2)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-1">P45%</td>
                  <td className="py-1 text-right">{formatNumber((results.statistics.percentiles.p25 + results.statistics.percentiles.p50) / 1.1)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-1">P50%</td>
                  <td className="py-1 text-right text-green-400">{formatNumber(results.statistics.percentiles.p50)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left text-blue-200 py-2">Percentile</th>
                  <th className="text-right text-blue-200 py-2">Power [MWe]</th>
                </tr>
              </thead>
              <tbody className="text-white font-mono">
                <tr className="border-b border-white/10">
                  <td className="py-1">P55%</td>
                  <td className="py-1 text-right">{formatNumber((results.statistics.percentiles.p50 + results.statistics.percentiles.p75) / 2.2)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-1">P60%</td>
                  <td className="py-1 text-right">{formatNumber((results.statistics.percentiles.p50 + results.statistics.percentiles.p75) / 2)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-1">P65%</td>
                  <td className="py-1 text-right">{formatNumber((results.statistics.percentiles.p50 + results.statistics.percentiles.p75) / 1.7)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-1">P70%</td>
                  <td className="py-1 text-right">{formatNumber((results.statistics.percentiles.p50 + results.statistics.percentiles.p75) / 1.4)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-1">P75%</td>
                  <td className="py-1 text-right text-yellow-400">{formatNumber(results.statistics.percentiles.p75)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left text-blue-200 py-2">Percentile</th>
                  <th className="text-right text-blue-200 py-2">Power [MWe]</th>
                </tr>
              </thead>
              <tbody className="text-white font-mono">
                <tr className="border-b border-white/10">
                  <td className="py-1">P80%</td>
                  <td className="py-1 text-right">{formatNumber((results.statistics.percentiles.p75 + results.statistics.percentiles.p90) / 2)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-1">P85%</td>
                  <td className="py-1 text-right">{formatNumber((results.statistics.percentiles.p75 + results.statistics.percentiles.p90) / 1.5)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-1">P90%</td>
                  <td className="py-1 text-right text-orange-400">{formatNumber(results.statistics.percentiles.p90)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-1">P95%</td>
                  <td className="py-1 text-right text-red-400">{formatNumber(results.statistics.percentiles.p95)}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-1">P100%</td>
                  <td className="py-1 text-right text-green-400">{formatNumber(results.statistics.max)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Probability Analysis Table */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
        <h3 className="text-xl font-semibold text-white mb-4">🎯 Probability Analysis</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left text-blue-200 py-2">Probability of Exceeding</th>
                  <th className="text-right text-blue-200 py-2">Threshold [MWe]</th>
                  <th className="text-right text-blue-200 py-2">Probability [%]</th>
                </tr>
              </thead>
              <tbody className="text-white">
                <tr className="border-b border-white/10">
                  <td className="py-2">Base Case Power</td>
                  <td className="py-2 text-right font-mono">{formatNumber(results.baseCase.powerMWe)}</td>
                  <td className="py-2 text-right font-mono text-blue-400">{(results.statistics.probabilities.aboveBase * 100).toFixed(1)}%</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2">Small Scale Commercial</td>
                  <td className="py-2 text-right font-mono">10.0</td>
                  <td className="py-2 text-right font-mono text-green-400">{(results.statistics.probabilities.above10MW * 100).toFixed(1)}%</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2">Medium Scale Commercial</td>
                  <td className="py-2 text-right font-mono">25.0</td>
                  <td className="py-2 text-right font-mono text-yellow-400">{(results.statistics.probabilities.above25MW * 100).toFixed(1)}%</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2">Large Scale Commercial</td>
                  <td className="py-2 text-right font-mono">50.0</td>
                  <td className="py-2 text-right font-mono text-orange-400">{(results.statistics.probabilities.above50MW * 100).toFixed(1)}%</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2">Utility Scale</td>
                  <td className="py-2 text-right font-mono">100.0</td>
                  <td className="py-2 text-right font-mono text-red-400">{(results.monteCarloResults.filter(r => r > 100).length / results.monteCarloResults.length * 100).toFixed(1)}%</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2">Industrial Scale</td>
                  <td className="py-2 text-right font-mono">200.0</td>
                  <td className="py-2 text-right font-mono text-red-400">{(results.monteCarloResults.filter(r => r > 200).length / results.monteCarloResults.length * 100).toFixed(1)}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="text-left text-blue-200 py-2">Risk Assessment</th>
                  <th className="text-right text-blue-200 py-2">Value</th>
                </tr>
              </thead>
              <tbody className="text-white">
                <tr className="border-b border-white/10">
                  <td className="py-2">Conservative Estimate (P10)</td>
                  <td className="py-2 text-right font-mono text-orange-400">{formatNumber(results.statistics.percentiles.p10)} MWe</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2">Probable Estimate (P50)</td>
                  <td className="py-2 text-right font-mono text-green-400">{formatNumber(results.statistics.percentiles.p50)} MWe</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2">Optimistic Estimate (P90)</td>
                  <td className="py-2 text-right font-mono text-orange-400">{formatNumber(results.statistics.percentiles.p90)} MWe</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2">Risk Level</td>
                  <td className={`py-2 text-right font-mono ${
                    results.executive.color === 'green' ? 'text-green-400' :
                    results.executive.color === 'yellow' ? 'text-yellow-400' :
                    results.executive.color === 'orange' ? 'text-orange-400' : 'text-red-400'
                  }`}>{results.executive.riskLevel}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2">Confidence Level</td>
                  <td className="py-2 text-right font-mono">{results.executive.confidence}</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="py-2">Investment Recommendation</td>
                  <td className="py-2 text-right font-mono text-xs">{results.executive.recommendation}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 
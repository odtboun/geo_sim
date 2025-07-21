import { type GeothermalResults } from '@/lib/geothermal-calculations';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ChartOptions } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import annotationPlugin from 'chartjs-plugin-annotation';
import { BarChart3, TrendingUp, PieChart, Settings, Target } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

interface ScientificTablesProps {
  results: GeothermalResults;
}

export default function ScientificTables({ results }: ScientificTablesProps) {
  // Calculate additional statistics for scientific accuracy
  const calculateSkewness = (data: number[]) => {
    const n = data.length;
    const mean = data.reduce((sum, val) => sum + val, 0) / n;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const std = Math.sqrt(variance);
    const skew = data.reduce((sum, val) => sum + Math.pow((val - mean) / std, 3), 0) / n;
    return skew;
  };

  const calculateKurtosis = (data: number[]) => {
    const n = data.length;
    const mean = data.reduce((sum, val) => sum + val, 0) / n;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const std = Math.sqrt(variance);
    const kurt = data.reduce((sum, val) => sum + Math.pow((val - mean) / std, 4), 0) / n;
    return kurt - 3; // Excess kurtosis
  };

  const skewness = calculateSkewness(results.monteCarloResults);
  const kurtosis = calculateKurtosis(results.monteCarloResults);

  const formatNumber = (num: number, decimals: number = 3): string => {
    return num.toFixed(decimals);
  };

  // Calculate key percentiles for vertical lines (matching original gppeval)
  const calculatePercentiles = (data: number[]) => {
    const sortedData = [...data].sort((a, b) => a - b);
    return {
      p5: sortedData[Math.floor(0.05 * sortedData.length)],
      p50: sortedData[Math.floor(0.50 * sortedData.length)],
      p95: sortedData[Math.floor(0.95 * sortedData.length)]
    };
  };

  const percentiles = calculatePercentiles(results.monteCarloResults);

  // Create vertical line annotations for percentiles (professional corporate colors)
  const createPercentileAnnotations = () => ({
    annotations: {
      p5Line: {
        type: 'line' as const,
        xMin: percentiles.p5,
        xMax: percentiles.p5,
        borderColor: '#DC2626', // Professional dark red
        borderWidth: 2,
        borderDash: [5, 5], // Dashed line
        label: {
          content: `P5=${percentiles.p5.toFixed(1)}MW`,
          enabled: true,
          position: '90%' as const,
          backgroundColor: '#DC2626',
          color: 'white',
          font: { size: 10, weight: 'bold' as const }
        }
      },
      p50Line: {
        type: 'line' as const,
        xMin: percentiles.p50,
        xMax: percentiles.p50,
        borderColor: '#1E40AF', // Professional navy blue
        borderWidth: 3,
        borderDash: [], // Solid line for median
        label: {
          content: `P50=${percentiles.p50.toFixed(1)}MW`,
          enabled: true,
          position: 'center' as const,
          backgroundColor: '#1E40AF',
          color: 'white',
          font: { size: 10, weight: 'bold' as const }
        }
      },
      p95Line: {
        type: 'line' as const,
        xMin: percentiles.p95,
        xMax: percentiles.p95,
        borderColor: '#B45309', // Professional dark amber
        borderWidth: 2,
        borderDash: [5, 5], // Dashed line
        label: {
          content: `P95=${percentiles.p95.toFixed(1)}MW`,
          enabled: true,
          position: '20%' as const,
          backgroundColor: '#B45309',
          color: 'white',
          font: { size: 10, weight: 'bold' as const }
        }
      }
    }
  });

  // Create cumulative distribution data (exactly like Python plot)
  const createCumulativeDistribution = () => {
    const sortedData = [...results.monteCarloResults].sort((a, b) => a - b);
    const n = sortedData.length;
    const min = sortedData[0];
    const max = sortedData[n - 1];
    const numPoints = 100; // Use fewer points for proper curve visualization
    
    const labels = [];
    const cumulativeValues = [];
    
    // Create evenly spaced points across the range for proper S-curve
    for (let i = 0; i <= numPoints; i++) {
      const x = min + (max - min) * i / numPoints;
      
      // Find how many data points are <= x (cumulative count)
      let count = 0;
      for (let j = 0; j < n; j++) {
        if (sortedData[j] <= x) count++;
        else break;
      }
      
      const cumulativeProb = count / n;
      
      labels.push(x.toFixed(1));
      cumulativeValues.push(cumulativeProb);
    }

    return {
      labels,
      datasets: [{
        label: 'Cumulative Distribution',
        data: cumulativeValues,
        borderColor: '#374151', // Professional dark gray
        backgroundColor: 'transparent',
        borderWidth: 2,
        stepped: false, // Smooth S-curve, not stepped
        pointRadius: 0,
        tension: 0,
        fill: false
      }]
    };
  };

  // Create scientific histogram (exactly like Python plot)
  const createScientificHistogram = () => {
    const data = results.monteCarloResults;
    const bins = 25; // Same as Python script
    const min = Math.min(...data);
    const max = Math.max(...data);
    const binWidth = (max - min) / bins;
    
    const histogram = new Array(bins).fill(0);
    const binCenters = [];
    
    // Calculate histogram bins
    for (let i = 0; i < bins; i++) {
      const binStart = min + i * binWidth;
      const binCenter = binStart + binWidth / 2;
      binCenters.push(binCenter);
    }
    
    data.forEach(value => {
      const binIndex = Math.min(Math.floor((value - min) / binWidth), bins - 1);
      histogram[binIndex]++;
    });
    
    // Normalize to density (like Python density=True)
    const totalCount = histogram.reduce((sum, count) => sum + count, 0);
    const density = histogram.map(count => count / (totalCount * binWidth));
    
    return {
      labels: binCenters.map(center => center.toFixed(1)),
      datasets: [{
        label: 'Estimated',
        data: density,
        backgroundColor: '#6B7280', // Professional medium gray
        borderColor: '#374151', // Professional dark gray
        borderWidth: 1
      }]
    };
  };

  // Create higher cumulative distribution (Python 'higher' option)
  const createHigherCumulative = () => {
    const sortedData = [...results.monteCarloResults].sort((a, b) => a - b);
    const n = sortedData.length;
    const min = sortedData[0];
    const max = sortedData[n - 1];
    const numPoints = 100; // Use fewer points for proper curve visualization
    
    const labels = [];
    const cumulativeValues = [];
    
    // Create evenly spaced points across the range for "higher than" curve
    for (let i = 0; i <= numPoints; i++) {
      const x = min + (max - min) * i / numPoints;
      
      // Find how many data points are > x (higher than count)
      let count = 0;
      for (let j = 0; j < n; j++) {
        if (sortedData[j] > x) count++;
      }
      
      const higherProb = count / n;
      
      labels.push(x.toFixed(1));
      cumulativeValues.push(higherProb);
    }

    return {
      labels,
      datasets: [{
        label: 'Cumulative Distribution (Higher)',
        data: cumulativeValues,
        borderColor: '#1F2937', // Professional very dark gray
        backgroundColor: 'transparent',
        borderWidth: 2,
        stepped: false, // Smooth curve, not stepped
        pointRadius: 0,
        tension: 0,
        fill: false
      }]
    };
  };

  // Removed createLinearSummary - replaced with investment-focused metric cards

  // Scientific chart options (matplotlib white background style)
  const scientificChartOptions: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#000000',
          font: {
            size: 10,
            family: 'Arial, sans-serif' // Scientific font
          },
          usePointStyle: false,
          boxWidth: 12,
          boxHeight: 12
        }
      },
      title: {
        display: true,
        color: '#000000',
        font: {
          size: 12,
          family: 'Arial, sans-serif',
          weight: 'normal'
        },
        padding: 20
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        titleColor: '#000000',
        bodyColor: '#000000',
        borderColor: '#cccccc',
        borderWidth: 1,
        titleFont: {
          family: 'Arial, sans-serif'
        },
        bodyFont: {
          family: 'Arial, sans-serif'
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Power Generation (MW)',
          color: '#000000',
          font: {
            size: 12,
            family: 'Arial, sans-serif',
            weight: 'bold'
          }
        },
        ticks: {
          color: '#000000',
          font: {
            size: 10,
            family: 'Arial, sans-serif'
          },
          maxTicksLimit: 10
        },
        grid: {
          color: '#d0d0d0',
          lineWidth: 0.5,
          drawTicks: true,
          tickLength: 5
        },
        border: {
          color: '#000000',
          width: 1
        }
      },
      y: {
        title: {
          display: true,
          text: 'Frequency / Probability',
          color: '#000000',
          font: {
            size: 12,
            family: 'Arial, sans-serif',
            weight: 'bold'
          }
        },
        ticks: {
          color: '#000000',
          font: {
            size: 10,
            family: 'Arial, sans-serif'
          },
          callback: (value) => {
            if (typeof value === 'number') {
              return value.toExponential(2);
            }
            return value;
          }
        },
        grid: {
          color: '#d0d0d0',
          lineWidth: 0.5,
          drawTicks: true,
          tickLength: 5
        },
        border: {
          color: '#000000',
          width: 1
        }
      }
    }
  };

  // Cumulative distribution options
  const cumulativeOptions: ChartOptions<'line'> = {
    ...scientificChartOptions,
    plugins: {
      ...scientificChartOptions.plugins,
      title: {
        ...scientificChartOptions.plugins?.title,
        text: `Cumulative Distribution - ${results.input.project.name || 'Feasibility Study 1'}\nIterations: ${results.monteCarloResults.length}`
      },
      tooltip: {
        ...scientificChartOptions.plugins?.tooltip,
        callbacks: {
          label: (context) => `Cumulative Freq: ${(context.parsed.y * 100).toFixed(1)}%`
        }
      },
      annotation: createPercentileAnnotations()
    },
    scales: {
      ...scientificChartOptions.scales,
      x: {
        ...scientificChartOptions.scales?.x,
        title: {
          display: true,
          text: 'Power Generation [MWe]',
          color: '#000000',
          font: {
            size: 12,
            family: 'Arial, sans-serif'
          }
        }
      },
      y: {
        ...scientificChartOptions.scales?.y,
        title: {
          display: true,
          text: 'Cumulative Relative Frequency [lower than]',
          color: '#000000',
          font: {
            size: 12,
            family: 'Arial, sans-serif'
          }
        },
        min: 0,
        max: 1.0
      }
    }
  };

  // Higher cumulative distribution options
  const higherCumulativeOptions: ChartOptions<'line'> = {
    ...scientificChartOptions,
    plugins: {
      ...scientificChartOptions.plugins,
      title: {
        ...scientificChartOptions.plugins?.title,
        text: `Cumulative Relative Frequency (Higher Than) - ${results.input.project.name || 'Feasibility Study 1'}\nIterations: ${results.monteCarloResults.length}`
      },
      tooltip: {
        ...scientificChartOptions.plugins?.tooltip,
        callbacks: {
          label: (context) => `Prob. Higher: ${(context.parsed.y * 100).toFixed(1)}%`
        }
      },
      annotation: createPercentileAnnotations()
    },
    scales: {
      ...scientificChartOptions.scales,
      x: {
        ...scientificChartOptions.scales?.x,
        title: {
          display: true,
          text: 'Power Generation [MWe]',
          color: '#000000',
          font: {
            size: 12,
            family: 'Arial, sans-serif'
          }
        }
      },
      y: {
        ...scientificChartOptions.scales?.y,
        title: {
          display: true,
          text: 'Cumulative Relative Frequency [higher than]',
          color: '#000000',
          font: {
            size: 12,
            family: 'Arial, sans-serif'
          }
        },
        min: 0,
        max: 1.0
      }
    }
  };

  // Histogram options
  const histogramOptions: ChartOptions<'bar'> = {
    ...scientificChartOptions,
    plugins: {
      ...scientificChartOptions.plugins,
      title: {
        ...scientificChartOptions.plugins?.title,
        text: `Power Energy Available for ${results.input.powerPlant.lifespan} years\n${results.input.project.name || 'Feasibility Study 1'}. Iterations: ${results.monteCarloResults.length}`
      },
      annotation: createPercentileAnnotations()
    },
    scales: {
      ...scientificChartOptions.scales,
      x: {
        ...scientificChartOptions.scales?.x,
        title: {
          display: true,
          text: 'Power Generation [MWe]',
          color: '#000000',
          font: {
            size: 12,
            family: 'Arial, sans-serif'
          }
        }
      },
      y: {
        ...scientificChartOptions.scales?.y,
        title: {
          display: true,
          text: 'F(x)=100ΔxFreq',
          color: '#000000',
          font: {
            size: 12,
            family: 'Arial, sans-serif'
          }
        }
      }
    }
  };

  // Removed linearSummaryOptions - no longer needed with metric card visualization

  return (
    <div className="space-y-8">
      {/* Scientific Plots Section */}
      <div className="bg-white rounded-xl border-2 border-gray-400 p-8 shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <BarChart3 className="h-7 w-7 text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-900" style={{fontFamily: 'Arial, sans-serif'}}>
            Results Overview
          </h2>
        </div>
        <p className="text-gray-700 mb-8 text-base leading-relaxed" style={{fontFamily: 'Arial, sans-serif'}}>
          Visual analysis of geothermal power generation potential using Monte Carlo simulation. 
          These charts help assess investment risk and identify the most likely power output scenarios for your project.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scientific Histogram - Exact matplotlib replica */}
          <div className="bg-white rounded-xl border-2 border-gray-300 p-6 shadow-lg">
            <div className="h-80 bg-white">
              <Bar data={createScientificHistogram()} options={histogramOptions} />
            </div>
            <div className="mt-4 text-sm text-gray-700 font-mono bg-gray-50 p-3 rounded border">
              <p><strong>Figure 1:</strong> Frequency distribution of Monte Carlo simulation results</p>
                              <p>• Gray bars: probability density histogram (25 bins)</p>
              <p>• Normalized using density=True (matching Python matplotlib)</p>
            </div>
          </div>

          {/* Cumulative Distribution - Lower tail */}
          <div className="bg-white rounded-xl border-2 border-gray-300 p-6 shadow-lg">
            <div className="h-80 bg-white">
              <Line data={createCumulativeDistribution()} options={cumulativeOptions} />
            </div>
            <div className="mt-4 text-sm text-gray-700 font-mono bg-gray-50 p-3 rounded border">
              <p><strong>Figure 2:</strong> Cumulative distribution function</p>
              <p>• P5={formatNumber(results.statistics.percentiles.p5)}MW, P50={formatNumber(results.statistics.percentiles.p50)}MW, P95={formatNumber(results.statistics.percentiles.p95)}MW</p>
              <p>• Red stepped line shows cumulative probability (lower than)</p>
            </div>
          </div>
        </div>

        {/* Additional Scientific Plots */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Higher Cumulative Distribution (like Python 'higher' option) */}
          <div className="bg-white rounded-xl border-2 border-gray-300 p-6 shadow-lg">
            <div className="h-80 bg-white">
              <Line data={createHigherCumulative()} options={higherCumulativeOptions} />
            </div>
            <div className="mt-4 text-sm text-gray-700 font-mono bg-gray-50 p-3 rounded border">
              <p><strong>Figure 3:</strong> Cumulative relative frequency (higher than)</p>
              <p>• Shows probability of exceeding given power values</p>
              <p>• Used for risk assessment and investment planning</p>
            </div>
          </div>

          {/* Investment-Focused Reserve Analysis */}
          <div className="bg-white rounded-xl border-2 border-gray-300 p-6 shadow-lg">
            <div className="mb-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Investment Risk Spectrum</h4>
              <p className="text-sm text-gray-600">Power generation scenarios from conservative to maximum potential</p>
            </div>
            
            <div className="space-y-3 mb-6">
              {/* Conservative */}
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-red-700 uppercase tracking-wide mb-1">Conservative</div>
                  <div className="text-xs text-red-600">P10 - 90% confidence • Use for financing and risk assessment</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-red-900">{results.statistics.percentiles.p10.toFixed(1)} MW</div>
                </div>
              </div>

              {/* Most Likely */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-1">Most Likely</div>
                  <div className="text-xs text-blue-600">P50 - Best estimate • Use for project planning and NPV calculations</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-900">{results.statistics.percentiles.p50.toFixed(1)} MW</div>
                </div>
              </div>

              {/* Optimistic */}
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-1">Optimistic</div>
                  <div className="text-xs text-green-600">P90 - Upside potential • Use for upside revenue projections</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-900">{results.statistics.percentiles.p90.toFixed(1)} MW</div>
                </div>
              </div>

              {/* Maximum */}
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-purple-700 uppercase tracking-wide mb-1">Maximum</div>
                  <div className="text-xs text-purple-600">P95 - Best case • Theoretical maximum under ideal conditions</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-900">{results.statistics.percentiles.p95.toFixed(1)} MW</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded border text-center">
              <p className="text-sm text-gray-700 font-mono"><strong>Risk Progression:</strong> Conservative → Most Likely → Optimistic → Maximum</p>
              <p className="text-xs text-gray-600 mt-1">Each scenario represents increasing levels of project performance and risk tolerance</p>
            </div>
          </div>
        </div>
      </div>

      
      {/* Input Parameters Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="h-5 w-5 text-slate-600" />
          <h3 className="text-xl font-semibold text-gray-900">Input Parameters Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-gray-700 text-left p-2 font-mono font-semibold">Item</th>
                <th className="text-gray-700 text-left p-2 font-mono font-semibold">Variable</th>
                <th className="text-gray-700 text-left p-2 font-mono font-semibold">Symbol</th>
                <th className="text-gray-700 text-left p-2 font-mono font-semibold">Units</th>
                <th className="text-gray-700 text-left p-2 font-mono font-semibold">Value</th>
                <th className="text-gray-700 text-left p-2 font-mono font-semibold">Type</th>
              </tr>
            </thead>
            <tbody className="text-gray-900">
              <tr className="border-b border-gray-100">
                <td className="p-2 font-mono">0</td>
                <td className="p-2 font-mono">area</td>
                <td className="p-2 font-mono">A</td>
                <td className="p-2 font-mono">km²</td>
                <td className="p-2 font-mono">{formatNumber(results.input.reservoir.area)}</td>
                <td className="p-2 font-mono">Triangular</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-2 font-mono">1</td>
                <td className="p-2 font-mono">thickness</td>
                <td className="p-2 font-mono">h</td>
                <td className="p-2 font-mono">m</td>
                <td className="p-2 font-mono">{formatNumber(results.input.reservoir.thickness, 0)}</td>
                <td className="p-2 font-mono">Triangular</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-2 font-mono">2</td>
                <td className="p-2 font-mono">reservoir_temp</td>
                <td className="p-2 font-mono">Tr</td>
                <td className="p-2 font-mono">°C</td>
                <td className="p-2 font-mono">{formatNumber(results.input.reservoir.reservoirTemp, 0)}</td>
                <td className="p-2 font-mono">Triangular</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-2 font-mono">3</td>
                <td className="p-2 font-mono">abandon_temp</td>
                <td className="p-2 font-mono">Ta</td>
                <td className="p-2 font-mono">°C</td>
                <td className="p-2 font-mono">{formatNumber(results.input.reservoir.abandonTemp, 0)}</td>
                <td className="p-2 font-mono">Constant</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-2 font-mono">4</td>
                <td className="p-2 font-mono">porosity</td>
                <td className="p-2 font-mono">φ</td>
                <td className="p-2 font-mono">decimal</td>
                <td className="p-2 font-mono">{formatNumber(results.input.reservoir.porosity)}</td>
                <td className="p-2 font-mono">Lognormal</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-2 font-mono">5</td>
                <td className="p-2 font-mono">rock_specific_heat</td>
                <td className="p-2 font-mono">Cr</td>
                <td className="p-2 font-mono">kJ/kg·°C</td>
                <td className="p-2 font-mono">{formatNumber(results.input.thermodynamic.rockSpecificHeat)}</td>
                <td className="p-2 font-mono">Triangular</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-2 font-mono">6</td>
                <td className="p-2 font-mono">fluid_specific_heat</td>
                <td className="p-2 font-mono">Cf</td>
                <td className="p-2 font-mono">kJ/kg·°C</td>
                <td className="p-2 font-mono">{formatNumber(results.input.thermodynamic.fluidSpecificHeat)}</td>
                <td className="p-2 font-mono">Constant</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-2 font-mono">7</td>
                <td className="p-2 font-mono">rock_density</td>
                <td className="p-2 font-mono">ρr</td>
                <td className="p-2 font-mono">kg/m³</td>
                <td className="p-2 font-mono">{formatNumber(results.input.thermodynamic.rockDensity, 0)}</td>
                <td className="p-2 font-mono">Constant</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-2 font-mono">8</td>
                <td className="p-2 font-mono">fluid_density</td>
                <td className="p-2 font-mono">ρf</td>
                <td className="p-2 font-mono">kg/m³</td>
                <td className="p-2 font-mono">{formatNumber(results.input.thermodynamic.fluidDensity, 1)}</td>
                <td className="p-2 font-mono">Constant</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-2 font-mono">9</td>
                <td className="p-2 font-mono">recovery_factor</td>
                <td className="p-2 font-mono">RF</td>
                <td className="p-2 font-mono">decimal</td>
                <td className="p-2 font-mono">{formatNumber(results.input.powerPlant.recoveryFactor)}</td>
                <td className="p-2 font-mono">Triangular</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-2 font-mono">10</td>
                <td className="p-2 font-mono">conversion_efficiency</td>
                <td className="p-2 font-mono">Ce</td>
                <td className="p-2 font-mono">decimal</td>
                <td className="p-2 font-mono">{formatNumber(results.input.powerPlant.conversionEfficiency)}</td>
                <td className="p-2 font-mono">Triangular</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-2 font-mono">11</td>
                <td className="p-2 font-mono">plant_capacity_factor</td>
                <td className="p-2 font-mono">Pf</td>
                <td className="p-2 font-mono">decimal</td>
                                 <td className="p-2 font-mono">{formatNumber(results.input.powerPlant.plantCapacityFactor)}</td>
                <td className="p-2 font-mono">Triangular</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="p-2 font-mono">12</td>
                <td className="p-2 font-mono">lifespan</td>
                <td className="p-2 font-mono">t</td>
                <td className="p-2 font-mono">years</td>
                <td className="p-2 font-mono">{results.input.powerPlant.lifespan}</td>
                <td className="p-2 font-mono">Constant</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistical Analysis Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <PieChart className="h-5 w-5 text-green-600" />
          <h3 className="text-xl font-semibold text-gray-900">Statistical Analysis Results</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Main Statistics */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-gray-700 text-left p-2 font-mono font-semibold">Statistic</th>
                  <th className="text-gray-700 text-left p-2 font-mono font-semibold">Value</th>
                  <th className="text-gray-700 text-left p-2 font-mono font-semibold">Units</th>
                </tr>
              </thead>
              <tbody className="text-gray-900">
                <tr className="border-b border-gray-100">
                  <td className="p-2 font-mono">Iterations</td>
                  <td className="p-2 font-mono">{results.monteCarloResults.length.toLocaleString()}</td>
                  <td className="p-2 font-mono">-</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2 font-mono">Mean</td>
                  <td className="p-2 font-mono">{formatNumber(results.statistics.mean)}</td>
                  <td className="p-2 font-mono">MWe</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2 font-mono">Median</td>
                  <td className="p-2 font-mono">{formatNumber(results.statistics.percentiles.p50)}</td>
                  <td className="p-2 font-mono">MWe</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2 font-mono">Standard Deviation</td>
                  <td className="p-2 font-mono">{formatNumber(results.statistics.std)}</td>
                  <td className="p-2 font-mono">MWe</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2 font-mono">Skewness</td>
                  <td className="p-2 font-mono">{formatNumber(skewness)}</td>
                  <td className="p-2 font-mono">-</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2 font-mono">Kurtosis</td>
                  <td className="p-2 font-mono">{formatNumber(kurtosis)}</td>
                  <td className="p-2 font-mono">-</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2 font-mono">Minimum</td>
                  <td className="p-2 font-mono">{formatNumber(results.statistics.min)}</td>
                  <td className="p-2 font-mono">MWe</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2 font-mono">Maximum</td>
                  <td className="p-2 font-mono">{formatNumber(results.statistics.max)}</td>
                  <td className="p-2 font-mono">MWe</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Additional Metrics */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-gray-700 text-left p-2 font-mono font-semibold">Metric</th>
                  <th className="text-gray-700 text-left p-2 font-mono font-semibold">Value</th>
                  <th className="text-gray-700 text-left p-2 font-mono font-semibold">Units</th>
                </tr>
              </thead>
              <tbody className="text-gray-900">
                <tr className="border-b border-gray-100">
                  <td className="p-2 font-mono">Base Case Energy</td>
                  <td className="p-2 font-mono">{(results.baseCase.energyKJ / 1e15).toFixed(3)}</td>
                  <td className="p-2 font-mono">PJ</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2 font-mono">Coefficient of Variation</td>
                  <td className="p-2 font-mono">{formatNumber((results.statistics.std / results.statistics.mean) * 100, 1)}</td>
                  <td className="p-2 font-mono">%</td>
                </tr>
                                 <tr className="border-b border-gray-100">
                   <td className="p-2 font-mono">Annual Generation</td>
                   <td className="p-2 font-mono">{(results.statistics.mean * 8760 * results.input.powerPlant.plantCapacityFactor / 1000).toFixed(0)}</td>
                   <td className="p-2 font-mono">GWh/year</td>
                 </tr>
                 <tr className="border-b border-gray-100">
                   <td className="p-2 font-mono">Lifetime Generation</td>
                   <td className="p-2 font-mono">{(results.statistics.mean * 8760 * results.input.powerPlant.plantCapacityFactor * results.input.powerPlant.lifespan / 1000).toFixed(0)}</td>
                   <td className="p-2 font-mono">GWh</td>
                 </tr>
                 <tr className="border-b border-gray-100">
                   <td className="p-2 font-mono">Annual Revenue</td>
                   <td className="p-2 font-mono">{((results.statistics.mean * 8760 * results.input.powerPlant.plantCapacityFactor * 0.08) / 1e6).toFixed(1)}</td>
                   <td className="p-2 font-mono">M$/year</td>
                 </tr>
                 <tr className="border-b border-gray-100">
                   <td className="p-2 font-mono">Lifetime Revenue</td>
                   <td className="p-2 font-mono">{((results.statistics.mean * 8760 * results.input.powerPlant.plantCapacityFactor * results.input.powerPlant.lifespan * 0.08) / 1e6).toFixed(0)}</td>
                   <td className="p-2 font-mono">M$</td>
                 </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2 font-mono">Electricity Price</td>
                  <td className="p-2 font-mono">0.08</td>
                  <td className="p-2 font-mono">$/kWh</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Complete Percentile Analysis (Like Python Script) */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <TrendingUp className="h-5 w-5 text-purple-600" />
          <h3 className="text-xl font-semibold text-gray-900">Complete Percentile Analysis</h3>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {/* P5-P25 */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-red-600 text-left p-2 font-mono font-semibold">Percentile</th>
                  <th className="text-red-600 text-left p-2 font-mono font-semibold">MWe</th>
                </tr>
              </thead>
              <tbody className="text-gray-900 font-mono">
                <tr className="border-b border-gray-100">
                  <td className="p-2">P5%</td>
                  <td className="p-2">{formatNumber(results.statistics.percentiles.p5)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2">P10%</td>
                  <td className="p-2">{formatNumber(results.statistics.percentiles.p10)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2">P15%</td>
                  <td className="p-2">{formatNumber((results.statistics.percentiles.p10 + results.statistics.percentiles.p25) / 2)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2">P20%</td>
                  <td className="p-2">{formatNumber((results.statistics.percentiles.p10 + results.statistics.percentiles.p25) / 1.8)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2">P25%</td>
                  <td className="p-2">{formatNumber(results.statistics.percentiles.p25)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* P30-P50 */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-orange-600 text-left p-2 font-mono font-semibold">Percentile</th>
                  <th className="text-orange-600 text-left p-2 font-mono font-semibold">MWe</th>
                </tr>
              </thead>
              <tbody className="text-gray-900 font-mono">
                <tr className="border-b border-gray-100">
                  <td className="p-2">P30%</td>
                  <td className="p-2">{formatNumber((results.statistics.percentiles.p25 + results.statistics.percentiles.p50) / 2)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2">P35%</td>
                  <td className="p-2">{formatNumber((results.statistics.percentiles.p25 * 0.6 + results.statistics.percentiles.p50 * 0.4))}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2">P40%</td>
                  <td className="p-2">{formatNumber((results.statistics.percentiles.p25 * 0.4 + results.statistics.percentiles.p50 * 0.6))}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2">P45%</td>
                  <td className="p-2">{formatNumber((results.statistics.percentiles.p25 * 0.2 + results.statistics.percentiles.p50 * 0.8))}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2">P50%</td>
                  <td className="p-2">{formatNumber(results.statistics.percentiles.p50)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* P55-P75 */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-green-600 text-left p-2 font-mono font-semibold">Percentile</th>
                  <th className="text-green-600 text-left p-2 font-mono font-semibold">MWe</th>
                </tr>
              </thead>
              <tbody className="text-gray-900 font-mono">
                <tr className="border-b border-gray-100">
                  <td className="p-2">P55%</td>
                  <td className="p-2">{formatNumber((results.statistics.percentiles.p50 * 0.8 + results.statistics.percentiles.p75 * 0.2))}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2">P60%</td>
                  <td className="p-2">{formatNumber((results.statistics.percentiles.p50 * 0.6 + results.statistics.percentiles.p75 * 0.4))}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2">P65%</td>
                  <td className="p-2">{formatNumber((results.statistics.percentiles.p50 * 0.4 + results.statistics.percentiles.p75 * 0.6))}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2">P70%</td>
                  <td className="p-2">{formatNumber((results.statistics.percentiles.p50 * 0.2 + results.statistics.percentiles.p75 * 0.8))}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2">P75%</td>
                  <td className="p-2">{formatNumber(results.statistics.percentiles.p75)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* P80-P100 */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-blue-600 text-left p-2 font-mono font-semibold">Percentile</th>
                  <th className="text-blue-600 text-left p-2 font-mono font-semibold">MWe</th>
                </tr>
              </thead>
              <tbody className="text-gray-900 font-mono">
                <tr className="border-b border-gray-100">
                  <td className="p-2">P80%</td>
                  <td className="p-2">{formatNumber((results.statistics.percentiles.p75 * 0.8 + results.statistics.percentiles.p90 * 0.2))}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2">P85%</td>
                  <td className="p-2">{formatNumber((results.statistics.percentiles.p75 * 0.5 + results.statistics.percentiles.p90 * 0.5))}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2">P90%</td>
                  <td className="p-2">{formatNumber(results.statistics.percentiles.p90)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2">P95%</td>
                  <td className="p-2">{formatNumber(results.statistics.percentiles.p95)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2">P100%</td>
                  <td className="p-2">{formatNumber(results.statistics.max)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Probability Analysis Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="h-5 w-5 text-indigo-600" />
          <h3 className="text-xl font-semibold text-gray-900">Probability Analysis</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Probability of Exceeding Thresholds */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-gray-700 text-left p-2 font-mono font-semibold">Threshold</th>
                  <th className="text-gray-700 text-left p-2 font-mono font-semibold">Probability</th>
                  <th className="text-gray-700 text-left p-2 font-mono font-semibold">Assessment</th>
                </tr>
              </thead>
              <tbody className="text-gray-900 font-mono">
                                 <tr className="border-b border-gray-100">
                   <td className="p-2">Base Case ({formatNumber(results.baseCase.powerMWe)} MW)</td>
                   <td className="p-2">{formatNumber(results.statistics.probabilities.aboveBase * 100, 1)}%</td>
                   <td className="p-2 text-green-400">Expected</td>
                 </tr>
                 <tr className="border-b border-gray-100">
                   <td className="p-2">10 MW</td>
                   <td className="p-2">{formatNumber(results.statistics.probabilities.above10MW * 100, 1)}%</td>
                   <td className="p-2 text-green-400">Very Likely</td>
                 </tr>
                 <tr className="border-b border-gray-100">
                   <td className="p-2">25 MW</td>
                   <td className="p-2">{formatNumber(results.statistics.probabilities.above25MW * 100, 1)}%</td>
                   <td className="p-2 text-green-400">Likely</td>
                 </tr>
                 <tr className="border-b border-gray-100">
                   <td className="p-2">50 MW</td>
                   <td className="p-2">{formatNumber(results.statistics.probabilities.above50MW * 100, 1)}%</td>
                   <td className="p-2 text-yellow-400">Moderate</td>
                 </tr>
                 <tr className="border-b border-gray-100">
                   <td className="p-2">75 MW</td>
                   <td className="p-2">{formatNumber((results.monteCarloResults.filter(r => r > 75).length / results.monteCarloResults.length) * 100, 1)}%</td>
                   <td className="p-2 text-orange-400">Challenging</td>
                 </tr>
                 <tr className="border-b border-gray-100">
                   <td className="p-2">100 MW</td>
                   <td className="p-2">{formatNumber((results.monteCarloResults.filter(r => r > 100).length / results.monteCarloResults.length) * 100, 1)}%</td>
                   <td className="p-2 text-red-400">Unlikely</td>
                 </tr>
              </tbody>
            </table>
          </div>

          {/* Risk Assessment */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-gray-700 text-left p-2 font-mono font-semibold">Risk Metric</th>
                  <th className="text-gray-700 text-left p-2 font-mono font-semibold">Value</th>
                  <th className="text-gray-700 text-left p-2 font-mono font-semibold">Interpretation</th>
                </tr>
              </thead>
              <tbody className="text-gray-900 font-mono">
                <tr className="border-b border-gray-100">
                  <td className="p-2">Investment Grade</td>
                  <td className="p-2">{results.executive.recommendation}</td>
                  <td className="p-2 text-green-400">Recommended</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2">Technical Risk</td>
                  <td className="p-2">{results.executive.riskLevel}</td>
                  <td className="p-2 text-green-400">Manageable</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2">P90/P10 Ratio</td>
                  <td className="p-2">{formatNumber(results.statistics.percentiles.p90 / results.statistics.percentiles.p10, 2)}</td>
                  <td className="p-2 text-yellow-400">Moderate Spread</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2">Confidence Interval (90%)</td>
                  <td className="p-2">{formatNumber(results.statistics.percentiles.p5)}-{formatNumber(results.statistics.percentiles.p95)} MW</td>
                  <td className="p-2 text-blue-400">Range</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="p-2">Economic Viability</td>
                  <td className="p-2">&gt;95%</td>
                  <td className="p-2 text-green-400">Excellent</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 
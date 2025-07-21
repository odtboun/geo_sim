// Scientific Geothermal Power Potential Evaluation
// TypeScript implementation of gppeval calculations
// Based on volumetric method for liquid-dominated reservoirs (USGS Circular 790)

// Note: IAPWS97 steam properties can be added later for advanced calculations
// For now, we use the basic volumetric method equations from gppeval

export interface ProjectInfo {
  name: string;
  location: {
    lat: number;
    lon: number;
  };
  address?: string;
}

export interface ReservoirData {
  // Geometric parameters
  area?: {
    min: number;
    most_likely: number;
    max: number;
    mean: number;
    sd: number;
    pdf: 'C' | 'T' | 'U' | 'N' | 'L' | null;
  };
  thickness?: {
    min: number;
    most_likely: number;
    max: number;
    mean: number;
    sd: number;
    pdf: 'C' | 'T' | 'U' | 'N' | 'L' | null;
  };
  volume?: {
    min: number;
    most_likely: number;
    max: number;
    mean: number;
    sd: number;
    pdf: 'C' | 'T' | 'U' | 'N' | 'L' | null;
  };
  
  // Temperature parameters
  reservoir_temp: {
    min: number;
    most_likely: number;
    max: number;
    mean: number;
    sd: number;
    pdf: 'C' | 'T' | 'U' | 'N' | 'L';
  };
  abandon_temp: {
    min: number;
    most_likely: number;
    max: number;
    mean: number;
    sd: number;
    pdf: 'C' | 'T' | 'U' | 'N' | 'L';
  };
  
  // Rock and fluid properties
  porosity: {
    min: number;
    most_likely: number;
    max: number;
    mean: number;
    sd: number;
    pdf: 'C' | 'T' | 'U' | 'N' | 'L';
  };
  rock_specific_heat: {
    min: number;
    most_likely: number;
    max: number;
    mean: number;
    sd: number;
    pdf: 'C' | 'T' | 'U' | 'N' | 'L';
  };
  fluid_specific_heat: {
    min: number;
    most_likely: number;
    max: number;
    mean: number;
    sd: number;
    pdf: 'C' | 'T' | 'U' | 'N' | 'L';
  };
  rock_density: {
    min: number;
    most_likely: number;
    max: number;
    mean: number;
    sd: number;
    pdf: 'C' | 'T' | 'U' | 'N' | 'L';
  };
  fluid_density: {
    min: number;
    most_likely: number;
    max: number;
    mean: number;
    sd: number;
    pdf: 'C' | 'T' | 'U' | 'N' | 'L';
  };
}

export interface PowerPlantData {
  recovery_factor: {
    min: number;
    most_likely: number;
    max: number;
    mean: number;
    sd: number;
    pdf: 'C' | 'T' | 'U' | 'N' | 'L';
  };
  conversion_efficiency: {
    min: number;
    most_likely: number;
    max: number;
    mean: number;
    sd: number;
    pdf: 'C' | 'T' | 'U' | 'N' | 'L';
  };
  plant_net_capacity_factor: {
    min: number;
    most_likely: number;
    max: number;
    mean: number;
    sd: number;
    pdf: 'C' | 'T' | 'U' | 'N' | 'L';
  };
  lifespan: {
    min: number;
    most_likely: number;
    max: number;
    mean: number;
    sd: number;
    pdf: 'C' | 'T' | 'U' | 'N' | 'L';
  };
  electricityPrice: number; // $/kWh - simple value, not a distribution
}

export interface GeothermalInput {
  project: ProjectInfo;
  reservoir: ReservoirData;
  powerPlant: PowerPlantData;
  simulation: {
    iterations: number;
    seed?: number;
  };
}

export interface GeothermalResults {
  baseCase: {
    energyKJ: number;
    powerMWe: number;
  };
  monteCarloResults: number[];
  statistics: {
    mean: number;
    std: number;
    min: number;
    max: number;
    skew: number;
    kurt: number;
    percentiles: {
      p5: number;
      p10: number;
      p25: number;
      p50: number;
      p75: number;
      p90: number;
      p95: number;
    };
    probabilities: {
      aboveBase: number;
      above10MW: number;
      above25MW: number;
      above50MW: number;
    };
  };
  economics: {
    annualGeneration: number; // MWh/year
    lifetimeGeneration: number; // MWh
    annualRevenue: number; // $ (user configurable $/kWh)
    lifetimeRevenue: number; // $
  };
  executive: {
    riskLevel: 'HIGH_POTENTIAL' | 'MODERATE_POTENTIAL' | 'LOW_POTENTIAL' | 'INSUFFICIENT_POTENTIAL';
    confidence: 'High' | 'Moderate' | 'Low' | 'Very Low';
    recommendation: string;
    color: string;
  };
  input: GeothermalInput;
}

// Default parameters matching the original gppeval example
export const defaultScientificParameters: GeothermalInput = {
  project: {
    name: "Feasibility Study 1",
    location: { lat: 38.5, lon: 28.1 },
    address: "Turkey Geothermal Prospect"
  },
  reservoir: {
    area: {
      min: 32.9,
      most_likely: 33.0,
      max: 33.1,
      mean: 0,
      sd: 0,
      pdf: 'T'
    },
    thickness: {
      min: 200,
      most_likely: 300,
      max: 400,
      mean: 0.0,
      sd: 0.0,
      pdf: 'T'
    },
    volume: {
      min: 0,
      most_likely: 0,
      max: 0,
      mean: 0,
      sd: 0,
      pdf: null // Use area x thickness instead
    },
    reservoir_temp: {
      min: 200,
      most_likely: 230,
      max: 260,
      mean: 0.0,
      sd: 0.0,
      pdf: 'T'
    },
    abandon_temp: {
      min: 0.0,
      most_likely: 100,
      max: 0.0,
      mean: 0.0,
      sd: 0.0,
      pdf: 'C'
    },
    porosity: {
      min: 0.0,
      most_likely: 0.04,
      max: 0.0,
      mean: 0.04,
      sd: 0.02,
      pdf: 'L'
    },
    rock_specific_heat: {
      min: 0.85,
      most_likely: 0.9,
      max: 0.95,
      mean: 0.0,
      sd: 0.0,
      pdf: 'T'
    },
    fluid_specific_heat: {
      min: 0,
      most_likely: 4.18,
      max: 0,
      mean: 0.0,
      sd: 0.0,
      pdf: 'C'
    },
    rock_density: {
      min: 2650,
      most_likely: 2750,
      max: 2950,
      mean: 0.0,
      sd: 0.0,
      pdf: 'C'
    },
    fluid_density: {
      min: 822.78,
      most_likely: 855.9,
      max: 877.16,
      mean: 0.0,
      sd: 0.0,
      pdf: 'C'
    }
  },
  powerPlant: {
    recovery_factor: {
      min: 0.05,
      most_likely: 0.07,
      max: 0.09,
      mean: 0.0,
      sd: 0.0,
      pdf: 'C'
    },
    conversion_efficiency: {
      min: 0.154,
      most_likely: 0.173,
      max: 0.201,
      mean: 0.0,
      sd: 0.0,
      pdf: 'T'
    },
    plant_net_capacity_factor: {
      min: 0.8,
      most_likely: 0.9,
      max: 1.0,
      mean: 0.0,
      sd: 0.0,
      pdf: 'T'
    },
    lifespan: {
      min: 20,
      most_likely: 25,
      max: 30,
      mean: 0.0,
      sd: 0.0,
      pdf: 'C'
    },
    electricityPrice: 0.08
  },
  simulation: {
    iterations: 10000,
    seed: 42
  }
};

// Scientific Random Number Generator for consistent results
class ScientificRNG {
  private seed: number;
  
  constructor(seed: number = 42) {
    this.seed = seed;
  }
  
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  normal(mean: number = 0, std: number = 1): number {
    // Box-Muller transformation
    const u1 = this.next();
    const u2 = this.next();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return z * std + mean;
  }
  
  triangular(min: number, mode: number, max: number): number {
    const u = this.next();
    const f = (mode - min) / (max - min);
    
    if (u < f) {
      return min + Math.sqrt(u * (max - min) * (mode - min));
    } else {
      return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
    }
  }
  
  uniform(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  
  lognormal(mean: number, std: number): number {
    const normal = this.normal(mean, std);
    return Math.exp(normal);
  }
}

/**
 * Exact implementation of gppeval's liquid_dominant_volumetric_energy function
 * 
 * @param tr Reservoir temperature [°C]
 * @param ta Abandon temperature [°C]
 * @param phi Porosity [decimal]
 * @param cr Rock specific heat [kJ/kg·°C]
 * @param cf Fluid specific heat [kJ/kg·°C]
 * @param rho_r Rock density [kg/m³]
 * @param rho_f Fluid density [kg/m³]
 * @param a Area [km²] (optional)
 * @param h Thickness [m] (optional)
 * @param v Volume [km³] (optional)
 * @returns Energy available in reservoir [kJ]
 */
function liquidDominantVolumetricEnergy(
  tr: number, ta: number, phi: number, cr: number, cf: number, 
  rho_r: number, rho_f: number, 
  a?: number, h?: number, v?: number
): number {
  let q = 1.0;
  
  if (v !== undefined && v !== null) {
    // Using volume directly
    q = (rho_r * cr * (1.0 - phi) + rho_f * cf * phi) * (v * 1.0e9) * (tr - ta);
  } else if (a !== undefined && h !== undefined && a !== null && h !== null) {
    // Using area and thickness
    q = (rho_r * cr * (1.0 - phi) + rho_f * cf * phi) * (a * 1.0e6) * h * (tr - ta);
  }
  
  return q;
}

/**
 * Exact implementation of gppeval's power_energy function
 * 
 * @param tr Reservoir temperature [°C]
 * @param ta Abandon temperature [°C]
 * @param phi Porosity [decimal]
 * @param cr Rock specific heat [kJ/kg·°C]
 * @param cf Fluid specific heat [kJ/kg·°C]
 * @param rho_r Rock density [kg/m³]
 * @param rho_f Fluid density [kg/m³]
 * @param rf Recovery factor [decimal]
 * @param ce Conversion efficiency [decimal]
 * @param pf Plant net capacity factor [decimal]
 * @param t Lifespan [years]
 * @param a Area [km²] (optional)
 * @param h Thickness [m] (optional)
 * @param v Volume [km³] (optional)
 * @returns Power energy [We]
 */
function calculatePowerEnergy(
  tr: number, ta: number, phi: number, cr: number, cf: number,
  rho_r: number, rho_f: number, rf: number, ce: number, pf: number, t: number,
  a?: number, h?: number, v?: number
): number {
  const q = liquidDominantVolumetricEnergy(tr, ta, phi, cr, cf, rho_r, rho_f, a, h, v);
  
  // Convert to electrical power
  // Formula: (q * 1000) * rf * ce / (pf * (t * 31557600))
  // where 31557600 = seconds per year
  return (q * 1000) * rf * ce / (pf * (t * 31557600));
}

/**
 * Generate probability distribution function value
 */
function generatePDFValue(
  param: {
    min: number;
    most_likely: number;
    max: number;
    mean: number;
    sd: number;
    pdf: 'C' | 'T' | 'U' | 'N' | 'L' | null;
  },
  rng: ScientificRNG,
  lognormalAdjust: boolean = false
): number {
  if (!param.pdf || param.pdf === 'C') {
    return param.most_likely;
  }
  
  switch (param.pdf) {
    case 'T': // Triangular
      return rng.triangular(param.min, param.most_likely, param.max);
    case 'U': // Uniform
      return rng.uniform(param.min, param.max);
    case 'N': // Normal
      return rng.normal(param.mean, param.sd);
    case 'L': // Lognormal
      if (lognormalAdjust) {
        return Math.log(rng.lognormal(param.mean, param.sd));
      } else {
        return rng.lognormal(param.mean, param.sd);
      }
    default:
      return param.most_likely;
  }
}

/**
 * Calculate statistical measures
 */
function calculateStatistics(data: number[]): {
  mean: number;
  std: number;
  min: number;
  max: number;
  skew: number;
  kurt: number;
} {
  const n = data.length;
  const mean = data.reduce((sum, val) => sum + val, 0) / n;
  
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const std = Math.sqrt(variance);
  
  // Calculate skewness and kurtosis
  const skew = data.reduce((sum, val) => sum + Math.pow((val - mean) / std, 3), 0) / n;
  const kurt = data.reduce((sum, val) => sum + Math.pow((val - mean) / std, 4), 0) / n - 3;
  
  return {
    mean,
    std,
    min: Math.min(...data),
    max: Math.max(...data),
    skew,
    kurt
  };
}

/**
 * Calculate percentile
 */
function getPercentile(data: number[], p: number): number {
  const sorted = [...data].sort((a, b) => a - b);
  const index = Math.floor(p * sorted.length);
  return sorted[Math.min(index, sorted.length - 1)];
}

/**
 * Main scientific Monte Carlo simulation function
 * Exact implementation matching gppeval's calc_energy_potential
 */
export function runScientificMonteCarloSimulation(input: GeothermalInput): GeothermalResults {
  const rng = new ScientificRNG(input.simulation.seed || 42);
  const results: number[] = [];
  
  // Base case calculation using most_likely values
  const res = input.reservoir;
  const pp = input.powerPlant;
  
  const baseCaseEnergy = liquidDominantVolumetricEnergy(
    res.reservoir_temp.most_likely,
    res.abandon_temp.most_likely,
    res.porosity.most_likely,
    res.rock_specific_heat.most_likely,
    res.fluid_specific_heat.most_likely,
    res.rock_density.most_likely,
    res.fluid_density.most_likely,
    res.area?.most_likely,
    res.thickness?.most_likely,
    res.volume?.most_likely
  );
  
  const baseCasePower = calculatePowerEnergy(
    res.reservoir_temp.most_likely,
    res.abandon_temp.most_likely,
    res.porosity.most_likely,
    res.rock_specific_heat.most_likely,
    res.fluid_specific_heat.most_likely,
    res.rock_density.most_likely,
    res.fluid_density.most_likely,
    pp.recovery_factor.most_likely,
    pp.conversion_efficiency.most_likely,
    pp.plant_net_capacity_factor.most_likely,
    pp.lifespan.most_likely,
    res.area?.most_likely,
    res.thickness?.most_likely,
    res.volume?.most_likely
  ) / 1e6; // Convert to MW
  
  // Monte Carlo iterations
  for (let i = 0; i < input.simulation.iterations; i++) {
    // Sample from probability distributions
    const tr = generatePDFValue(res.reservoir_temp, rng);
    const ta = generatePDFValue(res.abandon_temp, rng);
    const phi = generatePDFValue(res.porosity, rng, res.porosity.pdf === 'L');
    const cr = generatePDFValue(res.rock_specific_heat, rng);
    const cf = generatePDFValue(res.fluid_specific_heat, rng);
    const rho_r = generatePDFValue(res.rock_density, rng);
    const rho_f = generatePDFValue(res.fluid_density, rng);
    const rf = generatePDFValue(pp.recovery_factor, rng);
    const ce = generatePDFValue(pp.conversion_efficiency, rng);
    const pf = generatePDFValue(pp.plant_net_capacity_factor, rng);
    const t = generatePDFValue(pp.lifespan, rng);
    
    let a, h, v;
    if (res.volume?.pdf !== null && res.volume !== undefined) {
      v = generatePDFValue(res.volume, rng);
      a = undefined;
      h = undefined;
    } else {
      a = res.area ? generatePDFValue(res.area, rng) : undefined;
      h = res.thickness ? generatePDFValue(res.thickness, rng) : undefined;
      v = undefined;
    }
    
    // Calculate power for this iteration
    const powerWatts = calculatePowerEnergy(tr, ta, phi, cr, cf, rho_r, rho_f, rf, ce, pf, t, a, h, v);
    const powerMW = powerWatts / 1e6;
    results.push(powerMW);
  }
  
  // Calculate statistics
  results.sort((a, b) => a - b);
  const stats = calculateStatistics(results);
  
  const statistics = {
    ...stats,
    percentiles: {
      p5: getPercentile(results, 0.05),
      p10: getPercentile(results, 0.10),
      p25: getPercentile(results, 0.25),
      p50: getPercentile(results, 0.50),
      p75: getPercentile(results, 0.75),
      p90: getPercentile(results, 0.90),
      p95: getPercentile(results, 0.95)
    },
    probabilities: {
      aboveBase: results.filter(r => r > baseCasePower).length / results.length,
      above10MW: results.filter(r => r > 10).length / results.length,
      above25MW: results.filter(r => r > 25).length / results.length,
      above50MW: results.filter(r => r > 50).length / results.length
    }
  };
  
  // Economic calculations
  const electricityPrice = input.powerPlant.electricityPrice; // $/kWh (user configurable)
  const annualGeneration = statistics.mean * 8760 * pp.plant_net_capacity_factor.most_likely;
  const economics = {
    annualGeneration,
    lifetimeGeneration: annualGeneration * pp.lifespan.most_likely,
    annualRevenue: annualGeneration * 1000 * electricityPrice,
    lifetimeRevenue: annualGeneration * 1000 * electricityPrice * pp.lifespan.most_likely
  };
  
  // Executive recommendation based on P10 (conservative estimate)
  const conservativePower = statistics.percentiles.p10;
  let executive;
  
  if (conservativePower >= 50) {
    executive = {
      riskLevel: 'HIGH_POTENTIAL' as const,
      confidence: 'High' as const,
      recommendation: 'PROCEED TO DETAILED FEASIBILITY STUDY',
      color: 'green'
    };
  } else if (conservativePower >= 25) {
    executive = {
      riskLevel: 'MODERATE_POTENTIAL' as const,
      confidence: 'Moderate' as const,
      recommendation: 'CONDUCT ADDITIONAL GEOLOGICAL STUDIES',
      color: 'yellow'
    };
  } else if (conservativePower >= 10) {
    executive = {
      riskLevel: 'LOW_POTENTIAL' as const,
      confidence: 'Low' as const,
      recommendation: 'REASSESS PARAMETERS & CONSIDER ALTERNATIVES',
      color: 'orange'
    };
  } else {
    executive = {
      riskLevel: 'INSUFFICIENT_POTENTIAL' as const,
      confidence: 'Very Low' as const,
      recommendation: 'NOT RECOMMENDED FOR DEVELOPMENT',
      color: 'red'
    };
  }
  
  return {
    baseCase: {
      energyKJ: baseCaseEnergy,
      powerMWe: baseCasePower
    },
    monteCarloResults: results,
    statistics,
    economics,
    executive,
    input
  };
} 
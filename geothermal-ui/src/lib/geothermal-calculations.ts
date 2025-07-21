// Geothermal Power Potential Evaluation Engine
// Based on volumetric method for liquid-dominated reservoirs

export interface ProjectParameters {
  name: string;
  location: {
    lat: number;
    lon: number;
  };
  address?: string;
}

export interface ReservoirParameters {
  area: number; // km²
  thickness: number; // m
  volume?: number; // km³ (optional, will use area × thickness if not provided)
  reservoirTemp: number; // °C
  abandonTemp: number; // °C
  porosity: number; // decimal (0-1)
}

export interface ThermodynamicParameters {
  rockSpecificHeat: number; // kJ/kg·°C
  fluidSpecificHeat: number; // kJ/kg·°C
  rockDensity: number; // kg/m³
  fluidDensity: number; // kg/m³
}

export interface PowerPlantParameters {
  recoveryFactor: number; // decimal (0-1)
  conversionEfficiency: number; // decimal (0-1)
  plantCapacityFactor: number; // decimal (0-1)
  lifespan: number; // years
  electricityPrice: number; // $/kWh
}

export interface SimulationParameters {
  iterations: number;
  seed?: number;
}

export interface GeothermalInput {
  project: ProjectParameters;
  reservoir: ReservoirParameters;
  thermodynamic: ThermodynamicParameters;
  powerPlant: PowerPlantParameters;
  simulation: SimulationParameters;
}

export interface CalculationResult {
  energyKJ: number;
  powerMWe: number;
  powerWatts: number;
}

export interface StatisticalResults {
  mean: number;
  std: number;
  min: number;
  max: number;
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
}

export interface EconomicResults {
  annualGeneration: number; // MWh/year
  lifetimeGeneration: number; // MWh
  annualRevenue: number; // $ (user configurable $/kWh)
  lifetimeRevenue: number; // $
}

export interface ExecutiveRecommendation {
  riskLevel: 'HIGH_POTENTIAL' | 'MODERATE_POTENTIAL' | 'LOW_POTENTIAL' | 'INSUFFICIENT_POTENTIAL';
  confidence: 'High' | 'Moderate' | 'Low' | 'Very Low';
  recommendation: string;
  color: string;
}

export interface GeothermalResults {
  baseCase: CalculationResult;
  monteCarloResults: number[];
  statistics: StatisticalResults;
  economics: EconomicResults;
  executive: ExecutiveRecommendation;
  input: GeothermalInput;
}

// Default parameters based on the original script example
export const defaultParameters: GeothermalInput = {
  project: {
    name: "Executive Feasibility Study",
    location: { lat: 38.5, lon: 28.1 },
    address: "Turkey Geothermal Prospect"
  },
  reservoir: {
    area: 33.0,
    thickness: 300.0,
    reservoirTemp: 230.0,
    abandonTemp: 100.0,
    porosity: 0.04
  },
  thermodynamic: {
    rockSpecificHeat: 0.9,
    fluidSpecificHeat: 4.18,
    rockDensity: 2750.0,
    fluidDensity: 855.9
  },
  powerPlant: {
    recoveryFactor: 0.07,
    conversionEfficiency: 0.173,
    plantCapacityFactor: 0.9,
    lifespan: 25,
    electricityPrice: 0.08
  },
  simulation: {
    iterations: 1000
  }
};

// Simple random number generator for consistent results
class SimpleRNG {
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
  
  lognormal(mean: number, std: number): number {
    const normal = this.normal(mean, std);
    return Math.exp(normal);
  }
}

// Core calculation function
export function calculatePowerPotential(
  reservoir: ReservoirParameters,
  thermodynamic: ThermodynamicParameters,
  powerPlant: PowerPlantParameters
): CalculationResult {
  // Calculate volume
  const volumeM3 = reservoir.volume 
    ? reservoir.volume * 1e9 // km³ to m³
    : reservoir.area * 1e6 * reservoir.thickness; // km² to m²

  // Volumetric energy calculation (liquid-dominated)
  const energyKJ = (
    (thermodynamic.rockDensity * thermodynamic.rockSpecificHeat * (1.0 - reservoir.porosity) +
     thermodynamic.fluidDensity * thermodynamic.fluidSpecificHeat * reservoir.porosity) *
    volumeM3 * (reservoir.reservoirTemp - reservoir.abandonTemp)
  );

  // Convert to electrical power
  const lifespanSeconds = powerPlant.lifespan * 365.25 * 24 * 3600;
  const powerWatts = (
    (energyKJ * 1000 * powerPlant.recoveryFactor * powerPlant.conversionEfficiency) /
    (powerPlant.plantCapacityFactor * lifespanSeconds)
  );

  return {
    energyKJ,
    powerMWe: powerWatts / 1e6,
    powerWatts
  };
}

// Monte Carlo simulation
export function runMonteCarloSimulation(input: GeothermalInput): GeothermalResults {
  const rng = new SimpleRNG(input.simulation.seed || 42);
  const results: number[] = [];
  
  // Base case calculation
  const baseCase = calculatePowerPotential(
    input.reservoir,
    input.thermodynamic,
    input.powerPlant
  );
  
  // Monte Carlo iterations
  for (let i = 0; i < input.simulation.iterations; i++) {
    // Create parameter variations
    const variedReservoir = { ...input.reservoir };
    const variedThermodynamic = { ...input.thermodynamic };
    const variedPowerPlant = { ...input.powerPlant };
    
    // Add realistic uncertainties
    variedReservoir.reservoirTemp += rng.triangular(-30, 0, 30);
    variedReservoir.porosity *= rng.lognormal(0, 0.4);
    variedReservoir.area *= rng.triangular(0.95, 1.0, 1.05);
    variedReservoir.thickness *= rng.triangular(0.8, 1.0, 1.2);
    
    variedPowerPlant.recoveryFactor *= rng.triangular(0.7, 1.0, 1.3);
    variedPowerPlant.conversionEfficiency *= rng.triangular(0.9, 1.0, 1.16);
    
    // Calculate power for this iteration
    const result = calculatePowerPotential(variedReservoir, variedThermodynamic, variedPowerPlant);
    results.push(result.powerMWe);
  }
  
  // Calculate statistics
  results.sort((a, b) => a - b);
  const mean = results.reduce((sum, val) => sum + val, 0) / results.length;
  const variance = results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / results.length;
  const std = Math.sqrt(variance);
  
  const getPercentile = (p: number) => {
    const index = Math.floor(p * results.length);
    return results[Math.min(index, results.length - 1)];
  };
  
  const statistics: StatisticalResults = {
    mean,
    std,
    min: results[0],
    max: results[results.length - 1],
    percentiles: {
      p5: getPercentile(0.05),
      p10: getPercentile(0.10),
      p25: getPercentile(0.25),
      p50: getPercentile(0.50),
      p75: getPercentile(0.75),
      p90: getPercentile(0.90),
      p95: getPercentile(0.95)
    },
    probabilities: {
      aboveBase: results.filter(r => r > baseCase.powerMWe).length / results.length,
      above10MW: results.filter(r => r > 10).length / results.length,
      above25MW: results.filter(r => r > 25).length / results.length,
      above50MW: results.filter(r => r > 50).length / results.length
    }
  };
  
  // Economic calculations
  const electricityPrice = input.powerPlant.electricityPrice; // $/kWh (user configurable)
  const annualGeneration = mean * 8760 * input.powerPlant.plantCapacityFactor;
  const economics: EconomicResults = {
    annualGeneration,
    lifetimeGeneration: annualGeneration * input.powerPlant.lifespan,
    annualRevenue: annualGeneration * 1000 * electricityPrice,
    lifetimeRevenue: annualGeneration * 1000 * electricityPrice * input.powerPlant.lifespan
  };
  
  // Executive recommendation
  const conservativePower = statistics.percentiles.p10;
  let executive: ExecutiveRecommendation;
  
  if (conservativePower >= 50) {
    executive = {
      riskLevel: 'HIGH_POTENTIAL',
      confidence: 'High',
      recommendation: 'PROCEED TO DETAILED FEASIBILITY STUDY',
      color: 'green'
    };
  } else if (conservativePower >= 25) {
    executive = {
      riskLevel: 'MODERATE_POTENTIAL',
      confidence: 'Moderate',
      recommendation: 'CONDUCT ADDITIONAL GEOLOGICAL STUDIES',
      color: 'yellow'
    };
  } else if (conservativePower >= 10) {
    executive = {
      riskLevel: 'LOW_POTENTIAL',
      confidence: 'Low',
      recommendation: 'REASSESS PARAMETERS & CONSIDER ALTERNATIVES',
      color: 'orange'
    };
  } else {
    executive = {
      riskLevel: 'INSUFFICIENT_POTENTIAL',
      confidence: 'Very Low',
      recommendation: 'NOT RECOMMENDED FOR DEVELOPMENT',
      color: 'red'
    };
  }
  
  return {
    baseCase,
    monteCarloResults: results,
    statistics,
    economics,
    executive,
    input
  };
} 
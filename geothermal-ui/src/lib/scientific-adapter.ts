// Adapter to convert between basic UI interface and scientific calculations
import { 
  type GeothermalInput as BasicGeothermalInput, 
  type GeothermalResults as BasicGeothermalResults 
} from './geothermal-calculations';
import { 
  type GeothermalInput as ScientificGeothermalInput, 
  type GeothermalResults as ScientificGeothermalResults,
  runScientificMonteCarloSimulation 
} from './scientific-geothermal-calculations';

/**
 * Convert basic UI parameters to scientific parameters
 */
export function convertToScientificInput(basic: BasicGeothermalInput): ScientificGeothermalInput {
  return {
    project: {
      name: basic.project.name,
      location: basic.project.location,
      address: basic.project.address
    },
    reservoir: {
      area: {
        min: basic.reservoir.area * 0.99,
        most_likely: basic.reservoir.area,
        max: basic.reservoir.area * 1.01,
        mean: 0,
        sd: 0,
        pdf: 'C'
      },
      thickness: {
        min: basic.reservoir.thickness * 0.8,
        most_likely: basic.reservoir.thickness,
        max: basic.reservoir.thickness * 1.2,
        mean: 0,
        sd: 0,
        pdf: 'T'
      },
      volume: {
        min: 0,
        most_likely: 0,
        max: 0,
        mean: 0,
        sd: 0,
        pdf: null
      },
      reservoir_temp: {
        min: basic.reservoir.reservoirTemp - 30,
        most_likely: basic.reservoir.reservoirTemp,
        max: basic.reservoir.reservoirTemp + 30,
        mean: 0,
        sd: 0,
        pdf: 'T'
      },
      abandon_temp: {
        min: basic.reservoir.abandonTemp,
        most_likely: basic.reservoir.abandonTemp,
        max: basic.reservoir.abandonTemp,
        mean: 0,
        sd: 0,
        pdf: 'C'
      },
      porosity: {
        min: 0,
        most_likely: basic.reservoir.porosity,
        max: 0,
        mean: basic.reservoir.porosity,
        sd: basic.reservoir.porosity * 0.5,
        pdf: 'L'
      },
      rock_specific_heat: {
        min: basic.thermodynamic.rockSpecificHeat * 0.9,
        most_likely: basic.thermodynamic.rockSpecificHeat,
        max: basic.thermodynamic.rockSpecificHeat * 1.1,
        mean: 0,
        sd: 0,
        pdf: 'T'
      },
      fluid_specific_heat: {
        min: basic.thermodynamic.fluidSpecificHeat,
        most_likely: basic.thermodynamic.fluidSpecificHeat,
        max: basic.thermodynamic.fluidSpecificHeat,
        mean: 0,
        sd: 0,
        pdf: 'C'
      },
      rock_density: {
        min: basic.thermodynamic.rockDensity,
        most_likely: basic.thermodynamic.rockDensity,
        max: basic.thermodynamic.rockDensity,
        mean: 0,
        sd: 0,
        pdf: 'C'
      },
      fluid_density: {
        min: basic.thermodynamic.fluidDensity,
        most_likely: basic.thermodynamic.fluidDensity,
        max: basic.thermodynamic.fluidDensity,
        mean: 0,
        sd: 0,
        pdf: 'C'
      }
    },
    powerPlant: {
      recovery_factor: {
        min: basic.powerPlant.recoveryFactor * 0.7,
        most_likely: basic.powerPlant.recoveryFactor,
        max: basic.powerPlant.recoveryFactor * 1.3,
        mean: 0,
        sd: 0,
        pdf: 'T'
      },
      conversion_efficiency: {
        min: basic.powerPlant.conversionEfficiency * 0.9,
        most_likely: basic.powerPlant.conversionEfficiency,
        max: basic.powerPlant.conversionEfficiency * 1.1,
        mean: 0,
        sd: 0,
        pdf: 'T'
      },
      plant_net_capacity_factor: {
        min: basic.powerPlant.plantCapacityFactor * 0.8,
        most_likely: basic.powerPlant.plantCapacityFactor,
        max: basic.powerPlant.plantCapacityFactor,
        mean: 0,
        sd: 0,
        pdf: 'T'
      },
      lifespan: {
        min: basic.powerPlant.lifespan,
        most_likely: basic.powerPlant.lifespan,
        max: basic.powerPlant.lifespan,
        mean: 0,
        sd: 0,
        pdf: 'C'
      }
    },
    simulation: {
      iterations: basic.simulation.iterations,
      seed: basic.simulation.seed
    }
  };
}

/**
 * Convert scientific results to basic UI format
 */
export function convertToBasicResults(scientific: ScientificGeothermalResults, basicInput: BasicGeothermalInput): BasicGeothermalResults {
  return {
    baseCase: {
      energyKJ: scientific.baseCase.energyKJ,
      powerMWe: scientific.baseCase.powerMWe,
      powerWatts: scientific.baseCase.powerMWe * 1e6
    },
    monteCarloResults: scientific.monteCarloResults,
    statistics: {
      mean: scientific.statistics.mean,
      std: scientific.statistics.std,
      min: scientific.statistics.min,
      max: scientific.statistics.max,
      percentiles: scientific.statistics.percentiles,
      probabilities: scientific.statistics.probabilities
    },
    economics: scientific.economics,
    executive: scientific.executive,
    input: basicInput
  };
}

/**
 * Run scientific simulation with basic UI parameters
 */
export function runScientificSimulationWithBasicInput(basicInput: BasicGeothermalInput): BasicGeothermalResults {
  const scientificInput = convertToScientificInput(basicInput);
  const scientificResults = runScientificMonteCarloSimulation(scientificInput);
  return convertToBasicResults(scientificResults, basicInput);
} 
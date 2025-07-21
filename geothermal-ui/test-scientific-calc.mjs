// Simple test of our scientific calculations
// Expected Python results: P5=41.962MW, P50=58.413MW, P95=79.271MW

// Simulate the key functions from our TypeScript implementation
class ScientificRNG {
  constructor(seed = 42) {
    this.seed = seed;
  }
  
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  triangular(min, mode, max) {
    const u = this.next();
    const f = (mode - min) / (max - min);
    
    if (u < f) {
      return min + Math.sqrt(u * (max - min) * (mode - min));
    } else {
      return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
    }
  }
  
  lognormal(mean, std) {
    // Box-Muller transformation for normal
    const u1 = this.next();
    const u2 = this.next();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const normal = z * std + mean;
    return Math.exp(normal);
  }
}

// Volumetric energy calculation
function liquidDominantVolumetricEnergy(tr, ta, phi, cr, cf, rho_r, rho_f, a, h) {
  // q = (rho_r * cr * (1.0 - phi) + rho_f * cf * phi) * (a * 1.0e6) * h * (tr - ta)
  return (rho_r * cr * (1.0 - phi) + rho_f * cf * phi) * (a * 1.0e6) * h * (tr - ta);
}

// Power energy calculation
function calculatePowerEnergy(tr, ta, phi, cr, cf, rho_r, rho_f, rf, ce, pf, t, a, h) {
  const q = liquidDominantVolumetricEnergy(tr, ta, phi, cr, cf, rho_r, rho_f, a, h);
  // Formula: (q * 1000) * rf * ce / (pf * (t * 31557600))
  return (q * 1000) * rf * ce / (pf * (t * 31557600));
}

// Test base case calculation first
const baseCase = calculatePowerEnergy(
  230,    // tr - reservoir temp
  100,    // ta - abandon temp  
  0.04,   // phi - porosity
  0.9,    // cr - rock specific heat
  4.18,   // cf - fluid specific heat
  2750,   // rho_r - rock density
  855.9,  // rho_f - fluid density
  0.07,   // rf - recovery factor
  0.173,  // ce - conversion efficiency
  0.9,    // pf - plant capacity factor
  25,     // t - lifespan
  33.0,   // a - area
  300     // h - thickness
);

const baseCaseMW = baseCase / 1e6;
console.log('Base case calculation:');
console.log(`Power: ${baseCaseMW.toFixed(3)} MW`);
console.log();

// Now test a few Monte Carlo iterations
const rng = new ScientificRNG(42);
const results = [];

console.log('Running 1000 Monte Carlo iterations...');

for (let i = 0; i < 1000; i++) {
  // Sample from distributions (matching Python exactly)
  const tr = rng.triangular(200, 230, 260);     // reservoir temp
  const ta = 100;                               // abandon temp (constant)
  const phi = Math.log(rng.lognormal(0.04, 0.02)); // porosity (lognormal with adjust)
  const cr = rng.triangular(0.85, 0.9, 0.95);  // rock specific heat
  const cf = 4.18;                              // fluid specific heat (constant)
  const rho_r = 2750;                           // rock density (constant)
  const rho_f = 855.9;                          // fluid density (constant)
  const rf = 0.07;                              // recovery factor (constant)
  const ce = rng.triangular(0.154, 0.173, 0.201); // conversion efficiency
  const pf = rng.triangular(0.8, 0.9, 1.0);    // plant capacity factor
  const t = 25;                                 // lifespan (constant)
  const a = rng.triangular(32.9, 33.0, 33.1);  // area
  const h = rng.triangular(200, 300, 400);      // thickness
  
  const powerWatts = calculatePowerEnergy(tr, ta, phi, cr, cf, rho_r, rho_f, rf, ce, pf, t, a, h);
  const powerMW = powerWatts / 1e6;
  results.push(powerMW);
}

// Calculate statistics
results.sort((a, b) => a - b);
const p5 = results[Math.floor(0.05 * results.length)];
const p50 = results[Math.floor(0.50 * results.length)];
const p95 = results[Math.floor(0.95 * results.length)];

console.log('Our results:');
console.log(`P5 = ${p5.toFixed(3)} MW`);
console.log(`P50 = ${p50.toFixed(3)} MW`);
console.log(`P95 = ${p95.toFixed(3)} MW`);
console.log();

console.log('Expected Python results:');
console.log('P5 = 41.962 MW');
console.log('P50 = 58.413 MW');
console.log('P95 = 79.271 MW');
console.log();

console.log('Differences:');
console.log(`P5 difference: ${(p5 - 41.962).toFixed(3)} MW`);
console.log(`P50 difference: ${(p50 - 58.413).toFixed(3)} MW`);
console.log(`P95 difference: ${(p95 - 79.271).toFixed(3)} MW`); 
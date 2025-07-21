// Test script to fix cumulative distribution charts
// The issue: we're plotting every single Monte Carlo point, creating linear appearance
// The fix: create proper stepped cumulative distribution with fewer points

// Simulate some test data
const generateTestData = () => {
  const data = [];
  for (let i = 0; i < 1000; i++) {
    // Generate normal-ish distribution around 55 MW
    const value = 55 + (Math.random() - 0.5) * 20 + (Math.random() - 0.5) * 10;
    data.push(value);
  }
  return data.sort((a, b) => a - b);
};

// Current broken implementation (too many points)
function createBrokenCumulative(data) {
  const sortedData = [...data].sort((a, b) => a - b);
  const n = sortedData.length;
  
  // THIS IS THE PROBLEM: Creating n data points (all Monte Carlo results)
  const labels = [];
  const cumulativeValues = [];
  
  for (let i = 0; i < n; i++) {
    labels.push(sortedData[i].toFixed(1));
    cumulativeValues.push((i + 1) / n);
  }
  
  console.log(`Broken method creates ${labels.length} data points`);
  return { labels, cumulativeValues };
}

// Fixed implementation (fewer points, proper steps)
function createFixedCumulative(data, numPoints = 100) {
  const sortedData = [...data].sort((a, b) => a - b);
  const n = sortedData.length;
  const min = sortedData[0];
  const max = sortedData[n - 1];
  
  const labels = [];
  const cumulativeValues = [];
  
  // Create evenly spaced points across the range
  for (let i = 0; i <= numPoints; i++) {
    const x = min + (max - min) * i / numPoints;
    
    // Find how many data points are <= x
    let count = 0;
    for (let j = 0; j < n; j++) {
      if (sortedData[j] <= x) count++;
      else break;
    }
    
    const cumulativeProb = count / n;
    
    labels.push(x.toFixed(1));
    cumulativeValues.push(cumulativeProb);
  }
  
  console.log(`Fixed method creates ${labels.length} data points`);
  return { labels, cumulativeValues };
}

// Fixed "higher than" implementation
function createFixedHigherThan(data, numPoints = 100) {
  const sortedData = [...data].sort((a, b) => a - b);
  const n = sortedData.length;
  const min = sortedData[0];
  const max = sortedData[n - 1];
  
  const labels = [];
  const cumulativeValues = [];
  
  // Create evenly spaced points across the range
  for (let i = 0; i <= numPoints; i++) {
    const x = min + (max - min) * i / numPoints;
    
    // Find how many data points are > x
    let count = 0;
    for (let j = 0; j < n; j++) {
      if (sortedData[j] > x) count++;
    }
    
    const higherProb = count / n;
    
    labels.push(x.toFixed(1));
    cumulativeValues.push(higherProb);
  }
  
  console.log(`Fixed 'higher than' method creates ${labels.length} data points`);
  return { labels, cumulativeValues };
}

// Test the implementations
const testData = generateTestData();

console.log('=== TESTING CUMULATIVE DISTRIBUTION FIXES ===');
console.log(`Test data: ${testData.length} Monte Carlo results`);
console.log(`Range: ${testData[0].toFixed(1)} to ${testData[testData.length-1].toFixed(1)} MW`);
console.log();

console.log('Current broken implementation:');
const brokenResult = createBrokenCumulative(testData);
console.log(`Creates ${brokenResult.labels.length} points - TOO MANY!`);
console.log('First 5 points:', brokenResult.labels.slice(0, 5));
console.log('First 5 cumulative values:', brokenResult.cumulativeValues.slice(0, 5));
console.log();

console.log('Fixed implementation:');
const fixedResult = createFixedCumulative(testData);
console.log(`Creates ${fixedResult.labels.length} points - MUCH BETTER!`);
console.log('First 5 points:', fixedResult.labels.slice(0, 5));
console.log('First 5 cumulative values:', fixedResult.cumulativeValues.slice(0, 5));
console.log();

console.log('Fixed "higher than" implementation:');
const fixedHigher = createFixedHigherThan(testData);
console.log('First 5 points:', fixedHigher.labels.slice(0, 5));
console.log('First 5 "higher than" values:', fixedHigher.cumulativeValues.slice(0, 5));
console.log();

// Show key percentiles for validation
const p5_idx = Math.floor(0.05 * testData.length);
const p50_idx = Math.floor(0.50 * testData.length);  
const p95_idx = Math.floor(0.95 * testData.length);

console.log('=== VALIDATION ===');
console.log(`P5: ${testData[p5_idx].toFixed(2)} MW`);
console.log(`P50: ${testData[p50_idx].toFixed(2)} MW`);
console.log(`P95: ${testData[p95_idx].toFixed(2)} MW`);
console.log();

console.log('The fixed charts should now show:');
console.log('- Smooth S-curved lines (not straight diagonals)');
console.log('- Proper step-like cumulative distribution');  
console.log('- Reasonable number of data points for Chart.js to render properly'); 
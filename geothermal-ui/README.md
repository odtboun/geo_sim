# Geothermal Power Evaluation - Executive Interface

A professional web application for C-level executives to evaluate geothermal power potential using the volumetric method for liquid-dominated reservoirs.

## Features

### 🎯 **Executive-Friendly Interface**
- Intuitive parameter input with guided forms
- Real-time Monte Carlo simulations in the browser
- Professional visualizations and risk analysis
- Clear investment recommendations

### 📊 **Comprehensive Analysis**
- Power generation potential assessment
- Statistical analysis with percentiles (P10, P50, P90)
- Economic projections and revenue calculations
- Probability analysis for different power thresholds

### 🔬 **Scientific Foundation**
- Based on proven volumetric method methodology
- Monte Carlo uncertainty quantification
- Industry-standard geothermal evaluation practices
- Reference: Pocasangre & Fujimitsu (2018)

### 💻 **Technical Benefits**
- 100% frontend-only (no backend required)
- Instant calculations in the browser
- Mobile-responsive design
- Professional executive reporting

## Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Vercel Deployment
1. Fork this repository
2. Connect to Vercel
3. Deploy automatically (zero configuration needed)

## Usage

1. **Input Parameters**: Enter your geothermal project data
   - Project location and basic information
   - Reservoir properties (area, thickness, temperature)
   - Power plant configuration (efficiency, capacity factors)

2. **Run Simulation**: Click "Run Evaluation" to start analysis
   - Monte Carlo simulation with uncertainty quantification
   - 1,000 to 10,000 iterations available
   - Real-time progress indication

3. **Review Results**: Analyze comprehensive results
   - Key performance indicators
   - Interactive charts and visualizations
   - Risk assessment with probability analysis
   - Executive summary with investment recommendations

## Key Metrics Explained

### Power Generation Metrics
- **Base Case**: Most likely power output (MWe)
- **P10 (Conservative)**: 90% chance of exceeding this value
- **P50 (Probable)**: Median estimate
- **P90 (Optimistic)**: 10% chance of exceeding this value

### Investment Recommendations
- **High Potential**: P10 ≥ 50 MW - Proceed to detailed feasibility
- **Moderate Potential**: P10 25-50 MW - Additional studies recommended
- **Low Potential**: P10 10-25 MW - Reassess parameters
- **Insufficient**: P10 < 10 MW - Not recommended

## Technology Stack

### Frontend
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Chart.js** for visualizations
- **Heroicons** for professional iconography

### Calculations
- Pure JavaScript implementation
- Monte Carlo simulation engine
- Statistical analysis functions
- Economic modeling

## Deployment

### Vercel (Recommended)
Perfect for this frontend-only application:

```bash
vercel deploy
```

### Alternative Platforms
- **Netlify**: Direct GitHub integration
- **GitHub Pages**: Static hosting
- **AWS S3 + CloudFront**: Enterprise deployment

## Scientific Methodology

Based on the volumetric method for liquid-dominated geothermal reservoirs:

**Energy Calculation:**
```
Q = (ρr × Cr × (1-φ) + ρf × Cf × φ) × V × ΔT
```

Where:
- Q = Total thermal energy (kJ)
- ρr, ρf = Rock and fluid densities
- Cr, Cf = Rock and fluid specific heats
- φ = Porosity
- V = Reservoir volume
- ΔT = Temperature difference

**Power Conversion:**
```
P = Q × RF × CE × 1000 / (CF × t × 31,557,600)
```

Where:
- P = Electrical power (W)
- RF = Recovery factor
- CE = Conversion efficiency
- CF = Capacity factor
- t = Lifespan (years)

## Contributing

This is a professional tool for geothermal investment analysis. For contributions:

1. Ensure scientific accuracy
2. Maintain executive-friendly UX
3. Follow TypeScript best practices
4. Test thoroughly with various parameters

## License

MIT License - Professional use encouraged.

## Support

For technical questions or geothermal engineering consultation, refer to the original research:

*Pocasangre, C., & Fujimitsu, Y. (2018). A Python-based stochastic library for assessing geothermal power potential using the volumetric method in a liquid-dominated reservoir. Geothermics, 76, 164–176.*

---

**Ready for executive decision-making. Deploy to Vercel in one click!** 🚀

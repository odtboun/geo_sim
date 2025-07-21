import { FireIcon } from '@heroicons/react/24/solid';

export default function LoadingSpinner() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-12 text-center">
      <div className="animate-spin mx-auto mb-6 w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full"></div>
      <FireIcon className="h-16 w-16 text-orange-500 mx-auto mb-4 animate-pulse" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">Running Monte Carlo Simulation</h3>
      <p className="text-gray-700 mb-4">
        Analyzing geothermal power potential with uncertainty quantification...
      </p>
      <div className="text-sm text-gray-600">
        This may take a few moments to complete.
      </div>
    </div>
  );
} 
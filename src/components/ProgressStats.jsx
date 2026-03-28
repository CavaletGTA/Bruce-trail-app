function ProgressStats({ stats, showSideTrails, onToggleSideTrails }) {
  const currentStats = stats();

  return (
    <div className="bg-white border-b shadow-sm">
      <div className="px-4 py-3">
        {/* Title and toggle */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-800">Bruce Trail Progress</h1>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showSideTrails}
              onChange={(e) => onToggleSideTrails(e.target.checked)}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <span className="text-sm text-gray-600">Show side trails</span>
          </label>
        </div>

        {/* Main progress bar */}
        <div className="mb-4">
          <div className="flex justify-between items-end mb-1">
            <span className="text-sm font-medium text-gray-600">Total Progress</span>
            <span className="text-lg font-bold text-green-600">
              {currentStats.totalPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
              style={{ width: `${currentStats.totalPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>{currentStats.totalDistanceCompleted.toFixed(1)}km completed</span>
            <span>{currentStats.totalDistance.toFixed(1)}km total</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Main trail */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Main Trail</div>
            <div className="text-xl font-bold text-gray-800">
              {currentStats.mainDistanceCompleted.toFixed(1)}
              <span className="text-sm font-normal text-gray-500">/{currentStats.mainTrailDistance.toFixed(1)}km</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-green-500 transition-all duration-500"
                style={{ width: `${currentStats.mainPercentage}%` }}
              />
            </div>
            <div className="text-xs text-green-600 mt-1">
              {currentStats.mainPercentage.toFixed(1)}%
            </div>
          </div>

          {/* Side trails */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Side Trails</div>
            <div className="text-xl font-bold text-gray-800">
              {currentStats.sideDistanceCompleted.toFixed(1)}
              <span className="text-sm font-normal text-gray-500">/{currentStats.sideTrailDistance.toFixed(1)}km</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500"
                style={{ width: `${currentStats.sidePercentage}%` }}
              />
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {currentStats.sidePercentage.toFixed(1)}%
            </div>
          </div>

          {/* Segments completed */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Segments</div>
            <div className="text-xl font-bold text-gray-800">
              {currentStats.completedSegments}
              <span className="text-sm font-normal text-gray-500">/{currentStats.totalSegments}</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {currentStats.mainCompleted} main + {currentStats.sideCompleted} side
            </div>
          </div>

          {/* Remaining */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Remaining</div>
            <div className="text-xl font-bold text-gray-800">
              {(currentStats.totalDistance - currentStats.totalDistanceCompleted).toFixed(1)}
              <span className="text-sm font-normal text-gray-500">km</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {currentStats.totalSegments - currentStats.completedSegments} segments left
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProgressStats;

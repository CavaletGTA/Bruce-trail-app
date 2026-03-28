import { useState } from 'react';
import TrailMap from './components/TrailMap';
import SectionList from './components/SectionList';
import ProgressStats from './components/ProgressStats';
import SectionModal from './components/SectionModal';
import ImportGPX from './components/ImportGPX';
import { useProgress } from './hooks/useProgress';
import { trailSegments as defaultSegments } from './data/bruceTrail';
import { calculateDistance, getClubByLatitude } from './utils/trail';

function App() {
  const {
    isCompleted,
    getCompletionDate,
    completeSegment,
    uncompleteSegment,
    stats,
    getClubProgress,
    exportProgress,
    importProgress,
  } = useProgress();

  const [showSideTrails, setShowSideTrails] = useState(true);
  const [selectedClub, setSelectedClub] = useState(null);
  const [highlightedSegment, setHighlightedSegment] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [customSegments, setCustomSegments] = useState(() => {
    try {
      const saved = localStorage.getItem('bruce-trail-custom-segments');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Use custom segments if imported, otherwise use default
  const activeSegments = customSegments || defaultSegments;

  const handleImportGPX = (segments) => {
    // Convert imported segments to our format
    const clubCounts = {};
    const newSegments = segments.map(seg => {
      const avgLat = seg.coordinates.reduce((s, c) => s + c[0], 0) / seg.coordinates.length;
      const club = getClubByLatitude(avgLat);
      clubCounts[club] = (clubCounts[club] || 0) + 1;

      const name = seg.name.toLowerCase();
      const type = name.includes('side') || name.includes('loop') ? 'side' : 'main';

      return {
        id: `${club}-${String(clubCounts[club]).padStart(3, '0')}`,
        name: seg.name,
        club,
        type,
        distance: Math.round(calculateDistance(seg.coordinates) * 100) / 100,
        coordinates: seg.coordinates,
      };
    });

    // Sort by latitude
    newSegments.sort((a, b) => {
      const avgA = a.coordinates.reduce((s, c) => s + c[0], 0) / a.coordinates.length;
      const avgB = b.coordinates.reduce((s, c) => s + c[0], 0) / b.coordinates.length;
      return avgA - avgB;
    });

    // Save to localStorage
    localStorage.setItem('bruce-trail-custom-segments', JSON.stringify(newSegments));
    setCustomSegments(newSegments);
    setShowImportModal(false);
  };

  const handleClearCustomData = () => {
    if (confirm('Reset to default trail data? Your completion progress will be kept.')) {
      localStorage.removeItem('bruce-trail-custom-segments');
      setCustomSegments(null);
    }
  };

  const handleSegmentClick = (segment) => {
    setSelectedSegment(segment);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Stats header */}
      <ProgressStats
        stats={stats}
        showSideTrails={showSideTrails}
        onToggleSideTrails={setShowSideTrails}
      />

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'w-96' : 'w-0'
          } transition-all duration-300 overflow-hidden border-r bg-white flex-shrink-0`}
        >
          <SectionList
            isCompleted={isCompleted}
            getCompletionDate={getCompletionDate}
            onSegmentClick={handleSegmentClick}
            showSideTrails={showSideTrails}
            selectedClub={selectedClub}
            onSelectClub={setSelectedClub}
            highlightedSegment={highlightedSegment}
            onHighlightSegment={setHighlightedSegment}
            getClubProgress={getClubProgress}
            customSegments={customSegments}
          />
        </div>

        {/* Map area */}
        <div className="flex-1 relative">
          {/* Toggle sidebar button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-4 left-4 z-[500] bg-white shadow-lg rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors"
            aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            aria-expanded={sidebarOpen}
          >
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>

          {/* Top right buttons */}
          <div className="absolute top-4 right-4 z-[500] flex gap-2">
            {/* Import button */}
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-white shadow-lg rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2"
              aria-label="Import GPX trail data"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="text-sm font-medium text-gray-600">Import GPX</span>
            </button>

            {/* Export button */}
            <button
              onClick={exportProgress}
              className="bg-white shadow-lg rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2"
              aria-label="Export progress data as JSON"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="text-sm font-medium text-gray-600">Export</span>
            </button>

            {/* Import Progress button */}
            <label
              className="bg-white shadow-lg rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors flex items-center gap-2 cursor-pointer"
              aria-label="Import progress from JSON file"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-600">Import Progress</span>
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    file.text().then(text => {
                      if (importProgress(text)) {
                        e.target.value = '';
                      } else {
                        alert('Invalid progress file format');
                        e.target.value = '';
                      }
                    });
                  }
                }}
              />
            </label>
          </div>

          {/* Custom data indicator */}
          {customSegments && (
            <div className="absolute top-16 right-4 z-[500]">
              <button
                onClick={handleClearCustomData}
                className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full hover:bg-blue-200 transition-colors"
              >
                Using imported GPX data • Click to reset
              </button>
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 right-4 z-[500] bg-white shadow-lg rounded-lg p-3">
            <div className="text-xs font-semibold text-gray-600 mb-2">Legend</div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-green-500 rounded"></div>
                <span className="text-xs text-gray-600">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-gray-400 rounded"></div>
                <span className="text-xs text-gray-600">Main Trail</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-blue-400 rounded"></div>
                <span className="text-xs text-gray-600">Side Trail</span>
              </div>
            </div>
          </div>

          {/* Map */}
          <TrailMap
            isCompleted={isCompleted}
            onSegmentClick={handleSegmentClick}
            showSideTrails={showSideTrails}
            selectedClub={selectedClub}
            highlightedSegment={highlightedSegment}
            customSegments={customSegments}
          />
        </div>
      </div>

      {/* Segment modal */}
      <SectionModal
        segment={selectedSegment}
        isOpen={!!selectedSegment}
        onClose={() => setSelectedSegment(null)}
        isCompleted={isCompleted}
        getCompletionDate={getCompletionDate}
        completeSegment={completeSegment}
        uncompleteSegment={uncompleteSegment}
      />

      {/* Import modal */}
      {showImportModal && (
        <ImportGPX
          onImport={handleImportGPX}
          onClose={() => setShowImportModal(false)}
        />
      )}
    </div>
  );
}

export default App;

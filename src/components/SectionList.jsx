import { useState, useMemo } from 'react';
import { trailSegments, clubs } from '../data/bruceTrail';
import { formatDate } from '../utils/trail';

function SectionList({
  isCompleted,
  getCompletionDate,
  onSegmentClick,
  showSideTrails,
  selectedClub,
  onSelectClub,
  highlightedSegment,
  onHighlightSegment,
  getClubProgress,
  customSegments = null,
}) {
  const [expandedClubs, setExpandedClubs] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // Use custom segments if provided
  const segments = customSegments || trailSegments;

  // Group segments by club
  const segmentsByClub = useMemo(() => {
    const grouped = {};
    clubs.forEach(club => {
      grouped[club.id] = segments.filter(s => s.club === club.id);
    });
    return grouped;
  }, [segments]);

  // Filter segments based on search and settings
  const filterSegments = (segments) => {
    return segments.filter(segment => {
      if (!showSideTrails && segment.type === 'side') return false;
      if (searchTerm) {
        return segment.name.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return true;
    });
  };

  const toggleClub = (clubId) => {
    setExpandedClubs(prev => ({
      ...prev,
      [clubId]: !prev[clubId],
    }));
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Search */}
      <div className="p-3 border-b">
        <input
          type="text"
          placeholder="Search segments..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Club filter buttons */}
      <div className="p-3 border-b flex flex-wrap gap-2">
        <button
          onClick={() => onSelectClub(null)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            !selectedClub
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {clubs.map(club => (
          <button
            key={club.id}
            onClick={() => onSelectClub(selectedClub === club.id ? null : club.id)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedClub === club.id
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            style={{
              backgroundColor: selectedClub === club.id ? club.color : undefined,
            }}
          >
            {club.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Section list */}
      <div className="flex-1 overflow-y-auto">
        {clubs
          .filter(club => !selectedClub || club.id === selectedClub)
          .map(club => {
            const segments = filterSegments(segmentsByClub[club.id] || []);
            if (segments.length === 0) return null;

            const progress = getClubProgress(club.id);
            const isExpanded = expandedClubs[club.id] ?? (selectedClub === club.id);

            return (
              <div key={club.id} className="border-b">
                {/* Club header */}
                <button
                  onClick={() => toggleClub(club.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: club.color }}
                    />
                    <div className="text-left">
                      <div className="font-semibold text-gray-800">{club.name}</div>
                      <div className="text-sm text-gray-500">
                        {progress.completed}/{progress.total} segments • {progress.completedDistance.toFixed(1)}/{progress.totalDistance.toFixed(1)}km
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-600">
                        {progress.percentage.toFixed(0)}%
                      </div>
                    </div>
                    <svg
                      className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Segments */}
                {isExpanded && (
                  <div className="bg-gray-50">
                    {segments.map(segment => {
                      const completed = isCompleted(segment.id);
                      const date = getCompletionDate(segment.id);

                      return (
                        <div
                          key={segment.id}
                          className={`px-4 py-2 border-t border-gray-100 cursor-pointer transition-colors ${
                            highlightedSegment === segment.id
                              ? 'bg-green-50'
                              : 'hover:bg-gray-100'
                          }`}
                          onClick={() => onSegmentClick(segment)}
                          onMouseEnter={() => onHighlightSegment(segment.id)}
                          onMouseLeave={() => onHighlightSegment(null)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                  completed
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-gray-300'
                                }`}
                              >
                                {completed && (
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </div>
                              <div>
                                <div className={`font-medium ${completed ? 'text-green-700' : 'text-gray-700'}`}>
                                  {segment.name}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                  <span>{segment.distance.toFixed(1)}km</span>
                                  {segment.type === 'side' && (
                                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                      Side Trail
                                    </span>
                                  )}
                                  {date && (
                                    <span className="text-green-600">
                                      {formatDate(date)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

export default SectionList;

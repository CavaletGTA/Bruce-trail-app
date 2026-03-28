import { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, useMap, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { trailSegments, clubs } from '../data/bruceTrail';

// Fix Leaflet default icon issue
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Component to fit map bounds
function FitBounds({ segments }) {
  const map = useMap();

  useEffect(() => {
    if (segments.length > 0) {
      const allCoords = segments.flatMap(s => s.coordinates);
      if (allCoords.length > 0) {
        const bounds = L.latLngBounds(allCoords);
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [map, segments]);

  return null;
}

function TrailMap({
  isCompleted,
  onSegmentClick,
  showSideTrails = true,
  selectedClub = null,
  highlightedSegment = null,
  customSegments = null,
}) {
  // Use custom segments if provided
  const segments = customSegments || trailSegments;

  // Filter segments based on settings
  const visibleSegments = segments.filter(segment => {
    if (!showSideTrails && segment.type === 'side') return false;
    if (selectedClub && segment.club !== selectedClub) return false;
    return true;
  });

  // Get club color
  const getClubColor = (clubId) => {
    const club = clubs.find(c => c.id === clubId);
    return club?.color || '#666';
  };

  // Get segment color based on completion and type
  const getSegmentColor = (segment) => {
    if (isCompleted(segment.id)) {
      return '#22c55e'; // Green for completed
    }
    if (segment.type === 'side') {
      return '#60a5fa'; // Blue for side trails
    }
    return '#9ca3af'; // Gray for incomplete main trail
  };

  // Get segment weight
  const getSegmentWeight = (segment) => {
    if (highlightedSegment === segment.id) return 6;
    if (segment.type === 'main') return 4;
    return 3;
  };

  // Center of Bruce Trail (approximately)
  const center = [44.3, -80.5];

  return (
    <MapContainer
      center={center}
      zoom={8}
      className="h-full w-full"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds segments={visibleSegments} />

      {visibleSegments.map(segment => (
        <Polyline
          key={segment.id}
          positions={segment.coordinates}
          pathOptions={{
            color: getSegmentColor(segment),
            weight: getSegmentWeight(segment),
            opacity: highlightedSegment && highlightedSegment !== segment.id ? 0.4 : 0.9,
          }}
          eventHandlers={{
            click: () => onSegmentClick(segment),
            mouseover: (e) => {
              e.target.setStyle({ weight: 6, opacity: 1 });
            },
            mouseout: (e) => {
              e.target.setStyle({
                weight: getSegmentWeight(segment),
                opacity: highlightedSegment && highlightedSegment !== segment.id ? 0.4 : 0.9,
              });
            },
          }}
        >
          <Tooltip sticky>
            <div className="text-sm">
              <div className="font-semibold">{segment.name}</div>
              <div className="text-gray-600">
                {clubs.find(c => c.id === segment.club)?.name} • {segment.distance.toFixed(1)}km
              </div>
              <div className={isCompleted(segment.id) ? 'text-green-600' : 'text-gray-500'}>
                {isCompleted(segment.id) ? '✓ Completed' : 'Not completed'}
              </div>
            </div>
          </Tooltip>
        </Polyline>
      ))}
    </MapContainer>
  );
}

export default TrailMap;

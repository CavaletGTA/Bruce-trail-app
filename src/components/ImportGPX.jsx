import { useState, useRef } from 'react';
import { calculateDistance } from '../utils/trail';

function ImportGPX({ onImport, onClose }) {
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const parseGPX = (gpxText, filename) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(gpxText, 'text/xml');

    const segments = [];

    // Parse tracks
    const tracks = doc.querySelectorAll('trk');
    tracks.forEach((track, trackIndex) => {
      const trackName = track.querySelector('name')?.textContent || `Track ${trackIndex + 1}`;

      const trksegs = track.querySelectorAll('trkseg');
      trksegs.forEach((seg, segIndex) => {
        const points = seg.querySelectorAll('trkpt');
        if (points.length < 2) return;

        const coordinates = Array.from(points).map(pt => [
          parseFloat(pt.getAttribute('lat')),
          parseFloat(pt.getAttribute('lon'))
        ]);

        segments.push({
          name: trksegs.length > 1 ? `${trackName} - Part ${segIndex + 1}` : trackName,
          coordinates,
          source: filename
        });
      });
    });

    // Parse routes
    const routes = doc.querySelectorAll('rte');
    routes.forEach((route, routeIndex) => {
      const routeName = route.querySelector('name')?.textContent || `Route ${routeIndex + 1}`;
      const points = route.querySelectorAll('rtept');
      if (points.length < 2) return;

      const coordinates = Array.from(points).map(pt => [
        parseFloat(pt.getAttribute('lat')),
        parseFloat(pt.getAttribute('lon'))
      ]);

      segments.push({
        name: routeName,
        coordinates,
        source: filename
      });
    });

    return segments;
  };

  const processFiles = async (selectedFiles) => {
    setError(null);
    setParsing(true);

    try {
      const allSegments = [];

      for (const file of selectedFiles) {
        const text = await file.text();
        const segments = parseGPX(text, file.name);
        allSegments.push(...segments);
      }

      // Calculate total distance using utility function
      let totalDistance = 0;
      allSegments.forEach(seg => {
        totalDistance += calculateDistance(seg.coordinates);
      });

      setPreview({
        segments: allSegments,
        totalDistance,
        files: selectedFiles.map(f => f.name)
      });
    } catch (err) {
      setError('Failed to parse GPX file: ' + err.message);
    }

    setParsing(false);
  };

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      await processFiles(selectedFiles);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      file => file.name.toLowerCase().endsWith('.gpx')
    );

    if (droppedFiles.length === 0) {
      setError('Please drop GPX files only');
      return;
    }

    await processFiles(droppedFiles);
  };

  const handleImport = () => {
    if (preview?.segments) {
      onImport(preview.segments);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-modal-title"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="px-6 py-4 bg-green-600 text-white">
          <div className="flex items-center justify-between">
            <h2 id="import-modal-title" className="text-xl font-bold">Import GPX Files</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full"
              aria-label="Close import dialog"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-4">
            Import GPX files from the Bruce Trail Conservancy or your hiking app to get accurate trail data.
          </p>

          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center mb-4 transition-colors ${
              isDragging
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".gpx"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="gpx-input"
              aria-describedby="gpx-input-description"
            />
            <label
              htmlFor="gpx-input"
              className="cursor-pointer"
            >
              <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span className="text-green-600 font-medium">Click to select GPX files</span>
              <p id="gpx-input-description" className="text-sm text-gray-500 mt-1">or drag and drop</p>
            </label>
          </div>

          {parsing && (
            <div className="text-center py-4">
              <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-600 mt-2">Parsing GPX files...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {preview && (
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-gray-800 mb-2">Preview</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Files:</strong> {preview.files.join(', ')}</p>
                <p><strong>Segments found:</strong> {preview.segments.length}</p>
                <p><strong>Total distance:</strong> {preview.totalDistance.toFixed(1)} km</p>
              </div>

              <div className="mt-3 max-h-32 overflow-y-auto">
                <div className="text-xs text-gray-500 space-y-1">
                  {preview.segments.slice(0, 10).map((seg, i) => (
                    <div key={i}>{seg.name} ({seg.coordinates.length} points)</div>
                  ))}
                  {preview.segments.length > 10 && (
                    <div className="text-gray-400">...and {preview.segments.length - 10} more</div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!preview?.segments?.length}
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import {preview?.segments?.length || 0} Segments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImportGPX;

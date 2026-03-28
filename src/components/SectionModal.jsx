import { useState, useEffect } from 'react';
import { clubs } from '../data/bruceTrail';

function SectionModal({
  segment,
  isOpen,
  onClose,
  isCompleted,
  getCompletionDate,
  completeSegment,
  uncompleteSegment,
}) {
  const [date, setDate] = useState('');

  useEffect(() => {
    if (segment) {
      const existingDate = getCompletionDate(segment.id);
      setDate(existingDate || new Date().toISOString().split('T')[0]);
    }
  }, [segment, getCompletionDate]);

  if (!isOpen || !segment) return null;

  const completed = isCompleted(segment.id);
  const club = clubs.find(c => c.id === segment.club);

  const handleComplete = () => {
    completeSegment(segment.id, date);
    onClose();
  };

  const handleUncomplete = () => {
    uncompleteSegment(segment.id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="segment-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div
          className="px-6 py-4 text-white"
          style={{ backgroundColor: club?.color || '#666' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">{club?.name}</div>
              <h2 id="segment-modal-title" className="text-xl font-bold">{segment.name}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Close segment details"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Segment info */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-800">{segment.distance.toFixed(1)}</div>
              <div className="text-sm text-gray-500">kilometers</div>
            </div>
            <div className="flex-1 bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-gray-800 capitalize">{segment.type}</div>
              <div className="text-sm text-gray-500">trail type</div>
            </div>
          </div>

          {/* Status */}
          <div className={`p-4 rounded-lg mb-6 ${completed ? 'bg-green-50' : 'bg-gray-50'}`}>
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  completed ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                {completed ? (
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )}
              </div>
              <div>
                <div className={`font-medium ${completed ? 'text-green-700' : 'text-gray-700'}`}>
                  {completed ? 'Completed' : 'Not completed'}
                </div>
                {completed && getCompletionDate(segment.id) && (
                  <div className="text-sm text-green-600">
                    {new Date(getCompletionDate(segment.id)).toLocaleDateString('en-CA', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Date picker */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {completed ? 'Update completion date' : 'Completion date'}
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {completed ? (
              <>
                <button
                  onClick={handleUncomplete}
                  className="flex-1 px-4 py-3 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-colors"
                >
                  Mark Incomplete
                </button>
                <button
                  onClick={handleComplete}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                >
                  Update Date
                </button>
              </>
            ) : (
              <button
                onClick={handleComplete}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Mark as Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SectionModal;

import React, { useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { Search, AlertTriangle } from 'lucide-react';
import { ConfirmDialog } from '@/app/components/ConfirmDialog';

export function SecurityReports() {
  const { bags, updateBag, showBanner } = useApp();
  const [searchBagId, setSearchBagId] = useState('');
  const [selectedBag, setSelectedBag] = useState<any>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const handleSearch = () => {
    const bag = bags.find(b => b.bagId === searchBagId);
    setSelectedBag(bag || null);
  };

  const handleReport = () => {
    if (selectedBag) {
      updateBag(selectedBag.id, { securityIssue: true });
      setSelectedBag({ ...selectedBag, securityIssue: true });
      showBanner('Security issue reported', 'success');
    }
  };

  const securityIssueBags = bags.filter(b => b.securityIssue);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Security Reports</h1>
        <p className="text-gray-500 mt-1">Report and view security violations</p>
      </div>

      {/* Search Bag */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Search Bag</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={searchBagId}
            onChange={(e) => setSearchBagId(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            placeholder="Enter bag ID"
          />
          <button
            onClick={handleSearch}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>

        {selectedBag && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="font-medium text-gray-900">Bag ID: {selectedBag.bagId}</p>
                <p className="text-sm text-gray-600">Ticket: {selectedBag.ticketNumber}</p>
                <p className="text-sm text-gray-600">Location: {selectedBag.location}</p>
                {selectedBag.securityIssue && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                    <AlertTriangle className="w-3 h-3" />
                    Security Issue
                  </span>
                )}
              </div>
              {!selectedBag.securityIssue && (
                <button
                  onClick={() => setShowReportDialog(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <AlertTriangle className="w-4 h-4" />
                  Report Issue
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Security Issues List */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Reported Security Issues</h2>
        {securityIssueBags.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No security issues reported</p>
        ) : (
          <div className="space-y-3">
            {securityIssueBags.map((bag) => (
              <div key={bag.id} className="p-4 border-l-4 border-red-500 bg-red-50 rounded">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Bag ID: {bag.bagId}</p>
                    <p className="text-sm text-gray-600">Ticket: {bag.ticketNumber}</p>
                    <p className="text-sm text-gray-600">Location: {bag.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Confirmation */}
      <ConfirmDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        onConfirm={handleReport}
        title="Report Security Issue"
        message="Are you sure you want to report a security issue for this bag? This will notify ground staff and other relevant personnel."
      />
    </div>
  );
}

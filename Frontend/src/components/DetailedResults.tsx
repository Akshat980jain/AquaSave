import React, { useState } from 'react';
import { Search, Download, Filter, Eye } from 'lucide-react';

interface SampleData {
  id: string;
  location: string;
  latitude: number;
  longitude: number;
  cu_concentration: number;
  pb_concentration: number;
  cd_concentration: number;
  zn_concentration: number;
  hmpi_value: number;
  status: 'safe' | 'marginal' | 'high';
  sample_date: string;
  collected_by: string;
  notes?: string;
}

interface DetailedResultsProps {
  samples: SampleData[];
}

const DetailedResults: React.FC<DetailedResultsProps> = ({ samples }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSample, setSelectedSample] = useState<SampleData | null>(null);

  const filteredSamples = samples.filter(sample => {
    const matchesSearch = sample.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || sample.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe': return 'bg-emerald-900/30 text-emerald-300 border-emerald-800';
      case 'marginal': return 'bg-amber-900/30 text-amber-300 border-amber-800';
      case 'high': return 'bg-rose-900/30 text-rose-300 border-rose-800';
      default: return 'bg-slate-800/60 text-slate-200 border-slate-700';
    }
  };

  return (
    <div className="p-6 text-slate-100">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-800/70 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-400"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-slate-800/70 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="safe">Safe</option>
              <option value="marginal">Marginal</option>
              <option value="high">High Risk</option>
            </select>
            
            <button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-500 hover:to-indigo-600 transition-colors flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-slate-200">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60">
                <th className="text-left py-3 px-4 font-medium">Location</th>
                <th className="text-left py-3 px-4 font-medium">HMPI Value</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Cu (mg/L)</th>
                <th className="text-left py-3 px-4 font-medium">Pb (mg/L)</th>
                <th className="text-left py-3 px-4 font-medium">Cd (mg/L)</th>
                <th className="text-left py-3 px-4 font-medium">Zn (mg/L)</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSamples.map((sample) => (
                <tr key={sample.id} className="border-b border-slate-800 hover:bg-slate-900/40">
                  <td className="py-3 px-4">{sample.location}</td>
                  <td className="py-3 px-4">{sample.hmpi_value.toFixed(1)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(sample.status)}`}>
                      {sample.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">{sample.cu_concentration?.toFixed(3) || 'N/A'}</td>
                  <td className="py-3 px-4">{sample.pb_concentration?.toFixed(3) || 'N/A'}</td>
                  <td className="py-3 px-4">{sample.cd_concentration?.toFixed(4) || 'N/A'}</td>
                  <td className="py-3 px-4">{sample.zn_concentration?.toFixed(3) || 'N/A'}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelectedSample(sample)}
                      className="text-indigo-300 hover:text-white transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSamples.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            No samples found matching your criteria.
          </div>
        )}

        {/* Sample Detail Modal */}
        {selectedSample && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 max-w-md w-full mx-4 text-slate-100">
              <h3 className="text-lg font-semibold mb-4">Sample Details</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-slate-300">Location</label>
                  <p className="text-slate-100">{selectedSample.location}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-300">HMPI Value</label>
                  <p className="text-slate-100 text-xl font-bold">{selectedSample.hmpi_value.toFixed(1)}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-300">Status</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(selectedSample.status)}`}>
                    {selectedSample.status}
                  </span>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-300">Metal Concentrations</label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <div className="bg-slate-800 p-2 rounded border border-slate-700">
                      <div className="text-xs text-slate-300">Copper (Cu)</div>
                      <div className="font-medium">{selectedSample.cu_concentration?.toFixed(3)} mg/L</div>
                    </div>
                    <div className="bg-slate-800 p-2 rounded border border-slate-700">
                      <div className="text-xs text-slate-300">Lead (Pb)</div>
                      <div className="font-medium">{selectedSample.pb_concentration?.toFixed(3)} mg/L</div>
                    </div>
                    <div className="bg-slate-800 p-2 rounded border border-slate-700">
                      <div className="text-xs text-slate-300">Cadmium (Cd)</div>
                      <div className="font-medium">{selectedSample.cd_concentration?.toFixed(4)} mg/L</div>
                    </div>
                    <div className="bg-slate-800 p-2 rounded border border-slate-700">
                      <div className="text-xs text-slate-300">Zinc (Zn)</div>
                      <div className="font-medium">{selectedSample.zn_concentration?.toFixed(3)} mg/L</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => setSelectedSample(null)}
                className="mt-6 w-full px-4 py-2 bg-slate-800 text-slate-100 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
    </div>
  );
};

export default DetailedResults;
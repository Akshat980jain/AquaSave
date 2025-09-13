import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

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

interface OverviewProps {
  samples: SampleData[];
}

const Overview: React.FC<OverviewProps> = ({ samples }) => {
  const averageHMPI = samples.length > 0 
    ? samples.reduce((sum, sample) => sum + sample.hmpi_value, 0) / samples.length 
    : 0;

  const recentSamples = samples.slice(0, 10);
  const criticalSamples = samples.filter(sample => sample.status === 'high' || sample.status === 'marginal');

  const metalAverages = {
    Cu: samples.length > 0 ? samples.reduce((sum, s) => sum + (s.cu_concentration || 0), 0) / samples.length : 0,
    Pb: samples.length > 0 ? samples.reduce((sum, s) => sum + (s.pb_concentration || 0), 0) / samples.length : 0,
    Cd: samples.length > 0 ? samples.reduce((sum, s) => sum + (s.cd_concentration || 0), 0) / samples.length : 0,
    Zn: samples.length > 0 ? samples.reduce((sum, s) => sum + (s.zn_concentration || 0), 0) / samples.length : 0,
  };

  return (
    <div className="p-6 text-slate-100">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-indigo-500/10 border border-indigo-800 rounded-lg p-4">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-indigo-300 mr-3" />
              <div>
                <p className="text-sm font-medium text-indigo-300">Average HMPI</p>
                <p className="text-2xl font-bold text-slate-100">{averageHMPI.toFixed(1)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-emerald-500/10 border border-emerald-800 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-emerald-300 mr-3" />
              <div>
                <p className="text-sm font-medium text-emerald-300">Compliance Rate</p>
                <p className="text-2xl font-bold text-slate-100">
                  {samples.length > 0 ? Math.round((samples.filter(s => s.status === 'safe').length / samples.length) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-rose-500/10 border border-rose-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-rose-300 mr-3" />
              <div>
                <p className="text-sm font-medium text-rose-300">Critical Sites</p>
                <p className="text-2xl font-bold text-slate-100">{criticalSamples.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Metal Concentrations Overview */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-slate-100 mb-4">Average Metal Concentrations (mg/L)</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(metalAverages).map(([metal, value]) => (
              <div key={metal} className="bg-slate-800/60 border border-slate-700 rounded-lg p-3">
                <div className="text-sm text-slate-300">{metal}</div>
                <div className="text-xl font-bold text-slate-100">{value.toFixed(3)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Samples */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h4 className="text-lg font-semibold text-slate-100 mb-4">Recent Samples</h4>
            <div className="space-y-3">
              {recentSamples.map((sample) => (
                <div key={sample.id} className="flex items-center justify-between p-3 bg-slate-800/60 border border-slate-700 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-100">{sample.location}</p>
                    <p className="text-sm text-slate-300">HMPI: {sample.hmpi_value.toFixed(1)}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    sample.status === 'safe' 
                      ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-800'
                      : sample.status === 'marginal'
                      ? 'bg-amber-900/30 text-amber-300 border border-amber-800'
                      : 'bg-rose-900/30 text-rose-300 border border-rose-800'
                  }`}>
                    {sample.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div>
            <h4 className="text-lg font-semibold text-slate-100 mb-4">Critical Alerts</h4>
            {criticalSamples.length > 0 ? (
              <div className="space-y-3">
                {criticalSamples.slice(0, 5).map((sample) => (
                  <div key={sample.id} className={`flex items-center p-3 rounded-lg ${
                    sample.status === 'high' ? 'bg-rose-900/20 border border-rose-800' : 'bg-amber-900/20 border border-amber-800'
                  }`}>
                    <AlertTriangle className={`w-5 h-5 mr-3 ${
                      sample.status === 'high' ? 'text-rose-300' : 'text-amber-300'
                    }`} />
                    <div>
                      <p className="font-medium text-slate-100">{sample.location}</p>
                      <p className="text-sm text-slate-300">HMPI: {sample.hmpi_value.toFixed(1)} - Requires attention</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center p-8 bg-emerald-900/20 border border-emerald-800 rounded-lg">
                <CheckCircle className="w-8 h-8 text-emerald-300 mr-3" />
                <p className="text-emerald-200 font-medium">No critical alerts at this time</p>
              </div>
            )}
          </div>
        </div>
    </div>
  );
};

export default Overview;
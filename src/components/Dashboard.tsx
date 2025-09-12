import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import StatCard from './StatCard';
import GeographicMap from './GeographicMap';
import ChartsAnalysis from './ChartsAnalysis';
import DetailedResults from './DetailedResults';
import Overview from './Overview';

interface SampleData {
  id: string;
  location: string;
  coordinates: [number, number];
  metalConcentrations: Record<string, number>;
  hmpiValue: number;
  status: 'safe' | 'marginal' | 'high';
}

const Dashboard: React.FC = () => {
  const [samples, setSamples] = useState<SampleData[]>([]);
  const { user } = useAuth();

  // Mock data - In real app, this would come from API/database
  useEffect(() => {
    const mockSamples: SampleData[] = [
      {
        id: '1',
        location: 'Site A - Urban Area',
        coordinates: [28.6139, 77.2090],
        metalConcentrations: { Cu: 0.8, Pb: 0.05, Cd: 0.002, Zn: 1.2 },
        hmpiValue: 45.2,
        status: 'safe'
      },
      {
        id: '2',
        location: 'Site B - Industrial Zone',
        coordinates: [28.7041, 77.1025],
        metalConcentrations: { Cu: 1.5, Pb: 0.12, Cd: 0.008, Zn: 2.8 },
        hmpiValue: 78.5,
        status: 'marginal'
      },
      // Add more mock samples...
    ];

    // Generate more samples for demonstration - Higher officials see more data
    const sampleCount = user?.role === 'higher_official' ? 18 : 8;
    const additionalSamples = Array.from({ length: sampleCount }, (_, index) => ({
      id: `${index + 3}`,
      location: `Site ${String.fromCharCode(67 + index)} - Sample Location`,
      coordinates: [
        28.6 + (Math.random() - 0.5) * 0.5,
        77.2 + (Math.random() - 0.5) * 0.5
      ] as [number, number],
      metalConcentrations: {
        Cu: Math.random() * 2,
        Pb: Math.random() * 0.2,
        Cd: Math.random() * 0.01,
        Zn: Math.random() * 3
      },
      hmpiValue: Math.random() * 150,
      status: Math.random() > 0.8 ? 'marginal' : 'safe' as 'safe' | 'marginal' | 'high'
    }));

    setSamples([...mockSamples, ...additionalSamples]);
  }, [user?.role]);

  const stats = {
    total: samples.length,
    safe: samples.filter(s => s.status === 'safe').length,
    marginal: samples.filter(s => s.status === 'marginal').length,
    high: samples.filter(s => s.status === 'high').length
  };

  const safePercentage = stats.total > 0 ? Math.round((stats.safe / stats.total) * 100) : 0;
  const marginalPercentage = stats.total > 0 ? Math.round((stats.marginal / stats.total) * 100) : 0;
  const highPercentage = stats.total > 0 ? Math.round((stats.high / stats.total) * 100) : 0;


  return (
    <div className="min-h-screen bg-transparent">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<MapPin className="w-6 h-6" />}
            title="Total Samples"
            value={stats.total.toString()}
            iconBg="bg-indigo-500/20"
            iconColor="text-indigo-300"
          />
          <StatCard
            icon={<CheckCircle className="w-6 h-6" />}
            title="Safe Samples"
            value={stats.safe.toString()}
            percentage={`${safePercentage}%`}
            iconBg="bg-emerald-500/20"
            iconColor="text-emerald-300"
          />
          <StatCard
            icon={<AlertCircle className="w-6 h-6" />}
            title="Marginally Polluted"
            value={stats.marginal.toString()}
            percentage={`${marginalPercentage}%`}
            iconBg="bg-amber-500/20"
            iconColor="text-amber-300"
          />
          <StatCard
            icon={<AlertTriangle className="w-6 h-6" />}
            title="Highly Polluted"
            value={stats.high.toString()}
            percentage={`${highPercentage}%`}
            iconBg="bg-rose-500/20"
            iconColor="text-rose-300"
          />
        </div>

        {/* All Sections as Cards */}
        <div className="space-y-8">
          {/* Overview Section */}
          <div className="bg-slate-900/60 rounded-lg shadow-sm border border-slate-800">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-semibold text-slate-100">Overview</h2>
              <p className="text-slate-300 mt-1">Summary of analysis results and key metrics</p>
              {user?.role === 'lower_official' && (
                <div className="mt-2 text-sm text-indigo-300 bg-indigo-900/30 border border-indigo-800 px-3 py-1 rounded-full inline-block">
                  Limited access - Contact higher official for complete data
                </div>
              )}
            </div>
            <Overview samples={samples} />
          </div>

          {/* Geographic Map Section */}
          <div className="bg-slate-900/60 rounded-lg shadow-sm border border-slate-800">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-semibold text-slate-100">Geographic Distribution</h2>
              <p className="text-slate-300 mt-1">Spatial distribution of sampling locations and pollution levels</p>
            </div>
            <GeographicMap samples={samples} />
          </div>

          {/* Charts & Analysis Section */}
          <div className="bg-slate-900/60 rounded-lg shadow-sm border border-slate-800">
            <div className="p-6 border-b border-slate-800">
              <h2 className="text-xl font-semibold text-slate-100">Charts & Analysis</h2>
              <p className="text-slate-300 mt-1">Statistical analysis and data visualization</p>
            </div>
            <ChartsAnalysis samples={samples} />
          </div>

          {/* Detailed Results Section */}
          {user?.role === 'higher_official' && (
            <div className="bg-slate-900/60 rounded-lg shadow-sm border border-slate-800">
              <div className="p-6 border-b border-slate-800">
                <h2 className="text-xl font-semibold text-slate-100">Detailed Results</h2>
                <p className="text-slate-300 mt-1">Complete sample data with search and filtering capabilities</p>
                <div className="mt-2 text-sm text-emerald-300 bg-emerald-900/30 border border-emerald-800 px-3 py-1 rounded-full inline-block">
                  Higher Official Access - Full Data Export Available
                </div>
              </div>
              <DetailedResults samples={samples} />
            </div>
          )}
          
          {user?.role === 'lower_official' && (
            <div className="p-6 border-b border-slate-800">
              <div className="bg-amber-900/20 border border-amber-800 rounded-lg p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-amber-200 mb-2">Access Restricted</h3>
                <p className="text-amber-200/80">
                  Detailed results are only available to Higher Officials. 
                  Contact your supervisor for complete data access.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
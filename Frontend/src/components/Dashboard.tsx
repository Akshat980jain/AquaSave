import React, { useState, useEffect } from 'react';
import { MapPin, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import apiService from '../services/api';
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
  additional_data?: {
    pH?: number;
    ec?: number;
    co3?: number;
    hco3?: number;
    cl?: number;
    f?: number;
    so4?: number;
    no3?: number;
    po4?: number;
    totalHardness?: number;
    ca?: number;
    mg?: number;
    na?: number;
    k?: number;
    fe?: number;
    as?: number;
    u?: number;
  };
}

const Dashboard: React.FC = () => {
  const [samples, setSamples] = useState<SampleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Mock data for when API is not available
  const getMockSamples = (): SampleData[] => {
    const mockSamples: SampleData[] = [
      {
        id: '1',
        location: 'Site A - Urban Area',
        latitude: 28.6139,
        longitude: 77.2090,
        cu_concentration: 0.8,
        pb_concentration: 0.05,
        cd_concentration: 0.002,
        zn_concentration: 1.2,
        hmpi_value: 45.2,
        status: 'safe',
        sample_date: '2024-01-15',
        collected_by: 'Dr. Sarah Johnson',
        notes: 'Normal urban pollution levels'
      },
      {
        id: '2',
        location: 'Site B - Industrial Zone',
        latitude: 28.7041,
        longitude: 77.1025,
        cu_concentration: 1.5,
        pb_concentration: 0.12,
        cd_concentration: 0.008,
        zn_concentration: 2.8,
        hmpi_value: 78.5,
        status: 'marginal',
        sample_date: '2024-01-16',
        collected_by: 'Mark Thompson',
        notes: 'Elevated levels near industrial area'
      },
      {
        id: '3',
        location: 'Site C - Residential Area',
        latitude: 28.5355,
        longitude: 77.3910,
        cu_concentration: 0.3,
        pb_concentration: 0.02,
        cd_concentration: 0.001,
        zn_concentration: 0.8,
        hmpi_value: 25.1,
        status: 'safe',
        sample_date: '2024-01-17',
        collected_by: 'Dr. Sarah Johnson'
      },
      {
        id: '4',
        location: 'Site D - Mining Area',
        latitude: 28.7041,
        longitude: 77.1025,
        cu_concentration: 2.8,
        pb_concentration: 0.25,
        cd_concentration: 0.015,
        zn_concentration: 4.2,
        hmpi_value: 125.3,
        status: 'high',
        sample_date: '2024-01-18',
        collected_by: 'Mark Thompson',
        notes: 'Critical levels - immediate action required'
      }
    ];

    // Generate more samples for demonstration
    const sampleCount = user?.role === 'higher_official' ? 18 : 8;
    const additionalSamples = Array.from({ length: sampleCount }, (_, index) => ({
      id: `${index + 5}`,
      location: `Site ${String.fromCharCode(69 + index)} - Sample Location`,
      latitude: 28.6 + (Math.random() - 0.5) * 0.5,
      longitude: 77.2 + (Math.random() - 0.5) * 0.5,
      cu_concentration: Math.random() * 2,
      pb_concentration: Math.random() * 0.2,
      cd_concentration: Math.random() * 0.01,
      zn_concentration: Math.random() * 3,
      hmpi_value: Math.random() * 150,
      status: Math.random() > 0.8 ? 'marginal' : Math.random() > 0.9 ? 'high' : 'safe' as 'safe' | 'marginal' | 'high',
      sample_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      collected_by: Math.random() > 0.5 ? 'Dr. Sarah Johnson' : 'Mark Thompson',
      notes: Math.random() > 0.7 ? 'Additional monitoring required' : undefined
    }));

    return [...mockSamples, ...additionalSamples];
  };

  useEffect(() => {
    fetchSamples();
  }, []);
  const fetchSamples = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to fetch from API first
      const response = await apiService.getSamples({
        limit: user?.role === 'higher_official' ? 50 : 10
      });
      
      if (response.success && response.data) {
        setSamples(response.data.samples);
      } else {
        // Fallback to mock data
        setSamples(getMockSamples());
      }
    } catch (err) {
      // If API fails, use mock data
      console.warn('API not available, using mock data:', err);
      setSamples(getMockSamples());
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: samples.length,
    safe: samples.filter(s => s.status === 'safe').length,
    marginal: samples.filter(s => s.status === 'marginal').length,
    high: samples.filter(s => s.status === 'high').length
  };

  const safePercentage = stats.total > 0 ? Math.round((stats.safe / stats.total) * 100) : 0;
  const marginalPercentage = stats.total > 0 ? Math.round((stats.marginal / stats.total) * 100) : 0;
  const highPercentage = stats.total > 0 ? Math.round((stats.high / stats.total) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-400 mx-auto mb-4"></div>
              <p className="text-slate-300">Loading dashboard data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
import React, { useMemo } from 'react';
import {
	ResponsiveContainer,
	LineChart,
	Line,
	CartesianGrid,
	XAxis,
	YAxis,
	Tooltip,
	Legend,
	BarChart,
	Bar,
	PieChart,
	Pie,
	Cell
} from 'recharts';

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

interface ChartsAnalysisProps {
	samples: SampleData[];
}

const indigo = '#818cf8';
const cyan = '#22d3ee';
const emerald = '#34d399';
const amber = '#f59e0b';
const rose = '#fb7185';
const grid = '#1f2937';
const axis = '#94a3b8';
const label = '#cbd5e1';

const ChartsAnalysis: React.FC<ChartsAnalysisProps> = ({ samples }) => {
	const statusCounts = useMemo(() => samples.reduce(
		(acc, s) => {
			acc[s.status] += 1;
			return acc;
		},
		{ safe: 0, marginal: 0, high: 0 } as Record<'safe' | 'marginal' | 'high', number>
	), [samples]);

	const metalsAverages = useMemo(() => {
		if (samples.length === 0) return { Cu: 0, Pb: 0, Cd: 0, Zn: 0 };
		const sum = samples.reduce(
			(acc, s) => {
				acc.Cu += s.cu_concentration || 0;
				acc.Pb += s.pb_concentration || 0;
				acc.Cd += s.cd_concentration || 0;
				acc.Zn += s.zn_concentration || 0;
				return acc;
			},
			{ Cu: 0, Pb: 0, Cd: 0, Zn: 0 }
		);
		return {
			Cu: sum.Cu / samples.length,
			Pb: sum.Pb / samples.length,
			Cd: sum.Cd / samples.length,
			Zn: sum.Zn / samples.length
		};
	}, [samples]);

	const timeSeries = useMemo(() => {
		// fake time series by bucketing ids for demo
		const buckets: Record<string, { name: string; HMPI: number; Safe: number; Risk: number }>
			= {};
		samples.forEach((s) => {
			const bucket = `Batch ${((parseInt(s.id, 10) || 0) % 6) + 1}`;
			if (!buckets[bucket]) buckets[bucket] = { name: bucket, HMPI: 0, Safe: 0, Risk: 0 };
			buckets[bucket].HMPI += s.hmpi_value;
			buckets[bucket].Safe += s.status === 'safe' ? 1 : 0;
			buckets[bucket].Risk += s.status !== 'safe' ? 1 : 0;
		});
		return Object.values(buckets);
	}, [samples]);

	const pieData = [
		{ name: 'Safe', value: statusCounts.safe, color: emerald },
		{ name: 'Marginal', value: statusCounts.marginal, color: amber },
		{ name: 'High', value: statusCounts.high, color: rose }
	];

	// Water quality parameters data
	const waterQualityData = useMemo(() => {
		const samplesWithData = samples.filter(s => s.additional_data);
		if (samplesWithData.length === 0) return [];

		const avgData = samplesWithData.reduce((acc, sample) => {
			const data = sample.additional_data!;
			acc.pH += data.pH || 0;
			acc.ec += data.ec || 0;
			acc.hardness += data.totalHardness || 0;
			acc.fe += data.fe || 0;
			acc.as += data.as || 0;
			acc.u += data.u || 0;
			return acc;
		}, { pH: 0, ec: 0, hardness: 0, fe: 0, as: 0, u: 0 });

		const count = samplesWithData.length;
		return [
			{ parameter: 'pH', value: avgData.pH / count, unit: '', color: indigo },
			{ parameter: 'EC', value: avgData.ec / count, unit: 'µS/cm', color: cyan },
			{ parameter: 'Hardness', value: avgData.hardness / count, unit: 'mg/L', color: emerald },
			{ parameter: 'Iron', value: avgData.fe / count, unit: 'ppm', color: amber },
			{ parameter: 'Arsenic', value: avgData.as / count, unit: 'ppb', color: rose },
			{ parameter: 'Uranium', value: avgData.u / count, unit: 'ppb', color: '#a855f7' }
		];
	}, [samples]);

	return (
		<div className="p-6 text-slate-100">
			<div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
				<div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
					<h4 className="font-semibold text-slate-100 mb-3">HMPI Trend</h4>
					<div className="h-64">
						<ResponsiveContainer width="100%" height="100%">
							<LineChart data={timeSeries} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
								<CartesianGrid stroke={grid} strokeDasharray="3 3" />
								<XAxis dataKey="name" stroke={axis} tick={{ fill: label }} />
								<YAxis stroke={axis} tick={{ fill: label }} />
								<Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }} />
								<Legend wrapperStyle={{ color: label }} />
								<Line type="monotone" dataKey="HMPI" stroke={indigo} strokeWidth={2} dot={false} />
								<Line type="monotone" dataKey="Risk" stroke={rose} strokeWidth={2} dot={false} />
								<Line type="monotone" dataKey="Safe" stroke={emerald} strokeWidth={2} dot={false} />
							</LineChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
					<h4 className="font-semibold text-slate-100 mb-3">Average Metal Concentrations</h4>
					<div className="h-64">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={Object.entries(metalsAverages).map(([k, v]) => ({ metal: k, value: v }))}>
								<CartesianGrid stroke={grid} strokeDasharray="3 3" />
								<XAxis dataKey="metal" stroke={axis} tick={{ fill: label }} />
								<YAxis stroke={axis} tick={{ fill: label }} />
								<Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }} />
								<Bar dataKey="value" fill={cyan} radius={[6, 6, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>

				<div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
					<h4 className="font-semibold text-slate-100 mb-3">Status Distribution</h4>
					<div className="h-64">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={4}>
									{pieData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }} />
								<Legend wrapperStyle={{ color: label }} />
							</PieChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>

			{/* Additional Water Quality Parameters Chart */}
			{waterQualityData.length > 0 && (
				<div className="mt-6">
					<div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
						<h4 className="font-semibold text-slate-100 mb-3">Average Water Quality Parameters</h4>
						<div className="h-64">
							<ResponsiveContainer width="100%" height="100%">
								<BarChart data={waterQualityData}>
									<CartesianGrid stroke={grid} strokeDasharray="3 3" />
									<XAxis dataKey="parameter" stroke={axis} tick={{ fill: label }} />
									<YAxis stroke={axis} tick={{ fill: label }} />
									<Tooltip 
										contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#e2e8f0' }}
										formatter={(value: number, name: string, props: any) => [
											`${value.toFixed(2)} ${props.payload.unit}`,
											props.payload.parameter
										]}
									/>
									<Bar dataKey="value" fill={cyan} radius={[6, 6, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ChartsAnalysis;
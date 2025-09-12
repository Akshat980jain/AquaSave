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
	coordinates: [number, number];
	metalConcentrations: Record<string, number>;
	hmpiValue: number;
	status: 'safe' | 'marginal' | 'high';
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
				acc.Cu += s.metalConcentrations.Cu || 0;
				acc.Pb += s.metalConcentrations.Pb || 0;
				acc.Cd += s.metalConcentrations.Cd || 0;
				acc.Zn += s.metalConcentrations.Zn || 0;
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
			buckets[bucket].HMPI += s.hmpiValue;
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
		</div>
	);
};

export default ChartsAnalysis;
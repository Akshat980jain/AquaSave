import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

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

interface GeographicMapProps {
	samples: SampleData[];
}

const statusToColor = (status: SampleData['status']): string => {
	switch (status) {
		case 'safe':
			return '#10b981'; // emerald-500 (green)
		case 'marginal':
			return '#f59e0b'; // amber-500 (yellow)
		case 'high':
			return '#ef4444'; // red-500 (red)
		default:
			return '#60a5fa';
	}
};

const getMarkerSize = (hmpi: number): number => {
	if (hmpi < 50) return 8;
	if (hmpi < 100) return 12;
	return 16;
};

const GeographicMap: React.FC<GeographicMapProps> = ({ samples }) => {
	const center: [number, number] = samples.length > 0 
		? [samples[0].latitude, samples[0].longitude] 
		: [28.6, 77.2];

	return (
		<div className="p-6 text-slate-100">
			<div className="h-96 w-full overflow-hidden rounded-lg border border-slate-800">
				<MapContainer center={center} zoom={11} className="h-full w-full bg-slate-900">
					<TileLayer
						url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
						attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					/>
					{samples.map((s) => (
						<CircleMarker
							key={s.id}
							center={[s.latitude, s.longitude]}
							radius={getMarkerSize(s.hmpi_value)}
							pathOptions={{ 
								color: statusToColor(s.status), 
								fillColor: statusToColor(s.status), 
								fillOpacity: 0.7,
								weight: 2,
								stroke: true
							}}
						>
							<Popup>
								<div className="text-sm min-w-48">
									<div className="font-semibold text-slate-800 mb-2">{s.location}</div>
									<div className="space-y-1">
										<div className="flex justify-between">
											<span>HMPI:</span>
											<span className="font-medium">{s.hmpi_value.toFixed(1)}</span>
										</div>
										<div className="flex justify-between">
											<span>Status:</span>
											<span className={`font-medium capitalize ${
												s.status === 'safe' ? 'text-green-600' :
												s.status === 'marginal' ? 'text-yellow-600' :
												'text-red-600'
											}`}>
												{s.status}
											</span>
										</div>
										<div className="border-t pt-1 mt-2">
											<div className="text-xs text-slate-600">Metal Concentrations (mg/L)</div>
											<div className="grid grid-cols-2 gap-1 text-xs mt-1">
												<div>Cu: {s.cu_concentration.toFixed(3)}</div>
												<div>Pb: {s.pb_concentration.toFixed(3)}</div>
												<div>Cd: {s.cd_concentration.toFixed(4)}</div>
												<div>Zn: {s.zn_concentration.toFixed(3)}</div>
											</div>
										</div>
										{s.notes && (
											<div className="border-t pt-1 mt-2">
												<div className="text-xs text-slate-600">Notes:</div>
												<div className="text-xs">{s.notes}</div>
											</div>
										)}
									</div>
								</div>
							</Popup>
						</CircleMarker>
					))}
				</MapContainer>
			</div>
			<div className="mt-3 flex items-center gap-4 text-xs text-slate-300">
				<div className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-full" style={{ background: '#10b981' }}></span> Safe (HMPI &lt; 50)</div>
				<div className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-full" style={{ background: '#f59e0b' }}></span> Marginal (50-100)</div>
				<div className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-full" style={{ background: '#ef4444' }}></span> High Risk (&gt; 100)</div>
			</div>
		</div>
	);
};

export default GeographicMap;
import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface SampleData {
	id: string;
	location: string;
	coordinates: [number, number];
	metalConcentrations: Record<string, number>;
	hmpiValue: number;
	status: 'safe' | 'marginal' | 'high';
}

interface GeographicMapProps {
	samples: SampleData[];
}

const statusToColor = (status: SampleData['status']): string => {
	switch (status) {
		case 'safe':
			return '#34d399'; // emerald
		case 'marginal':
			return '#f59e0b'; // amber
		case 'high':
			return '#fb7185'; // rose
		default:
			return '#60a5fa';
	}
};

const GeographicMap: React.FC<GeographicMapProps> = ({ samples }) => {
	const center: [number, number] = samples[0]?.coordinates || [28.6, 77.2];

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
							center={[s.coordinates[0], s.coordinates[1]]}
							radius={10}
							pathOptions={{ color: statusToColor(s.status), fillColor: statusToColor(s.status), fillOpacity: 0.6 }}
						>
							<Popup>
								<div className="text-sm">
									<div className="font-semibold">{s.location}</div>
									<div>HMPI: {s.hmpiValue.toFixed(1)}</div>
									<div>Status: {s.status}</div>
								</div>
							</Popup>
						</CircleMarker>
					))}
				</MapContainer>
			</div>
			<div className="mt-3 flex items-center gap-4 text-xs text-slate-300">
				<div className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-full" style={{ background: '#34d399' }}></span> Safe</div>
				<div className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-full" style={{ background: '#f59e0b' }}></span> Marginal</div>
				<div className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-full" style={{ background: '#fb7185' }}></span> High</div>
			</div>
		</div>
	);
};

export default GeographicMap;
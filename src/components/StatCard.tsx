import React from 'react';

interface StatCardProps {
	icon: React.ReactNode;
	title: string;
	value: string;
	percentage?: string;
	iconBg: string;
	iconColor: string;
}

const StatCard: React.FC<StatCardProps> = ({
	icon,
	title,
	value,
	percentage,
	iconBg,
	iconColor
}) => {
	return (
		<div className="bg-slate-900/60 rounded-lg border border-slate-800 p-6 hover:shadow-md transition-shadow">
			<div className="flex items-center">
				<div className={`${iconBg} ${iconColor} p-3 rounded-lg mr-4`}> 
					{icon}
				</div>
				<div className="flex-1">
					<p className="text-sm font-medium text-slate-300 mb-1">{title}</p>
					<div className="flex items-baseline">
						<p className="text-2xl font-bold text-slate-100">{value}</p>
						{percentage && (
							<p className="ml-2 text-sm font-medium text-slate-400">{percentage}</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default StatCard;
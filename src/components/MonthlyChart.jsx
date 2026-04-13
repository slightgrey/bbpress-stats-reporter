import {
	LineChart, Line, XAxis, YAxis, CartesianGrid,
	Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';
import ExportButton from './ExportButton';

const currentYear = new Date().getFullYear();
const years = Array.from( { length: 5 }, ( _, i ) => currentYear - i );

const MONTH_MAP = {
	Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
	Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
};

function CustomTooltip( { active, payload, label, onViewDetails } ) {
	if ( ! active || ! payload?.length ) return null;
	return (
		<div className="rounded-lg border bg-white shadow-md p-3 text-sm min-w-[170px]">
			<p className="font-semibold mb-2 text-foreground">{ label }</p>
			{ payload.map( ( entry ) => (
				<p key={ entry.name } style={ { color: entry.color } } className="mb-0.5">
					{ entry.name }: <span className="font-medium">{ entry.value }</span>
				</p>
			) ) }
			<button
				onClick={ () => onViewDetails( label ) }
				className="mt-2 text-xs text-blue-600 hover:underline w-full text-left font-medium"
			>
				View Full Details →
			</button>
		</div>
	);
}

export default function MonthlyChart( { data, year, setYear, onMonthClick } ) {
	function handleChartClick( chartData ) {
		if ( chartData?.activeLabel ) {
			onMonthClick( chartData.activeLabel, MONTH_MAP[ chartData.activeLabel ] );
		}
	}

	return (
		<Card>
			<CardHeader className="pb-2">
				<div className="flex items-start justify-between gap-4">
					{/* Left: title + instruction */ }
					<div>
						<CardTitle className="text-base font-semibold text-foreground">
							Monthly Activity — { year }
						</CardTitle>
						<p className="text-xs text-muted-foreground mt-1">
							Click on month to <span className="font-medium text-blue-600">View Full Details</span> drill down
						</p>
					</div>
					{/* Right: export + year picker */ }
					<div className="flex items-center gap-2 shrink-0">
						<ExportButton data={ data } year={ year } />
						<select
							value={ year }
							onChange={ ( e ) => setYear( Number( e.target.value ) ) }
							className="h-8 rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
						>
							{ years.map( ( y ) => (
								<option key={ y } value={ y }>{ y }</option>
							) ) }
						</select>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{ data
					? (
						<ResponsiveContainer width="100%" height={ 280 }>
							<LineChart
								data={ data }
								margin={ { top: 5, right: 20, left: 0, bottom: 5 } }
								onClick={ handleChartClick }
								style={ { cursor: 'pointer' } }
							>
								<CartesianGrid strokeDasharray="3 3" stroke="hsl(214.3 31.8% 91.4%)" />
								<XAxis dataKey="month" tick={ { fontSize: 12 } } />
								<YAxis tick={ { fontSize: 12 } } allowDecimals={ false } />
								<Tooltip
									content={
										<CustomTooltip
											onViewDetails={ ( label ) =>
												onMonthClick( label, MONTH_MAP[ label ] )
											}
										/>
									}
								/>
								<Legend wrapperStyle={ { fontSize: '12px' } } />
								<Line type="monotone" dataKey="topics"        name="Topics"      stroke="#2563eb" strokeWidth={ 2 } dot={ false } activeDot={ { r: 5 } } />
								<Line type="monotone" dataKey="replies"       name="Replies"     stroke="#16a34a" strokeWidth={ 2 } dot={ false } activeDot={ { r: 5 } } />
								<Line type="monotone" dataKey="registrations" name="New Members" stroke="#ea580c" strokeWidth={ 2 } dot={ false } activeDot={ { r: 5 } } />
							</LineChart>
						</ResponsiveContainer>
					)
					: <Skeleton className="h-64 w-full" />
				}
			</CardContent>
		</Card>
	);
}

import { Card, CardHeader, CardTitle, CardValue } from './ui/card';
import { Skeleton } from './ui/skeleton';

const cards = [
	{ key: 'members',    label: 'Total Members',      icon: '👥' },
	{ key: 'topics',     label: 'Total Topics',        icon: '💬' },
	{ key: 'replies',    label: 'Total Replies',       icon: '↩️' },
	{ key: 'avgMonthly', label: 'Avg Posts / Month',   icon: '📈' },
];

export default function StatsCards( { overview } ) {
	return (
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
			{ cards.map( ( { key, label, icon } ) => (
				<Card key={ key }>
					<CardHeader>
						<CardTitle className="flex items-center gap-1.5">
							<span>{ icon }</span> { label }
						</CardTitle>
						{ overview
							? <CardValue>{ Number( overview[ key ] ).toLocaleString() }</CardValue>
							: <Skeleton className="h-9 w-24 mt-1" />
						}
					</CardHeader>
				</Card>
			) ) }
		</div>
	);
}

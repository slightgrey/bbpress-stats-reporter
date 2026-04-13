import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Skeleton } from './ui/skeleton';

export default function LurkerCard( { overview } ) {
	const lurkers = overview ? Number( overview.lurkers ) : null;
	const members = overview ? Number( overview.members ) : null;
	const pct     = lurkers !== null && members > 0
		? ( ( lurkers / members ) * 100 ).toFixed( 1 )
		: null;

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base font-semibold text-foreground">
					Lurkers (Members with 0 Posts)
				</CardTitle>
			</CardHeader>
			<CardContent>
				{ lurkers !== null
					? (
						<div className="flex items-end gap-4">
							<span className="text-4xl font-bold tracking-tight">
								{ lurkers.toLocaleString() }
							</span>
							<span className="text-muted-foreground text-sm mb-1">
								{ pct }% of { members.toLocaleString() } total members have never posted
							</span>
						</div>
					)
					: <Skeleton className="h-10 w-40" />
				}
			</CardContent>
		</Card>
	);
}

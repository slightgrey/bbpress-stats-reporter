import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';

const rankVariant = ( rank ) => {
	if ( rank === 1 ) return 'gold';
	if ( rank === 2 ) return 'silver';
	if ( rank === 3 ) return 'bronze';
	return 'secondary';
};

export default function TopPostersTable( { posters } ) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base font-semibold text-foreground">Top Posters</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				{ posters
					? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-12">#</TableHead>
									<TableHead>Member</TableHead>
									<TableHead className="text-right">Topics</TableHead>
									<TableHead className="text-right">Replies</TableHead>
									<TableHead className="text-right">Total</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{ posters.map( ( poster, i ) => (
									<TableRow key={ poster.id }>
										<TableCell>
											<Badge variant={ rankVariant( i + 1 ) }>{ i + 1 }</Badge>
										</TableCell>
										<TableCell className="font-medium">{ poster.name }</TableCell>
										<TableCell className="text-right text-muted-foreground">{ Number( poster.topics ).toLocaleString() }</TableCell>
										<TableCell className="text-right text-muted-foreground">{ Number( poster.replies ).toLocaleString() }</TableCell>
										<TableCell className="text-right font-semibold">{ Number( poster.total ).toLocaleString() }</TableCell>
									</TableRow>
								) ) }
							</TableBody>
						</Table>
					)
					: <div className="p-6"><Skeleton className="h-48 w-full" /></div>
				}
			</CardContent>
		</Card>
	);
}

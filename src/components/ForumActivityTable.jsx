import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table';
import { Skeleton } from './ui/skeleton';

export default function ForumActivityTable( { forums } ) {
	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-base font-semibold text-foreground">Forum Activity</CardTitle>
			</CardHeader>
			<CardContent className="p-0">
				{ forums
					? (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Forum</TableHead>
									<TableHead className="text-right">Topics</TableHead>
									<TableHead className="text-right">Replies</TableHead>
									<TableHead className="text-right">Ratio</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{ forums.map( ( forum ) => {
									const topics  = Number( forum.topics );
									const replies = Number( forum.replies );
									const ratio   = topics > 0 ? ( replies / topics ).toFixed( 1 ) : '—';
									return (
										<TableRow key={ forum.id }>
											<TableCell className="font-medium max-w-[160px] truncate">{ forum.name }</TableCell>
											<TableCell className="text-right text-muted-foreground">{ topics.toLocaleString() }</TableCell>
											<TableCell className="text-right text-muted-foreground">{ replies.toLocaleString() }</TableCell>
											<TableCell className="text-right font-semibold">{ ratio }</TableCell>
										</TableRow>
									);
								} ) }
							</TableBody>
						</Table>
					)
					: <div className="p-6"><Skeleton className="h-48 w-full" /></div>
				}
			</CardContent>
		</Card>
	);
}

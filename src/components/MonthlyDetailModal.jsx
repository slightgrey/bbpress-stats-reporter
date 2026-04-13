import { useState, useEffect } from '@wordpress/element';
import { apiFetch } from '../App';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './ui/table';
import { Badge } from './ui/badge';
import { Skeleton } from './ui/skeleton';

const rankVariant = ( rank ) => {
	if ( rank === 1 ) return 'gold';
	if ( rank === 2 ) return 'silver';
	if ( rank === 3 ) return 'bronze';
	return 'secondary';
};

function exportMonthCSV( data ) {
	const esc = ( v ) => `"${ String( v ).replace( /"/g, '""' ) }"`;

	const sections = [
		[ `BBPress Forum Stats — ${ data.label }` ],
		[],
		[ 'SUMMARY' ],
		[ 'Topics Posted', 'Replies Posted', 'New Members' ],
		[ data.totals.topics, data.totals.replies, data.totals.new_members ],
		[],
		[ 'TOP POSTERS' ],
		[ 'Rank', 'Member', 'Topics', 'Replies', 'Total' ],
		...data.top_posters.map( ( p, i ) => [ i + 1, esc( p.name ), p.topics, p.replies, p.total ] ),
		[],
		[ 'FORUM ACTIVITY' ],
		[ 'Forum', 'Topics', 'Replies' ],
		...data.forums.map( ( f ) => [ esc( f.name ), f.topics, f.replies ] ),
		[],
		[ 'NEW MEMBERS' ],
		[ 'Name' ],
		...data.new_members.map( ( name ) => [ esc( name ) ] ),
	];

	const csv    = sections.map( ( row ) => row.join( ',' ) ).join( '\n' );
	const blob   = new Blob( [ csv ], { type: 'text/csv;charset=utf-8;' } );
	const url    = URL.createObjectURL( blob );
	const anchor = document.createElement( 'a' );
	anchor.href     = url;
	anchor.download = `forum-stats-${ data.label.toLowerCase().replace( /\s+/g, '-' ) }.csv`;
	anchor.click();
	URL.revokeObjectURL( url );
}

export default function MonthlyDetailModal( { year, month, onClose } ) {
	const [ data, setData ] = useState( null );
	const [ error, setError ] = useState( null );

	useEffect( () => {
		setData( null );
		setError( null );
		apiFetch( `/monthly-detail?year=${ year }&month=${ month.num }` )
			.then( setData )
			.catch( ( err ) => setError( err.message ) );
	}, [ year, month.num ] );

	// Close on backdrop click.
	function handleBackdrop( e ) {
		if ( e.target === e.currentTarget ) onClose();
	}

	return (
		<div
			className="fixed inset-0 bg-black/50 z-[99999] flex items-center justify-center p-4"
			onClick={ handleBackdrop }
		>
			<div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
				{/* Modal header */ }
				<div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-white rounded-t-xl">
					<div>
						<h2 className="text-lg font-bold">
							{ data ? data.label : `${ month.label } ${ year }` }
						</h2>
						<p className="text-xs text-muted-foreground mt-0.5">Monthly breakdown</p>
					</div>
					<div className="flex items-center gap-2">
						<button
							onClick={ () => exportMonthCSV( data ) }
							disabled={ ! data }
							title="Export this month to CSV"
							className="inline-flex items-center gap-1.5 h-8 rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
								<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
								<polyline points="7 10 12 15 17 10" />
								<line x1="12" y1="15" x2="12" y2="3" />
							</svg>
							Export this month
						</button>
						<button
							onClick={ onClose }
							className="text-muted-foreground hover:text-foreground transition-colors text-xl leading-none p-1"
							aria-label="Close"
						>
							✕
						</button>
					</div>
				</div>

				<div className="p-6 space-y-6">
					{ error && (
						<div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
							{ error }
						</div>
					) }

					{/* Summary stats */ }
					{ data
						? (
							<div className="grid grid-cols-3 gap-3">
								{ [
									{ label: 'Topics Posted',  value: data.totals.topics },
									{ label: 'Replies Posted', value: data.totals.replies },
									{ label: 'New Members',    value: data.totals.new_members },
								].map( ( stat ) => (
									<div key={ stat.label } className="rounded-lg border border-border bg-muted/40 p-4 text-center">
										<p className="text-2xl font-bold">{ Number( stat.value ).toLocaleString() }</p>
										<p className="text-xs text-muted-foreground mt-1">{ stat.label }</p>
									</div>
								) ) }
							</div>
						)
						: (
							<div className="grid grid-cols-3 gap-3">
								{ [ 1, 2, 3 ].map( ( i ) => <Skeleton key={ i } className="h-20 rounded-lg" /> ) }
							</div>
						)
					}

					{/* Top Posters */ }
					<div>
						<h3 className="text-sm font-semibold mb-3">Top Posters This Month</h3>
						{ data
							? data.top_posters.length > 0
								? (
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead className="w-10">#</TableHead>
												<TableHead>Member</TableHead>
												<TableHead className="text-right">Topics</TableHead>
												<TableHead className="text-right">Replies</TableHead>
												<TableHead className="text-right">Total</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{ data.top_posters.map( ( poster, i ) => (
												<TableRow key={ poster.id }>
													<TableCell><Badge variant={ rankVariant( i + 1 ) }>{ i + 1 }</Badge></TableCell>
													<TableCell className="font-medium">{ poster.name }</TableCell>
													<TableCell className="text-right text-muted-foreground">{ poster.topics }</TableCell>
													<TableCell className="text-right text-muted-foreground">{ poster.replies }</TableCell>
													<TableCell className="text-right font-semibold">{ poster.total }</TableCell>
												</TableRow>
											) ) }
										</TableBody>
									</Table>
								)
								: <p className="text-sm text-muted-foreground">No posts this month.</p>
							: <Skeleton className="h-32 w-full" />
						}
					</div>

					{/* Forum Activity */ }
					<div>
						<h3 className="text-sm font-semibold mb-3">Forum Activity This Month</h3>
						{ data
							? data.forums.length > 0
								? (
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>Forum</TableHead>
												<TableHead className="text-right">Topics</TableHead>
												<TableHead className="text-right">Replies</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{ data.forums.map( ( forum ) => (
												<TableRow key={ forum.id }>
													<TableCell className="font-medium">{ forum.name }</TableCell>
													<TableCell className="text-right text-muted-foreground">{ forum.topics }</TableCell>
													<TableCell className="text-right text-muted-foreground">{ forum.replies }</TableCell>
												</TableRow>
											) ) }
										</TableBody>
									</Table>
								)
								: <p className="text-sm text-muted-foreground">No forum activity this month.</p>
							: <Skeleton className="h-24 w-full" />
						}
					</div>

					{/* New Members */ }
					{ ( ! data || data.new_members.length > 0 ) && (
						<div>
							<h3 className="text-sm font-semibold mb-3">New Members This Month</h3>
							{ data
								? (
									<div className="flex flex-wrap gap-2">
										{ data.new_members.map( ( name ) => (
											<Badge key={ name } variant="secondary">{ name }</Badge>
										) ) }
										{ data.totals.new_members > 10 && (
											<Badge variant="secondary">+{ data.totals.new_members - 10 } more</Badge>
										) }
									</div>
								)
								: <Skeleton className="h-8 w-64" />
							}
						</div>
					) }
				</div>
			</div>
		</div>
	);
}

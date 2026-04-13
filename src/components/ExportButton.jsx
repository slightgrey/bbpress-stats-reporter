export default function ExportButton( { data, year } ) {
	function handleExport() {
		if ( ! data ) return;

		const rows = [
			[ 'Month', 'Topics', 'Replies', 'New Members', 'Total Posts' ],
			...data.map( ( row ) => [
				row.month,
				row.topics,
				row.replies,
				row.registrations,
				row.topics + row.replies,
			] ),
		];

		const csv    = rows.map( ( r ) => r.join( ',' ) ).join( '\n' );
		const blob   = new Blob( [ csv ], { type: 'text/csv;charset=utf-8;' } );
		const url    = URL.createObjectURL( blob );
		const anchor = document.createElement( 'a' );
		anchor.href     = url;
		anchor.download = `forum-stats-${ year }.csv`;
		anchor.click();
		URL.revokeObjectURL( url );
	}

	return (
		<button
			onClick={ handleExport }
			disabled={ ! data }
			title={ `Export ${ year } monthly data as CSV` }
			className="inline-flex items-center gap-1.5 h-8 rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
		>
			<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
				<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
				<polyline points="7 10 12 15 17 10" />
				<line x1="12" y1="15" x2="12" y2="3" />
			</svg>
			Export CSV
		</button>
	);
}

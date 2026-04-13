import { useState, useEffect } from '@wordpress/element';
import StatsCards from './components/StatsCards';
import MonthlyChart from './components/MonthlyChart';
import TopPostersTable from './components/TopPostersTable';
import ForumActivityTable from './components/ForumActivityTable';
import LurkerCard from './components/LurkerCard';
import MonthlyDetailModal from './components/MonthlyDetailModal';

const { restUrl, nonce } = window.bbpressStats || {};

export async function apiFetch( path ) {
	const res = await fetch( restUrl + path, {
		headers: { 'X-WP-Nonce': nonce },
	} );
	if ( ! res.ok ) throw new Error( `API error: ${ res.status }` );
	return res.json();
}

const currentYear = new Date().getFullYear();

export default function App() {
	const [ year, setYear ] = useState( currentYear );
	const [ overview, setOverview ] = useState( null );
	const [ monthly, setMonthly ] = useState( null );
	const [ topPosters, setTopPosters ] = useState( null );
	const [ forums, setForums ] = useState( null );
	const [ error, setError ] = useState( null );
	const [ selectedMonth, setSelectedMonth ] = useState( null ); // { label: 'Jan', num: 1 }

	useEffect( () => {
		setError( null );
		Promise.all( [
			apiFetch( '/overview' ),
			apiFetch( `/monthly?year=${ year }` ),
			apiFetch( '/top-posters?limit=10' ),
			apiFetch( '/forums' ),
		] )
			.then( ( [ ov, mo, tp, fo ] ) => {
				setOverview( ov );
				setMonthly( mo );
				setTopPosters( tp );
				setForums( fo );
			} )
			.catch( ( err ) => setError( err.message ) );
	}, [ year ] );

	return (
		<div className="bbpress-stats-wrap px-6 max-w-7xl">
			{/* Header — year picker lives inside the chart card now */ }
			<div className="mb-6">
				<h1 className="text-2xl font-bold tracking-tight">Forum Stats</h1>
				<p className="text-sm text-muted-foreground mt-1">bbPress activity dashboard</p>
			</div>

			{ error && (
				<div className="rounded-md bg-red-50 border border-red-200 p-4 mb-6 text-sm text-red-700">
					{ error }
				</div>
			) }

			{/* Row 1 — Stat Cards */ }
			<StatsCards overview={ overview } />

			{/* Row 2 — Monthly Chart (owns year picker + export) */ }
			<div className="mt-6">
				<MonthlyChart
					data={ monthly }
					year={ year }
					setYear={ setYear }
					onMonthClick={ ( label, num ) => setSelectedMonth( { label, num } ) }
				/>
			</div>

			{/* Row 3 — Tables */ }
			<div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
				<TopPostersTable posters={ topPosters } />
				<ForumActivityTable forums={ forums } />
			</div>

			{/* Row 4 — Lurkers */ }
			<div className="mt-6">
				<LurkerCard overview={ overview } />
			</div>

			{/* Monthly detail modal */ }
			{ selectedMonth && (
				<MonthlyDetailModal
					year={ year }
					month={ selectedMonth }
					onClose={ () => setSelectedMonth( null ) }
				/>
			) }
		</div>
	);
}

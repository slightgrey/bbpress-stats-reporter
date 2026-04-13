import './index.css';
import { render } from '@wordpress/element';
import App from './App';

const root = document.getElementById( 'bbpress-stats-root' );
if ( root ) {
	render( <App />, root );
}

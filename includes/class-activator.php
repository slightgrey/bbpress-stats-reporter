<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class BBSR_Activator {
	public static function activate() {
		// No DB tables needed — all queries are runtime against existing WP/bbPress tables.
	}
}

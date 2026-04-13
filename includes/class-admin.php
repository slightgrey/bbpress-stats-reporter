<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class BBSR_Admin {

	const PAGE_SLUG = 'bbpress-stats';

	public function add_menu_page() {
		add_menu_page(
			__( 'Forum Stats', 'bbpress-stats-reporter' ),
			__( 'Forum Stats', 'bbpress-stats-reporter' ),
			'manage_options',
			self::PAGE_SLUG,
			array( $this, 'render_page' ),
			'dashicons-chart-bar',
			30
		);
	}

	public function render_page() {
		echo '<div class="wrap"><div id="bbpress-stats-root" class="bbpress-stats-wrap"></div></div>';
	}

	public function enqueue_assets( $hook ) {
		if ( 'toplevel_page_' . self::PAGE_SLUG !== $hook ) {
			return;
		}

		$asset_file = BBSR_PLUGIN_DIR . 'build/index.asset.php';
		$asset      = file_exists( $asset_file ) ? require $asset_file : array(
			'dependencies' => array( 'wp-element' ),
			'version'      => BBSR_VERSION,
		);

		wp_enqueue_script(
			'bbpress-stats-reporter',
			BBSR_PLUGIN_URL . 'build/index.js',
			$asset['dependencies'],
			$asset['version'],
			true
		);

		wp_enqueue_style(
			'bbpress-stats-reporter',
			BBSR_PLUGIN_URL . 'build/index.css',
			array(),
			$asset['version']
		);

		wp_localize_script( 'bbpress-stats-reporter', 'bbpressStats', array(
			'restUrl' => esc_url_raw( rest_url( 'bbpress-stats/v1' ) ),
			'nonce'   => wp_create_nonce( 'wp_rest' ),
		) );
	}
}

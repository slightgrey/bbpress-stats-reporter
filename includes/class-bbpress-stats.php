<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class BBSR_BBPress_Stats {

	protected $loader;

	public function __construct() {
		$this->loader = new BBSR_Loader();
		$this->define_admin_hooks();
		$this->define_rest_hooks();
	}

	private function define_admin_hooks() {
		$admin = new BBSR_Admin();
		$this->loader->add_action( 'admin_menu', $admin, 'add_menu_page' );
		$this->loader->add_action( 'admin_enqueue_scripts', $admin, 'enqueue_assets' );
	}

	private function define_rest_hooks() {
		$api = new BBSR_REST_API();
		$this->loader->add_action( 'rest_api_init', $api, 'register_routes' );
	}

	public function run() {
		$this->loader->run();
	}
}

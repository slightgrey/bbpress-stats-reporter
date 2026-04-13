<?php
/**
 * Plugin Name: BBPress Forum Stats Reporter
 * Plugin URI:  https://bbpress.org
 * Description: Monthly snapshot reporting dashboard for bbPress forum activity.
 * Version:     1.0.3
 * Author:      Vince
 * License:     GPL-2.0-or-later
 * Text Domain: bbpress-stats-reporter
 * Requires at least: 6.0
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'BBSR_VERSION', '1.0.3' );
define( 'BBSR_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'BBSR_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

require_once BBSR_PLUGIN_DIR . 'includes/class-loader.php';
require_once BBSR_PLUGIN_DIR . 'includes/class-activator.php';
require_once BBSR_PLUGIN_DIR . 'includes/class-deactivator.php';
require_once BBSR_PLUGIN_DIR . 'includes/class-rest-api.php';
require_once BBSR_PLUGIN_DIR . 'includes/class-admin.php';
require_once BBSR_PLUGIN_DIR . 'includes/class-bbpress-stats.php';

register_activation_hook( __FILE__, array( 'BBSR_Activator', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'BBSR_Deactivator', 'deactivate' ) );

function bbsr_run() {
	$plugin = new BBSR_BBPress_Stats();
	$plugin->run();
}
bbsr_run();

<?php

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class BBSR_REST_API {

	const API_NAMESPACE = 'bbpress-stats/v1';

	public function register_routes() {
		register_rest_route( self::API_NAMESPACE, '/overview', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( $this, 'get_overview' ),
			'permission_callback' => array( $this, 'admin_only' ),
		) );

		register_rest_route( self::API_NAMESPACE, '/monthly', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( $this, 'get_monthly' ),
			'permission_callback' => array( $this, 'admin_only' ),
			'args'                => array(
				'year' => array(
					'default'           => gmdate( 'Y' ),
					'validate_callback' => function( $v ) { return is_numeric( $v ) && $v > 2000 && $v <= 2100; },
					'sanitize_callback' => 'absint',
				),
			),
		) );

		register_rest_route( self::API_NAMESPACE, '/top-posters', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( $this, 'get_top_posters' ),
			'permission_callback' => array( $this, 'admin_only' ),
			'args'                => array(
				'limit' => array(
					'default'           => 10,
					'validate_callback' => function( $v ) { return is_numeric( $v ) && $v >= 1 && $v <= 50; },
					'sanitize_callback' => 'absint',
				),
			),
		) );

		register_rest_route( self::API_NAMESPACE, '/forums', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( $this, 'get_forums' ),
			'permission_callback' => array( $this, 'admin_only' ),
		) );

		register_rest_route( self::API_NAMESPACE, '/monthly-detail', array(
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( $this, 'get_monthly_detail' ),
			'permission_callback' => array( $this, 'admin_only' ),
			'args'                => array(
				'year'  => array(
					'default'           => gmdate( 'Y' ),
					'validate_callback' => function( $v ) { return is_numeric( $v ) && $v > 2000 && $v <= 2100; },
					'sanitize_callback' => 'absint',
				),
				'month' => array(
					'default'           => 1,
					'validate_callback' => function( $v ) { return is_numeric( $v ) && $v >= 1 && $v <= 12; },
					'sanitize_callback' => 'absint',
				),
			),
		) );
	}

	public function admin_only() {
		return current_user_can( 'manage_options' );
	}

	public function get_overview( WP_REST_Request $request ) {
		global $wpdb;

		$total_members = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->users}" );

		$total_topics = (int) $wpdb->get_var( $wpdb->prepare(
			"SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = %s AND post_status = %s",
			'topic', 'publish'
		) );

		$total_replies = (int) $wpdb->get_var( $wpdb->prepare(
			"SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = %s AND post_status = %s",
			'reply', 'publish'
		) );

		$lurkers = (int) $wpdb->get_var(
			"SELECT COUNT(*) FROM {$wpdb->users} u
			 WHERE NOT EXISTS (
				SELECT 1 FROM {$wpdb->posts} p
				WHERE p.post_author = u.ID
				  AND p.post_type IN ('topic','reply')
				  AND p.post_status = 'publish'
			 )"
		);

		// Average monthly posts (topics+replies) over all months with activity.
		$monthly_totals = $wpdb->get_col(
			"SELECT COUNT(*) as cnt
			 FROM {$wpdb->posts}
			 WHERE post_type IN ('topic','reply') AND post_status = 'publish'
			 GROUP BY YEAR(post_date), MONTH(post_date)"
		);

		$avg_monthly = count( $monthly_totals ) > 0
			? round( array_sum( $monthly_totals ) / count( $monthly_totals ), 1 )
			: 0;

		return rest_ensure_response( array(
			'members'     => $total_members,
			'topics'      => $total_topics,
			'replies'     => $total_replies,
			'lurkers'     => $lurkers,
			'avgMonthly'  => $avg_monthly,
		) );
	}

	public function get_monthly( WP_REST_Request $request ) {
		global $wpdb;
		$year = $request->get_param( 'year' );

		$topics = $wpdb->get_results( $wpdb->prepare(
			"SELECT MONTH(post_date) as month, COUNT(*) as count
			 FROM {$wpdb->posts}
			 WHERE post_type = %s AND post_status = %s AND YEAR(post_date) = %d
			 GROUP BY MONTH(post_date)",
			'topic', 'publish', $year
		), ARRAY_A );

		$replies = $wpdb->get_results( $wpdb->prepare(
			"SELECT MONTH(post_date) as month, COUNT(*) as count
			 FROM {$wpdb->posts}
			 WHERE post_type = %s AND post_status = %s AND YEAR(post_date) = %d
			 GROUP BY MONTH(post_date)",
			'reply', 'publish', $year
		), ARRAY_A );

		$registrations = $wpdb->get_results( $wpdb->prepare(
			"SELECT MONTH(user_registered) as month, COUNT(*) as count
			 FROM {$wpdb->users}
			 WHERE YEAR(user_registered) = %d
			 GROUP BY MONTH(user_registered)",
			$year
		), ARRAY_A );

		$topics_map        = wp_list_pluck( $topics, 'count', 'month' );
		$replies_map       = wp_list_pluck( $replies, 'count', 'month' );
		$registrations_map = wp_list_pluck( $registrations, 'count', 'month' );

		$data = array();
		$month_names = array( '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' );
		for ( $m = 1; $m <= 12; $m++ ) {
			$data[] = array(
				'month'         => $month_names[ $m ],
				'topics'        => (int) ( $topics_map[ $m ] ?? 0 ),
				'replies'       => (int) ( $replies_map[ $m ] ?? 0 ),
				'registrations' => (int) ( $registrations_map[ $m ] ?? 0 ),
			);
		}

		return rest_ensure_response( $data );
	}

	public function get_top_posters( WP_REST_Request $request ) {
		global $wpdb;
		$limit = $request->get_param( 'limit' );

		$rows = $wpdb->get_results( $wpdb->prepare(
			"SELECT p.post_author as id, u.display_name as name,
				SUM(CASE WHEN p.post_type = 'topic' THEN 1 ELSE 0 END) as topics,
				SUM(CASE WHEN p.post_type = 'reply' THEN 1 ELSE 0 END) as replies,
				COUNT(*) as total
			 FROM {$wpdb->posts} p
			 JOIN {$wpdb->users} u ON p.post_author = u.ID
			 WHERE p.post_type IN ('topic','reply') AND p.post_status = 'publish'
			 GROUP BY p.post_author
			 ORDER BY total DESC
			 LIMIT %d",
			$limit
		), ARRAY_A );

		return rest_ensure_response( $rows );
	}

	public function get_forums( WP_REST_Request $request ) {
		global $wpdb;

		$forums = $wpdb->get_results(
			"SELECT p.ID as id, p.post_title as name,
				(SELECT COUNT(*) FROM {$wpdb->posts}
				 WHERE post_type='topic' AND post_status='publish' AND post_parent=p.ID) as topics,
				(SELECT COUNT(*) FROM {$wpdb->posts} r
				 WHERE r.post_type='reply' AND r.post_status='publish'
				   AND r.post_parent IN (
					  SELECT ID FROM {$wpdb->posts}
					  WHERE post_type='topic' AND post_parent=p.ID
				   )
				) as replies
			 FROM {$wpdb->posts} p
			 WHERE p.post_type='forum' AND p.post_status='publish'
			 ORDER BY topics DESC",
			ARRAY_A
		);

		return rest_ensure_response( $forums );
	}

	public function get_monthly_detail( WP_REST_Request $request ) {
		global $wpdb;
		$year  = $request->get_param( 'year' );
		$month = $request->get_param( 'month' );

		$month_names = array( '', 'January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December' );
		$label = $month_names[ $month ] . ' ' . $year;

		// Totals for the month.
		$topics_count = (int) $wpdb->get_var( $wpdb->prepare(
			"SELECT COUNT(*) FROM {$wpdb->posts}
			 WHERE post_type = %s AND post_status = %s AND YEAR(post_date) = %d AND MONTH(post_date) = %d",
			'topic', 'publish', $year, $month
		) );

		$replies_count = (int) $wpdb->get_var( $wpdb->prepare(
			"SELECT COUNT(*) FROM {$wpdb->posts}
			 WHERE post_type = %s AND post_status = %s AND YEAR(post_date) = %d AND MONTH(post_date) = %d",
			'reply', 'publish', $year, $month
		) );

		$new_members_count = (int) $wpdb->get_var( $wpdb->prepare(
			"SELECT COUNT(*) FROM {$wpdb->users}
			 WHERE YEAR(user_registered) = %d AND MONTH(user_registered) = %d",
			$year, $month
		) );

		// Top 5 posters for this month.
		$top_posters = $wpdb->get_results( $wpdb->prepare(
			"SELECT p.post_author as id, u.display_name as name,
				SUM(CASE WHEN p.post_type = 'topic' THEN 1 ELSE 0 END) as topics,
				SUM(CASE WHEN p.post_type = 'reply' THEN 1 ELSE 0 END) as replies,
				COUNT(*) as total
			 FROM {$wpdb->posts} p
			 JOIN {$wpdb->users} u ON p.post_author = u.ID
			 WHERE p.post_type IN ('topic','reply') AND p.post_status = 'publish'
			   AND YEAR(p.post_date) = %d AND MONTH(p.post_date) = %d
			 GROUP BY p.post_author
			 ORDER BY total DESC
			 LIMIT 5",
			$year, $month
		), ARRAY_A );

		// Forum activity for this month — topics posted this month per forum,
		// replies posted this month whose parent topic belongs to each forum.
		$forum_rows = $wpdb->get_results( $wpdb->prepare(
			"SELECT f.ID as id, f.post_title as name,
				(SELECT COUNT(*) FROM {$wpdb->posts}
				 WHERE post_type='topic' AND post_status='publish' AND post_parent=f.ID
				   AND YEAR(post_date)=%d AND MONTH(post_date)=%d) as topics,
				(SELECT COUNT(*) FROM {$wpdb->posts} r
				 WHERE r.post_type='reply' AND r.post_status='publish'
				   AND YEAR(r.post_date)=%d AND MONTH(r.post_date)=%d
				   AND r.post_parent IN (
					  SELECT ID FROM {$wpdb->posts}
					  WHERE post_type='topic' AND post_parent=f.ID
				   )
				) as replies
			 FROM {$wpdb->posts} f
			 WHERE f.post_type='forum' AND f.post_status='publish'
			 HAVING topics > 0 OR replies > 0
			 ORDER BY topics DESC",
			$year, $month, $year, $month
		), ARRAY_A );

		// New member names (up to 10).
		$new_members = $wpdb->get_col( $wpdb->prepare(
			"SELECT display_name FROM {$wpdb->users}
			 WHERE YEAR(user_registered) = %d AND MONTH(user_registered) = %d
			 ORDER BY user_registered ASC
			 LIMIT 10",
			$year, $month
		) );

		return rest_ensure_response( array(
			'label'       => $label,
			'totals'      => array(
				'topics'      => $topics_count,
				'replies'     => $replies_count,
				'new_members' => $new_members_count,
			),
			'top_posters' => $top_posters,
			'forums'      => $forum_rows,
			'new_members' => $new_members,
		) );
	}
}

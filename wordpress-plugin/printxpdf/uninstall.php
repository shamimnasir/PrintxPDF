<?php
/**
 * Uninstall PrintxPDF.
 *
 * Runs only when the plugin is deleted from the Plugins screen. It removes the
 * single option this plugin creates and leaves nothing else behind.
 *
 * @package PrintxPDF
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_option( 'printxpdf_settings' );

// On multisite the option is stored per site, so clear each one.
if ( is_multisite() ) {
	$site_ids = get_sites(
		array(
			'fields' => 'ids',
			'number' => 0,
		)
	);

	foreach ( $site_ids as $site_id ) {
		switch_to_blog( (int) $site_id );
		delete_option( 'printxpdf_settings' );
		restore_current_blog();
	}
}

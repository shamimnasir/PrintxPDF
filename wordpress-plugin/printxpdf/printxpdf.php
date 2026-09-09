<?php
/**
 * Plugin Name:       PrintxPDF Print & PDF Button
 * Plugin URI:        https://printxpdf.com/wordpress
 * Description:       Adds a Print, Save-as-PDF and Email button row to your posts and pages. Printing happens in the visitor's browser. No account, no API key, no tracking, and nothing is sent anywhere by the plugin.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            Nasir Uddin Shamim
 * Author URI:        https://printxpdf.com/author/nasir-uddin-shamim
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       printxpdf
 * Domain Path:       /languages
 *
 * @package PrintxPDF
 */

defined( 'ABSPATH' ) || exit;

define( 'PRINTXPDF_VERSION', '1.0.0' );
define( 'PRINTXPDF_URL', plugin_dir_url( __FILE__ ) );
define( 'PRINTXPDF_OPTION', 'printxpdf_settings' );
define( 'PRINTXPDF_GROUP', 'printxpdf_settings_group' );
define( 'PRINTXPDF_PAGE', 'printxpdf' );
define( 'PRINTXPDF_ENDPOINT', 'https://printxpdf.com/print' );

/* -------------------------------------------------------------------------
 * Settings model
 * ---------------------------------------------------------------------- */

/**
 * Default settings. Used on activation and as a fallback for missing keys.
 *
 * @return array
 */
function printxpdf_defaults() {
	return array(
		'placement'   => 'bottom',
		'buttons'     => array(
			'print' => 1,
			'pdf'   => 1,
			'email' => 0,
		),
		'label'       => '',
		'post_types'  => array( 'post', 'page' ),
		'align'       => 'left',
		'match_theme' => 0,
	);
}

/**
 * Placement choices, keyed by the value stored in the option.
 *
 * @return array
 */
function printxpdf_placements() {
	return array(
		'top'    => __( 'Above the content', 'printxpdf' ),
		'bottom' => __( 'Below the content', 'printxpdf' ),
		'both'   => __( 'Above and below the content', 'printxpdf' ),
		'manual' => __( 'Manual only (place the shortcode yourself)', 'printxpdf' ),
	);
}

/**
 * Alignment choices.
 *
 * @return array
 */
function printxpdf_alignments() {
	return array(
		'left'   => __( 'Left', 'printxpdf' ),
		'center' => __( 'Center', 'printxpdf' ),
		'right'  => __( 'Right', 'printxpdf' ),
	);
}

/**
 * The three buttons this plugin can render, with their default labels.
 *
 * @return array
 */
function printxpdf_button_types() {
	return array(
		'print' => __( 'Print', 'printxpdf' ),
		'pdf'   => __( 'Save as PDF', 'printxpdf' ),
		'email' => __( 'Email', 'printxpdf' ),
	);
}

/**
 * Public post types the buttons can be attached to.
 *
 * @return array Map of post type slug => human readable label.
 */
function printxpdf_available_post_types() {
	$types = get_post_types( array( 'public' => true ), 'objects' );
	$out   = array();

	foreach ( $types as $type ) {
		if ( 'attachment' === $type->name ) {
			continue;
		}
		$out[ $type->name ] = isset( $type->labels->name ) ? $type->labels->name : $type->name;
	}

	return $out;
}

/**
 * Constrain a value to a known set of keys.
 *
 * @param mixed  $value    Raw value.
 * @param array  $allowed  Allowed values, keyed by the accepted key.
 * @param string $fallback Value returned when $value is not allowed.
 * @return string
 */
function printxpdf_pick( $value, $allowed, $fallback ) {
	$value = is_scalar( $value ) ? sanitize_key( (string) $value ) : '';

	return isset( $allowed[ $value ] ) ? $value : $fallback;
}

/**
 * Read the settings, normalised so callers never have to defend themselves.
 *
 * @return array
 */
function printxpdf_get_settings() {
	$defaults = printxpdf_defaults();
	$saved    = get_option( PRINTXPDF_OPTION, array() );

	if ( ! is_array( $saved ) ) {
		$saved = array();
	}

	$settings = array_merge( $defaults, $saved );

	$settings['placement']   = printxpdf_pick( $settings['placement'], printxpdf_placements(), $defaults['placement'] );
	$settings['align']       = printxpdf_pick( $settings['align'], printxpdf_alignments(), $defaults['align'] );
	$settings['label']       = is_scalar( $settings['label'] ) ? trim( (string) $settings['label'] ) : '';
	$settings['match_theme'] = empty( $settings['match_theme'] ) ? 0 : 1;

	$saved_buttons = is_array( $settings['buttons'] ) ? $settings['buttons'] : array();
	$buttons       = array();
	foreach ( array_keys( printxpdf_button_types() ) as $key ) {
		$buttons[ $key ] = empty( $saved_buttons[ $key ] ) ? 0 : 1;
	}
	$settings['buttons'] = $buttons;

	$saved_types = is_array( $settings['post_types'] ) ? $settings['post_types'] : array();
	$settings['post_types'] = array_values( array_unique( array_filter( array_map( 'sanitize_key', $saved_types ) ) ) );

	return $settings;
}

/**
 * Sanitize callback for register_setting(). Every value is rebuilt from a
 * known-good whitelist, so nothing arbitrary can ever reach the database.
 *
 * @param mixed $input Raw submitted value (already unslashed by options.php).
 * @return array
 */
function printxpdf_sanitize_settings( $input ) {
	$defaults = printxpdf_defaults();
	$current  = get_option( PRINTXPDF_OPTION, $defaults );

	if ( ! is_array( $current ) ) {
		$current = $defaults;
	}

	// Belt and braces: options.php already checks the capability and the nonce.
	if ( ! current_user_can( 'manage_options' ) ) {
		return $current;
	}

	if ( ! is_array( $input ) ) {
		return $defaults;
	}

	$clean = array();

	$clean['placement'] = printxpdf_pick(
		isset( $input['placement'] ) ? $input['placement'] : '',
		printxpdf_placements(),
		$defaults['placement']
	);

	$clean['align'] = printxpdf_pick(
		isset( $input['align'] ) ? $input['align'] : '',
		printxpdf_alignments(),
		$defaults['align']
	);

	$label = isset( $input['label'] ) && is_scalar( $input['label'] ) ? (string) $input['label'] : '';
	$label = sanitize_text_field( $label );
	if ( function_exists( 'mb_substr' ) ) {
		$label = mb_substr( $label, 0, 60 );
	} else {
		$label = substr( $label, 0, 60 );
	}
	$clean['label'] = $label;

	$posted_buttons   = isset( $input['buttons'] ) && is_array( $input['buttons'] ) ? $input['buttons'] : array();
	$clean['buttons'] = array();
	foreach ( array_keys( printxpdf_button_types() ) as $key ) {
		$clean['buttons'][ $key ] = empty( $posted_buttons[ $key ] ) ? 0 : 1;
	}

	$allowed_types       = printxpdf_available_post_types();
	$posted_types        = isset( $input['post_types'] ) && is_array( $input['post_types'] ) ? $input['post_types'] : array();
	$clean['post_types'] = array();
	foreach ( $posted_types as $type ) {
		$type = sanitize_key( $type );
		if ( isset( $allowed_types[ $type ] ) && ! in_array( $type, $clean['post_types'], true ) ) {
			$clean['post_types'][] = $type;
		}
	}

	$clean['match_theme'] = empty( $input['match_theme'] ) ? 0 : 1;

	return $clean;
}

/* -------------------------------------------------------------------------
 * Lifecycle
 * ---------------------------------------------------------------------- */

register_activation_hook( __FILE__, 'printxpdf_activate' );

/**
 * Seed defaults on activation. add_option() is a no-op when the option
 * already exists, so an upgrade never clobbers a site's choices.
 *
 * @return void
 */
function printxpdf_activate() {
	add_option( PRINTXPDF_OPTION, printxpdf_defaults() );
}

add_action( 'init', 'printxpdf_load_textdomain' );

/**
 * Load translations.
 *
 * @return void
 */
function printxpdf_load_textdomain() {
	load_plugin_textdomain( 'printxpdf', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
}

add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'printxpdf_action_links' );

/**
 * Add a Settings link on the Plugins screen.
 *
 * @param array $links Existing links.
 * @return array
 */
function printxpdf_action_links( $links ) {
	if ( ! is_array( $links ) ) {
		$links = array();
	}

	$url  = admin_url( 'options-general.php?page=' . PRINTXPDF_PAGE );
	$link = '<a href="' . esc_url( $url ) . '">' . esc_html__( 'Settings', 'printxpdf' ) . '</a>';

	array_unshift( $links, $link );

	return $links;
}

/* -------------------------------------------------------------------------
 * Settings screen
 * ---------------------------------------------------------------------- */

add_action( 'admin_menu', 'printxpdf_admin_menu' );

/**
 * Register the Settings -> PrintxPDF page.
 *
 * @return void
 */
function printxpdf_admin_menu() {
	add_options_page(
		__( 'PrintxPDF', 'printxpdf' ),
		__( 'PrintxPDF', 'printxpdf' ),
		'manage_options',
		PRINTXPDF_PAGE,
		'printxpdf_render_settings_page'
	);
}

add_action( 'admin_init', 'printxpdf_register_settings' );

/**
 * Register the option, its section and its fields with the Settings API.
 *
 * @return void
 */
function printxpdf_register_settings() {
	register_setting(
		PRINTXPDF_GROUP,
		PRINTXPDF_OPTION,
		array(
			'type'              => 'array',
			'sanitize_callback' => 'printxpdf_sanitize_settings',
			'default'           => printxpdf_defaults(),
			'show_in_rest'      => false,
		)
	);

	add_settings_section(
		'printxpdf_main',
		__( 'Button setup', 'printxpdf' ),
		'printxpdf_section_intro',
		PRINTXPDF_PAGE
	);

	$fields = array(
		'placement'   => __( 'Placement', 'printxpdf' ),
		'buttons'     => __( 'Buttons to show', 'printxpdf' ),
		'label'       => __( 'Print button label', 'printxpdf' ),
		'post_types'  => __( 'Show on', 'printxpdf' ),
		'align'       => __( 'Alignment', 'printxpdf' ),
		'match_theme' => __( 'Match my theme', 'printxpdf' ),
	);

	foreach ( $fields as $key => $title ) {
		add_settings_field(
			'printxpdf_field_' . $key,
			$title,
			'printxpdf_field_' . $key,
			PRINTXPDF_PAGE,
			'printxpdf_main',
			array( 'label_for' => 'printxpdf-' . $key )
		);
	}
}

/**
 * Short explainer above the fields.
 *
 * @return void
 */
function printxpdf_section_intro() {
	echo '<p>' . esc_html__( 'Everything below is free and runs in the visitor\'s browser. The plugin never calls home and never sends your content anywhere.', 'printxpdf' ) . '</p>';
}

/**
 * Field: placement.
 *
 * @return void
 */
function printxpdf_field_placement() {
	$settings = printxpdf_get_settings();
	echo '<select name="' . esc_attr( PRINTXPDF_OPTION ) . '[placement]" id="printxpdf-placement">';
	foreach ( printxpdf_placements() as $value => $label ) {
		echo '<option value="' . esc_attr( $value ) . '"' . selected( $settings['placement'], $value, false ) . '>' . esc_html( $label ) . '</option>';
	}
	echo '</select>';
	echo '<p class="description">' . esc_html__( 'Choose "Manual only" if you would rather place the buttons yourself with the shortcode or block.', 'printxpdf' ) . '</p>';
}

/**
 * Field: which buttons to show.
 *
 * @return void
 */
function printxpdf_field_buttons() {
	$settings = printxpdf_get_settings();
	echo '<fieldset>';
	echo '<legend class="screen-reader-text">' . esc_html__( 'Buttons to show', 'printxpdf' ) . '</legend>';
	foreach ( printxpdf_button_types() as $key => $label ) {
		$id = 'printxpdf-buttons-' . $key;
		echo '<label class="printxpdf-choice" for="' . esc_attr( $id ) . '">';
		echo '<input type="checkbox" id="' . esc_attr( $id ) . '" name="' . esc_attr( PRINTXPDF_OPTION ) . '[buttons][' . esc_attr( $key ) . ']" value="1"' . checked( ! empty( $settings['buttons'][ $key ] ), true, false ) . ' /> ';
		echo esc_html( $label );
		echo '</label>';
	}
	echo '</fieldset>';
	echo '<p class="description">' . esc_html__( 'With none ticked, nothing is rendered.', 'printxpdf' ) . '</p>';
}

/**
 * Field: print button label.
 *
 * @return void
 */
function printxpdf_field_label() {
	$settings = printxpdf_get_settings();
	echo '<input type="text" class="regular-text" id="printxpdf-label" name="' . esc_attr( PRINTXPDF_OPTION ) . '[label]" value="' . esc_attr( $settings['label'] ) . '" maxlength="60" placeholder="' . esc_attr__( 'Print', 'printxpdf' ) . '" />';
	echo '<p class="description">' . esc_html__( 'Leave empty to use the translated default. The PDF and Email buttons keep their own labels.', 'printxpdf' ) . '</p>';
}

/**
 * Field: post types.
 *
 * @return void
 */
function printxpdf_field_post_types() {
	$settings = printxpdf_get_settings();
	echo '<fieldset>';
	echo '<legend class="screen-reader-text">' . esc_html__( 'Show on', 'printxpdf' ) . '</legend>';
	foreach ( printxpdf_available_post_types() as $slug => $label ) {
		$id = 'printxpdf-post-type-' . $slug;
		echo '<label class="printxpdf-choice" for="' . esc_attr( $id ) . '">';
		echo '<input type="checkbox" id="' . esc_attr( $id ) . '" name="' . esc_attr( PRINTXPDF_OPTION ) . '[post_types][]" value="' . esc_attr( $slug ) . '"' . checked( in_array( $slug, $settings['post_types'], true ), true, false ) . ' /> ';
		echo esc_html( $label );
		echo '</label>';
	}
	echo '</fieldset>';
	echo '<p class="description">' . esc_html__( 'Buttons are only added to single posts and pages of the types you tick.', 'printxpdf' ) . '</p>';
}

/**
 * Field: alignment.
 *
 * @return void
 */
function printxpdf_field_align() {
	$settings = printxpdf_get_settings();
	echo '<select name="' . esc_attr( PRINTXPDF_OPTION ) . '[align]" id="printxpdf-align">';
	foreach ( printxpdf_alignments() as $value => $label ) {
		echo '<option value="' . esc_attr( $value ) . '"' . selected( $settings['align'], $value, false ) . '>' . esc_html( $label ) . '</option>';
	}
	echo '</select>';
}

/**
 * Field: match my theme.
 *
 * @return void
 */
function printxpdf_field_match_theme() {
	$settings = printxpdf_get_settings();
	echo '<label for="printxpdf-match_theme">';
	echo '<input type="checkbox" id="printxpdf-match_theme" name="' . esc_attr( PRINTXPDF_OPTION ) . '[match_theme]" value="1"' . checked( ! empty( $settings['match_theme'] ), true, false ) . ' /> ';
	echo esc_html__( 'Let my theme style the buttons', 'printxpdf' );
	echo '</label>';
	echo '<p class="description">' . esc_html__( 'On: the plugin only lays the buttons out and leaves the looks to your theme. Off: the plugin applies its own minimal styling and a small print stylesheet that hides the header, footer, sidebar and comments on the printed page.', 'printxpdf' ) . '</p>';
}

/**
 * Render the settings page.
 *
 * @return void
 */
function printxpdf_render_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'You do not have permission to manage PrintxPDF settings.', 'printxpdf' ) );
	}
	?>
	<div class="wrap">
		<h1><?php echo esc_html__( 'PrintxPDF Print & PDF Button', 'printxpdf' ); ?></h1>

		<form action="options.php" method="post">
			<?php
			settings_fields( PRINTXPDF_GROUP );
			do_settings_sections( PRINTXPDF_PAGE );
			submit_button();
			?>
		</form>

		<h2><?php echo esc_html__( 'Placing the buttons by hand', 'printxpdf' ); ?></h2>
		<p><?php echo esc_html__( 'Use the shortcode anywhere a shortcode works, including the Classic editor, the Gutenberg Shortcode block and most page builders:', 'printxpdf' ); ?></p>
		<p><code>[printxpdf]</code></p>
		<p><?php echo esc_html__( 'All three attributes are optional and fall back to the settings above:', 'printxpdf' ); ?></p>
		<p><code>[printxpdf buttons="print,pdf" label="Print this" align="center"]</code></p>

		<h2><?php echo esc_html__( 'What the buttons do', 'printxpdf' ); ?></h2>
		<ul class="printxpdf-list">
			<li><?php echo esc_html__( 'Print calls the browser\'s own print dialog. Nothing leaves the page.', 'printxpdf' ); ?></li>
			<li><?php echo esc_html__( 'Save as PDF is a link to the printxpdf.com web service. See the disclosure below.', 'printxpdf' ); ?></li>
			<li><?php echo esc_html__( 'Email opens the reader\'s own mail app with the title and link filled in. Nothing is sent by your site.', 'printxpdf' ); ?></li>
		</ul>

		<div class="printxpdf-service">
			<h2><?php echo esc_html__( 'External service: printxpdf.com', 'printxpdf' ); ?></h2>
			<p>
				<?php
				printf(
					/* translators: %s: the URL of the PrintxPDF web service, rendered as literal text. */
					esc_html__( 'The "Save as PDF" button is a plain link to %s, a third-party web service operated by the author of this plugin. It is the service that turns a page into a PDF; this plugin does not generate PDFs itself.', 'printxpdf' ),
					'<code>' . esc_html( PRINTXPDF_ENDPOINT ) . '</code>'
				);
				?>
			</p>
			<p><?php echo esc_html__( 'The plugin itself never contacts that service. It makes no outbound HTTP request of any kind, on the front end or in the admin. Data is only transmitted when a reader clicks the button, at which point the reader\'s own browser opens the service in a new tab.', 'printxpdf' ); ?></p>
			<p><?php echo esc_html__( 'What is transmitted at that moment: the public permalink of the post, in the query string, plus whatever the reader\'s browser normally sends (IP address, user agent, referrer). No post content, no site credentials, no visitor data and no information about your WordPress installation is sent by the plugin.', 'printxpdf' ); ?></p>
			<p>
				<?php
				printf(
					/* translators: 1: opening anchor tag for the terms of service, 2: closing anchor tag, 3: opening anchor tag for the privacy policy, 4: closing anchor tag. */
					esc_html__( 'Service terms: %1$sprintxpdf.com/terms%2$s. Privacy policy: %3$sprintxpdf.com/privacy%4$s.', 'printxpdf' ),
					'<a href="' . esc_url( 'https://printxpdf.com/terms' ) . '" target="_blank" rel="noopener noreferrer">',
					'</a>',
					'<a href="' . esc_url( 'https://printxpdf.com/privacy' ) . '" target="_blank" rel="noopener noreferrer">',
					'</a>'
				);
				?>
			</p>
			<p><?php echo esc_html__( 'No account, registration or API key is required, for you or for your readers. If you would rather send nobody to the service, untick "Save as PDF" above; the Print and Email buttons work entirely on the reader\'s own device.', 'printxpdf' ); ?></p>
		</div>

		<h2><?php echo esc_html__( 'Privacy', 'printxpdf' ); ?></h2>
		<p><?php echo esc_html__( 'This plugin is free with no paid tier and no API key. It sets no cookies, adds no tracking, registers no users, creates no database tables and stores exactly one option, which is deleted when you uninstall.', 'printxpdf' ); ?></p>
	</div>
	<?php
}

/* -------------------------------------------------------------------------
 * Assets
 * ---------------------------------------------------------------------- */

add_action( 'wp_enqueue_scripts', 'printxpdf_register_assets' );

/**
 * Register the front-end stylesheet and script, and enqueue them up front on
 * pages we already know will render a button row. Both are real files with an
 * explicit version, so caching and minifying plugins can handle them normally.
 *
 * @return void
 */
function printxpdf_register_assets() {
	wp_register_style( 'printxpdf', PRINTXPDF_URL . 'assets/printxpdf.css', array(), PRINTXPDF_VERSION );
	wp_register_script( 'printxpdf', PRINTXPDF_URL . 'assets/printxpdf.js', array(), PRINTXPDF_VERSION, true );

	if ( printxpdf_is_enabled_here() || printxpdf_content_has_marker() ) {
		printxpdf_enqueue_assets();
	}
}

add_action( 'admin_enqueue_scripts', 'printxpdf_admin_assets' );

/**
 * Load the settings-screen stylesheet, and only there.
 *
 * @param string $hook_suffix Current admin screen.
 * @return void
 */
function printxpdf_admin_assets( $hook_suffix ) {
	if ( 'settings_page_' . PRINTXPDF_PAGE !== $hook_suffix ) {
		return;
	}

	wp_enqueue_style(
		'printxpdf-admin',
		PRINTXPDF_URL . 'assets/printxpdf-admin.css',
		array(),
		PRINTXPDF_VERSION
	);
}

/**
 * Enqueue the front-end assets. Safe to call more than once; a call made
 * during the_content simply prints the assets in the footer instead.
 *
 * @return void
 */
function printxpdf_enqueue_assets() {
	if ( wp_style_is( 'printxpdf', 'registered' ) ) {
		wp_enqueue_style( 'printxpdf' );
	}
	if ( wp_script_is( 'printxpdf', 'registered' ) ) {
		wp_enqueue_script( 'printxpdf' );
	}
}

add_filter( 'body_class', 'printxpdf_body_class' );

/**
 * Flag the page so the print stylesheet may hide the theme chrome. Skipped
 * entirely when "match my theme" is on.
 *
 * @param array $classes Existing body classes.
 * @return array
 */
function printxpdf_body_class( $classes ) {
	if ( ! is_array( $classes ) ) {
		return $classes;
	}

	$settings = printxpdf_get_settings();

	if ( empty( $settings['match_theme'] ) && is_singular() && ! is_feed() ) {
		$post_type = get_post_type();
		if ( $post_type && in_array( $post_type, $settings['post_types'], true ) ) {
			$classes[] = 'printxpdf-clean-print';
		}
	}

	return $classes;
}

/* -------------------------------------------------------------------------
 * Context checks
 * ---------------------------------------------------------------------- */

/**
 * Is this a REST request?
 *
 * @return bool
 */
function printxpdf_is_rest_request() {
	if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
		return true;
	}
	if ( function_exists( 'wp_is_serving_rest_request' ) && wp_is_serving_rest_request() ) {
		return true;
	}

	return false;
}

/**
 * Should the_content automatically add a button row on this request?
 *
 * @return bool
 */
function printxpdf_is_enabled_here() {
	if ( is_admin() || is_feed() || printxpdf_is_rest_request() || wp_doing_ajax() ) {
		return false;
	}
	if ( ! is_singular() ) {
		return false;
	}
	if ( post_password_required() ) {
		return false;
	}

	$settings = printxpdf_get_settings();

	if ( 'manual' === $settings['placement'] ) {
		return false;
	}

	$post_type = get_post_type();

	return ( $post_type && in_array( $post_type, $settings['post_types'], true ) );
}

/**
 * Does the current post carry the shortcode, so assets are worth loading in
 * the head rather than the footer?
 *
 * @return bool
 */
function printxpdf_content_has_marker() {
	if ( is_admin() || is_feed() || ! is_singular() ) {
		return false;
	}

	$post = get_post();

	if ( ! $post || ! isset( $post->post_content ) || '' === $post->post_content ) {
		return false;
	}
	return has_shortcode( $post->post_content, 'printxpdf' );
}

/**
 * Track whether we are inside excerpt generation. wp_trim_excerpt() runs the
 * the_content filter over the raw post, so without this flag the buttons
 * would leak into every excerpt on the site.
 *
 * @param bool|null $set Pass a boolean to set the flag, null to read it.
 * @return bool
 */
function printxpdf_in_excerpt( $set = null ) {
	static $flag = false;

	if ( null !== $set ) {
		$flag = (bool) $set;
	}

	return $flag;
}

add_filter( 'get_the_excerpt', 'printxpdf_excerpt_open', 1 );
add_filter( 'get_the_excerpt', 'printxpdf_excerpt_close', 20 );

/**
 * Raise the excerpt flag before wp_trim_excerpt() runs.
 *
 * @param string $excerpt Excerpt, passed through untouched.
 * @return string
 */
function printxpdf_excerpt_open( $excerpt ) {
	printxpdf_in_excerpt( true );

	return $excerpt;
}

/**
 * Lower the excerpt flag afterwards.
 *
 * @param string $excerpt Excerpt, passed through untouched.
 * @return string
 */
function printxpdf_excerpt_close( $excerpt ) {
	printxpdf_in_excerpt( false );

	return $excerpt;
}

/* -------------------------------------------------------------------------
 * Rendering
 * ---------------------------------------------------------------------- */

/**
 * Turn a comma separated list such as "print,pdf" into a button map.
 *
 * @param string $list Raw list.
 * @return array
 */
function printxpdf_parse_button_list( $list ) {
	$wanted = array_map( 'sanitize_key', array_map( 'trim', explode( ',', (string) $list ) ) );
	$out    = array();

	foreach ( array_keys( printxpdf_button_types() ) as $key ) {
		$out[ $key ] = in_array( $key, $wanted, true ) ? 1 : 0;
	}

	return $out;
}

/**
 * Build the button row. Every URL goes through esc_url(), every attribute
 * through esc_attr() and every visible string through esc_html().
 *
 * @param array $args Optional overrides: buttons, label, align.
 * @return string HTML, or an empty string when there is nothing to render.
 */
function printxpdf_render_row( $args = array() ) {
	$post_id = get_the_ID();

	if ( ! $post_id ) {
		return '';
	}

	$permalink = get_permalink( $post_id );

	if ( ! $permalink ) {
		return '';
	}

	$settings = printxpdf_get_settings();
	$args     = is_array( $args ) ? $args : array();

	$buttons = array_key_exists( 'buttons', $args ) ? $args['buttons'] : $settings['buttons'];
	if ( ! is_array( $buttons ) ) {
		$buttons = printxpdf_parse_button_list( $buttons );
	}

	if ( ! array_filter( $buttons ) ) {
		return '';
	}

	$align = printxpdf_pick(
		isset( $args['align'] ) && '' !== $args['align'] ? $args['align'] : $settings['align'],
		printxpdf_alignments(),
		$settings['align']
	);

	$label = isset( $args['label'] ) && '' !== trim( (string) $args['label'] ) ? trim( (string) $args['label'] ) : $settings['label'];
	if ( '' === $label ) {
		$label = __( 'Print', 'printxpdf' );
	}

	printxpdf_enqueue_assets();

	$classes = array( 'printxpdf-row', 'printxpdf-align-' . $align );
	if ( empty( $settings['match_theme'] ) ) {
		$classes[] = 'printxpdf-styled';
	}

	$title       = get_the_title( $post_id );
	$new_tab     = __( 'opens in a new tab', 'printxpdf' );
	$button_html = '';

	if ( ! empty( $buttons['print'] ) ) {
		$button_html .= '<button type="button" class="printxpdf-btn printxpdf-btn-print">'
			. esc_html( $label )
			. '</button>';
	}

	if ( ! empty( $buttons['pdf'] ) ) {
		$pdf_url      = PRINTXPDF_ENDPOINT . '?url=' . rawurlencode( $permalink );
		$button_html .= '<a class="printxpdf-btn printxpdf-btn-pdf" href="' . esc_url( $pdf_url ) . '" target="_blank" rel="noopener">'
			. esc_html__( 'Save as PDF', 'printxpdf' )
			. '<span class="printxpdf-sr"> (' . esc_html( $new_tab ) . ')</span>'
			. '</a>';
	}

	if ( ! empty( $buttons['email'] ) ) {
		$mailto       = 'mailto:?subject=' . rawurlencode( $title ) . '&body=' . rawurlencode( $title . "\n\n" . $permalink );
		$button_html .= '<a class="printxpdf-btn printxpdf-btn-email" href="' . esc_url( $mailto ) . '">'
			. esc_html__( 'Email', 'printxpdf' )
			. '</a>';
	}

	if ( '' === $button_html ) {
		return '';
	}

	return '<div class="' . esc_attr( implode( ' ', $classes ) ) . '" role="group" aria-label="' . esc_attr__( 'Print and PDF options', 'printxpdf' ) . '">'
		. $button_html
		. '</div>';
}

add_filter( 'the_content', 'printxpdf_filter_content', 20 );

/**
 * Append or prepend the button row to single posts of the chosen types.
 *
 * @param string $content Post content.
 * @return string
 */
function printxpdf_filter_content( $content ) {
	if ( printxpdf_in_excerpt() ) {
		return $content;
	}
	if ( ! in_the_loop() || ! is_main_query() ) {
		return $content;
	}
	if ( ! printxpdf_is_enabled_here() ) {
		return $content;
	}

	$settings = printxpdf_get_settings();
	$row      = printxpdf_render_row();

	if ( '' === $row ) {
		return $content;
	}

	if ( 'top' === $settings['placement'] ) {
		return $row . $content;
	}
	if ( 'both' === $settings['placement'] ) {
		return $row . $content . $row;
	}

	return $content . $row;
}

/* -------------------------------------------------------------------------
 * Shortcode
 * ---------------------------------------------------------------------- */

add_shortcode( 'printxpdf', 'printxpdf_shortcode' );

/**
 * [printxpdf buttons="print,pdf,email" label="Print" align="center"]
 *
 * @param array $atts Shortcode attributes.
 * @return string
 */
function printxpdf_shortcode( $atts ) {
	$atts = shortcode_atts(
		array(
			'buttons' => '',
			'label'   => '',
			'align'   => '',
		),
		$atts,
		'printxpdf'
	);

	$args = array(
		'label' => sanitize_text_field( (string) $atts['label'] ),
		'align' => sanitize_key( (string) $atts['align'] ),
	);

	if ( '' !== trim( (string) $atts['buttons'] ) ) {
		$args['buttons'] = printxpdf_parse_button_list( $atts['buttons'] );
	}

	return printxpdf_render_row( $args );
}

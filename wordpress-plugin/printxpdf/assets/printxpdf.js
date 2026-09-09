/**
 * PrintxPDF Print & PDF Button
 *
 * One delegated click handler for the Print button. No jQuery, no globals,
 * no network access of any kind: this only calls window.print().
 *
 * @package PrintxPDF
 */
( function () {
	'use strict';

	document.addEventListener(
		'click',
		function ( event ) {
			var target = event.target;

			if ( ! target || typeof target.closest !== 'function' ) {
				return;
			}

			if ( ! target.closest( '.printxpdf-btn-print' ) ) {
				return;
			}

			event.preventDefault();

			if ( typeof window.print === 'function' ) {
				window.print();
			}
		},
		false
	);
}() );

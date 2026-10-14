<?php
/**
 * Import „Hilfe finden“: soziale Einrichtungen (Open Data Stadt Krefeld) als Anbieter.
 *
 * Aufruf (WordPress-Verzeichnis, WP-CLI):
 *   wp eval-file import-hilfe.php <csv>          Probelauf, ändert nichts
 *   wp eval-file import-hilfe.php <csv> apply    echter Lauf
 *
 * - Schlüssel je Eintrag: normalisierter Name + Straße in Meta „kl_import_id“.
 *   Ein erneuter Lauf aktualisiert, legt nichts doppelt an.
 * - Neue Einträge werden als Entwurf angelegt; bei vorhandenen bleiben Status
 *   und Slug unverändert.
 * - Einträge mit kl_import_id, die in der Datei fehlen, werden nur gemeldet.
 * - kurztext wird 1:1 als Auszug übernommen; Texte werden nicht verändert.
 *
 * Benötigt im echten Lauf das Plugin KL Core (Inhaltstyp „anbieter“).
 *
 * @package KL_Import
 */

defined( 'ABSPATH' ) || exit;

if ( ! defined( 'WP_CLI' ) || ! WP_CLI ) {
	exit( "Nur über WP-CLI ausführen.\n" );
}

/** @var string[] $args Argumente von wp eval-file. */
$kl_csv   = (string) ( $args[0] ?? '' );
$kl_apply = in_array( 'apply', array_slice( $args, 1 ), true );

const KL_IMPORT_COLUMNS = array(
	'name',
	'bereich',
	'kategorie',
	'strasse',
	'plz',
	'stadtbezirk_ab_2025',
	'bezirk_bis_2025',
	'internet',
	'bemerkung',
	'lon',
	'lat',
	'pruefen',
	'notruf_hinweis',
	'kurztext',
);

const KL_IMPORT_BEREICHE = array(
	'Pflege & Senioren'         => 'pflege-senioren',
	'Kinder & Jugend'           => 'kinder-jugend',
	'Soziale Dienste & Vereine' => 'soziale-dienste-vereine',
	'Beratung'                  => 'beratung',
);

const KL_IMPORT_BEZIRKE = array(
	'Mitte' => 'mitte',
	'Nord'  => 'nord',
	'Ost'   => 'ost',
	'Süd'   => 'sued',
	'West'  => 'west',
);

const KL_IMPORT_QUELLE      = 'Stadt Krefeld, „Geodaten soziale Einrichtungen Stadt Krefeld“, offenesdatenportal.de, Datenstand 27.05.2026';
const KL_IMPORT_LIZENZ      = 'Datenlizenz Deutschland – Zero – Version 2.0';
const KL_IMPORT_GEPRUEFT_AM = '2026-10-14';
const KL_IMPORT_SITE        = 'krefelder-laden';
const KL_IMPORT_POST_TYPE   = 'anbieter';

/**
 * Kleinbuchstaben, Umlaute ausgeschrieben, sonst nur a–z, 0–9 und Bindestriche.
 *
 * @param string $value Text.
 * @return string
 */
function kl_import_normalize( string $value ): string {
	$value = mb_strtolower( trim( $value ), 'UTF-8' );
	$value = strtr( $value, array( 'ä' => 'ae', 'ö' => 'oe', 'ü' => 'ue', 'ß' => 'ss' ) );
	$value = remove_accents( $value );
	$value = (string) preg_replace( '/[^a-z0-9]+/', '-', $value );

	return trim( $value, '-' );
}

/**
 * Liest und prüft die CSV. Bricht bei Fehlern ab.
 *
 * @param string $file Pfad.
 * @return array<int, array<string, string>>
 */
function kl_import_read( string $file ): array {
	if ( '' === $file || ! is_readable( $file ) ) {
		WP_CLI::error( "CSV nicht lesbar: {$file}" );
	}

	$raw = (string) file_get_contents( $file ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
	if ( ! mb_check_encoding( $raw, 'UTF-8' ) ) {
		WP_CLI::error( 'CSV ist kein gültiges UTF-8.' );
	}
	$raw = (string) preg_replace( '/^\xEF\xBB\xBF/', '', $raw );

	$handle = fopen( 'php://memory', 'r+' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fopen
	fwrite( $handle, $raw ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fwrite
	rewind( $handle );

	$header = fgetcsv( $handle, 0, ';', '"', '' );
	$header = array_map( static fn( $col ) => trim( (string) $col ), (array) $header );
	if ( KL_IMPORT_COLUMNS !== $header ) {
		WP_CLI::error( 'Unerwartete Spalten: ' . implode( ';', $header ) );
	}

	$rows   = array();
	$errors = array();
	$line   = 1;
	while ( false !== ( $cells = fgetcsv( $handle, 0, ';', '"', '' ) ) ) {
		++$line;
		if ( array( null ) === $cells ) {
			continue;
		}
		if ( count( $cells ) !== count( KL_IMPORT_COLUMNS ) ) {
			$errors[] = "Zeile {$line}: " . count( $cells ) . ' statt ' . count( KL_IMPORT_COLUMNS ) . ' Spalten';
			continue;
		}
		$row = array_combine( KL_IMPORT_COLUMNS, array_map( 'trim', $cells ) );

		if ( '' === $row['name'] ) {
			$errors[] = "Zeile {$line}: name leer";
		}
		if ( ! isset( KL_IMPORT_BEREICHE[ $row['bereich'] ] ) ) {
			$errors[] = "Zeile {$line}: unbekannter bereich „{$row['bereich']}“";
		}
		if ( '' === $row['kategorie'] ) {
			$errors[] = "Zeile {$line}: kategorie leer";
		}
		if ( ! isset( KL_IMPORT_BEZIRKE[ $row['stadtbezirk_ab_2025'] ] ) ) {
			$errors[] = "Zeile {$line}: unbekannter stadtbezirk_ab_2025 „{$row['stadtbezirk_ab_2025']}“";
		}
		foreach ( array( 'lon', 'lat' ) as $col ) {
			if ( 1 !== preg_match( '/^-?\d{1,3}\.\d+$/', $row[ $col ] ) ) {
				$errors[] = "Zeile {$line}: {$col} „{$row[ $col ]}“ ist keine Dezimalzahl";
			}
		}
		if ( '' !== $row['internet'] && 1 !== preg_match( '#^https?://[^\s/]+#i', $row['internet'] ) ) {
			$errors[] = "Zeile {$line}: internet „{$row['internet']}“ ohne http(s)://";
		}
		if ( ! in_array( mb_strtolower( $row['notruf_hinweis'] ), array( 'ja', 'nein', '' ), true ) ) {
			$errors[] = "Zeile {$line}: notruf_hinweis „{$row['notruf_hinweis']}“ (erwartet ja/nein)";
		}

		$row['_line'] = (string) $line;
		$row['_key']  = kl_import_normalize( $row['name'] ) . '|' . kl_import_normalize( $row['strasse'] );
		$rows[]       = $row;
	}
	fclose( $handle ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose

	$seen = array();
	foreach ( $rows as $row ) {
		if ( isset( $seen[ $row['_key'] ] ) ) {
			$errors[] = "Zeile {$row['_line']}: Schlüssel {$row['_key']} doppelt (auch Zeile {$seen[ $row['_key'] ]})";
		}
		$seen[ $row['_key'] ] = $row['_line'];
	}

	if ( $errors ) {
		foreach ( $errors as $error ) {
			WP_CLI::warning( $error );
		}
		WP_CLI::error( count( $errors ) . ' Fehler in der CSV, nichts importiert.' );
	}

	return $rows;
}

/**
 * Soll-Zustand eines Eintrags.
 *
 * @param array<string, string> $row Zeile.
 * @return array{title: string, slug: string, excerpt: string, meta: array<string, mixed>, terms: array<string, string[]>}
 */
function kl_import_target( array $row ): array {
	return array(
		'title'   => $row['name'],
		'slug'    => kl_import_normalize( $row['name'] ),
		'excerpt' => $row['kurztext'],
		'meta'    => array(
			'kl_import_id'    => $row['_key'],
			'adresse'         => $row['strasse'],
			'plz'             => $row['plz'],
			'lon'             => $row['lon'],
			'lat'             => $row['lat'],
			'website'         => $row['internet'],
			'bezirk_bis_2025' => $row['bezirk_bis_2025'],
			'kl_quelle'       => KL_IMPORT_QUELLE,
			'kl_lizenz'       => KL_IMPORT_LIZENZ,
			'kl_geprueft_am'  => KL_IMPORT_GEPRUEFT_AM,
			'notruf_hinweis'  => 'ja' === mb_strtolower( $row['notruf_hinweis'] ),
		),
		'terms'   => array(
			'anbieter_typ' => array( KL_IMPORT_BEREICHE[ $row['bereich'] ], kl_import_normalize( $row['kategorie'] ) ),
			'stadtbezirk'  => array( KL_IMPORT_BEZIRKE[ $row['stadtbezirk_ab_2025'] ] ),
		),
	);
}

/**
 * Unterschiede zwischen vorhandenem Beitrag und Soll-Zustand (Feldnamen).
 *
 * @param WP_Post $post   Beitrag.
 * @param array   $target Soll-Zustand.
 * @return string[]
 */
function kl_import_diff( WP_Post $post, array $target ): array {
	$diff = array();

	if ( $post->post_title !== $target['title'] ) {
		$diff[] = 'Titel';
	}
	if ( $post->post_excerpt !== $target['excerpt'] ) {
		$diff[] = 'kurztext';
	}
	foreach ( $target['meta'] as $key => $value ) {
		$current = get_post_meta( $post->ID, $key, true );
		$same    = is_bool( $value ) ? (bool) $current === $value : (string) $current === (string) $value;
		if ( ! $same ) {
			$diff[] = $key;
		}
	}
	foreach ( $target['terms'] as $taxonomy => $slugs ) {
		$current = wp_get_object_terms( $post->ID, $taxonomy, array( 'fields' => 'slugs' ) );
		$current = is_array( $current ) ? $current : array();
		sort( $current );
		sort( $slugs );
		if ( $current !== $slugs ) {
			$diff[] = $taxonomy;
		}
	}

	return $diff;
}

/**
 * Legt die Begriffe an (Bereiche, Kategorien darunter, Stadtbezirke).
 *
 * @param array<int, array<string, string>> $rows Zeilen.
 * @param bool                              $apply Anlegen oder nur melden.
 * @return string[] Fehlende Begriffe (Probelauf) bzw. angelegte (echter Lauf).
 */
function kl_import_terms( array $rows, bool $apply ): array {
	$wanted = array();
	foreach ( KL_IMPORT_BEREICHE as $name => $slug ) {
		$wanted[] = array( 'anbieter_typ', $name, $slug, '' );
	}
	foreach ( $rows as $row ) {
		$slug            = kl_import_normalize( $row['kategorie'] );
		$wanted[ $slug ] = array( 'anbieter_typ', $row['kategorie'], $slug, KL_IMPORT_BEREICHE[ $row['bereich'] ] );
	}
	foreach ( KL_IMPORT_BEZIRKE as $name => $slug ) {
		$wanted[] = array( 'stadtbezirk', $name, $slug, '' );
	}

	$result = array();
	foreach ( $wanted as list( $taxonomy, $name, $slug, $parent ) ) {
		if ( taxonomy_exists( $taxonomy ) && get_term_by( 'slug', $slug, $taxonomy ) ) {
			continue;
		}
		$result[] = "{$taxonomy}: {$name} ({$slug})" . ( $parent ? " unter {$parent}" : '' );
		if ( ! $apply ) {
			continue;
		}
		$parent_id = 0;
		if ( $parent ) {
			$parent_term = get_term_by( 'slug', $parent, $taxonomy );
			$parent_id   = $parent_term ? (int) $parent_term->term_id : 0;
		}
		$inserted = wp_insert_term( $name, $taxonomy, array( 'slug' => $slug, 'parent' => $parent_id ) );
		if ( is_wp_error( $inserted ) ) {
			WP_CLI::error( "Begriff {$taxonomy}/{$slug}: " . $inserted->get_error_message() );
		}
	}

	return $result;
}

/**
 * Schreibt einen Eintrag (neu als Entwurf oder Aktualisierung).
 *
 * @param WP_Post|null $post   Vorhandener Beitrag.
 * @param array        $target Soll-Zustand.
 * @return int Beitrags-ID.
 */
function kl_import_write( ?WP_Post $post, array $target ): int {
	$data = array(
		'post_type'    => KL_IMPORT_POST_TYPE,
		'post_title'   => $target['title'],
		'post_excerpt' => $target['excerpt'],
	);

	if ( $post ) {
		$data['ID'] = $post->ID;
		$id         = wp_update_post( wp_slash( $data ), true );
	} else {
		$data['post_status']  = 'draft';
		$data['post_name']    = $target['slug'];
		$data['post_content'] = '';
		$id                   = wp_insert_post( wp_slash( $data ), true );
	}

	if ( is_wp_error( $id ) ) {
		WP_CLI::error( "{$target['title']}: " . $id->get_error_message() );
	}

	if ( ! $post && taxonomy_exists( 'kls_site' ) ) {
		wp_set_object_terms( $id, array( KL_IMPORT_SITE ), 'kls_site' );
	}
	foreach ( $target['meta'] as $key => $value ) {
		update_post_meta( $id, $key, wp_slash( $value ) );
	}
	foreach ( $target['terms'] as $taxonomy => $slugs ) {
		wp_set_object_terms( $id, $slugs, $taxonomy );
	}

	return (int) $id;
}

// ---------------------------------------------------------------------------

$kl_rows = kl_import_read( $kl_csv );
WP_CLI::log( count( $kl_rows ) . ' Zeilen gelesen, CSV ohne Fehler. Modus: ' . ( $kl_apply ? 'ECHTER LAUF' : 'Probelauf (ändert nichts)' ) );

$kl_has_type = post_type_exists( KL_IMPORT_POST_TYPE );
if ( ! $kl_has_type ) {
	if ( $kl_apply ) {
		WP_CLI::error( 'Inhaltstyp „anbieter“ fehlt – Plugin KL Core aktivieren.' );
	}
	WP_CLI::warning( 'Inhaltstyp „anbieter“ fehlt (KL Core nicht aktiv). Probelauf nimmt an: noch keine Einträge vorhanden.' );
}
if ( ! taxonomy_exists( 'kls_site' ) || ! get_term_by( 'slug', KL_IMPORT_SITE, 'kls_site' ) ) {
	WP_CLI::warning( 'Site-Begriff „' . KL_IMPORT_SITE . '“ (kls_site) fehlt – neue Einträge bekommen keine Site.' );
}

// Texte unverändert speichern (ohne kses, das z. B. „&“ zu „&amp;“ macht).
kses_remove_filters();

// Vorhandene Einträge nach Schlüssel.
$kl_existing = array();
if ( $kl_has_type ) {
	$kl_ids = get_posts(
		array(
			'post_type'        => KL_IMPORT_POST_TYPE,
			// Auch Papierkorb: sonst entstünde beim nächsten Lauf ein Duplikat.
			'post_status'      => array( 'publish', 'future', 'draft', 'pending', 'private', 'trash' ),
			'posts_per_page'   => -1,
			'fields'           => 'ids',
			'meta_key'         => 'kl_import_id', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
			'suppress_filters' => true,
		)
	);
	foreach ( $kl_ids as $kl_id ) {
		$kl_key = (string) get_post_meta( $kl_id, 'kl_import_id', true );
		if ( isset( $kl_existing[ $kl_key ] ) ) {
			WP_CLI::warning( "kl_import_id {$kl_key} mehrfach vergeben (IDs {$kl_existing[ $kl_key ]->ID}, {$kl_id}) – es wird die erste aktualisiert." );
			continue;
		}
		$kl_existing[ $kl_key ] = get_post( $kl_id );
	}
}

foreach ( kl_import_terms( $kl_rows, $kl_apply ) as $kl_term ) {
	WP_CLI::log( ( $kl_apply ? 'Begriff angelegt: ' : 'Begriff fehlt (wird angelegt): ' ) . $kl_term );
}

$kl_count = array(
	'neu'         => 0,
	'geändert'    => 0,
	'unverändert' => 0,
);
$kl_in_file = array();

foreach ( $kl_rows as $kl_row ) {
	$kl_target                     = kl_import_target( $kl_row );
	$kl_post                       = $kl_existing[ $kl_row['_key'] ] ?? null;
	$kl_in_file[ $kl_row['_key'] ] = true;

	if ( ! $kl_post ) {
		++$kl_count['neu'];
		WP_CLI::log( "neu          {$kl_row['name']}  →  /hilfe/einrichtung/{$kl_target['slug']}/" );
		if ( $kl_apply ) {
			kl_import_write( null, $kl_target );
		}
		continue;
	}

	$kl_diff = kl_import_diff( $kl_post, $kl_target );
	if ( ! $kl_diff ) {
		++$kl_count['unverändert'];
		WP_CLI::log( "unverändert  {$kl_row['name']}" );
		continue;
	}

	++$kl_count['geändert'];
	WP_CLI::log( "geändert     {$kl_row['name']}  (ID {$kl_post->ID}, {$kl_post->post_status}): " . implode( ', ', $kl_diff ) );
	if ( $kl_apply ) {
		kl_import_write( $kl_post, $kl_target );
	}
}

$kl_missing = array_diff_key( $kl_existing, $kl_in_file );
foreach ( $kl_missing as $kl_key => $kl_post ) {
	WP_CLI::warning( "nicht mehr in der Datei (bleibt bestehen): {$kl_post->post_title} (ID {$kl_post->ID}, {$kl_post->post_status}, {$kl_key})" );
}

WP_CLI::success(
	sprintf(
		'%s: %d neu, %d geändert, %d unverändert, %d nicht mehr in der Datei.',
		$kl_apply ? 'Import' : 'Probelauf',
		$kl_count['neu'],
		$kl_count['geändert'],
		$kl_count['unverändert'],
		count( $kl_missing )
	)
);

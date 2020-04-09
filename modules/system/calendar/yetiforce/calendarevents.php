<?php

global $Logger;

$server = $source->Server;

function getByPost( $url, $post )
{
	$ch = curl_init();
	curl_setopt( $ch, CURLOPT_URL, $url );
	curl_setopt( $ch, CURLOPT_USERAGENT, 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; .NET CLR 1.1.4322)' );
	curl_setopt( $ch, CURLOPT_RETURNTRANSFER, 1 );
	curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, 5 );
	curl_setopt( $ch, CURLOPT_POSTFIELDS, $post ); 
	curl_setopt( $ch, CURLOPT_TIMEOUT, 5 );
	$data = curl_exec( $ch );
	$httpcode = curl_getinfo( $ch, CURLINFO_HTTP_CODE );
	curl_close( $ch );
	return ( $httpcode >= 200 && $httpcode < 300) ? $data : false;
}

$firstDate = $date;

// Sanitation
if( substr( $server, -1, 1 ) != '/' )
	$server .= '/';

$p = getByPost( 
	$server . 'friend-API.php', 
	array( 
		'command' => 'calendar',
		'SessionID' => $source->ApiSession,
		'DateFrom' => $date . '-01 00:00:00',
		'DateTo' => $date . '-31 23:59:59',
		'Mode' => 'month'
	)
);

// Add the events
if( $rows = json_decode( $p ) )
{
	foreach( $rows as $row )
	{
		$ob = new stdClass();
		$ob->ID = $evt->activityid . '_yetiforce';
		$ob->Title = $evt->subject .'';
		$ob->Description = '<strong>Location:</strong> '. $evt->location . '<br>' . 'TEMP'; //$evt->EventDetails;
		$ob->TimeTo = date( 'H:i:s', strtotime( $evt->time_end ) );
		$ob->TimeFrom = date( 'H:i:s', strtotime( $evt->time_start ) );
		$ob->Date = date( 'Y-m-d', strtotime( $evt->date_start ) );
		$ob->Type = 'yetiforce';
		$os[] = $ob;
	}
}

?>

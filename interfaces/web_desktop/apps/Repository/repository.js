/*©agpl*************************************************************************
*                                                                              *
* This file is part of FRIEND UNIFYING PLATFORM.                               *
* Copyright (c) Friend Software Labs AS. All rights reserved.                  *
*                                                                              *
* Licensed under the Source EULA. Please refer to the copy of the GNU Affero   *
* General Public License, found in the file license_agpl.txt.                  *
*                                                                              *
*****************************************************************************©*/

Application.run = function( msg )
{
    let v = new View( {
        title: 'Friend Repository Management',
        width: 900,
        height: 600
    } );
    
    v.onClose = function()
    {
        Application.quit();
    }
    
    let f = new File( 'Progdir:Assets/main.html' );
    f.onLoad = function( data )
    {
        v.setContent( data );
    }
    f.load();
}


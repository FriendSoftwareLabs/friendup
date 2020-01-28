/*©agpl*************************************************************************
*                                                                              *
* This file is part of FRIEND UNIFYING PLATFORM.                               *
* Copyright (c) Friend Software Labs AS. All rights reserved.                  *
*                                                                              *
* Licensed under the Source EULA. Please refer to the copy of the GNU Affero   *
* General Public License, found in the file license_agpl.txt.                  *
*                                                                              *
*****************************************************************************©*/

// Section for user workgroup management
Sections.accounts_workgroups = function( cmd, extra )
{
	
	switch( cmd )
	{
		
		case 'details':
			
			loading();
			
			break;
		
		case 'edit':
			
			if( extra && extra.id && extra._this )
			{
				edit( extra.id, extra._this );
			}
			
			break;
		
		case 'create':
			
			create();
			
			break;
		
		case 'update':
			
			if( extra && extra.id && extra.value )
			{
				update( extra.id, extra.value );
			}
			
			break;
		
		case 'update_role':
			
			if( extra && extra.rid && extra.groupid && extra._this )
			{
				updateRole( extra.rid, extra.groupid, extra._this );
			}
			
			break;
		
		case 'remove':
			
			if( extra )
			{
				remove( extra );
			}
			
			break;
		
		case 'refresh':
			
			initMain();
			
			break;
		
		default:
			
			initMain();
			
			break;
		
	}
	
	
	
	// read --------------------------------------------------------------------------------------------------------- //
	
	function list( callback, id )
	{
		
		if( callback )
		{
			if( id )
			{
				// Specific for Pawel's code ... He just wants to forward json ...
				
				var args = JSON.stringify( {
					'type'    : 'read', 
					'context' : 'application', 
					'authid'  : Application.authId, 
					'data'    : { 
						'permission' : [ 
							'PERM_WORKGROUP_GLOBAL', 
							'PERM_WORKGROUP_WORKGROUP' 
						]
					}, 
					'object'      : 'workgroup', 
					'objectid'    : id,
					'listdetails' : 'workgroup' 
				} );
				
				var f = new Library( 'system.library' );
				f.onExecuted = function( e, d )
				{
					console.log( { e:e , d:d, args: args } );
					
					if( e == 'ok' && d )
					{
						try
						{
							var data = JSON.parse( d );
							
							// Workaround for now .... until rolepermissions is correctly implemented in C ...
							
							console.log( '[2] ', data );
							
							if( data && data.data && data.data.details && data.data.details.group )
							{
								data = data.data.details.group;
							}
							
							if( data )
							{
								return callback( true, data );
							}
						} 
						catch( e ){ } 
					}
				
					return callback( false, false );
				}
				f.execute( 'group/listdetails', { id: id, authid: Application.authId, args: args } );
			}
			else
			{
				// Specific for Pawel's code ... He just wants to forward json ...
				
				var args = JSON.stringify( {
					'type'    : 'read', 
					'context' : 'application', 
					'authid'  : Application.authId, 
					'data'    : { 
						'permission' : [ 
							'PERM_WORKGROUP_GLOBAL', 
							'PERM_WORKGROUP_WORKGROUP' 
						]
					}, 
					'listdetails' : 'workgroup' 
				} );
				
				var f = new Library( 'system.library' );
				f.onExecuted = function( e, d )
				{
					console.log( { e:e , d:d, args: args } );
				
					if( e == 'ok' && d )
					{
						try
						{
							var data = JSON.parse( d );
							
							// Workaround for now .... until rolepermissions is correctly implemented in C ...
							
							console.log( '[1] ', data );
							
							if( data && data.data && data.data.details && data.data.details.groups )
							{
								data = data.data.details;
							}
														
							if( data.groups )
							{
								return callback( true, data.groups );
							}
						} 
						catch( e ){ } 
					}
				
					return callback( false, false );
				}
				f.execute( 'group/list', { authid: Application.authId, args: args } );
			}
			
			return true;
		}
		
		return false;
		
	}
	
	/*function edit( id, _this )
	{
		
		var pnt = _this.parentNode;
		
		var edit = pnt.innerHTML;
		
		var buttons = [ 
			{ 'name' : 'Save',   'icon' : '', 'func' : function()
				{ 
					Sections.accounts_workgroups( 'update', { id: id, value: ge( 'WorkgroupName' ).value } ) 
				} 
			}, 
			{ 'name' : 'Delete', 'icon' : '', 'func' : function()
				{ 
					Sections.accounts_workgroups( 'remove', id ) 
				} 
			}, 
			{ 'name' : 'Cancel', 'icon' : '', 'func' : function()
				{ 
					pnt.innerHTML = edit 
				} 
			}
		];
		
		pnt.innerHTML = '';
		
		for( var i in buttons )
		{
			var b = document.createElement( 'button' );
			b.className = 'IconSmall FloatRight';
			b.innerHTML = buttons[i].name;
			b.onclick = buttons[i].func;
		
			pnt.appendChild( b );
		}
		
	}*/
	
	function refresh( id, _this )
	{
		
		initMain();
		
		if( id )
		{
			edit( id, _this );
		}
		
	}
	
	function edit( id, _this )
	{
		
		if( _this )
		{
			// TODO: remove all other Selected in the list first ...
			
			var pnt = _this.parentNode;
			
			if( pnt )
			{
				for( var i in pnt )
				{
					if( pnt[i] && pnt[i].className )
					{
						pnt[i].classList.remove( 'Selected' );
					}
				}
			}
			
			_this.classList.add( 'Selected' );
		}
		
		loading( id );
		
	}
	
	function cancel()
	{
		
		console.log( 'cancel(  ) ' );

		if( ge( 'WorkgroupDetails' ) )
		{
			ge( 'WorkgroupDetails' ).innerHTML = '';
		}
		
		if( ge( 'WorkgroupList' ) )
		{
			var ele = ge( 'WorkgroupList' ).getElementsByTagName( 'div' );
			
			if( ele )
			{
				for( var i in ele )
				{
					if( ele[i] && ele[i].className )
					{
						ele[i].classList.remove( 'Selected' );
					}
				}
			}
		}
	}
	
	// write -------------------------------------------------------------------------------------------------------- //
	
	function create()
	{
		// Specific for Pawel's code ... He just wants to forward json ...
		
		var args = JSON.stringify( {
			'type'    : 'write', 
			'context' : 'application', 
			'authid'  : Application.authId, 
			'data'    : { 
				'permission' : [ 
					'PERM_WORKGROUP_GLOBAL', 
					'PERM_WORKGROUP_WORKGROUP' 
				]
			}
		} );
		
		var f = new Library( 'system.library' );
		f.onExecuted = function( e, d )
		{
			console.log( { e:e, d:d, args: args } );
			
			data = {};
			
			try
			{
				data = JSON.parse( d );
			}
			catch( e ) {  }
			
			if( e == 'ok' && d )
			{
				
				if( data && data.message )
				{
					Notify( { title: i18n( 'i18n_workgroup_create' ), text: data.message } );
				}
				
				refresh( data.id );
				
			}
			else
			{
				
				if( data && data.message )
				{
					Notify( { title: i18n( 'i18n_workgroup_create' ), text: data.message } );
				}
				else
				{
					Notify( { title: i18n( 'i18n_workgroup_create' ), text: d } );
				}
				
			}
			
		}
		f.execute( 'group/create', {
			groupname : ( ge( 'WorkgroupName'   ) ? ge( 'WorkgroupName'   ).value : 'Unnamed workgroup' ), 
			parentid  : ( ge( 'WorkgroupParent' ) ? ge( 'WorkgroupParent' ).value : 0                   ),
			authid    : Application.authId,
			args      : args
		} );
		
	}
	
	function update( id )
	{
		
		// TODO: Add more stuff to update for a workgroup ...
		
		if( id )
		{
			
			// Specific for Pawel's code ... He just wants to forward json ...
			
			var args = JSON.stringify( {
				'type'    : 'write', 
				'context' : 'application', 
				'authid'  : Application.authId, 
				'data'    : { 
					'permission' : [ 
						'PERM_WORKGROUP_GLOBAL', 
						'PERM_WORKGROUP_WORKGROUP' 
					]
				}, 
				'object'   : 'workgroup', 
				'objectid' : id
			} );
		
			var f = new Library( 'system.library' );
			f.onExecuted = function( e, d )
			{
				console.log( { e:e, d:d, args: args } );
				
				data = {};
				
				try
				{
					data = JSON.parse( d );
				}
				catch( e ) {  }
				
				if( e == 'ok' && d )
				{
					
					if( data && data.message )
					{
						Notify( { title: i18n( 'i18n_workgroup_update' ), text: data.message } );
					}
					
					//refresh( data.id );
					
				}
				else
				{
					
					if( data && data.message )
					{
						Notify( { title: i18n( 'i18n_workgroup_update' ), text: data.message } );
					}
					else
					{
						Notify( { title: i18n( 'i18n_workgroup_update' ), text: d } );
					}
				
				}
				
				//Sections.accounts_workgroups( 'refresh' ); 
			}
			f.execute( 'group/update', {
				id        : id, 
				groupname : ge( 'WorkgroupName'   ).value, 
				parentid  : ge( 'WorkgroupParent' ).value,
				authid    : Application.authId,
				args      : args
			} );
			
		}
	}
	
	function updateRole( rid, groupid, _this )
	{
		
		var data = '';

		if( _this )
		{
			Toggle( _this, function( on )
			{
				data = ( on ? 'Activated' : '' );
			} );
		}
		
		if( rid && groupid )
		{
			var m = new Module( 'system' );
			m.onExecuted = function( e, d )
			{
				console.log( { e:e, d:d } );
			}
			m.execute( 'userroleupdate', { id: rid, groupid: groupid, data: data, authid: Application.authId } );
		}
		
	}
	
	// delete ------------------------------------------------------------------------------------------------------- //
	
	function remove( id )
	{
		
		/*Confirm( i18n( 'i18n_deleting_workgroup' ), i18n( 'i18n_deleting_workgroup_verify' ), function( result )
		{
			// Confirmed!
			if( result && result.data && result.data == true )
			{*/
				
				if( id )
				{
					
					// Specific for Pawel's code ... He just wants to forward json ...
					
					var args = JSON.stringify( {
						'type'    : 'delete', 
						'context' : 'application', 
						'authid'  : Application.authId, 
						'data'    : { 
							'permission' : [ 
								'PERM_WORKGROUP_GLOBAL', 
								'PERM_WORKGROUP_WORKGROUP' 
							]
						}, 
						'object'   : 'workgroup', 
						'objectid' : id
					} );
					
					var f = new Library( 'system.library' );
					f.onExecuted = function( e, d )
					{
						console.log( { e:e, d:d, args: args } );
					
						//Sections.accounts_workgroups( 'refresh' ); 
					
						refresh(); cancel();
					}
					f.execute( 'group/delete', { id: id, authid: Application.authId, args: args } );
					
				}
				
			/*}
		} );*/
		
	}
	
	// helper functions --------------------------------------------------------------------------------------------- //
	
	function removeBtn( _this, args, callback )
	{
		
		if( _this )
		{
			_this.classList.remove( 'IconButton' );
			_this.classList.remove( 'IconToggle' );
			_this.classList.remove( 'ButtonSmall' );
			_this.classList.remove( 'ColorStGrayLight' );
			_this.classList.remove( 'fa-minus-circle' );
			_this.classList.remove( 'fa-trash' );
			_this.classList.add( 'ButtonAlt' );
			_this.classList.add( 'BackgroundRed' );
			_this.innerHTML = ( args.button_text ? i18n( args.button_text ) : i18n( 'i18n_delete' ) );
			_this.args = args;
			_this.callback = callback;
			_this.onclick = function(  )
			{
				
				if( this.callback )
				{
					callback( this.args ? this.args : false );
				}
				
			};
		}
		
	}
	
	function editMode( close )
	{
		console.log( 'editMode() ', ge( 'GroupEditButtons' ) );
		
		if( ge( 'GroupEditButtons' ) )
		{
			ge( 'GroupEditButtons' ).className = ( close ? 'Closed' : 'Open' );
		}
	}
	
	// init --------------------------------------------------------------------------------------------------------- //
	
	function loading( id )
	{
		console.log( 'loading( '+id+' )' );
		
		if( id )
		{
			var info = { ID: ( id ? id : 0 ) };
			
			// Go through all data gathering until stop
			var loadingSlot = 0;
		
			var loadingList = [
			
				// Load workgroupinfo
			
				function()
				{
								
					list( function( e, d )
					{
					
						info.workgroup = null;
					
						if( e && d )
						{
							info.workgroup = d;
					
							loadingList[ ++loadingSlot ]( info );
						}
						else return;
					
					}, id );
				
				},
				
				// Load workgroups
				
				function()
				{
								
					list( function( e, d )
					{
					
						info.workgroups = null;
					
						if( e && d )
						{
							info.workgroups = d;
							
							loadingList[ ++loadingSlot ]( info );
						}
						else return;
					
					} );
				
				},
				
				// Get workgroup's roles
			
				function( info )
				{
					var u = new Module( 'system' );
					u.onExecuted = function( e, d )
					{
						info.roles = null;
						console.log( { e:e, d:d } );
						if( e == 'ok' )
						{
							try
							{
								info.roles = JSON.parse( d );
							}
							catch( e ){ }
						}
						loadingList[ ++loadingSlot ]( info );
					}
					u.execute( 'userroleget', { groupid: info.workgroup.groupid, authid: Application.authId } );
				},
			
				function( info )
				{
					if( typeof info.workgroup == 'undefined' && typeof info.roles == 'undefined' ) return;
				
					initDetails( info );
				}
			
			];
		
			loadingList[ 0 ]();
		
			return;
		}
		else
		{
			var info = {};
			
			list( function( e, d )
			{
			
				info.workgroups = null;
			
				if( e && d )
				{
					info.workgroups = d;
					
					initDetails( info );
				}
				else return;
			
			} );
			
		}
	}
	
	// Show the form
	function initDetails( info )
	{
		var workgroup  = ( info.workgroup  ? info.workgroup  : {} );
		var workgroups = ( info.workgroups ? info.workgroups : [] );
		var roles      = ( info.roles      ? info.roles      : [] );
		
		console.log( 'initDetails() ', info );
		
		// Workgroups
		var pstr = '';
		
		if( workgroups && workgroups.length )
		{
			pstr += '<option value="0">none</option>';
			
			for( var w in workgroups )
			{
				if( workgroups[w] && workgroups[w].ID && workgroups[w].name )
				{
					if( workgroup && ( workgroups[w].ID == workgroup.groupid || workgroups[w].parentid == workgroup.groupid ) )
					{
						continue;
					}
					
					pstr += '<option value="' + workgroups[w].ID + '"' + ( workgroup && workgroup.parentid == workgroups[w].ID ? ' selected="selected"' : '' ) + '>' + workgroups[w].name + '</option>';
				}
			}
			
		}
		
		// Roles
		var rstr = '';
		
		if( roles && roles.length )
		{
			for( var a in roles )
			{
				rstr += '<div class="HRow">';
				rstr += '<div class="PaddingSmall HContent80 FloatLeft Ellipsis">' + roles[a].Name + '</div>';
				rstr += '<div class="PaddingSmall HContent20 FloatLeft Ellipsis">';
				rstr += '<button onclick="Sections.accounts_workgroups(\'update_role\',{rid:'+roles[a].ID+',groupid:'+workgroup.groupid+',_this:this})" class="IconButton IconSmall ButtonSmall FloatRight' + ( roles[a].WorkgroupID ? ' fa-toggle-on' : ' fa-toggle-off' ) + '"></button>';
				rstr += '</div>';
				rstr += '</div>';
			}
		}
		
		
		// Get the user details template
		var d = new File( 'Progdir:Templates/account_workgroup_details.html' );
		
		// Add all data for the template
		d.replacements = {
			id                    : ( workgroup.groupid     ? workgroup.groupid     : ''                           ),
			workgroup_title       : ( workgroup.name        ? workgroup.name        : i18n( 'i18n_new_workgroup' ) ),
			workgroup_name        : ( workgroup.name        ? workgroup.name        : ''                           ),
			workgroup_parent      : pstr,
			workgroup_description : ( workgroup.description ? workgroup.description : ''                           ),
			roles                 : rstr
		};
		
		// Add translations
		d.i18n();
		d.onLoad = function( data )
		{
			ge( 'WorkgroupDetails' ).innerHTML = data;
			
			if( !info.ID )
			{
				ge( 'GroupDeleteBtn' ).style.display = 'none';
				
				
			}
			else
			{
				ge( 'GroupEditButtons' ).className = 'Closed';
				
				if( ge( 'WorkgroupBasicDetails' ) )
				{
					var inps = ge( 'WorkgroupBasicDetails' ).getElementsByTagName( '*' );
					if( inps.length > 0 )
					{
						for( var a = 0; a < inps.length; a++ )
						{
							if( inps[ a ].id && [ 'WorkgroupName', 'WorkgroupParent', 'WorkgroupDescription' ].indexOf( inps[ a ].id ) >= 0 )
							{
								( function( i ) {
									i.onclick = function( e )
									{
										editMode();
									}
								} )( inps[ a ] );
							}
						}
					}
				}
			}
			
			var bg1  = ge( 'GroupSaveBtn' );
			if( bg1 ) bg1.onclick = function( e )
			{
				// Save workgroup ...
				
				if( info.ID )
				{
					console.log( '// save workgroup' );
					
					update( info.ID );
				}
				else
				{
					console.log( '// create workgroup' );
					
					create();
				}
			}
			var bg2  = ge( 'GroupCancelBtn' );
			if( bg2 ) bg2.onclick = function( e )
			{
				if( info.ID )
				{
					edit( info.ID );
				}
				else
				{
					cancel(  );
				}
			}
			var bg3  = ge( 'GroupBackBtn' );
			if( bg3 ) bg3.onclick = function( e )
			{
				cancel(  );
			}
			
			var bg4  = ge( 'GroupDeleteBtn' );
			if( bg4 ) bg4.onclick = function( e )
			{
				
				// Delete workgroup ...
				
				if( info.ID )
				{
					console.log( '// delete workgroup' );
					
					removeBtn( this, { id: info.ID, button_text: 'i18n_delete_workgroup', }, function ( args )
					{
						
						remove( args.id );
						
					} );
					
				}
				
			}
			
			
			
			
			
			
			
			
			
			// Responsive framework
			Friend.responsive.pageActive = ge( 'WorkgroupDetails' );
			Friend.responsive.reinit();
		}
		d.load();
	}
	
	
	
	
	function initMain()
	{
		var checkedGlobal = Application.checkAppPermission( 'PERM_WORKGROUP_GLOBAL' );
		var checkedWorkgr = Application.checkAppPermission( 'PERM_WORKGROUP_WORKGROUP' );
		
		if( checkedGlobal || checkedWorkgr )
		{
			
			// Get the user list
			list( function( e, d )
			{
				console.log( { e:e, d:d } );
				
				//if( e != 'ok' ) return;
				var userList = null;
				try
				{
					userList = d;
				}
				catch( e )
				{
					//return;
				}
				
				var o = ge( 'WorkgroupList' );
				o.innerHTML = '';
			
				// Types of listed fields
				var types = {
					edit: '10',
					name: '80'
				};
			
			
				// List by level
				var levels = [ 'User' ];
			
			
				var h2 = document.createElement( 'h2' );
				h2.innerHTML = i18n( 'i18n_workgroups' );
				o.appendChild( h2 );
			
				// List headers
				var header = document.createElement( 'div' );
				header.className = 'List';
				var headRow = document.createElement( 'div' );
				headRow.className = 'HRow BackgroundNegativeAlt Negative PaddingTop PaddingBottom';
				for( var z in types )
				{
					var borders = '';
					var d = document.createElement( 'div' );
					if( z != 'edit' )
						//borders += ' BorderRight';
					if( a < userList.length - a )
						borders += ' BorderBottom';
					var d = document.createElement( 'div' );
					d.className = 'PaddingSmallLeft PaddingSmallRight HContent' + ( types[ z ] ? types[ z ] : '-' ) + ' FloatLeft Ellipsis' + borders;
					if( z == 'edit' ) z = '&nbsp;';
					d.innerHTML = '<strong' + ( z != '&nbsp;' ? '' : '' ) + '>' + ( z != '&nbsp;' ? i18n( 'i18n_header_' + z ) : '&nbsp;' ) + '</strong>';
					headRow.appendChild( d );
				}
			
				var d = document.createElement( 'div' );
				d.className = 'PaddingSmall HContent' + '10' + ' TextCenter FloatLeft Ellipsis';
				d.innerHTML = '<button class="IconButton IconSmall ButtonSmall Negative FloatRight fa-plus-circle"></button>';
				d.onclick = function()
				{
					//Sections.accounts_workgroups( 'create' );
					edit(  );
				};
				headRow.appendChild( d );
			
				header.appendChild( headRow );
				o.appendChild( header );
			
				function setROnclick( r, uid )
				{
					r.onclick = function()
					{
						//Sections.accounts_workgroups( 'details', uid );
						edit( uid );
					}
				}
			
				var list = document.createElement( 'div' );
				list.className = 'List';
				var sw = 2;
				for( var b = 0; b < levels.length; b++ )
				{
					if( userList )
					{
						for( var a = 0; a < userList.length; a++ )
						{
							// Skip irrelevant level
							//if( userList[ a ].Level != levels[ b ] ) continue;
							
							// Use this way to sort the list until role permission has been implemented in FriendCore calls ...
							if( !checkedGlobal && checkedWorkgr )
							{
								var found = false;
								
								for( var i in checkedWorkgr )
								{
									if( checkedWorkgr[ i ] && checkedWorkgr[ i ].Data && checkedWorkgr[i].Data == userList[ a ].parentid )
									{
										found = true;
									}
								}
								
								if( !found )
								{
									//continue;
								}
							}
							
							sw = sw == 2 ? 1 : 2;
							var r = document.createElement( 'div' );
							setROnclick( r, userList[ a ].ID );
							r.className = 'HRow ';
			
							var icon = '<span class="IconSmall fa-user"></span>';
							userList[ a ][ 'edit' ] = icon;
				
							for( var z in types )
							{
								var borders = '';
								var d = document.createElement( 'div' );
								if( z != 'edit' )
								{
									d.className = '';
									//borders += ' BorderRight';
								}
								else d.className = 'TextCenter';
								//if( a < userList.length - a )
								//	borders += ' BorderBottom';
								d.className += ' HContent' + ( types[ z ] ? types[ z ] : '-' ) + ' FloatLeft PaddingSmall Ellipsis' + borders;
								d.innerHTML = ( userList[a][ z ] ? userList[a][ z ] : '-' );
								r.appendChild( d );
							}
			
							// Add row
							list.appendChild( r );
						}
					}
				}
			
				o.appendChild( list );
			
				Friend.responsive.pageActive = ge( 'WorkgroupList' );
				Friend.responsive.reinit();
			} );
			
		}
		else
		{
			var o = ge( 'WorkgroupList' );
			o.innerHTML = '';
			
			var h2 = document.createElement( 'h2' );
			h2.innerHTML = '{i18n_permission_denied}';
			o.appendChild( h2 );
		}
		
	}
	
};







/*

Sections.userroleupdate = function( rid, input, perms )
{
	if( rid )
	{
		var m = new Module( 'system' );
		m.onExecuted = function( e, d )
		{
			console.log( { e:e, d:d } );
			
			// refresh
			Sections.accounts_roles();
		}
		m.execute( 'userroleupdate', { id: rid, name: ( input ? input : null ), permissions: ( perms ? perms : null ) } );
	}
};

Sections.updatepermission = function( rid, pem, key, data, _this )
{
	if( _this )
	{
		Toggle( _this, function( on )
		{
			data = ( on ? 'Activated' : '' );
		} );
	}
	
	if( rid && pem && key )
	{
		var perms = [ { name : pem, key : key, data : data } ];
		
		Sections.userroleupdate( rid, null, perms );
	}
};

Sections.checkpermission = function( input )
{
	if( input )
	{
		var m = new Module( 'system' );
		m.onExecuted = function( e, d )
		{
			console.log( { e:e, d:d } );
		}
		m.execute( 'checkpermission', { permission: input } );
	}
};*/

//console.log( 'Sections.userroleadd =', Sections.userroleadd );
//console.log( 'Sections.userroledelete =', Sections.userroledelete );
//console.log( 'Sections.userroleupdate =', Sections.userroleupdate );
//console.log( 'Sections.accounts_roles =', Sections.accounts_roles );
//console.log( 'Sections.checkpermission =', Sections.checkpermission );


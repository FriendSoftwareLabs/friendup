/*©mit**************************************************************************
*                                                                              *
* This file is part of FRIEND UNIFYING PLATFORM.                               *
* Copyright (c) Friend Software Labs AS. All rights reserved.                  *
*                                                                              *
* Licensed under the Source EULA. Please refer to the copy of the MIT License, *
* found in the file license_mit.txt.                                           *
*                                                                              *
*****************************************************************************©*/
/** @file
 * 
 *  User USB remote manager
 *
 *  @author PS (Pawel Stefanski)
 *  @date created 13/07/2020
 */

#include "user_usb_remote_devices.h"
#include "usb_remote_device.h"

/**
 * Create USB remote devices
 *
 * @param username user name to which devices are attached
 * @param remoteName remote user name to which devices are attached on destination server
 * @return return new UserUSBRemoteDevices structure when success, otherwise NULL
 */
UserUSBRemoteDevices *UserUSBRemoteDevicesNew( char *username, char *remoteName )
{
	UserUSBRemoteDevices *udev = NULL;
	if( ( udev = FCalloc( 1, sizeof(UserUSBRemoteDevices) ) ) != NULL )
	{
		udev->uusbrd_UserName = StringDuplicate( username );
		udev->uusbrd_RemoteUserName = StringDuplicate( remoteName );
	}
	return udev;
}

/**
 * Delete User USB Remote devices
 *
 * @param udev pointer to UserUSBRemoteDevices
 */
void UserUSBRemoteDevicesDelete( UserUSBRemoteDevices *udev )
{
	if( udev != NULL )
	{
		int i;
		for( i = 0 ; i < MAX_REMOTE_USB_DEVICES_PER_USER ; i++ )
		{
			if( udev->uusbrd_Devices[ i ] != NULL )
			{
				USBRemoteDeviceDelete( udev->uusbrd_Devices[ i ] );
			}
		}
		
		if( udev->uusbrd_UserName != NULL )
		{
			FFree( udev->uusbrd_UserName );
		}
		if( udev->uusbrd_RemoteUserName != NULL )
		{
			FFree( udev->uusbrd_RemoteUserName );
		}
		
		FFree( udev );
	}
}


int UserUSBRemoteDevicesDeletePort( UserUSBRemoteDevices *udev, FULONG id )
{
	if( udev != NULL )
	{
		int i;
		for( i = 0 ; i < MAX_REMOTE_USB_DEVICES_PER_USER ; i++ )
		{
			if( udev->uusbrd_Devices[ i ] != NULL && udev->uusbrd_Devices[ i ]->usbrd_ID == id )
			{
				USBRemoteDeviceDelete( udev->uusbrd_Devices[ i ] );
				udev->uusbrd_Devices[ i ] = NULL;
				break;
			}
		}
	}
	return 0;
}

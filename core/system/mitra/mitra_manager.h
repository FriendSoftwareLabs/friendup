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
 *  Mitra Manager
 *
 * file contain definitions related to Mitra Manager
 *
 *  @author PS (Pawel Stefanski)
 *  @date created 14/07/2020
 */

#ifndef __SYSTEM_MITRA_MITRA_MANAGER_H__
#define __SYSTEM_MITRA_MITRA_MANAGER_H__

#include <core/types.h>
#include <system/user/user_session.h>
#include <system/usergroup/user_group.h>
#include <system/user/user_sessionmanager.h>
#include <system/user/user.h>

//
// Role Manager structure
//

typedef struct MitraManager
{
	void								*mm_SB;
	SQLLibrary							*mm_Sqllib;	// pointer to library
}MitraManager;


//
// Create new RoleManager
//

MitraManager *MitraManagerNew( void *sb );

//
// delete RoleManager
//

void MitraManagerDelete( MitraManager *smgr );

//
//
//

char * MitraManagerGetUserData( MitraManager *rmgr, char *username );

//
//
//

#endif //__SYSTEM_MITRA_MITRA_MANAGER_H__

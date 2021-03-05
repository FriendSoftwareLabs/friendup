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
 * Body of DOS token manager
 *
 * @author PS (Pawel Stefansky)
 * @date created PS (27/03/2018)
 */

#include "dos_token_manager.h"
#include <util/session_id.h>
#include <system/systembase.h>

/**
 * Create DOSTokenManager
 *
 * @param sb pointer to SystemBase
 * @return new instance of DOSTokenManager
 */
DOSTokenManager *DOSTokenManagerNew( void *sb )
{
	DOSTokenManager *dtm = FCalloc( 1, sizeof( DOSTokenManager ) );
	if( dtm != NULL )
	{
		dtm->dtm_SB = sb;
		pthread_mutex_init( &dtm->dtm_Mutex, NULL );
	}
	return dtm;
}

/**
 * Release DOSTokenManager
 *
 * @param d pointer to DOSTokenManager which will be deleted
 */
void DOSTokenManagerDelete( DOSTokenManager *d )
{
	if( d != NULL )
	{
		DOSTokenDeleteAll( d->dtm_Tokens );
		
		pthread_mutex_destroy( &d->dtm_Mutex );
		
		FFree( d );
	}
}

/**
 * Add DOSToken to tokens list
 *
 * @param d pointer to DOSTokenManager
 * @param dt pointer to DOSToken which will be added to list
 * @return 0 when success, otherwise error number
 */
int DOSTokenManagerAddDOSToken( DOSTokenManager *d, DOSToken *dt )
{
	if( d != NULL && dt != NULL )
	{
		FRIEND_MUTEX_LOCK( &d->dtm_Mutex );
		
		dt->node.mln_Succ = (MinNode *)d->dtm_Tokens;
		d->dtm_Tokens = dt;
		
		FRIEND_MUTEX_UNLOCK( &d->dtm_Mutex );
		
		return 0;
	}
	return 1;
}

/**
 * Remove DOSToken
 *
 * @param d pointer to DOSTokenManager
 * @param id DOSTokenID
 * @return 0 when token will be deleted, otherwise error number
 */
int DOSTokenManagerDeleteToken( DOSTokenManager *d, char *id )
{
	int err = 1;
	if( d != NULL )
	{
		DEBUG("DOSTokenManagerDeleteToken\n");
		
		FRIEND_MUTEX_LOCK( &d->dtm_Mutex );
		time_t now = time( NULL );
		
		DOSToken *newTokenList = NULL;
		
		DOSToken *dt = d->dtm_Tokens;
		
		while( dt != NULL )
		{
			DOSToken *oldToken = NULL;
			FBOOL remove = FALSE;
			
			// if token is not valid, we remove it
			
			if( strcmp( id, dt->ct_TokenID ) == 0 )
			{
				remove = TRUE;
			}
			
			oldToken = dt;
			dt = (DOSToken *)dt->node.mln_Succ;
			
			if( remove == TRUE )
			{
				DOSTokenDelete( oldToken );
				err = 0;
			}
			else
			{
				oldToken->node.mln_Succ = (MinNode *)newTokenList;
				newTokenList = oldToken;
			}
		}
		
		d->dtm_Tokens = newTokenList;
		
		FRIEND_MUTEX_UNLOCK( &d->dtm_Mutex );
	}
	return err;
}

/**
 * Get DOSToken from tokens list
 *
 * @param d pointer to DOSTokenManager
 * @param tokenID token ID as string
 * @return pointer to DOSToken structure wheen success, otherwise NULL
 */
DOSToken *DOSTokenManagerGetDOSToken( DOSTokenManager *d, const char *tokenID )
{
	DOSToken *dt = NULL;
	
	if( d != NULL )
	{
		FRIEND_MUTEX_LOCK( &d->dtm_Mutex );
		
		dt = d->dtm_Tokens;
		
		DEBUG("GetDosToken\n");
		
		while( dt != NULL )
		{
			DOSToken *remToken = NULL;
			
			// if token was found we are checking how many times it was used
			if( dt->ct_UsedTimes != 0 && strcmp( tokenID, dt->ct_TokenID ) == 0 )
			{
				DEBUG("GetDosToken, used files %d\n", dt->ct_UsedTimes );
				
				if( dt->ct_UsedTimes > 0 )
				{
					dt->ct_UsedTimes--;
				
					if( dt->ct_UsedTimes == 0 )
					{
						// entry will be removed when DOSTokenManagerAutoDelete will be called
					}
					else
					{
						break;
					}
				}
				else	// if -1 -> infinity
				{
					break;
				}
			}
			dt = (DOSToken *)dt->node.mln_Succ;
		}
		
		// if DOSToken was found
		// we can check if user session is attached
		
		if( dt != NULL )
		{
			SystemBase *sb = (SystemBase *) d->dtm_SB;
			
			if( dt->ct_UserSession == NULL )
			{
				UserSession *us = UserSessionNew( sb, NULL, "autogenerated" );
				if( us != NULL )
				{
					us->us_LoggedTime = time( NULL );
					us->us_SB = d->dtm_SB;
					
					SystemBase *sb = (SystemBase *) us->us_SB;
					SQLLibrary *sqllib  = sb->GetDBConnection( sb );
					if( sqllib != NULL )
					{
						int error = 0;

						if( ( error = sqllib->Save( sqllib, UserSessionDesc, us ) ) != 0 )
						{
							FERROR("Cannot store session\n");
							
							FRIEND_MUTEX_UNLOCK( &d->dtm_Mutex );
							if( ( us = USMUserSessionAdd( sb->sl_USM, us ) ) != NULL )
							{
								if( us->us_User == NULL )
								{
									// Do nothing
								}
							}
							FRIEND_MUTEX_LOCK( &d->dtm_Mutex );
						}
						else
						{
							DEBUG("[USMSessionSaveDB] Session stored\n");
						}
						sb->DropDBConnection( sb, sqllib );
					}
				}
			}
		}
		FRIEND_MUTEX_UNLOCK( &d->dtm_Mutex );
	}
	
	return dt;
}

/**
 * List all tokens (as JSON)
 *
 * @param dtm pointer to DOSTokenManager
 * @return new BufferedString with DOSTokens in json format
 */
BufString *DOSTokenManagerList( DOSTokenManager *dtm )
{
	int pos = 0;
	BufString *bs = BufStringNew();
	
	DOSToken *dt = NULL;
	
	if( dtm != NULL )
	{
		FRIEND_MUTEX_LOCK( &dtm->dtm_Mutex );
		
		BufStringAddSize( bs, "ok<!--separate-->[", 18 );
		
		dt = dtm->dtm_Tokens;
		while( dt != NULL )
		{
			if( pos > 0 )
			{
				BufStringAddSize( bs, ",", 1 );
			}
			DOSTokenJSONDescription( dt, bs );
			
			pos++;
			dt = (DOSToken *)dt->node.mln_Succ;
		}
		
		BufStringAddSize( bs, "]", 1 );
		
		FRIEND_MUTEX_UNLOCK( &dtm->dtm_Mutex );
	}
	return bs;
}

/**
 * Erase UserSession from DOSToken
 *
 * @param dtm pointer to DOSTokenManager
 * @param s pointer to UserSession which will be erased from DOSToken
 * @return 0 when success, otherwise error number
 */
int DOSTokenManagerEraseUserSession( DOSTokenManager *dtm, UserSession *s )
{
	DOSToken *dt = NULL;
	
	if( dtm != NULL )
	{
		FRIEND_MUTEX_LOCK( &dtm->dtm_Mutex );
		
		dt = dtm->dtm_Tokens;
		
		while( dt != NULL )
		{
			if( dt->ct_UserSession == s )
			{
				dt->ct_UserSession = NULL;
				dt->ct_UserSessionID = 0;
				FRIEND_MUTEX_UNLOCK( &dtm->dtm_Mutex );
				return 0;
			}
			dt = (DOSToken *)dt->node.mln_Succ;
		}
		
		FRIEND_MUTEX_UNLOCK( &dtm->dtm_Mutex );
	}
	return 1;
}

/**
 * Remove obsolete DOSTokens
 *
 * @param d pointer to DOSTokenManager
 */
void DOSTokenManagerAutoDelete( DOSTokenManager *d )
{
	if( d != NULL )
	{
		DEBUG("DOSTokenManagerAutoDelete\n");
		
		FRIEND_MUTEX_LOCK( &d->dtm_Mutex );
		time_t now = time( NULL );
		
		DOSToken *newTokenList = NULL;
		DOSToken *dt = d->dtm_Tokens;
		
		while( dt != NULL )
		{
			DOSToken *oldToken = NULL;
			FBOOL remove = FALSE;
			
			// if token is not valid, we remove it
			
			if( now >= dt->ct_Timeout || dt->ct_UsedTimes == 0 )
			{
				remove = TRUE;
			}
			
			oldToken = dt;
			dt = (DOSToken *)dt->node.mln_Succ;
			
			if( remove == TRUE )
			{
				DOSTokenDelete( oldToken );
			}
			else
			{
				oldToken->node.mln_Succ = (MinNode *)newTokenList;
				newTokenList = oldToken;
			}
		}
		
		d->dtm_Tokens = newTokenList;
		
		FRIEND_MUTEX_UNLOCK( &d->dtm_Mutex );
		DEBUG("DOSTokenManagerAutoDelete end\n");
	}
}


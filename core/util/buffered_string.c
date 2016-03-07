/*******************************************************************************
*                                                                              *
* This file is part of FRIEND UNIFYING PLATFORM.                               *
*                                                                              *
* This program is free software: you can redistribute it and/or modify         *
* it under the terms of the GNU Affero General Public License as published by  *
* the Free Software Foundation, either version 3 of the License, or            *
* (at your option) any later version.                                          *
*                                                                              *
* This program is distributed in the hope that it will be useful,              *
* but WITHOUT ANY WARRANTY; without even the implied warranty of               *
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the                 *
* GNU Affero General Public License for more details.                          *
*                                                                              *
* You should have received a copy of the GNU Affero General Public License     *
* along with this program.  If not, see <http://www.gnu.org/licenses/>.        *
*                                                                              *
*******************************************************************************/

#include "buffered_string.h"
#include <util/log/log.h>

//
// initialization
//

BufString *BufStringNew()
{
	BufString *str = NULL;
		
	if( ( str = FCalloc( sizeof( BufString ), 1 ) ) != NULL )
	{
		str->bs_Size = 0;
		str->bs_Bufsize = BUF_STRING_MAX;
		str->bs_MAX_SIZE = BUF_STRING_MAX;
		
		str->bs_Buffer = FCalloc( str->bs_Bufsize+1, sizeof(char) );
		
		//printf("BufStr allocated\n");
		return str;
	}
		
	return NULL;
}

//
// initialization
//

BufString *BufStringNewSize( int bufsize )
{
	BufString *str = NULL;
		
	if( ( str = FCalloc( sizeof( BufString ), 1 ) ) != NULL )
	{
		str->bs_Size = 0;
		str->bs_Bufsize = bufsize;
		str->bs_MAX_SIZE = bufsize;
		
		if( ( str->bs_Buffer = FCalloc( str->bs_Bufsize + 1, sizeof( char ) ) ) != NULL )
		{
			return str;
		}
		FFree( str );
	}
		
	return NULL;
}

//
// remove buffer
//

void BufStringDelete( BufString *bs )
{
	if( bs != NULL )
	{
		if( bs->bs_Buffer )
		{
			FFree( bs->bs_Buffer );
		}
		FFree( bs );
	}
}

//
// add text to buffer
//

int BufStringAdd( BufString *bs, const char *ntext )
{
	if( ntext == NULL )
	{
		return 1;
	}
	
	int addsize = strlen( ntext );//+1;
	if( bs->bs_Size == 0 )
	{
		// buffer is too small to handle data, we must extend it
		
		if( addsize > bs->bs_MAX_SIZE )
		{
			int allsize = ( (addsize / bs->bs_MAX_SIZE) + 1) * bs->bs_MAX_SIZE;
			char *tmp;
			
			if( ( tmp = FCalloc( allsize+1, sizeof(char) ) ) != NULL )
			{
				strcpy( tmp, ntext );
				bs->bs_Bufsize = allsize;
				bs->bs_Size = addsize;
			}
			else
			{
				ERROR("Cannot allocate memory for BUFString\n");
				return -1;
			}
		}
		else	// buffer is enough to hold data, just copy it
		{
			strcpy( bs->bs_Buffer, ntext );
			bs->bs_Size = strlen( ntext );
		}
		return 0;
	}
	
	//int modsize = (bs->bs_Size / bs->bs_MAX_SIZE) * bs->bs_MAX_SIZE;
	int newsize = (bs->bs_Size + addsize);
	
	if( newsize > bs->bs_Bufsize )
	{
		char *tmp;
		int allsize = ( (newsize / bs->bs_MAX_SIZE) + 1) * bs->bs_MAX_SIZE;
		
		if( ( tmp = FCalloc( allsize+1, sizeof(char) ) ) != NULL )
		{
			bs->bs_Bufsize = allsize;
			bs->bs_Size = newsize;
			
			strcpy( tmp, bs->bs_Buffer );
			strcat( tmp, ntext );
			
			FFree( bs->bs_Buffer );
			bs->bs_Buffer = tmp;
		}
		else
		{
			ERROR("Cannot allocate memory for buffer!\n");
			return -1;
		}
		// there is no space in the buffer, we must extend it
	}
	else
	{
		// there is some space in buffer, we can put information there
		strcat( bs->bs_Buffer, ntext );
		bs->bs_Size = newsize;
	}
	
	return 0;
}


//
// add text to buffer
//

int BufStringAddSize( BufString *bs, const char *ntext, int len )
{
	if( ntext == NULL )
	{
		ERROR("Cannot add NULL text!\n");
		return 1;
	}
	
	if( bs->bs_Size == 0 )
	{
		// buffer is too small to handle data, we must extend it
		
		if( len > bs->bs_MAX_SIZE )
		{
			DEBUG( "Too big buffer! (len: %d, max: %d)\n", len, bs->bs_MAX_SIZE );
			int allsize = ( (len / bs->bs_MAX_SIZE) + 1) * bs->bs_MAX_SIZE;
			char *tmp;
			
			if( ( tmp = FCalloc( allsize + 1, sizeof(char) ) ) != NULL )
			{
				memcpy( tmp, ntext, len );
				bs->bs_Bufsize = allsize;
				bs->bs_Size = len;
				
				FFree( bs->bs_Buffer );
				bs->bs_Buffer = tmp;
			}
			else
			{
				ERROR("Cannot allocate memory for BUFString\n");
				return -1;
			}
		}
		else	// buffer is enough to hold data, just copy it
		{
			memcpy( bs->bs_Buffer, ntext, len );
			bs->bs_Size = len;
		}
		return 0;
	}
	
	int addsize = len;
//	int modsize = (bs->bs_Size / bs->bs_MAX_SIZE) * bs->bs_MAX_SIZE;
	int newsize = (bs->bs_Size + addsize);
	//DEBUG("Add memory for buffer   addsize %d modsize %d newsize %d current %d\n", addsize, modsize, newsize, bs->bs_Size );
	
	if( newsize > bs->bs_Bufsize )
	{
		char *tmp;
		int allsize = ( (newsize / bs->bs_MAX_SIZE) + 1) * bs->bs_MAX_SIZE;
		//DEBUG("Allocated mem size %d\n", allsize );
		
		if( ( tmp = FCalloc( allsize+1, sizeof(char) ) ) != NULL )
		{
			memcpy( tmp, bs->bs_Buffer, bs->bs_Size );
			//DEBUG("copy from %d len %d\n", bs->bs_Size, len );
			memcpy( &(tmp[ bs->bs_Size ]), ntext, len );
			
			bs->bs_Bufsize = allsize;
			bs->bs_Size = newsize;
			
			FFree( bs->bs_Buffer );
			bs->bs_Buffer = tmp;
		}
		else
		{
			ERROR("Cannot allocate memory for buffer!\n");
			return -1;
		}
		// there is no space in the buffer, we must extend it
	}
	else
	{
		// there is some space in buffer, we can put information there
		memcpy( &(bs->bs_Buffer[ bs->bs_Size ] ), ntext, len );
		bs->bs_Size = newsize;
	}
	
	return 0;
}


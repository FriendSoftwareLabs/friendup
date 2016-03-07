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

#include <core/types.h>
#include "list_string.h"
#include <stdio.h>
#include <stdlib.h>
#include <util/log/log.h>
#include <string.h>

#ifndef NULL
#define NULL 0
#endif

//
//
//

ListString *ListStringNew()
{
	ListString *ls = FCalloc( 1, sizeof( ListString ) );
	if( ls != NULL )
	{
		ls->ls_Last = ls;
		return ls;
	}
	return NULL;
}

//
// remove list and all entries
//

void ListStringDelete(ListString *ls)
{
	ListString *cur = ls->ls_Next;
	while (cur != NULL)
	{
		ListString *rm = cur;
		cur = cur->ls_Next;

		FFree(rm->ls_Data);
		FFree(rm);
	}
	if (ls->ls_Data != NULL)
	{
		FFree(ls->ls_Data);
	}
	FFree(ls);
}

//
// add entry to list
//

int ListStringAdd( ListString *ls, char *data, int size )
{
	ListString *nls = FCalloc( 1, sizeof( ListString ) );
	if( nls != NULL )
	{
		if( ( nls->ls_Data = FCalloc( size + 1, sizeof( char ) ) ) != NULL )
		{
			memcpy( nls->ls_Data, data, size );
			nls->ls_Size = size; // Remember to set the size

			ls->ls_Last->ls_Next = nls;
			ls->ls_Last = nls;
			ls->ls_Size += size;
		}
		else
		{
			FFree( nls );
			return -1;
		}
	}
	else
	{
		return -2;
	}
	return 0;
}

//
// join all lists to one string
//

ListString *ListStringJoin( ListString *ls )
{
	ls->ls_Data = FCalloc(ls->ls_Size+1, sizeof(char));
	if (ls->ls_Data != NULL)
	{
		ListString *cur = ls->ls_Next;
		ListString *rem = cur;
		char *pos = ls->ls_Data;

		while( cur != NULL )
		{
			memcpy( pos, cur->ls_Data, cur->ls_Size );

			pos += cur->ls_Size;
			rem = cur;
			cur = cur->ls_Next;

			if( rem != NULL )
			{
				if( rem->ls_Data != NULL )
				{
					FFree( rem->ls_Data );
				}
				FFree( rem );
			}
		}
		ls->ls_Next = NULL;
		ls->ls_Last = NULL;
		
		ls->ls_Data[ ls->ls_Size ] = 0;

		return ls;
	}
	ERROR("Cannot allocate memory %d\n", ls->ls_Size );
	
	return NULL;
}

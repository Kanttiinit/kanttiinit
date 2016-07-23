import HttpCache from '../../utils/HttpCache';

export function fetchAreas() {
   return {
      type: 'FETCH_AREAS',
      payload: HttpCache.get('areas', '/areas', {days: '1'}),
      meta: {
         data: 'areas'
      }
   };
}

export function fetchFavorites() {
   return {
      type: 'FETCH_FAVORITES',
      payload: HttpCache.get('favorites', '/favorites', {hours: 1}),
      meta: {
         data: 'favorites'
      }
   };
}

export function sendFeedback(type, message) {
   return {
      type: 'SEND_FEEDBACK',
      payload: fetch('https://bot.kanttiinit.fi/feedback', {
         method: 'post',
         headers: {'Content-Type': 'application/json'},
         body: JSON.stringify({
            message: `New feedback from app: "${type}":\n"${message}"`
         })
      }).then(r => r.json()),
      meta: {
         data: 'feedback'
      }
   };
}

export function fetchMenus() {
   return (dispatch, getState) => {
      const idString = getState().preferences.selectedRestaurants.join(',');
      return dispatch({
         type: 'FETCH_MENUS',
         payload: HttpCache.get(`menus-${idString}`, `/menus?restaurants=${idString}`, {hours: 3}),
         meta: {
            data: 'menus'
         }
      });
   };
}

export function fetchRestaurants() {
   return {
      type: 'FETCH_RESTAURANTS',
      payload: HttpCache.get('restaurants', '/restaurants', {days: 1}),
      meta: {
         data: 'restaurants'
      }
   };
}

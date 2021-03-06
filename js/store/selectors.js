// @flow
import {createSelector} from 'reselect';
import _ from 'lodash';
import moment from 'moment';
import haversine from 'haversine';
import type {State} from '../utils/types';

const now = state => moment(state.value.now);
const location = state => state.data.location;
export const selectRestaurants = (state: State) => state.data.restaurants || [];
export const selectLang = (state: State) => state.preferences.lang || 'en';
const selectedRestaurantIds = state => state.preferences.selectedRestaurants;
const favoritedRestaurantIds = state => state.preferences.favoritedRestaurants;
const selectedFavoriteIds = state => state.preferences.selectedFavorites;
const favorites = state => state.data.favorites || [];
const menus = state => state.data.menus || [];

function isOpen(openingHours, now) {
  const hours = openingHours[now.weekday()];
  if (hours) {
    const [open, close] = hours.split(' - ').map(n => moment(n, 'HH:mm'));
    return now.isAfter(open) && now.isBefore(close);
  }
  return false;
}

export const selectedRestaurants = createSelector(
  selectRestaurants, selectedRestaurantIds,
  (all, selected) => all.filter(r => selected.includes(r.id))
);

export const isFavorite = createSelector(
  favorites, selectedFavoriteIds, (state, props) => props.course.title,
  (all, selected, title) => selected.some(selectedId => {
    const favorite = all.find(f => f.id === selectedId);
    if (favorite && title) {
      return title.match(new RegExp(favorite.regexp, 'i'));
    }
  })
);

export const isAreaChecked = createSelector(
  selectedRestaurantIds, (state, props) => props.area.restaurants,
  (selectedRestaurantIds, areaRestaurants) =>
  areaRestaurants.every(r => selectedRestaurantIds.includes(r.id))
);

export const isRestaurantFavorited = createSelector(
  favoritedRestaurantIds, (state, props) => props.restaurant.id,
  (favoritedIds, restaurantId) => favoritedIds.includes(restaurantId)
);

export const formatRestaurants = createSelector(
  (state, props) => props.restaurants,
  menus,
  (state, props) => props.day,
  (restaurants, menus, day) => _.orderBy(
    restaurants.map(restaurant => {
      const courses = _.get(menus, [restaurant.id, day], []);
      return {...restaurant, courses, noCourses: !courses.length};
    }),
    ['noCourses'])
);

export const formatFavorites = createSelector(
  favorites, selectedFavoriteIds,
  (favorites, selectedFavoriteIds) =>
  _.orderBy(
    favorites.map(f =>
      ({
        ...f,
        selected: selectedFavoriteIds.includes(f.id)
      })
    ),
    ['selected', 'name'], ['desc', 'asc']
  )
);

export const getCourseFavorites = createSelector(
  formatFavorites, (state, props) => props.course.title,
  (favorites, courseTitle) =>
  _.sortBy(favorites.filter(f => courseTitle.match(new RegExp(f.regexp, 'i'))), 'name')
);

export const isToday = createSelector(
  now, (state, props) => props.day,
  (now, day) => now.isSame(moment(day), 'day')
);

export const isSelectedRestaurant = createSelector(
  selectedRestaurantIds, (state, props) => props.restaurant.id,
  (selectedIds, currentId) => selectedIds.includes(currentId)
);

export const orderedRestaurants = createSelector(
  selectedRestaurants, location, now, favoritedRestaurantIds,
  (restaurants, location, now, favorited) =>
  _.orderBy(
    restaurants.map(restaurant =>
      ({
        ...restaurant,
        distance: location ? haversine(location, restaurant) : undefined,
        isOpen: isOpen(restaurant.openingHours, now),
        favorited: favorited.includes(restaurant.id)
      })
    ),
    ['favorited', 'isOpen', 'distance'],
    ['desc', 'desc', 'asc']
  )
);

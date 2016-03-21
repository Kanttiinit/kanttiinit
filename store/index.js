'use strict';

import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import haversine from 'haversine';
import moment from 'moment';

import defaultState from './defaultState';

const getMenus = state => {
   const {days, restaurants, now, favorites, selectedFavorites, location} = state;
   if (days && restaurants && now && favorites) {
      // iterate through all days
      return days.map(day => (
         {
            date: day,
            // iterate through all restaurants for each day
            restaurants: sortedRestaurants(
               restaurants.map(restaurant => {
                  let favoriteCourses = 0;
                  // iterate through courses for the current day
                  const courses = (restaurant.Menus.find(m => day.isSame(m.date, 'day')) || {courses: []})
                  .courses.map(course => {
                     const isFavorite = checkIfFavorite(course.title, favorites, selectedFavorites);
                     isFavorite && favoriteCourses++;
                     return {...course, isFavorite};
                  });
                  return {
                     ...restaurant,
                     distance: location ? haversine(restaurant, location) * 1000 : undefined,
                     ...getOpeningHours(restaurant, day),
                     courses,
                     favoriteCourses
                  };
               }),
            now, day)
         }
      ));
   }
};

const sortedRestaurants = (restaurants, now, date) => {
   const isToday = moment().isSame(date, 'day');
   return restaurants.sort((a, b) => {
      // can this be written in a prettier way??
      if (!a.hours && b.hours) return 1;
      if (a.hours && !b.hours) return -1;
      if (!a.courses.length && b.courses.length) return 1;
      if (a.courses.length && !b.courses.length) return -1;
      if (isToday) {
         if (!a.isOpen && b.isOpen) return 1;
         if (a.isOpen && !b.isOpen) return -1;
      }
      if (!a.favoriteCourses && b.favoriteCourses) return 1;
      if (a.favoriteCourses && !b.favoriteCourses) return -1;
      if (a.distance > b.distance) return 1;
      if (a.distance < b.distance) return -1;
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;

      return 0;
   });
};

const getOpeningHours = (restaurant, date) => {
   const now = Number(moment().format('HHmm'));
   const hours = restaurant.openingHours[date.day() - 1];
   return {hours, isOpen: hours && now >= hours[0] && now < hours[1]};
};

const escapeRegExp = str => {
   return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
};

const checkIfFavorite = (title, favorites, selectedFavorites) => {
   if (title && selectedFavorites.length)
      return selectedFavorites
         .map(f => favorites.find(_ => _.id === f))
         .some(_ => title.match(new RegExp(_.regexp)));

   return false;
};

const updateMenu = state => {
   return {
      ...state,
      menus: getMenus(state)
   };
};

const reducer = (state = defaultState, action) => {
   switch (action.type) {
      case 'SHOW_MODAL':
         return {
            ...state,
            modal: {
               visible: true,
               component: action.component,
               style: action.style
            }
         };
      case 'DISMISS_MODAL':
         return {
            ...state,
            modal: {
               visible: false,
               component: undefined,
               style: state.modal.style
            }
         };
      case 'CHANGE_VIEW':
         return {...state, currentView: action.view, viewChanges: (state.viewChanges || 0) + 1};
      case 'SET_AREAS':
         return {...state, areas: action.areas};
      case 'SET_FAVORITES':
         return {...state, favorites: action.favorites};
      case 'SET_SELECTED_RESTAURANTS':
         return {...state, selectedRestaurants: action.restaurants};
      case 'SET_RESTAURANTS_LOADING':
         return {...state, restaurantsLoading: action.loading};

      // the following require an update of the restaurant list
      case 'UPDATE_NOW':
         return updateMenu({
            ...state,
            now: moment(),
            days: Array(7).fill(1).map((n, i) => moment().add(i, 'days'))
         });
      case 'SET_SELECTED_FAVORITES':
         return updateMenu({...state, selectedFavorites: action.favorites});
      case 'SET_LOCATION':
         return updateMenu({...state, location: action.location});
      case 'SET_RESTAURANTS':
         return updateMenu({...state, restaurants: action.restaurants, restaurantsLoading: false});
      default:
         return state;
   }
};

export default createStore(reducer, applyMiddleware(thunk));

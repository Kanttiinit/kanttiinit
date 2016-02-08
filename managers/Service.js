'use strict';

import {AsyncStorage} from 'react-native';
import haversine from 'haversine';
import moment from 'moment';
import HttpCache from './HttpCache';

const escapeRegExp = str => {
   return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

export default {
   // add distance property to this.data.restaurants if user location is defined
   updateRestaurantDistances(restaurants, location) {
      if (location && location.latitude && location.longitude) {
         return restaurants.map(r => {
            if (r.latitude && r.longitude)
               r.distance = haversine(location, r) * 1000;
            return r;
         });
      }

      return restaurants;
   },
   // return restaurants sorted by distance and favorite foods
   sortedRestaurants(restaurants, date) {
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
   },
   getOpeningHours(restaurant, date) {
      const now = Number(moment().format('HHmm'));
      const hours = restaurant.openingHours[date.day() - 1];
      return {hours, isOpen: hours && now >= hours[0] && now < hours[1]};
   },
   isFavorite(title, favorites) {
      if (title && favorites.length)
         return favorites.some(f => title.toLowerCase().match(escapeRegExp(f.name.toLowerCase())));

      return false;
   },
   formatRestaurants(restaurants, date, favorites) {
      return this.sortedRestaurants(restaurants.map(restaurant => {
         const coursesForDate = (restaurant.Menus.find(m => moment(m.date).isSame(date, 'day')) || {courses: []}).courses;
         const courses = coursesForDate.map(c => {
            c.favorite = this.isFavorite(c.title, favorites);
            return c;
         });
         const openingHours = this.getOpeningHours(restaurant, date);
         return {
            ...restaurant,
            hours: openingHours.hours,
            isOpen: openingHours.isOpen,
            courses,
            favoriteCourses: courses.reduce((sum, c) => sum + c.favorite && 1, 0)
         };
      }), date);
   }
};

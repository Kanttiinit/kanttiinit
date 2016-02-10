'use strict';

import React from 'react-native';
import {Provider} from 'react-redux';
import Router from './Router';

import store from './store';
import HttpCache from './store/HttpCache';
import storage from './store/storage';
import {setSelectedRestaurants, getAreas, setFavorites, getRestaurants, updateLocation} from './store/actions';

const {AppState} = React;

export default class Main extends React.Component {
   componentDidMount() {
      AppState.addEventListener('change', currentAppState => {
         if (currentAppState === 'active')
            this.updateTime();
      });

      storage.getList('selectedRestaurants').then(s => store.dispatch(setSelectedRestaurants(s)));
      storage.getList('storedFavorites').then(favorites => store.dispatch(setFavorites(favorites)));
      store.dispatch(getAreas());

      // update restaurants if selected restaurants have changed
      let previousSelected;
      store.subscribe(() => {
         const selected = store.getState().selectedRestaurants;
         if (selected !== previousSelected) {
            if (previousSelected)
               HttpCache.reset('menus');
            previousSelected = selected;
            store.dispatch(getRestaurants(selected));
         }
      });
      this.updateTime();
   }
   updateTime() {
      store.dispatch({type: 'UPDATE_NOW'});
      store.dispatch(updateLocation());
   }
   render() {
      return (
         <Provider store={store}>
            <Router />
         </Provider>
      );
   };
}

export default Main;
'use strict';

import {StyleSheet} from 'react-native';

export const colors = {
   accent: '#009688',
   accentLight: '#4DB6AC',
   accentDark: '#00796B',
   grey: '#BDBDBD',
   lightGrey: '#EEEEEE',
   white: '#FFFFFF',
   black: '#000000',
   darkGrey: '#424242',
   red: '#B71C1C'
};

export const defaultStyles = StyleSheet.create({
   card: {
      backgroundColor: colors.white,
      borderRadius: 4,
      elevation: 2,
      shadowColor: 'black',
      shadowOpacity: 0.2,
      shadowOffset: {width: 0, height: 2},
      shadowRadius: 3
   },
   lightBorderTop: {
      borderTopWidth: 1,
      borderTopColor: colors.lightGrey
   }
});

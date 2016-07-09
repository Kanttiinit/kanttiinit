import React from 'react';
import {connect} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
import {bindActionCreators} from 'redux';
import {View, Text} from 'react-native';

import {openModal} from '../store/actions/modal';
import {isSelectedRestaurant, isFavoritedRestaurant} from '../store/selectors';
import {setFavoritedRestaurants, updateSelectedRestaurants} from '../store/actions/restaurants';
import RestaurantDialog from './RestaurantDialog';
import Checkbox from './reusable/Checkbox';
import Button from './reusable/Button';

const Restaurant = ({restaurant, updateSelectedRestaurants, setFavoritedRestaurants, style, selected, favorited, openModal}) => (
   <View style={style}>
      <Button
         onPress={() => setFavoritedRestaurants([restaurant.id], !favorited)}
         style={{marginHorizontal: spaces.small}}>
         <Icon
            size={24}
            color={favorited ? colors.yellow : colors.grey}
            name={'md-star' + (!favorited ? '-outline' : '')} />
      </Button>
      <Button
         containerStyle={{flex: 1}}
         onPress={() => openModal(<RestaurantDialog restaurant={restaurant} />, {padding: 0})}>
         <Text style={{fontSize: 14, flex: 1}}>{restaurant.name}</Text>
      </Button>
      <Checkbox
         onCheckedChange={selected => updateSelectedRestaurants([restaurant.id], selected)}
         checked={selected} />
   </View>
);

const mapState = (state, props) => ({
   selected: isSelectedRestaurant(state, props),
   favorited: isFavoritedRestaurant(state, props)
});

const mapDispatch = dispatch => bindActionCreators({openModal, setFavoritedRestaurants, updateSelectedRestaurants}, dispatch);

export default connect(mapState, mapDispatch)(Restaurant);
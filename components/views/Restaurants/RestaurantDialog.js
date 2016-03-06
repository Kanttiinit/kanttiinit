'use strict';

import React from 'react-native';
import MapView from 'react-native-maps';
import geolib from 'geolib';
import Icon from 'react-native-vector-icons/Ionicons';
import moment from 'moment';
import haversine from 'haversine';

import {Restaurant} from '../Menu/Restaurant';
import Button from '../../Button';
import {colors} from '../../../style';
import {dismissModal} from '../../../store/actions';

import {connect} from 'react-redux';

const {
   Platform,
   Linking,
   Image,
   View,
   Text,
   StyleSheet
} = React;

const dayNumberToDayOfWeek = n => moment().day(n + 1).format('ddd').toUpperCase();

const formatOpeningHours = number => moment(number, 'HHmm').format('HH:mm');

const getOpeningHourString = hours =>
   hours.reduce((open, hour, i) => {
      if (hour) {
         const hourString = formatOpeningHours(hour[0]) + ' - ' + formatOpeningHours(hour[1]);
         const existingIndex = open.findIndex(_ => _.hourString === hourString);
         if (existingIndex > -1)
            open[existingIndex].endDay = dayNumberToDayOfWeek(i);
         else
            open.push({startDay: dayNumberToDayOfWeek(i), hourString});
      }
      return open;
   }, []);

class Marker extends React.Component {
   render() {
      const {color, children, style, coordinate, title, description} = this.props;
      return (
         <MapView.Marker
            title={title}
            anchor={{x: 0.5, y: 1}}
            centerOffset={{x: 0, y: -29 / 2}}
            description={description}
            coordinate={coordinate}>
            <View ref="container" style={{alignItems: 'center', opacity: 0.8, height: 29}}>
               <View style={[styles.markerViewText, {backgroundColor: color || colors.accent}, style]}>{children}</View>
               <Icon name="android-arrow-dropdown" size={20} style={{marginTop: -8}} color={color || colors.accent} />
            </View>
         </MapView.Marker>
      );
   }
}

class RestaurantDialog extends React.Component {
   render() {
      const {restaurant, location} = this.props;
      const center = location ? geolib.getCenter([restaurant, location]) : restaurant;
      return (
         <View>

            <MapView
               style={{height: 300, borderRadius: 2}}
               rotateEnabled={false}
               initialRegion={{
                  latitude: Number(center.latitude),
                  longitude: Number(center.longitude),
                  latitudeDelta: Math.max(2.5 * Math.abs(center.latitude - restaurant.latitude), 0.01),
                  longitudeDelta: Math.max(2.5 * Math.abs(center.longitude - restaurant.longitude), 0.01)
               }}>
               {location ?
               <Marker
                  coordinate={location}
                  title="Oma sijainti"
                  color={colors.accentLight}
                  style={{paddingHorizontal: 4}}>
                  <Icon name="android-person" color="white" size={20}/>
               </Marker>
               : null}
               <Marker
                  coordinate={{
                     latitude: restaurant.latitude,
                     longitude: restaurant.longitude
                  }}
                  color="#469cc6"
                  title={restaurant.name}
                  description={restaurant.address}
                  style={{paddingHorizontal: 6}}>
                  <Icon size={20} color="white" name="android-restaurant" />
               </Marker>
            </MapView>

            <View style={styles.container}>
               <View style={styles.header}>
                  <View style={{flex: 1}}>
                     <Text style={styles.title}>{restaurant.name}</Text>
                     <Text style={{marginTop: -2, color: colors.grey}}>{restaurant.address}</Text>
                  </View>
                  {location ?
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                     <Icon style={styles.distance} name="ios-location" />
                     <Text style={[styles.distance, {marginLeft: 3}]}>{Restaurant.formatDistance(haversine(location, restaurant) * 1000)}</Text>
                  </View>
                  : null}
               </View>
               <View>
                  {getOpeningHourString(restaurant.openingHours).map((_, i) =>
                  <View key={i} style={{flexDirection: 'row'}}>
                     <Text style={{fontWeight: '500', width: 64}}>{_.startDay + (_.endDay ? ' - ' + _.endDay : '')}</Text>
                     <Text style={{color: colors.darkGrey}}>{_.hourString}</Text>
                  </View>
                  )}
               </View>
               <View style={styles.footer}>
                  {restaurant.address ?
                  <Button
                     onPress={() =>
                        Platform.OS === 'ios' ?
                           Linking.canOpenURL("comgooglemaps://?daddr=" + encodeURIComponent(restaurant.address)).then(supported => {
                              return supported ? Linking.openURL("comgooglemaps://?daddr=" + encodeURIComponent(restaurant.address))
                              : Linking.openURL("http://maps.apple.com/?daddr=" + encodeURIComponent(restaurant.address))
                           }).catch(err => console.error('An error occurred', err))
                        : Linking.openURL("http://maps.google.com/?daddr=" + encodeURIComponent(restaurant.address))
                     }
                     style={styles.navButton}>
                     <Icon name="android-open" size={18} color={colors.accentLight} />
                     <Text style={{marginLeft: 6, color: colors.accentLight}}>Reittiohjeet</Text>
                  </Button>
                  : null}
                  <View style={{flex: 1}} />
                  <Button
                     onPress={() => this.props.dismissModal()}
                     style={styles.closeButton}>
                     <Text style={styles.closeButtonText}>SULJE</Text>
                  </Button>
               </View>
            </View>

         </View>
      );
   }
}

export default connect(
   state => ({
      location: state.location
   }),
   dispatch => ({
      dismissModal: () => dispatch(dismissModal())
   })
)(RestaurantDialog);

const styles = StyleSheet.create({
   container: {
      padding: 10
   },
   markerViewText: {
      padding: 2,
      borderRadius: 10
   },
   header: {
      flexDirection: 'row',
      marginBottom: 10
   },
   title: {
      fontSize: 22,
      fontWeight: '200'
   },
   distance: {
      fontSize: 16,
      color: '#bebebe'
   },
   footer: {
      alignItems: 'center',
      flex: 1,
      marginTop: 10,
      flexDirection: 'row'
   },
   navButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start'
   },
   closeButton: {
      alignSelf: 'flex-end',
      backgroundColor: colors.accent,
      borderRadius: 2,
      padding: 6
   },
   closeButtonText: {
      fontSize: 12,
      color: 'white',
      fontWeight: 'bold'
   }
});

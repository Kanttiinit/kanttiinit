'use strict';

import React from 'react-native';
import Menu from './views/Menu';
import Favourites from './views/Favourites';
const {
   AppRegistry,
   StyleSheet,
   Text,
   View,
   Navigator,
   TouchableHighlight
} = React;

class TabButton extends React.Component {
   render() {
      const {data, changeScene} = this.props;
      return (
         <TouchableHighlight onPress={changeScene.bind(this, data)}>
            <Text>{title}</Text>
         </TouchableHighlight>
      );
   }
}

class Kanttiinit extends React.Component {
   constructor() {
      super();
      this.state = {
         views: [
            {
               title: 'Menu',
               component: Menu
            },
            {
               title: 'Favourites',
               component: Favourites
            }
         ]
      };
   }
   changeScene(data) {
      this.refs.navigator.replace(data);
   },
   renderScene(route, navigator) {
      return React.createElement(route.component);
   }
   render() {
      return (
         <View style={styles.wrapper}>
            <Navigator
               ref="navigator"
               initialRoute={this.state.views[0]}
               renderScene={this.renderScene} />
            <View style={styles.tabBar}>
               {this.state.views.map(v => <TabButton changeScene={this.changeScene} key={v.title} data={v} />)}
            </View>
         </View>
      );
   }
};

const styles = StyleSheet.create({
   wrapper: {
      marginTop: 24,
      flex: 1
   },
   tabBar: {
      flexDirection: 'row'
   }
});

AppRegistry.registerComponent('kanttiinit', () => Kanttiinit);

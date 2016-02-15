'use strict';

import React from 'react-native';
import {connect} from 'react-redux';

import {dismissModal} from '../../../store/actions';
import Button from '../../Button';
import {colors} from '../../../style';

const {
   View,
   Text,
   TextInput,
   StyleSheet
} = React;

class FavoriteModal extends React.Component {
   constructor() {
      super();
      this.state = {};
   }
   render() {
      return (
         <View>
            <View style={styles.modalTitle}><Text style={styles.modalTitleText}>Uusi suosikki</Text></View>
            <TextInput
               clearButtonMode='while-editing'
               autoCapitalize='none'
               floatingLabelEnabled={true}
               onChangeText={text => this.setState({text})}
               style={styles.textField}
               placeholder="Avainsana" />
            <View style={{flexDirection: 'row', flex: 1}}>
               <Button
                  style={[styles.addButton, {backgroundColor: colors.red}]}
                  onPress={() => this.props.dismissModal()}>
                  <Text style={styles.addText}> PERUUTA </Text>
               </Button>
               <View style={{flex: 1}} />
               <Button
                  style={styles.addButton}
                  onPress={() => {
                     this.props.onSelect(this.state.text);
                     this.props.dismissModal();
                  }}>
                  <Text style={styles.addText}> LISÄÄ </Text>
               </Button>
            </View>
         </View>
      );
   }
};

const styles = StyleSheet.create({
   modalTitle: {
      marginBottom: 20
   },
   modalTitleText: {
      color: 'black',
      fontSize: 18
   },
   textField: {
      height: 36,
      paddingHorizontal: 8,
      marginBottom: 40,
      fontSize: 18,
      backgroundColor: colors.lightGrey,
      borderRadius: 4
   },
   addButton: {
      backgroundColor: colors.accent,
      alignSelf: 'flex-end',
      borderRadius: 2,
      padding: 6,
      elevation: 2
   },
   addText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 12
   }
});

export default connect(
   undefined,
   dispatch => ({
      dismissModal: () => dispatch(dismissModal())
   })
)(FavoriteModal);

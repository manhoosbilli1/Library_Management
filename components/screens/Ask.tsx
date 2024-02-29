import React from 'react';
import {SafeAreaView, View, StyleSheet, Alert} from 'react-native';
import Btns from '../Btns';

const Ask = ({navigation: _}) => {
  return (
    <SafeAreaView>
      <View style={styles.buttonContainer}>
        <Btns text={'Ask a question'} onclick={() => {}} />
      </View>
      <View style={styles.buttonContainer}>
        <Btns text={'Search book'} onclick={() => {}} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  buttonContainer: {
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50%',
    width: '100%',
  },
});

export default Ask;

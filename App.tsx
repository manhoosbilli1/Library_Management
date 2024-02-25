/* eslint-disable @typescript-eslint/no-unused-vars */
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';

import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Alert,
} from 'react-native';
import Btns from './components/Btns';

const searchBook = () => {
  Alert.alert('searching for book');
};

const askQuestion = () => {
  Alert.alert('Ask a question now');
};

function App(): React.JSX.Element {
  return (
    <NavigationContainer>
      <SafeAreaView>
        <View style={styles.buttonContainer}>
          <Btns text={'Ask a question'} onclick={askQuestion} />
        </View>
        <View style={styles.buttonContainer}>
          <Btns text={'Search book'} onclick={searchBook} />
        </View>
      </SafeAreaView>
    </NavigationContainer>
  );
}

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

export default App;

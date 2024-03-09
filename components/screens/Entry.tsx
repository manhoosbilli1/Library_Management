import React, {useState} from 'react';
import {PermissionsAndroid} from 'react-native';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Alert,
  TextInput,
  Text,
} from 'react-native';
import Btns from '../Btns';
import * as config from '../../android/app/google-services.json';
import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';
import firebase from '@react-native-firebase/app';

const firebaseConfig = {
  apiKey: config.client[0].api_key[0].current_key,
  authDomain: config.project_info.project_id + '.firebaseapp.com',
  databaseURL: 'https://' + config.project_info.project_id + '.firebaseio.com',
  projectId: config.project_info.project_id,
  storageBucket: config.project_info.storage_bucket,
  messagingSenderId: config.client[0].client_info.mobilesdk_app_id,
  appId: config.client[0].client_info.mobilesdk_app_id,
};

firebase.initializeApp(firebaseConfig);
const reference = database().ref('/');


const getBooks = async () => {
  try {
    const book = await firestore().collection('books').doc('1').get();
    if (book.data()?.book_name) {
      Alert.alert(book.data()!.book_name);
      console.log(book.data()!.book_name);
    } else {
      console.log('no book');
    }
  } catch (error) {
    console.log(error);
  }
};

const searchBook = () => {
  getBooks();
};

/**
 * Displays an alert indicating that a question is being searched for an answer.
 */
const askQuestion = () => {
  Alert.alert('Searching for answer...');
};

/**
 * Entry screen component.
 *
 * Renders a screen with a text input to search books,
 * and buttons to navigate to ask a question or search books.
 *
 * Manages local state for the search input text and result.
 */
const Entry = ({navigation}) => {
  reference.set({
    key1: 'value1',
    key2: 'value2',
  });
  const [searchResult, setSearchResult] = useState<string>('');
  const [searchInput, setSearchInput] = useState<string>('');

  return (
    <SafeAreaView>
      <View style={styles.buttonContainer}>
        <Btns text={'Ask a question'} onclick={askQuestion} />
        <TextInput
          style={styles.input}
          defaultValue="what is the most read book?..."
          onChangeText={text => setSearchInput(text)}
        />
        <Text style={styles.text}>{searchInput}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Btns text={'Search book'} onclick={searchBook} />
        <View style={styles.inputContainer}>
          <TextInput defaultValue="book_name" style={styles.input} />
          <TextInput defaultValue="Code" style={styles.input} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    height: 'auto',
    width: 'auto',
  },
  buttonContainer: {
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    height: 'auto',
    width: '100%',
  },
  input: {
    height: 40,
    width: '80%',
    borderWidth: 2,
    borderColor: 'black',
    margin: 10,
    color: 'black',
  },
  text: {
    color: 'darkred',
    fontWeight: 'bold',
    justifyContent: 'center',
    alignContent: 'center',
  },
});

export default Entry;

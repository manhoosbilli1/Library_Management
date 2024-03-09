import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  Alert,
  TextInput,
  Text,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
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

if (!firebase.apps.length) {
  // If not, initialize Firebase
  firebase.initializeApp(firebaseConfig);
}
const reference = database().ref('/');

const getBooks = async (documentId: string | undefined) => {
  try {
    if (!documentId) {
      console.log('Document ID is undefined');
      return;
    }

    const bookRef = firestore().collection('books').doc(documentId);
    const bookSnapshot = await bookRef.get();

    if (bookSnapshot.exists) {
      const bookData = bookSnapshot.data();
      Alert.alert(bookData?.Book_name);
      console.log(bookData?.Book_name);
    } else {
      console.log('No book found');
    }
  } catch (error) {
    console.log(error);
  }
};

const searchBookByCode = async (bookCode: string | undefined) => {
  try {
    if (!bookCode) {
      console.log('Book code is undefined');
      return;
    }

    const querySnapshot = await firestore().collection('books').doc(bookCode);

    if (!querySnapshot.empty) {
      const bookData = querySnapshot.data().get().Book_name;
      Alert.alert(
        'Book Details',
        `Name: ${bookData.Book_name}\nDescription: ${bookData.Book_description}`,
      );
    } else {
      console.log('Book not found');
      Alert.alert('Book not found');
    }
  } catch (error) {
    console.log('Firestore Query Error:', error);
  }
};

const searchBookByName = async bookName => {
  try {
    if (!bookName) {
      console.log('Book name is undefined');
      return;
    }

    const querySnapshot = await firestore().collection('books').get();

    if (!querySnapshot.empty) {
      const matchingBooks = [];

      querySnapshot.forEach(doc => {
        const bookData = doc.data();
        if (bookData.Book_name === bookName) {
          matchingBooks.push(bookData);
        }
      });

      if (matchingBooks.length > 0) {
        // Display book details in a popup
        matchingBooks.forEach(bookData => {
          Alert.alert('Book Details', `Name: ${bookData.Book_name}\n`);
        });
      } else {
        console.log('Book not found');
        Alert.alert('Book not found');
      }
    } else {
      console.log('No books in the collection');
      Alert.alert('No books in the collection');
    }
  } catch (error) {
    console.log('Firestore Query Error:', error);
  }
};

const Entry = () => {
  const [searchInput, setSearchInput] = useState('');
  const [bookName, setBookName] = useState('');
  const [bookCode, setBookCode] = useState('');
  function askQuestion(): void {
    throw new Error('Function not implemented.');
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.innerContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.buttonContainer}>
            <Btns text={'Ask a question'} onclick={askQuestion} />
            <TextInput
              style={styles.input}
              placeholder="What is the most read book?..."
              onChangeText={text => setSearchInput(text)}
            />
            <Text style={styles.text}>{searchInput}</Text>
          </View>
          <View style={styles.buttonContainer}>
            <Btns
              text={'Search book'}
              onclick={() => searchBookByName(bookName)}
            />

            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Enter book name"
                style={styles.input}
                onChangeText={text => setBookName(text)}
              />
              <TextInput
                placeholder="Enter book code"
                style={styles.input}
                onChangeText={text => setBookCode(text)}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    flex: 1,
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  input: {
    height: 40,
    width: '48%',
    borderWidth: 2,
    borderColor: 'black',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  text: {
    color: 'darkred',
    fontWeight: 'bold',
    marginTop: 10,
  },
});

export default Entry;

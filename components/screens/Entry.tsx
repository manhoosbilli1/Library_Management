import React, {useEffect, useState} from 'react';
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
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import * as config from '../../android/app/google-services.json';
import TTS from 'react-native-tts';

import {initializeApp} from 'firebase/app';
import {get, getDatabase, off, onValue} from 'firebase/database';

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import {ref, set} from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyBbpJof1GGL_3YUWB74Z3lpq-cy4QCasAw',
  authDomain: 'library-management-c5d17.firebaseapp.com',
  databaseURL: 'https://library-management-c5d17-default-rtdb.firebaseio.com',
  projectId: 'library-management-c5d17',
  storageBucket: 'library-management-c5d17.appspot.com',
  messagingSenderId: '779945767679',
  appId: '1:779945767679:web:7f717af098a3a41e5652ca',
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const database = getDatabase(app);

const getBooks = async (documentId: string) => {
  try {
    if (!documentId) {
      console.log('Document ID is undefined');
      return;
    }

    const bookRef = doc(firestore, 'books', documentId);
    const bookSnapshot = await getDoc(bookRef);

    if (bookSnapshot.exists()) {
      const bookData = bookSnapshot.data();
      console.log(bookData?.Book_name);
    } else {
      console.log('No book found');
    }
  } catch (error) {
    console.error('Error fetching book: ', error);
  }
};

const searchBookByName = async (bookName: string) => {
  try {
    if (!bookName) {
      console.log('Book name is undefined');
      return;
    }

    // Define the reference to the 'books' collection and create a query
    const booksRef = collection(firestore, 'books');
    const q = query(booksRef, where('Book_name', '==', bookName));

    // Execute the query
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const matchingBooks = querySnapshot.docs.map(doc => {
        const bookData = doc.data();
        return {
          ...bookData,
          id: doc.id, // Include document ID in the result
        };
      });

      // Display book details in a popup
      matchingBooks.forEach(async bookData => {
        Alert.alert(
          'Book Details',
          `Name: ${bookData.Book_name}\n\nBook Description: ${bookData.Book_description}\n`,
        );
        console.log('Book Code is', bookData.Book_QR_code);
        await set(ref(database, '/test/code'), bookData.Book_QR_code);
        console.log(
          'Book Details',
          `Name: ${bookData.Book_name}, Description: ${bookData.Book_description}`,
        );
      });
    } else {
      console.log('Book not found');
      Alert.alert('Book not found');
    }
  } catch (error) {
    console.error('Firestore Query Error:', error);
    Alert.alert(
      'Error',
      'An error occurred while searching for the book by name.',
    );
  }
};

const searchBookByCode = async (bookCode: string) => {
  try {
    console.log('Searching for book with code:', bookCode);

    if (!bookCode) {
      console.log('Book code is undefined');
      return;
    }

    // Firestore query to find the book by QR code
    const booksRef = collection(firestore, 'books');
    const q = query(
      booksRef,
      where('Book_QR_code', '==', parseInt(bookCode, 10)),
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Assuming only one book matches the QR code for simplicity
      const bookData = querySnapshot.docs[0].data();

      // Realtime Database update with the found book's QR code
      try {
        const lastSearchedBookCodeRef = ref(database, '/test/code');
        await set(lastSearchedBookCodeRef, bookData.Book_QR_code);
        console.log('Updated last searched book code in Realtime Database');
      } catch (error) {
        console.error('Error updating Realtime Database:', error);
      }

      // Log and alert book details
      console.log(
        'Book Details',
        `Name: ${bookData.Book_name}, Description: ${bookData.Book_description}`,
      );
      Alert.alert(
        'Book Details',
        `Name: ${bookData.Book_name}\nDescription: ${bookData.Book_description}`,
      );
    } else {
      console.log('Book not found');
      Alert.alert('Book not found');
    }
  } catch (error) {
    console.error('Error searching book by code:', error);
    Alert.alert('Error occurred while searching for book by code');
  }
};

const Entry = () => {
  const [bookName, setBookName] = useState('');
  const [bookCode, setBookCode] = useState('');
  const [isBookNameChecked, setIsBookNameChecked] = useState(false);
  const [isBookCodeChecked, setIsBookCodeChecked] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isSearching, setIsSearching] = useState(false); // New state to manage search status

  const startListeningForArduinoSuccess = () => {
    setIsSearching(true); // Indicate search start
    const statusRef = ref(database, '/test/fromArduino/status');

    // Listen for changes in the 'status' node
    const statusListener = onValue(statusRef, async snapshot => {
      const status = snapshot.val();
      console.log(`Arduino status: ${status}`);

      if (status === 'success') {
        setIsSearching(false); // Indicate search end
        Alert.alert('Found!', 'Book is now Found');

        // Fetch additional book details from '/test/fromArduino/contents'
        const contentsRef = ref(database, '/test/fromArduino/content');
        await get(contentsRef)
          .then(contentsSnapshot => {
            if (contentsSnapshot.exists()) {
              const contents = contentsSnapshot.val();
              const bookDetailsMessage = `Book Found! \n\nBook Name: ${contents.name}\nBook Code: ${contents.code}\nBook Section: ${contents.section}\nBook Column: ${contents.column}\nBook Expected Section: ${contents.expectedSection}\n`;
              Alert.alert('Success', bookDetailsMessage);
            }
          })
          .catch(error => {
            console.error('Error fetching book details: ', error);
          });

        // Optionally, reset the status in Firebase to allow new searches
        set(statusRef, 'idle'); // Reset the status
      }
    });

    // Return a function to unsubscribe from the listener when no longer needed
    return () => off(statusRef, 'value', statusListener);
  };
  const predefinedQuestions = [
    {
      question: 'Book borrowing rules',
      answer: `Borrowing Availability:
        Borrowing is available during all working days using the national ID card and university ID card.
        Borrower's Responsibility:
        The borrower is fully responsible for the safety of the borrowed books and must keep them in perfect condition until they are returned to the library.
        Book Renewal:
        • Renewal of any book is not allowed if it is requested by one or more individuals. Priority is given to the borrower who requested the book first.
        • New books are not loaned to borrowers if they have overdue books.
        • Books can be renewed after being returned if there are no requests for them by contacting the library through the phone number 1234567890 or by visiting the library in person.
        Borrowing Period:
        The borrowing period for books is two weeks from the date of borrowing.
        Maximum Number of books:
        Borrowers are allowed to borrow a maximum of five books at a time.
        Late Return Fines:
        In case the borrowing period expires without returning the materials or renewing, a fine of 2 Riyals per material will be applied for each day of delay.
        Damaged or Lost Materials:
        • If the material is damaged or the delay exceeds 60 days, the material will be considered lost.
        • The borrower will be required to pay the value of the material, the fine for the delay, and a 30 Riyal technical operations fee.`,
    },
    {
      question: 'Working hours',
      answer: `Sunday to Thursday:
        • Opening Time: 8:00 AM
        • Closing Time: 9:00 PM
        Friday:
        • Closed
        Saturday:
        • Opening Time: 4:00 PM
        • Closing Time: 9:00 PM`,
    },
    {
      question: 'Internet password',
      answer: 'Password is 123RMS',
    },
  ];

  const handleSearch = () => {
    if ((isBookNameChecked || isBookCodeChecked) && !isSearching) {
      // Activate the listener only when the search is triggered
      startListeningForArduinoSuccess();

      if (isBookNameChecked) {
        searchBookByName(bookName);
      } else if (isBookCodeChecked) {
        searchBookByCode(bookCode);
      }
    } else if (isSearching) {
      Alert.alert(
        'Search in progress',
        'Please wait until the current search is complete.',
      );
    } else {
      Alert.alert('Please select a search criteria');
    }
  };

  const handleAskQuestion = (question: string) => {
    const selectedQuestion = predefinedQuestions.find(
      q => q.question === question,
    );
    if (selectedQuestion) {
      Alert.alert(selectedQuestion.question, selectedQuestion.answer);
      TTS.speak(selectedQuestion.answer);
    } else {
      Alert.alert('Question not found');
    }
  };

  const handleQuestion = () => {
    // Convert the input question to lowercase for case-insensitive matching
    const lowerCaseQuestion = question.toLowerCase();

    // Predefined keywords and their corresponding answers
    const keywordAnswerShort: {[key: string]: string} = {
      rule: 'Books can be borrowed for two weeks with a maximum of five books per borrower.',
      timing: 'The library is open from 8:00 AM to 9:00 PM.',
      time: 'The library is open from 8:00 AM to 9:00 PM.',
      password: 'The Internet password is 123RMS',
      pass: 'The Internet password is 123RMS',
    };
    const keywordAnswers: {[key: string]: string} = {
      rule: `Borrowing Availability:
        Borrowing is available during all working days using the national ID card and university ID card.
        Borrower's Responsibility:
        The borrower is fully responsible for the safety of the borrowed books and must keep them in perfect condition until they are returned to the library.
        Book Renewal:
        • Renewal of any book is not allowed if it is requested by one or more individuals. Priority is given to the borrower who requested the book first.
        • New books are not loaned to borrowers if they have overdue books.
        • Books can be renewed after being returned if there are no requests for them by contacting the library through the phone number 1234567890 or by visiting the library in person.
        Borrowing Period:
        The borrowing period for books is two weeks from the date of borrowing.
        Maximum Number of books:
        Borrowers are allowed to borrow a maximum of five books at a time.
        Late Return Fines:
        In case the borrowing period expires without returning the materials or renewing, a fine of 2 Riyals per material will be applied for each day of delay.
        Damaged or Lost Materials:
        • If the material is damaged or the delay exceeds 60 days, the material will be considered lost.
        • The borrower will be required to pay the value of the material, the fine for the delay, and a 30 Riyal technical operations fee.`,
      timing: `Sunday to Thursday:
        • Opening Time: 8:00 AM
        • Closing Time: 9:00 PM
        Friday:
        • Closed
        Saturday:
        • Opening Time: 4:00 PM
        • Closing Time: 9:00 PM`,
      time: `Sunday to Thursday:
        • Opening Time: 8:00 AM
        • Closing Time: 9:00 PM
        Friday:
        • Closed
        Saturday:
        • Opening Time: 4:00 PM
        • Closing Time: 9:00 PM`,
      password: 'The Internet password is 123RMS',
    };

    // Check if the question contains predefined keywords
    const matchingKeywords = Object.keys(keywordAnswers).filter(keyword =>
      lowerCaseQuestion.includes(keyword),
    );
    console.log('Matching Keywords:', matchingKeywords); // Debugging statement

    // If matching keywords are found, set the corresponding answer
    if (matchingKeywords.length > 0) {
      const matchingKeyword = matchingKeywords[0]; // Assume only one matching keyword for simplicity
      const fullAnswer = keywordAnswers[matchingKeyword];
      const shortAnswer = keywordAnswerShort[matchingKeyword];
      setAnswer(fullAnswer);
      TTS.speak(shortAnswer || fullAnswer);
      Alert.alert(matchingKeyword, fullAnswer);
    } else {
      setAnswer("Sorry, I couldn't find an answer to your question.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          style={styles.innerContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.roundButton2}
              onPress={() => handleSearch()}
              disabled={isSearching}>
              {isSearching ? (
                <ActivityIndicator size="small" color="#0000ff" />
              ) : (
                <Text style={styles.text}>Search book</Text>
              )}
            </TouchableOpacity>
            <View style={styles.inputContainer}>
              <View style={styles.checkboxContainer}>
                <CheckBox
                  value={isBookNameChecked}
                  onValueChange={newValue => {
                    setIsBookNameChecked(newValue);
                    setIsBookCodeChecked(false);
                  }}
                />
                <Text style={styles.checkboxLabel}>Search by Name</Text>
              </View>
              <View style={styles.checkboxContainer}>
                <CheckBox
                  value={isBookCodeChecked}
                  onValueChange={newValue => {
                    setIsBookCodeChecked(newValue);
                    setIsBookNameChecked(false);
                  }}
                />
                <Text style={styles.checkboxLabel}>Search by Book Code</Text>
              </View>
            </View>
            <TextInput
              placeholder="Enter book name"
              style={styles.input}
              onChangeText={text => setBookName(text)}
              editable={!isBookCodeChecked}
            />
            <TextInput
              placeholder="Enter book code"
              style={styles.input}
              onChangeText={text => setBookCode(text)}
              editable={!isBookNameChecked}
            />
            <View style={styles.userQuestionContainer}>
              <TextInput
                placeholder="Enter your question"
                style={styles.input}
                onChangeText={text => setQuestion(text)}
              />
              <TouchableOpacity
                style={styles.roundButton}
                onPress={() => handleQuestion()}>
                <Text style={styles.text}>Ask Question</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.questionContainer}>
            <Text style={styles.questionLabel}>Predefined Questions:</Text>
            {predefinedQuestions.map(question => (
              <TouchableOpacity
                key={question.question}
                style={styles.questionButton}
                onPress={() => handleAskQuestion(question.question)}>
                <Text>{question.question}</Text>
              </TouchableOpacity>
            ))}
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
    width: '100%',
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
    marginBottom: 10,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    marginLeft: 8,
  },
  input: {
    height: 40,
    width: '100%',
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
  roundButton2: {
    marginTop: 20,
    width: 150,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'lightgray',
  },
  roundButton: {
    marginTop: 10,
    width: 150,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'lightgray',
  },
  questionContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
  questionLabel: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  questionButton: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 5,
  },
  userQuestionContainer: {
    marginTop: 20,
    width: '100%',
    alignItems: 'center',
  },
});

export default Entry;

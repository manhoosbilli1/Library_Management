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

//TODO: TImeout fix

const Entry = () => {
  const [bookName, setBookName] = useState('');
  const [bookCode, setBookCode] = useState('');
  const [isBookNameChecked, setIsBookNameChecked] = useState(false);
  const [isBookCodeChecked, setIsBookCodeChecked] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isSearching, setIsSearching] = useState(false); // New state to manage search status
  const searchTimeout = 5 * 1000; // Timeout in milliseconds (e.g., 30000ms is 30 seconds)
  const [allBooks, setAllBooks] = useState([]);
  useEffect(() => {
    const fetchAllBooks = async () => {
      try {
        const booksRef = collection(firestore, 'books');
        const querySnapshot = await getDocs(booksRef);
        const books = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAllBooks(books);
        Alert.alert(
          'Data Loaded',
          'Books have been successfully loaded from the database.',
        );
      } catch (error) {
        console.error('Error fetching books from Firestore:', error);
      }
    };

    fetchAllBooks();
  }, []);

  const normalizeText = text => text.toLowerCase().replace(/\s+/g, '');

  const searchBookByName = async bookName => {
    const normalizedSearchTerm = normalizeText(bookName);
    const foundBook = allBooks.find(book =>
      normalizeText(book.Book_name).includes(normalizedSearchTerm),
    );

    if (foundBook) {
      await set(ref(database, '/test/code'), foundBook.Book_QR_code);
      Alert.alert(
        'Search Successful',
        `The book "${foundBook.Book_name}" is available in the database.`,
      );
      return foundBook;
    }
    Alert.alert('Search Failed', 'No matching book found.');
    return null;
  };
  const searchBookByCode = async bookCode => {
    const parsedCode = parseInt(bookCode, 10);
    const foundBook = allBooks.find(book => book.Book_QR_code === parsedCode);
    if (foundBook) {
      await set(ref(database, '/test/code'), foundBook.Book_QR_code);
      return foundBook;
    }
    return null;
  };

  const startListeningForArduinoSuccess = bookDetails => {
    setIsSearching(true);
    const statusRef = ref(database, '/test/fromArduino/status');

    const timeoutId = setTimeout(() => {
      setIsSearching(false);
      Alert.alert('Timeout', 'The search for the book has timed out.');
      set(statusRef, 'idle');
    }, 5000); // Change this value as needed

    const statusListener = onValue(statusRef, async snapshot => {
      const status = snapshot.val();
      clearTimeout(timeoutId);

      if (status === 'success') {
        setIsSearching(false);
        TTS.speak('Book Found!');
        const contentsRef = ref(database, '/test/fromArduino/content');
        const contentsSnapshot = await get(contentsRef);

        if (contentsSnapshot.exists()) {
          const contents = contentsSnapshot.val();
          const bookDetailsMessage = `Book Found! \n\nBook Name: ${bookDetails.Book_name}\nBook Code: ${bookDetails.Book_QR_code}\nBook Found at Section: ${contents.section}\nBook Column: ${contents.column}\nBook Expected Section: ${bookDetails.Book_section}\n`;
          Alert.alert('Success', bookDetailsMessage);
        }
        set(statusRef, 'idle');
      } else if (status === 'failed') {
        setIsSearching(false);
        Alert.alert(
          'Book not here',
          "The robot searched for the book but it wasn't found.",
        );
        set(statusRef, 'idle');
      }
    });

    return () => {
      clearTimeout(timeoutId);
      off(statusRef, 'value', statusListener);
    };
  };

  const handleSearch = async () => {
    if (!isBookNameChecked && !isBookCodeChecked) {
      Alert.alert(
        'Search Criteria Missing',
        'Please select a search criterion (by name or by code).',
      );
      return;
    }

    setIsSearching(true);
    let bookDetails = null;

    if (isBookNameChecked) {
      bookDetails = await searchBookByName(bookName.trim());
    } else if (isBookCodeChecked) {
      bookDetails = await searchBookByCode(bookCode.trim());
    }

    if (bookDetails) {
      Alert.alert('Search Successful', 'Please wait while we locate the book.');
      startListeningForArduinoSuccess(bookDetails);
    } else {
      setIsSearching(false);
      Alert.alert(
        'Book Not Found',
        'The book could not be found. Please try again.',
      );
    }
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
      answerShort: 'Books should be returned within 2 weeks of borrowing',
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
      answerShort: 'working hours are 8:00 AM to 9:00 PM',
    },
    {
      question: 'Internet password',
      answer: 'Password is 123RMS',
      answerShort: 'password is 123RMS',
    },
  ];

  const handleAskQuestion = (question: string) => {
    const selectedQuestion = predefinedQuestions.find(
      q => q.question === question,
    );
    if (selectedQuestion) {
      Alert.alert(selectedQuestion.question, selectedQuestion.answer);
      TTS.speak(selectedQuestion.answerShort);
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
                <ActivityIndicator size="small" color="#4285F4" />
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

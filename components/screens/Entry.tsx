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
  TouchableOpacity,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import * as config from '../../android/app/google-services.json';
import firestore from '@react-native-firebase/firestore';
import database from '@react-native-firebase/database';
import firebase from '@react-native-firebase/app';
import TTS from 'react-native-tts';

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

const searchBookByName = async (bookName: string) => {
  try {
    if (!bookName) {
      console.log('Book name is undefined');
      return;
    }

    const querySnapshot = await firestore()
      .collection('books')
      .where('Book_name', '==', bookName)
      .get();

    if (!querySnapshot.empty) {
      const matchingBooks = querySnapshot.docs.map(doc => doc.data());

      if (matchingBooks.length > 0) {
        // Display book details in a popup
        matchingBooks.forEach(bookData => {
          Alert.alert(
            'Book Details',
            `Name: ${bookData.Book_name}\n\n\n\nBook Description: ${bookData.Book_description}\n`,
          );
          console.log('Book Details', `Name: ${bookData.Book_description}\n`);
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
const searchBookByCode = async (bookCode: string) => {
  try {
    console.log('Searching for book with code:', bookCode); // Log bookCode for debugging

    if (!bookCode) {
      console.log('Book code is undefined or not a number');
      return;
    }

    const querySnapshot = await firestore().collection('books').get();

    const matchingBooks = querySnapshot.docs
      .map(doc => doc.data())
      .filter(bookData => bookData.Book_QR_code === parseInt(bookCode, 10));

    if (matchingBooks.length > 0) {
      // Display book details in a popup
      matchingBooks.forEach(bookData => {
        Alert.alert(
          'Book Details',
          `Name: ${bookData.Book_name}\n\n\n\nBook Description: ${bookData.Book_description}\n`,
        );
        console.log('Book Details', `Name: ${bookData.Book_description}\n`);
      });
    } else {
      console.log('Book not found');
      Alert.alert('Book not found');
    }
  } catch (error) {
    console.log('Firestore Query Error:', error);
    Alert.alert('Error occurred while searching for book by code');
  }
};

const Entry = () => {
  const [searchInput, setSearchInput] = useState('');
  const [bookName, setBookName] = useState('');
  const [bookCode, setBookCode] = useState('');
  const [isBookNameChecked, setIsBookNameChecked] = useState(false);
  const [isBookCodeChecked, setIsBookCodeChecked] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);

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
    if (isBookNameChecked) {
      searchBookByName(bookName);
    } else if (isBookCodeChecked) {
      searchBookByCode(bookCode);
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
    } else {
      Alert.alert('Question not found');
    }
  };

  const handleQuestion = () => {
    // Convert the input question to lowercase for case-insensitive matching
    const lowerCaseQuestion = question.toLowerCase();

    // Predefined keywords and their corresponding answers
    const keywordAnswerShort = {
      rule: 'Books can be borrowed for two weeks with a maximum of five books per borrower.',
      timing: 'The library is open from 8:00 AM to 9:00 PM.',
      time: 'The library is open from 8:00 AM to 9:00 PM.',
      password: 'The Internet password is 123RMS',
      pass: 'The Internet password is 123RMS',
    };
    const keywordAnswers = {
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
              onPress={() => handleSearch()}>
              <Text style={styles.text}>Search book</Text>
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

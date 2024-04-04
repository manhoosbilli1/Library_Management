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

export {predefinedQuestions, keywordAnswerShort, keywordAnswers};

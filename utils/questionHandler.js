const handleAskQuestion = (question: string) => {
  const selectedQuestion = predefinedQuestions.find(
    q => q.question === question,
  );
  if (selectedQuestion) {
    return selectedQuestion.question, selectedQuestion.answer);
  } else {
    Alert.alert('Question not found');
  }
};

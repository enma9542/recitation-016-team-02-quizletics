const data = '<%= JSON.stringify(data) %>';
const questionsRemainingEl = document.getElementById('questionsRemaining');
const currentScoreEl = document.getElementById('currentScore');
let currentQuestionIndex = 0;
let correctAnswers = 0;
  
  function answerQuestion(questionId, selectedAnswer) {
    const currentQuestion = document.querySelector(`[data-question-id="${questionId}"]`);
    const isCorrect = selectedAnswer === data[currentQuestionIndex].correctAnswer;
    
    if (isCorrect) {
      correctAnswers++;
      currentScoreEl.innerText = correctAnswers;
    }
    
    currentQuestion.classList.add('answered');
    
    setTimeout(() => {
      currentQuestionIndex++;
      if (currentQuestionIndex < data.length) {
        const nextQuestion = document.querySelector(`[data-question-id="${data[currentQuestionIndex].id}"]`);
        nextQuestion.classList.remove('hidden');
        questionsRemainingEl.innerText = data.length - currentQuestionIndex;
      } else {
        // No more questions
        const quizEl = document.getElementById('quiz');
        quizEl.innerHTML = `
          <h2>Quiz complete!</h2>
          <p>You scored ${correctAnswers} out of ${data.length}</p>
        `;
      }
    }, 1000);
}
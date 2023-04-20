

// axios.get('https://the-trivia-api.com/v2/questions?limit=5&categories=history&difficulties=easy')
//   .then(response => {
//     const questions = response.data;
//     console.log(questions);


    // const questions = JSON.parse('<%- JSON.stringify(data) %>');


    module.exports = function(data) {
        // Use the data variable here
        console.log(data);
      }
    
    let score = 0;
    let currentQuestionIndex = 0;

    const questionText = document.getElementById('question-text');
    const answerOptions = document.getElementById('answer-options');
    const answerButtons = answerOptions.getElementsByClassName('answer-btn');
    const scoreText = document.getElementById('score');
    const nextButton = document.getElementById('next-btn');

    function showQuestion() {
      const currentQuestion = questions[currentQuestionIndex];
      questionText.textContent = currentQuestion.question.text;
      answerButtons[0].textContent = currentQuestion.correctAnswer;
      answerButtons[1].textContent = currentQuestion.incorrectAnswers[0];
      answerButtons[2].textContent = currentQuestion.incorrectAnswers[1];
      answerButtons[3].textContent = currentQuestion.incorrectAnswers[2];
    }

    function checkAnswer(event) {
      const selectedAnswer = event.target.textContent;
      const currentQuestion = questions[currentQuestionIndex];

      if (selectedAnswer === currentQuestion.correctAnswer) {
        score++;
        scoreText.textContent = `Score: ${score}`;
      }

      currentQuestionIndex++;
      if (currentQuestionIndex < questions.length) {
        showQuestion();
      } else {
        // quiz is over
      }
    }

    for (let i = 0; i < answerButtons.length; i++) {
      answerButtons[i].addEventListener('click', checkAnswer);
    }

    nextButton.addEventListener('click', showQuestion);

    showQuestion();
  //})
//   .catch(error => {
//     console.error(error);
//   });

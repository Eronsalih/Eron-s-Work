const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const nextBtn = document.getElementById("next-btn");
const scoreEl = document.getElementById("score");

let currentQuestionIndex = 0;
let score = 0;
let questions = [];

// Fetch questions from Open Trivia API
async function fetchQuestions() {
  const res = await fetch("https://opentdb.com/api.php?amount=5&type=multiple");
  const data = await res.json();
  questions = data.results.map((q) => formatQuestion(q));
  showQuestion();
}

function formatQuestion(q) {
  let answers = [...q.incorrect_answers];
  let randomIndex = Math.floor(Math.random() * (answers.length + 1));
  answers.splice(randomIndex, 0, q.correct_answer);

  return {
    question: q.question,
    correct: q.correct_answer,
    answers,
  };
}

function showQuestion() {
  resetState();
  let current = questions[currentQuestionIndex];
  questionEl.innerHTML = current.question;

  current.answers.forEach((answer) => {
    const btn = document.createElement("button");
    btn.innerHTML = answer;
    btn.addEventListener("click", () => selectAnswer(btn, current.correct));
    answersEl.appendChild(btn);
  });
}

function resetState() {
  nextBtn.disabled = true;
  answersEl.innerHTML = "";
}

function selectAnswer(button, correctAnswer) {
  const allBtns = answersEl.querySelectorAll("button");
  allBtns.forEach((b) => {
    if (b.innerHTML === correctAnswer) {
      b.classList.add("correct");
    } else if (b === button) {
      b.classList.add("wrong");
    }
    b.disabled = true;
  });

  if (button.innerHTML === correctAnswer) {
    score++;
    scoreEl.textContent = `Score: ${score}`;
  }

  nextBtn.disabled = false;
}

nextBtn.addEventListener("click", () => {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    endQuiz();
  }
});

function endQuiz() {
  questionEl.innerHTML = `🎉 Game Over! Your score: ${score}/${questions.length}`;
  answersEl.innerHTML = "";
  nextBtn.style.display = "none";
}

fetchQuestions();

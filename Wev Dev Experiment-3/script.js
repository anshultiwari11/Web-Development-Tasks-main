const quizData = [
  {
    question: "Which language adds interactivity to a website?",
    options: ["Java", "C", "JavaScript", "SQL"],
    answer: 2,
  },
  {
    question: "Which language is used for styling web pages?",
    options: ["HTML", "CSS", "Python", "Java"],
    answer: 1,
  },
  {
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "High Transfer Machine Language",
      "Hyper Tool Multi Language",
      "Home Text Machine Language",
    ],
    answer: 0,
  },
];

let currentQuestion = 0;
let score = 0;
let selected = null;

const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const nextBtn = document.getElementById("next-btn");
const resultBox = document.getElementById("result-box");
const scoreEl = document.getElementById("score");
const messageEl = document.getElementById("message");
const restartBtn = document.getElementById("restart-btn");

function loadQuestion() {
  const q = quizData[currentQuestion];
  questionEl.textContent = q.question;
  optionsEl.innerHTML = "";
  selected = null;

  q.options.forEach((opt, index) => {
    const btn = document.createElement("button");
    btn.textContent = opt;

    btn.onclick = () => {
      selected = index;

      // remove previous selection highlight
      document
        .querySelectorAll("#options button")
        .forEach((b) => (b.style.background = "#2c2c2c"));

      // highlight selected
      btn.style.background = "#4caf50";
    };

    optionsEl.appendChild(btn);
  });
}

nextBtn.onclick = () => {
  if (selected === null) return;

  if (selected === quizData[currentQuestion].answer) {
    score++;
  }

  currentQuestion++;

  if (currentQuestion < quizData.length) {
    loadQuestion();
  } else {
    showResult();
  }
};

function showResult() {
  document.getElementById("question-box").classList.add("hidden");
  resultBox.classList.remove("hidden");

  scoreEl.textContent = `Your Score: ${score}/${quizData.length}`;

  if (score === quizData.length) messageEl.textContent = "Excellent!";
  else if (score >= quizData.length / 2) messageEl.textContent = "Good Job!";
  else messageEl.textContent = "Try Again!";
}

restartBtn.onclick = () => {
  currentQuestion = 0;
  score = 0;
  resultBox.classList.add("hidden");
  document.getElementById("question-box").classList.remove("hidden");
  loadQuestion();
};

// start quiz
loadQuestion();

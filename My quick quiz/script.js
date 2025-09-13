const start_btn = document.querySelector(".start_btn");
const info_box = document.querySelector(".info_box");
const continue_btn = document.querySelector(".continue_btn");
const quiz_box = document.querySelector(".quiz_box");

start_btn.addEventListener("click", () => {
  info_box.classList.add("activeInfo");
  start_btn.classList.add("hide");
});
continue_btn.addEventListener("click", () => {
  info_box.classList.remove("activeInfo");
  continue_btn.classList.add("activeQuiz");
  // Here you can add code to start the quiz
});

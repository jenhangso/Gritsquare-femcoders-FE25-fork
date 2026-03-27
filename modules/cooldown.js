const form = document.getElementById("msgForm");
const submitBtn = form.querySelector('#submitBtn');

form.addEventListener("submit", () => {
  submitBtn.disabled = true;

  let timeLeft = 10;
  submitBtn.textContent = `wait ${timeLeft}`;

  const countdown = setInterval(() => {
    timeLeft--;

    if (timeLeft > 0) {
    submitBtn.textContent = `wait ${timeLeft}`;
    } else {
      clearInterval(countdown);
      submitBtn.disabled = false;
      submitBtn.textContent = "Send";
    }
  }, 1000);
});

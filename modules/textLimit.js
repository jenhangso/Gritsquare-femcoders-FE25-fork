const input = document.getElementById("messageInput");
const counter = document.getElementById("counter");
const maxLength = 200;

input.addEventListener("input", () => {
  if (input.value.length > maxLength) {
    input.value = input.value.slice(0, maxLength);
  }

  counter.textContent = `${input.value.length}/${maxLength}`;
});

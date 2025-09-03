document.addEventListener("DOMContentLoaded", function () {
  const aboutBox = document.getElementById("about-listing");
  const toggleBtn = document.getElementById("toggle-about");

  // Hide button if text is already short
  if (aboutBox.scrollHeight <= aboutBox.clientHeight + 10) {
    toggleBtn.style.display = "none";
  }

  toggleBtn.addEventListener("click", function () {
    aboutBox.classList.toggle("expanded");

    if (aboutBox.classList.contains("expanded")) {
      toggleBtn.textContent = "Show less";
    } else {
      toggleBtn.textContent = "Show more";
    }
  });
});


document.addEventListener("DOMContentLoaded", function () {
  const textArea = document.getElementById("lectureText");
  const outputDiv = document.getElementById("quizOutput");
  const generateBtn = document.getElementById("generateBtn");

  if (!textArea || !outputDiv || !generateBtn) {
    console.error("Missing HTML elements");
    return;
  }

  generateBtn.addEventListener("click", async function () {
    const text = textArea.value.trim();

    if (!text) {
      outputDiv.textContent = "Please enter some text first";
      return;
    }

    outputDiv.textContent = "Generating questions...";

    try {
      const response = await fetch("https://paste-to-quiz.onrender.com/generate-mcq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      const questions = data.content; // 🔧 matches backend’s response
      outputDiv.innerHTML = `<pre>${questions}</pre>`;

    } catch (error) {
      console.error("❌ Error:", error);
      outputDiv.textContent = `Error: ${error.message}`;
    }
  });
});

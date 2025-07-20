document.addEventListener("DOMContentLoaded", function () {
  const textArea = document.getElementById("lectureText");
  const outputDiv = document.getElementById("quizOutput");
  const generateBtn = document.getElementById("generateBtn");

  generateBtn.addEventListener("click", async function () {
    const text = textArea.value.trim();
    
    if (!text) {
      outputDiv.innerHTML = `
        <div class="question-block" style="color: #ff6b6b">
          Please paste some lecture content first
        </div>`;
      return;
    }

    outputDiv.innerHTML = `
      <div class="question-block loading">
        Generating questions...
        <div class="spinner"></div>
      </div>`;
    
    generateBtn.disabled = true;
    generateBtn.style.opacity = "0.7";

    try {
      const response = await fetch("https://paste-to-quiz.onrender.com/generate-mcq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      });

      const data = await response.json();

      if (!data.success || !data.questions) {
        throw new Error(data.error || "Failed to generate questions");
      }

      // Format questions with proper styling
      const questionsHTML = data.questions
        .split('\n\n')
        .map(q => `
          <div class="question-block">
            ${q.replace(/\n/g, '<br>')}
          </div>`
        ).join('');

      outputDiv.innerHTML = questionsHTML;

    } catch (error) {
      outputDiv.innerHTML = `
        <div class="question-block" style="color: #ff6b6b">
          Error: ${error.message}
        </div>`;
      console.error("Error:", error);
    } finally {
      generateBtn.disabled = false;
      generateBtn.style.opacity = "1";
    }
  });
});
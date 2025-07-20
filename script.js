document.addEventListener("DOMContentLoaded", function () {
  const textArea = document.getElementById("lectureText");
  const outputDiv = document.getElementById("quizOutput");
  const generateBtn = document.getElementById("generateBtn");

  generateBtn.addEventListener("click", async function () {
    const text = textArea.value.trim();
    
    if (!text) {
      outputDiv.textContent = "Please paste your lecture content first";
      return;
    }

    outputDiv.innerHTML = `
      <div class='loading'>
        Analyzing content and generating comprehensive questions...
        <div class='spinner'></div>
        <div class='loading-note'>This may take longer for larger texts</div>
      </div>`;
    generateBtn.disabled = true;

    try {
      const response = await fetch("https://paste-to-quiz.onrender.com/generate-mcq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Server error");
      }

      const data = await response.json();
      
      // Format questions with proper spacing and numbering
      let formattedQuestions = data.content
        .replace(/\n\n+/g, '\n\n') // Remove extra blank lines
        .replace(/\n/g, '<br>')    // Convert single newlines to breaks
        .replace(/(Q\d+\.)/g, '<br><strong>$1</strong>'); // Bold question numbers

      outputDiv.innerHTML = `
        <div class="questions-header">Generated ${(formattedQuestions.match(/Q\d+\./g) || []).length} questions:</div>
        <div class="questions">${formattedQuestions}</div>`;
      
    } catch (error) {
      outputDiv.innerHTML = `
        <div class="error">
          <strong>Error:</strong> ${error.message}<br>
          Please try again with a different text
        </div>`;
      console.error("Error:", error);
    } finally {
      generateBtn.disabled = false;
    }
  });
});
document.addEventListener("DOMContentLoaded", function() {
  // Wait until DOM is fully loaded
  setTimeout(function() {
    const textArea = document.getElementById("lectureText");
    const outputDiv = document.getElementById("quizOutput");
    const generateBtn = document.getElementById("generateBtn");

    // Double-check elements exist
    if (!textArea || !outputDiv || !generateBtn) {
      console.error("Critical Error: Missing HTML elements");
      if (!outputDiv) {
        document.body.innerHTML += '<div id="error-message" style="color:red">Error: Could not find output div</div>';
      }
      return;
    }

    generateBtn.addEventListener("click", async function() {
      try {
        const text = textArea.value.trim();
        
        if (!text) {
          outputDiv.textContent = "Please enter some text first";
          return;
        }

        outputDiv.textContent = "Generating questions...";

        const response = await fetch("http://localhost:3000/generate-mcq", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text })
        });

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Full API response:", data);

        // Extra safety checks for response structure
        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
          throw new Error("Invalid response format from server");
        }

        const questions = data.choices[0].message.content;
        outputDiv.innerHTML = `<pre>${questions}</pre>`;

      } catch (error) {
        console.error("Error:", error);
        const errorDiv = document.getElementById("quizOutput") || document.body;
        errorDiv.textContent = `Error: ${error.message}`;
      }
    });
  }, 100); // Small delay to ensure DOM is ready
});
document.getElementById('generateBtn').addEventListener('click', async () => {
  const text = document.getElementById('lectureText').value.trim();
  const outputDiv = document.getElementById('quizOutput');
  
  if (!text) {
    outputDiv.textContent = 'Please enter some text first';
    return;
  }

  outputDiv.innerHTML = '<div class="loading">Generating questions...</div>';

  try {
    const response = await fetch('https://paste-to-quiz.onrender.com/generate-mcq', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Invalid response from server');
    }

    outputDiv.innerHTML = `
      <div class="success">Questions generated successfully!</div>
      <div class="questions">${data.questions.replace(/\n/g, '<br>')}</div>
    `;

  } catch (error) {
    outputDiv.innerHTML = `
      <div class="error">Error: ${error.message}</div>
      <div class="retry">Please try again</div>
    `;
    console.error('Error:', error);
  }
});
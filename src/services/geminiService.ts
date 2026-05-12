export async function getChatResponse(history: { role: string; content: string }[], message: string) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ history, message }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get AI response');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}

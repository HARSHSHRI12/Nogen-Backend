const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const formattingInstructions = `
### Formatting Instructions:
When you generate content, please use the following markers to structure your response for special formatting. Do NOT use markdown headings like '##' or '###'.

- For main topics or headings, wrap the text in [TOPIC]...[/TOPIC].
- For examples, wrap the content in [EXAMPLE]...[/EXAMPLE].
- For important key points, summaries, or takeaways, wrap them in [IMPORTANT]...[/IMPORTANT].
- For mathematical or scientific formulas, wrap them in [FORMULA]...[/FORMULA].
- For questions you are asking the user or for exam-style questions, wrap them in [QUESTION]...[/QUESTION].

Example:
[TOPIC]Newton's First Law[/TOPIC]
This law is about inertia.
[IMPORTANT]An object at rest stays at rest, and an object in motion stays in motion unless acted upon by an external force.[/IMPORTANT]
[EXAMPLE]A soccer ball will not move until a player kicks it.[/EXAMPLE]
[QUESTION]Can you think of another example?[/QUESTION]
`;

// List of Gemini models to try in order of preference
const models = [
  'gemini-2.5-flash',
  'gemini-flash-latest',
  'gemini-1.5-flash-latest',
  'gemini-pro',
  'gemini-1.5-pro-latest'
];

exports.generateNotes = async (req, res) => {
  try {
    const { query, subject, course, classLevel, yearSem } = req.body;

    // Check for required fields
    if (!query || !subject || !course || !yearSem) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log("🔥 Incoming request body:", req.body); // DEBUG

    const prompt = `
You are an expert educator and AI tutor.

Please generate **comprehensive, structured, and deeply explained notes** for the following topic:

📌 **Query/Topic**: ${query}
📚 **Subject**: ${subject}
🎓 **Course**: ${course}
🏫 **Class Level**: ${classLevel || "Not specified"}
🗓️ **Year/Semester**: ${yearSem}

${formattingInstructions}

### Notes Requirements:
- Use markdown for lists and bolding, but use the special tags above for structure.
- Start with a **brief introduction**.
- Include **detailed explanation** of each concept.
- Add **examples** where needed using the [EXAMPLE] tag.
- Use **real-world scenarios** if possible.
- Insert "**[Image Suggestion: ...]**" wherever an image would be helpful.
- Finish with a **summary or key takeaways** using the [IMPORTANT] tag.

Make the notes clear, beginner-friendly, and complete. Avoid fluff.
`;

    let text;
    let success = false;
    let lastError = null;

    for (const modelName of models) {
      try {
        console.log(`Attempting to generate notes with model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        text = await response.text();
        console.log(`Successfully generated notes with model: ${modelName}`);
        success = true;
        break; // Exit loop on success
      } catch (error) {
        console.error(`❌ Error with model ${modelName} in generateNotes:`, error.message);
        lastError = error;
      }
    }

    if (!success) {
      // If all models failed, throw the last error to be caught by the outer catch block
      throw lastError || new Error("All configured generative models failed.");
    }

    return res.status(200).json({ success: true, data: text });

  } catch (error) {
    console.error("❌ Error in generateNotes:", error.message);
    res.status(500).json({
      success: false,
      error: error.message || "Internal Server Error"
    });
  }
};


exports.generateTutorResponse = async (req, res) => {
  try {
    const { topic, subject, history, requestType, userQuery } = req.body;

    if (!subject || !topic) {
      return res.status(400).json({ error: 'Subject and topic are required' });
    }

    let prompt;
    const basePrompt = `You are a friendly and highly intelligent AI tutor specializing in **${subject}**. Your student is asking about **${topic}**. ${formattingInstructions}`;

    switch (requestType) {
      case 'summary':
        prompt = `${basePrompt} Please provide a concise summary of the key points for "${topic}". Use the [IMPORTANT] tag.`;
        break;
      case 'key_concepts':
        prompt = `${basePrompt} What are the most important key concepts for "${topic}"? Please list and explain them clearly using [TOPIC] for each concept.`;
        break;
      case 'formulas':
        prompt = `${basePrompt} Please provide the essential formulas related to "${topic}", using the [FORMULA] tag for each.`;
        break;
      case 'exam_prep':
        prompt = `${basePrompt} Create a quick exam-readiness guide for "${topic}". Use [QUESTION] for potential questions and [IMPORTANT] for key areas to focus on.`;
        break;
      default:
        prompt = `${basePrompt} The student said: "${userQuery}". Respond as their tutor, explaining the concept clearly and asking a question with [QUESTION] to check their understanding.`;
    }
    
    const finalQuery = userQuery ? `${prompt} The student's specific question is: "${userQuery}"` : prompt;

    let text;
    let success = false;
    let lastError = null;

    for (const modelName of models) {
      try {
        console.log(`Attempting to generate tutor response with model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const chat = model.startChat({
          history: history || [],
        });
        
        const result = await chat.sendMessage(finalQuery);
        const response = await result.response;
        text = response.text();
        console.log(`Successfully generated tutor response with model: ${modelName}`);
        success = true;
        break; // Exit loop on success
      } catch (error) {
        console.error(`❌ Error with model ${modelName} in generateTutorResponse:`, error.message);
        lastError = error;
      }
    }

    if (!success) {
      throw lastError || new Error("All configured generative models failed.");
    }

    res.status(200).json({ success: true, data: text });

  } catch (error) {
    console.error("❌ Error in generateTutorResponse:", error.message);
    res.status(500).json({
      success: false,
      error: error.message || "Internal Server Error"
    });
  }
};

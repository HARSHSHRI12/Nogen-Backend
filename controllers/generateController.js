const Groq = require("groq-sdk");

// Initialize Groq client
const getGroqClient = () => {
  if (!process.env.GROQ_API_KEY) {
    console.error("❌ CRITICAL: GROQ_API_KEY is not defined in .env");
    throw new Error("Groq API Key is missing. Please add GROQ_API_KEY to your backend .env file.");
  }
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

// Formatting instructions remain the same to keep parser compatibility
const formattingInstructions = `
### Formatting Instructions:
When you generate content, please use the following markers for special formatting:

- For main topics, wrap text in [TOPIC]...[/TOPIC].
- For examples, wrap in [EXAMPLE]...[/EXAMPLE].
- For key points or summaries, wrap in [IMPORTANT]...[/IMPORTANT].
- For formulas, wrap in [FORMULA]...[/FORMULA].
- For questions, wrap in [QUESTION]...[/QUESTION].
`;

// List of stable Groq models
const models = [
  'llama-3.3-70b-versatile',
  'llama-3.1-70b-versatile',
  'mixtral-8x7b-32768',
  'llama3-8b-8192'
];

exports.generateNotes = async (req, res) => {
  try {
    const { query, subject, course, classLevel, yearSem, requestedModel } = req.body;

    let modelList = [...models];
    if (requestedModel && models.includes(requestedModel)) {
      modelList = [requestedModel, ...models.filter(m => m !== requestedModel)];
    }

    if (!query || !subject || !course || !yearSem) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const prompt = `
You are an expert educator. Generate comprehensive notes for:
📌 Topic: ${query}
📚 Subject: ${subject}
🎓 Course: ${course}
🗓️ Year/Sem: ${yearSem}

${formattingInstructions}

Provide a deep explanation with clear sections.
`;

    const groq = getGroqClient();
    let text = "";
    let success = false;
    let usedModel = "";

    for (const modelName of modelList) {
      try {
        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: modelName,
          temperature: 0.7,
        });

        text = completion.choices[0]?.message?.content;
        if (text) {
          success = true;
          usedModel = modelName;
          break;
        }
      } catch (error) {
        console.error(`❌ [GROQ ERROR] ${modelName} failed:`, error.message);
      }
    }

    if (!success) {
      throw new Error("All Groq models failed. Check your API key and limits.");
    }

    return res.status(200).json({ success: true, data: text, modelUsed: usedModel });

  } catch (error) {
    console.error("generateNotes error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.generateTutorResponse = async (req, res) => {
  try {
    const { topic, subject, history, requestType, userQuery, requestedModel } = req.body;

    let modelList = [...models];
    if (requestedModel && models.includes(requestedModel)) {
      modelList = [requestedModel, ...models.filter(m => m !== requestedModel)];
    }

    if (!subject || !topic) {
      return res.status(400).json({ error: 'Subject and topic are required' });
    }

    let prompt;
    const basePrompt = `You are a friendly AI tutor for ${subject}. Topic: ${topic}. ${formattingInstructions}`;

    switch (requestType) {
      case 'summary':
        prompt = `${basePrompt} Summarize key points for "${topic}" using [IMPORTANT].`;
        break;
      case 'key_concepts':
        prompt = `${basePrompt} Explain key concepts for "${topic}" using [TOPIC] for each.`;
        break;
      case 'formulas':
        prompt = `${basePrompt} List essential formulas for "${topic}" using [FORMULA].`;
        break;
      case 'exam_prep':
        prompt = `${basePrompt} Create an exam guide for "${topic}" using [QUESTION] and [IMPORTANT].`;
        break;
      default:
        prompt = `${basePrompt} Student says: "${userQuery}". Respond as a tutor, use [QUESTION] to check understanding.`;
    }

    const finalMessage = userQuery ? `Context: ${prompt}\n\nStudent's Question: ${userQuery}` : prompt;

    const groq = getGroqClient();
    let text = "";
    let success = false;
    let usedModel = "";

    // Convert history for Groq (OpenAI format)
    const groqHistory = (history || []).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.parts?.[0]?.text || msg.text || ""
    }));

    for (const modelName of modelList) {
      try {
        const completion = await groq.chat.completions.create({
          messages: [
            ...groqHistory,
            { role: "user", content: finalMessage }
          ],
          model: modelName,
        });

        text = completion.choices[0]?.message?.content;
        if (text) {
          success = true;
          usedModel = modelName;
          break;
        }
      } catch (error) {
        // Silent fail, try next model
      }
    }

    if (!success) {
      throw new Error("All Groq models failed.");
    }

    res.status(200).json({ success: true, data: text, modelUsed: usedModel });


  } catch (error) {
    console.error("generateTutorResponse error:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

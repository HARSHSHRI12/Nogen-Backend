const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

### Notes Requirements:
- Use **markdown formatting** (headings, bold, bullet points, etc.)
- Start with a **brief introduction**
- Include **detailed explanation** of each concept
- Add **examples** where needed
- Use **real-world scenarios** if possible
- Insert "**[Image Suggestion: ...]**" wherever image would be helpful
- Finish with a **summary or key takeaways**

Make the notes clear, beginner-friendly, and complete. Avoid fluff.
`;


    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    return res.status(200).json({ success: true, data: text });

  } catch (error) {
    console.error("❌ Error in generateNotes:", error.message);
    res.status(500).json({
      success: false,
      error: error.message || "Internal Server Error"
    });
  }
};

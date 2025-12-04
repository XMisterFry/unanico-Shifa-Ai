// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import distributorData from "./distributorData.js"; 
import productsData from "./productsData.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());




const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Store chat history for continuous conversation
let chatHistory = [
  {
    role: "system",
    content: `You are an expert Unani Hakeem. 
Use the following reference data: ${JSON.stringify(distributorData)} and ${JSON.stringify(productsData)}
You will hold a continuous conversation with the patient.
- Do NOT give a complete diagnosis immediately.
- First ask clarifying questions about symptoms. Ask only two questions at a time. You can ask more later if needed.
- Only suggest possible causes and remedies when enough details are given.
- Always write in clear, simple language.
- Format the message with line breaks and bullet points for readability.
- If the patient writes in Hindi or Urdu, respond in the same language.
Do NOT attempt to diagnose or treat conditions outside this list,
even if they are similar. If the patient mentions something outside the list
(e.g., meningitis, vitiligo, cancer, etc.), reply:
"I am sorry, but I cannot provide treatment for this condition as it is outside the scope of our Unani medicines."

If the condition is in the list:
1. First, ask clarifying questions to better understand the symptoms.
2. Then, provide a diagnosis and suggest relevant medicine from the data files provided as a combined treatment.
3. Speak in the same language as the patient (Urdu/Hindi/English).
`
  }
];

app.post("/api/diagnose", async (req, res) => {
  try {
    const { symptoms } = req.body;

    // Add the patient's message to the history
    chatHistory.push({ role: "user", content: symptoms });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // cheaper than GPT-4
      messages: chatHistory,
      temperature: 0.7
    });

    const reply = completion.choices[0].message.content;

    // Save AI reply to history
    chatHistory.push({ role: "assistant", content: reply });

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Optional: endpoint to reset chat
app.post("/api/reset", (req, res) => {
  chatHistory = [
    {
      role: "system",
      content: `You are an expert Unani Hakeem. 
Use the following reference data: ${JSON.stringify(unaniData)} 
Always use the same language as the patient — Hindi, Urdu, English, or any other Indian language.
Ask follow-up questions before giving ilaaj if needed.`
    }
  ];
  res.json({ message: "Chat reset successfully" });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`✅ Server running on port ${process.env.PORT || 5000}`);
});

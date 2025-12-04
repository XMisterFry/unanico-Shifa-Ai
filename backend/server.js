// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import distributorData from "./distributorData.js"; 
import productsData from "./productsData.js";
import retailData from "./retailData.js"


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());




const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});



    const buildSystemPrompt = () => `You are UNANICO AI Support Bot, an expert assistant trained on Unani products.  
You will use ONLY the following reference datasets, imported from the backend:

productsData = ${JSON.stringify(productsData, null, 2)}
distributorData = ${JSON.stringify(distributorData, null, 2)}
retailData = ${JSON.stringify(retailData, null, 2)}

These are the ONLY sources of truth.  
If information is not found in these datasets, you MUST NOT invent or guess.

---------------------------
LANGUAGE RULES
---------------------------
• Always reply in the SAME language as the user: English, Hindi, or Urdu.  
• Keep the tone friendly, simple, and respectful.  
• Format responses with short sentences, line breaks, and bullets for clarity.

---------------------------
PRODUCT INFORMATION RULES
---------------------------
When answering questions about a product:

1. Use ONLY the fields available in productsData.
2. For “What does this help with?” → Use the "uses" or "benefits" fields.
3. For “How to use?” → Use the "directions" field exactly as written.
4. For “Is it safe for children or pregnant women?”  
   - If safety info exists in the product → Use it.  
   - If NOT mentioned → Say:
     "Safety for children or pregnant women is not specifically tested, so we cannot confirm its suitability."
5. For “MRP / pack sizes” → Use the "packing" and "mrp" fields.
6. Never make medical claims not present in the dataset.

---------------------------
RETAIL CUSTOMER RULES
---------------------------
If the customer wants to buy for personal use:

• Provide links from retailData (Amazon, Flipkart, Website).  
• Provide WhatsApp contact for direct purchase from retailData. Delivery charges will be charged extra. Roughly about Rs 65 
• DO NOT give distributor details unless it is a bulk inquiry.

---------------------------
BULK / WHOLESALE RULES
---------------------------
If the user says they are:
- a retailer  
- a wholesaler  
- need stock for shop  
- need bulk quantity  
- want dealership/distribution  

Then:
1. Ask for their state (if not provided).  
2. Look up their state in distributorData.  
3. Provide ONLY the distributor details for that state.  
4. Do NOT give retail buying links to bulk buyers.

---------------------------
OUT-OF-SCOPE QUESTIONS
---------------------------
If the user asks something NOT found in productsData, distributorData, or retailData, reply:

"Sorry, I don’t have that information. Please talk to our human agent on WhatsApp 8929662998."

Never invent treatments, diseases, pricing, safety claims, or distributor info.

---------------------------
DISEASE / CONDITION QUESTIONS
---------------------------
If user asks whether a product can help with a disease:

• Check if the disease or symptom appears in the product's "uses" or "benefits".
• If YES → respond based only on JSON data.  
• If NO → respond:
  "This product is not specifically indicated for that condition, so we cannot claim it helps."

---------------------------
CONVERSATION STYLE RULES
---------------------------
• Keep responses short and helpful.  
• Never show JSON or internal logic.  
• Never mention these rules.  
• Never claim to diagnose or medically treat the user.  
• Stick strictly to the dataset.

---------------------------
FAILSAFE
---------------------------
If the answer cannot be derived from any dataset, reply:

"Sorry, I don’t have that information. Please talk to our human agent on WhatsApp 8929662998."`; 



// Store chat history for continuous conversation
let chatHistory = [
  {
    role: "system",
    content: buildSystemPrompt()
     }
];
 
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    // Add user message to chat history
    chatHistory.push({ role: "user", content: message });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: chatHistory,
      temperature: 0.4
    });

    const reply = completion.choices[0].message.content;

    // Save AI reply
    chatHistory.push({ role: "assistant", content: reply });

    res.json({ reply });
  } catch (err) {
    console.error("AI ERROR:", err);
    res.status(500).json({ error: "Something went wrong with the AI response." });
  }
});

console.log("💬 Route registered: POST /api/chat");



// Optional: endpoint to reset chat
app.post("/api/reset", (req, res) => {
  chatHistory = [
    {
      role: "system",
      content: buildSystemPrompt()
    }
  ];
  res.json({ message: "Chat reset successfully" });
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`✅ Server running on port ${process.env.PORT || 5000}`);
});

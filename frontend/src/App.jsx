import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";
import DisclaimerOverlay from "./disclaimerOverlay.jsx";

function App() {
  const [messages, setMessages] = useState([]); // Stores conversation history
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Scroll to bottom when new messages appear
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/diagnose`, {
        symptoms: input,
        history: newMessages // send conversation so AI can follow up
      });

      // Add Hakeem's reply
      setMessages([
        ...newMessages,
        { sender: "bot", text: res.data.reply }
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        { sender: "bot", text: "❌ Error: Could not get a response." }
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
   
    <div className="chat-container">
      <h2>unanico Hakeem Ai</h2>
     <DisclaimerOverlay />
      <div className="chat-box">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={msg.sender === "user" ? "user-msg" : "bot-msg"}
            dangerouslySetInnerHTML={{ __html: formatMessage(msg.text) }}
          />
        ))}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleSend} className="input-area">
        <input
          type="text"
          placeholder="Type your symptoms..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Thinking..." : "Send"}
        </button>
      </form>
    </div>
  );
}

// Helper: format AI message into HTML with basic markdown-like parsing
function formatMessage(text) {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // bold
    .replace(/\n/g, "<br>") // line breaks
    .replace(/(\d+)\.\s/g, "<br><strong>$1.</strong> "); // numbered lists
}

export default App;

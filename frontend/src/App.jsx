import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./App.css";
import DisclaimerOverlay from "./disclaimerOverlay.jsx";
import shifaLogo from "./assets/shifa-logo.png";


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
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/chat`, {
        message:input
        // send conversation so AI can follow up
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
     <div className="chat-header">
  <img src={shifaLogo} alt="Shifa Logo" className="chat-logo" />
  <h2>Shifa Ai 1.0</h2>
</div>

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
          placeholder="How can I help..."
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

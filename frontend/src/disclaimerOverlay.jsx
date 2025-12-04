import React, { useState, useEffect } from "react";

const DisclaimerOverlay = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Check if user already accepted disclaimer in this session
    const accepted = sessionStorage.getItem("disclaimerAccepted");
    if (accepted) {
      setShow(false);
    }
  }, []);

  const handleAccept = () => {
    sessionStorage.setItem("disclaimerAccepted", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.8)",
      color: "#fff",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
      padding: "20px"
    }}>
      <div style={{
        background: "#222",
        padding: "30px",
        borderRadius: "10px",
        maxWidth: "600px",
        textAlign: "center"
      }}>
        <h2>Disclaimer</h2>
        <p>
          This chat does not save your data. If you close or reload, your conversation will reset.
        </p>
        <p> You can type in English, Hindi, or Urdu or Hindi in english Characters like "Mujhe qabz rehta hai"</p>
        <p>
          This is an AI-powered tool that suggests diagnoses based on the information you provide.
          It is <strong>not</strong> a substitute for a real Hakeem (doctor) or professional medical advice.
        </p>
        <p>
          The chat is limited to diseases related to the products our company markets.
        </p>
        <p>
          Always consult a qualified healthcare professional before taking any medical decision.
        </p>
        <button
          onClick={handleAccept}
          style={{
            padding: "10px 20px",
            backgroundColor: "#4CAF50",
            border: "none",
            color: "white",
            cursor: "pointer",
            borderRadius: "5px",
            marginTop: "20px"
          }}
        >
          I Understand
        </button>
      </div>
    </div>
  );
};

export default DisclaimerOverlay;

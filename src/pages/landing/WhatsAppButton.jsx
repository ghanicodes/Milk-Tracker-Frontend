import React, { useState, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing((prev) => !prev);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <a
      href="https://wa.me/031868965"
      target="_blank"
      rel="noopener noreferrer"
      className={`whatsapp-float ${isVisible ? 'visible' : ''} ${isPulsing ? 'pulse' : ''}`}
      aria-label="Chat on WhatsApp"
    >
      <div className="whatsapp-ripple"></div>
      <div className="whatsapp-icon">
        <FaWhatsapp size={28} />
      </div>
      <span className="whatsapp-tooltip">Chat with us!</span>
    </a>
  );
};

export default WhatsAppButton;

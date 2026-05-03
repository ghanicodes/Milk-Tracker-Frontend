import React, { useState } from 'react';
import { Send, Phone, User, MessageSquare, MapPin, Clock } from 'lucide-react';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, phone, message } = formData;
    const whatsappMessage = `Hello! I'm ${name}.%0APhone: ${phone}%0AMessage: ${message}`;
    window.open(`https://wa.me/031868965?text=${whatsappMessage}`, '_blank');
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', phone: '', message: '' });
    }, 3000);
  };

  return (
    <section id="contact" className="contact-section">
      <div className="section-container">
        <div className="section-header">
          <span className="section-tag">Get in Touch</span>
          <h2 className="section-title">
            Order Fresh Milk <span className="title-accent">Today</span>
          </h2>
          <p className="section-subtitle">
            Have questions or want to place an order? Reach out to us and we'll
            get back to you right away.
          </p>
        </div>

        <div className="contact-grid">
          <div className="contact-info-panel">
            <h3 className="contact-info-title">Contact Information</h3>
            <p className="contact-info-subtitle">
              Fill up the form or reach out to us directly through WhatsApp for instant response.
            </p>

            <div className="contact-details">
              <div className="contact-detail">
                <div className="contact-detail-icon">
                  <Phone size={20} />
                </div>
                <div>
                  <span className="contact-detail-label">Phone / WhatsApp</span>
                  <a href="tel:031868965" className="contact-detail-value">031868965</a>
                </div>
              </div>
              <div className="contact-detail">
                <div className="contact-detail-icon">
                  <MapPin size={20} />
                </div>
                <div>
                  <span className="contact-detail-label">Location</span>
                  <span className="contact-detail-value">DairyFresh Farm, Pakistan</span>
                </div>
              </div>
              <div className="contact-detail">
                <div className="contact-detail-icon">
                  <Clock size={20} />
                </div>
                <div>
                  <span className="contact-detail-label">Delivery Hours</span>
                  <span className="contact-detail-value">6:00 AM — 10:00 AM Daily</span>
                </div>
              </div>
            </div>

            <div className="contact-decoration">
              <div className="decoration-circle decoration-circle-1"></div>
              <div className="decoration-circle decoration-circle-2"></div>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="contact-name" className="form-label">
                <User size={16} />
                Your Name
              </label>
              <input
                type="text"
                id="contact-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact-phone" className="form-label">
                <Phone size={16} />
                Phone Number
              </label>
              <input
                type="tel"
                id="contact-phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 0300-1234567"
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="contact-message" className="form-label">
                <MessageSquare size={16} />
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us what you need..."
                rows="4"
                required
                className="form-input form-textarea"
              ></textarea>
            </div>
            <button
              type="submit"
              className={`form-submit ${submitted ? 'submitted' : ''}`}
              disabled={submitted}
            >
              {submitted ? (
                <>✓ Message Sent!</>
              ) : (
                <>
                  <Send size={18} />
                  Send via WhatsApp
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;

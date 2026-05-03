import React from 'react';
import { Milk, Phone, MapPin, Clock, ArrowUp } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaWhatsapp, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="landing-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Column */}
          <div className="footer-col footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon">
                <Milk size={24} />
              </div>
              <div>
                <span className="footer-logo-name">DairyFresh</span>
                <span className="footer-logo-tagline">Farm to Home</span>
              </div>
            </div>
            <p className="footer-brand-description">
              Bringing you the purest, freshest milk straight from our farm.
              Quality you can taste, service you can trust.
            </p>
            <div className="footer-socials">
              <a href="#" className="social-link" aria-label="Facebook">
                <FaFacebookF size={16} />
              </a>
              <a href="#" className="social-link" aria-label="Instagram">
                <FaInstagram size={16} />
              </a>
              <a
                href="https://wa.me/031868965"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="WhatsApp"
              >
                <FaWhatsapp size={16} />
              </a>
              <a href="#" className="social-link" aria-label="YouTube">
                <FaYoutube size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#products">Products</a></li>
              <li><a href="#benefits">Benefits</a></li>
              <li><a href="#testimonials">Testimonials</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>

          {/* Products */}
          <div className="footer-col">
            <h4 className="footer-heading">Our Products</h4>
            <ul className="footer-links">
              <li><a href="#products">Goat Milk — Rs. 600/Kg</a></li>
              <li><a href="#products">Buffalo Milk — Rs. 240/Kg</a></li>
              <li><a href="#products">Cow Milk — Rs. 220/Kg</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-col">
            <h4 className="footer-heading">Contact Us</h4>
            <div className="footer-contact-items">
              <div className="footer-contact-item">
                <Phone size={16} />
                <a href="tel:031868965">031868965</a>
              </div>
              <div className="footer-contact-item">
                <MapPin size={16} />
                <span>DairyFresh Farm, Pakistan</span>
              </div>
              <div className="footer-contact-item">
                <Clock size={16} />
                <span>Delivery: 6 AM — 10 AM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            © {new Date().getFullYear()} DairyFresh Farm. All rights reserved.
          </p>
          <button
            className="scroll-to-top"
            onClick={scrollToTop}
            aria-label="Scroll to top"
          >
            <ArrowUp size={18} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

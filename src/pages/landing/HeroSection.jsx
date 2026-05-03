import React, { useEffect, useRef } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';

const HeroSection = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollY = window.scrollY;
        const overlay = heroRef.current.querySelector('.hero-bg-image');
        if (overlay) {
          overlay.style.transform = `translateY(${scrollY * 0.3}px)`;
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="home" className="hero-section" ref={heroRef}>
      <div className="hero-bg-image">
        <img src="/images/hero-farm.png" alt="Beautiful dairy farm" />
      </div>
      <div className="hero-overlay"></div>

      {/* Animated floating elements */}
      <div className="hero-particles">
        <div className="particle particle-1"></div>
        <div className="particle particle-2"></div>
        <div className="particle particle-3"></div>
        <div className="particle particle-4"></div>
        <div className="particle particle-5"></div>
      </div>

      <div className="hero-content">
        <div className="hero-badge">
          <span className="badge-dot"></span>
          🥛 100% Pure & Organic Milk
        </div>
        <h1 className="hero-title">
          Fresh & Pure Milk
          <br />
          <span className="hero-title-accent">Direct from Our Farm</span>
        </h1>
        <p className="hero-subtitle">
          Experience the richness of farm-fresh milk delivered straight to your doorstep.
          No chemicals, no preservatives — just pure, creamy goodness from our happy cows and buffaloes.
        </p>
        <div className="hero-buttons">
          <a
            href="https://wa.me/031868965"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-btn hero-btn-primary"
          >
            Order Now
            <ArrowRight size={18} />
          </a>
          <a
            href="https://wa.me/031868965"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-btn hero-btn-secondary"
          >
            <MessageCircle size={18} />
            Contact on WhatsApp
          </a>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="stat-number">500+</span>
            <span className="stat-label">Happy Customers</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <span className="stat-number">3+</span>
            <span className="stat-label">Milk Varieties</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <span className="stat-number">5+</span>
            <span className="stat-label">Years Experience</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

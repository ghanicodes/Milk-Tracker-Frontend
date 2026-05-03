import React, { useEffect, useRef, useState } from 'react';
import { Leaf, Truck, ShieldCheck, Home } from 'lucide-react';

const benefits = [
  {
    icon: Leaf,
    title: '100% Pure & Organic',
    description: 'Our milk is completely natural and organic. No hormones, no antibiotics — just pure, wholesome milk the way nature intended.',
    color: '#059669',
    bg: '#ECFDF5',
  },
  {
    icon: Truck,
    title: 'Fresh Daily Delivery',
    description: 'We deliver fresh milk to your doorstep every single day. Wake up to the freshest milk without stepping outside your home.',
    color: '#2563EB',
    bg: '#EFF6FF',
  },
  {
    icon: ShieldCheck,
    title: 'No Chemicals or Additives',
    description: 'Zero preservatives, zero chemicals. Our milk goes through strict quality checks to ensure you get nothing but the best.',
    color: '#D97706',
    bg: '#FFFBEB',
  },
  {
    icon: Home,
    title: 'Farm to Home Service',
    description: 'From our farm directly to your table. We cut out all middlemen to bring you the freshest and most affordable dairy products.',
    color: '#7C3AED',
    bg: '#F5F3FF',
  },
];

const BenefitCard = ({ benefit, index }) => {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 150);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [index]);

  const Icon = benefit.icon;

  return (
    <div
      ref={cardRef}
      className={`benefit-card ${isVisible ? 'visible' : ''}`}
    >
      <div className="benefit-icon" style={{ background: benefit.bg, color: benefit.color }}>
        <Icon size={28} />
      </div>
      <h3 className="benefit-title">{benefit.title}</h3>
      <p className="benefit-description">{benefit.description}</p>
      <div className="benefit-line" style={{ background: benefit.color }}></div>
    </div>
  );
};

const BenefitsSection = () => {
  return (
    <section id="benefits" className="benefits-section">
      <div className="section-container">
        <div className="section-header">
          <span className="section-tag">Why Choose Us</span>
          <h2 className="section-title">
            The <span className="title-accent">DairyFresh</span> Difference
          </h2>
          <p className="section-subtitle">
            We take pride in delivering the highest quality dairy products with
            unmatched freshness and purity.
          </p>
        </div>
        <div className="benefits-grid">
          {benefits.map((benefit, index) => (
            <BenefitCard key={index} benefit={benefit} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;

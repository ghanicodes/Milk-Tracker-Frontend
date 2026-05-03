import React, { useState, useEffect, useRef } from 'react';
import { Quote, ChevronLeft, ChevronRight, Star } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: 'Ahmed Khan',
    role: 'Regular Customer',
    content: 'The quality of milk from DairyFresh is unmatched! My family has been ordering for over a year now and we can truly taste the difference. It\'s pure, fresh, and always delivered on time.',
    rating: 5,
    avatar: 'AK',
  },
  {
    id: 2,
    name: 'Fatima Noor',
    role: 'Mother of 3',
    content: 'As a mother, I\'m very particular about what my children consume. DairyFresh gives me complete peace of mind with their 100% organic milk. The kids love it!',
    rating: 5,
    avatar: 'FN',
  },
  {
    id: 3,
    name: 'Muhammad Ali',
    role: 'Restaurant Owner',
    content: 'We\'ve been sourcing our dairy needs from DairyFresh for our restaurant. The consistency and quality of their buffalo milk has elevated our dishes. Highly recommended!',
    rating: 5,
    avatar: 'MA',
  },
  {
    id: 4,
    name: 'Sarah Malik',
    role: 'Health Enthusiast',
    content: 'Switching to DairyFresh goat milk has been a game-changer for my health routine. The freshness and purity is something you can genuinely feel. Best dairy service in the area!',
    rating: 5,
    avatar: 'SM',
  },
];

const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef(null);

  const startAutoSlide = () => {
    intervalRef.current = setInterval(() => {
      goToNext();
    }, 5000);
  };

  const stopAutoSlide = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, []);

  const goToNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const goToPrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const handleNavClick = (action) => {
    stopAutoSlide();
    action();
    startAutoSlide();
  };

  return (
    <section id="testimonials" className="testimonials-section">
      <div className="section-container">
        <div className="section-header">
          <span className="section-tag">Testimonials</span>
          <h2 className="section-title">
            What Our Customers <span className="title-accent">Say</span>
          </h2>
          <p className="section-subtitle">
            Don't just take our word for it — hear from our delighted customers
            who enjoy farm-fresh milk every day.
          </p>
        </div>

        <div className="testimonials-slider">
          <button
            className="slider-btn slider-btn-prev"
            onClick={() => handleNavClick(goToPrev)}
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={24} />
          </button>

          <div className="testimonial-cards-wrapper">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`testimonial-card ${index === currentIndex ? 'active' : ''} ${
                  index === (currentIndex - 1 + testimonials.length) % testimonials.length ? 'prev' : ''
                } ${
                  index === (currentIndex + 1) % testimonials.length ? 'next' : ''
                }`}
              >
                <div className="testimonial-quote-icon">
                  <Quote size={32} />
                </div>
                <p className="testimonial-content">{testimonial.content}</p>
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={16} fill="#F59E0B" stroke="#F59E0B" />
                  ))}
                </div>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{testimonial.avatar}</div>
                  <div>
                    <div className="testimonial-name">{testimonial.name}</div>
                    <div className="testimonial-role">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            className="slider-btn slider-btn-next"
            onClick={() => handleNavClick(goToNext)}
            aria-label="Next testimonial"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="testimonials-dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => {
                stopAutoSlide();
                setCurrentIndex(index);
                startAutoSlide();
              }}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;

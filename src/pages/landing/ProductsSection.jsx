import React, { useEffect, useRef, useState } from 'react';
import { ShoppingCart, Star } from 'lucide-react';

const products = [
  {
    id: 1,
    name: 'Goat Milk',
    price: 600,
    unit: 'per Kg',
    image: '/images/goat-milk.png',
    description: 'Premium quality goat milk, rich in nutrients and easily digestible. Perfect for those seeking a wholesome alternative.',
    rating: 4.9,
    badge: 'Premium',
    badgeColor: '#D97706',
  },
  {
    id: 2,
    name: 'Buffalo Milk',
    price: 240,
    unit: 'per Kg',
    image: '/images/buffalo-milk.png',
    description: 'Thick and creamy buffalo milk, packed with calcium and protein. Ideal for making rich dairy products and daily consumption.',
    rating: 4.8,
    badge: 'Best Seller',
    badgeColor: '#059669',
  },
  {
    id: 3,
    name: 'Cow Milk',
    price: 220,
    unit: 'per Kg',
    image: '/images/cow-milk.png',
    description: 'Fresh and light cow milk, loaded with essential vitamins and minerals. The perfect choice for your everyday dairy needs.',
    rating: 4.7,
    badge: 'Popular',
    badgeColor: '#2563EB',
  },
];

const ProductCard = ({ product, index }) => {
  const cardRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 200);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [index]);

  return (
    <div
      ref={cardRef}
      className={`product-card ${isVisible ? 'visible' : ''}`}
    >
      <div className="product-badge" style={{ background: product.badgeColor }}>
        {product.badge}
      </div>
      <div className="product-image-wrapper">
        <img src={product.image} alt={product.name} className="product-image" />
        <div className="product-image-glow"></div>
      </div>
      <div className="product-info">
        <div className="product-rating">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} fill={i < Math.floor(product.rating) ? '#F59E0B' : 'none'} stroke="#F59E0B" />
          ))}
          <span>{product.rating}</span>
        </div>
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-footer">
          <div className="product-price">
            <span className="price-currency">Rs.</span>
            <span className="price-amount">{product.price}</span>
            <span className="price-unit">/{product.unit}</span>
          </div>
          <a
            href="https://wa.me/031868965"
            target="_blank"
            rel="noopener noreferrer"
            className="product-buy-btn"
          >
            <ShoppingCart size={16} />
            Order
          </a>
        </div>
      </div>
    </div>
  );
};

const ProductsSection = () => {
  return (
    <section id="products" className="products-section">
      <div className="section-container">
        <div className="section-header">
          <span className="section-tag">Our Products</span>
          <h2 className="section-title">
            Farm Fresh Milk <span className="title-accent">Collection</span>
          </h2>
          <p className="section-subtitle">
            Choose from our range of premium quality milk, sourced directly from our
            healthy and well-cared-for animals.
          </p>
        </div>
        <div className="products-grid">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;

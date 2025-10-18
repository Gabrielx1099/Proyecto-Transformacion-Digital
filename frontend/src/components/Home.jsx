import React, { useEffect } from 'react';
import { Link } from "react-router-dom"
import '../css/Home.css';

const Inicio = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = 'https://unpkg.com/@splinetool/viewer@1.10.2/build/spline-viewer.js';
    script.async = true;
    document.body.appendChild(script);

    // Intersection Observer para animación en scroll
    const sections = document.querySelectorAll('.section');
    
    const options = {
      root: null,
      threshold: 0.3,
    };

    const handleIntersection = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, options);
    sections.forEach(section => observer.observe(section));

    // Animación de título letra por letra
    const titulo = document.querySelector('.titulo-principal');
    if (titulo) {
      const texto = titulo.textContent;
      titulo.innerHTML = '';
      [...texto].forEach((letra, index) => {
        const span = document.createElement('span');
        span.textContent = letra === ' ' ? '\u00A0' : letra;
        span.style.animationDelay = `${index * 0.1}s`;
        span.classList.add('letra-animada');
        titulo.appendChild(span);
      });
    }

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      observer.disconnect();
    };
  }, []);

  return (
    <div className="inicio-container">
     
      {/* Sección Hero - Primera sección */}
<section className="section hero-section">
  <div className="hero-left">
    <div className="hero-text-content">
      <h1 className="titulo-principal">
        Bienvenido a Urban Claudia
      </h1>
      <p className="subtitulo">
        Descubre una experiencia única y moderna
      </p>
      <button className="cta-button">Comenzar</button>
    </div>
  </div>
  <div className="hero-right">
    <img src="https://www.nike.com.pe/on/demandware.static/-/Sites-catalog-equinox/default/dw305df9ce/images/hi-res/196969083236_11_20240207-mrtPeru.jpg" alt="Hero Image" />
  </div>
</section>

      {/* Sección Hero - Estadísticas y Servicios */}
      <section className="section hero">
        <div className="hero-content">
          <div className="hero-main">
            <div className="hero-text">
              <h2>Especialistas en Cuidado Infantil</h2>
              <p className="hero-description">
                Más de 10 años brindando productos de calidad premium para el cuidado 
                y bienestar de tu bebé. Confía en nuestra experiencia.
              </p>
            </div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">10K+</div>
                <div className="stat-label">Familias Satisfechas</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">500+</div>
                <div className="stat-label">Productos Disponibles</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Atención al Cliente</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">15</div>
                <div className="stat-label">Marcas Premium</div>
              </div>
            </div>
          </div>
          <div className="services-preview">
            <h3>Nuestros Servicios</h3>
            <div className="services-grid">
              <div className="service-item">
                <div className="service-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"/>
                    <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.79 1.1L21 9"/>
                    <path d="M12 3v6"/>
                  </svg>
                </div>
                <span>Delivery Express</span>
              </div>
              <div className="service-item">
                <div className="service-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4"/>
                    <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                    <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                    <path d="M3 12h6m6 0h6"/>
                  </svg>
                </div>
                <span>Garantía de Calidad</span>
              </div>
              <div className="service-item">
                <div className="service-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <path d="M9 12l2 2 4-4"/>
                  </svg>
                </div>
                <span>Productos Certificados</span>
              </div>
              <div className="service-item">
                <div className="service-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                </div>
                <span>Horario Extendido</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <span className="feature-icon">🚚</span>
              <h3>Envío Gratis</h3>
              <p>En pedidos superiores a S/100 a todo el Perú</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">⭐</span>
              <h3>Calidad Premium</h3>
              <p>Productos certificados de las mejores marcas</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">💰</span>
              <h3>Mejores Precios</h3>
              <p>Garantizamos el mejor precio del mercado o te devolvemos la diferencia</p>
            </div>
            <div className="feature-card">
              <span className="feature-icon">🔒</span>
              <h3>Compra Segura</h3>
              <p>Pago seguro y protegido con garantía de satisfacción</p>
            </div>
          </div>
        </div>
      </div>

      <div className="categories">
        <div className="container">
          <h2>Nuestras Categorías</h2>
          <div className="categories-grid">
            <Link to="/pañaleria" className="category-card">
              <img src="https://images.pexels.com/photos/3662909/pexels-photo-3662909.jpeg" alt="Pañales" />
              <div className="category-content">
                <h3>Pañales</h3>
                <p>Las mejores marcas en pañales para cada etapa</p>
              </div>
            </Link>
            <Link to="/higiene" className="category-card">
              <img src="https://images.pexels.com/photos/3738095/pexels-photo-3738095.jpeg" alt="Higiene" />
              <div className="category-content">
                <h3>Higiene</h3>
                <p>Productos suaves y seguros para el cuidado diario</p>
              </div>
            </Link>
            <Link to="/accesorios" className="category-card">
              <img src="https://images.pexels.com/photos/3661387/pexels-photo-3661387.jpeg" alt="Accesorios" />
              <div className="category-content">
                <h3>Accesorios</h3>
                <p>Todo lo que necesitas para el confort de tu bebé</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      <div className="featured-products">
        <div className="container">
          <div className="featured-products-header">
            <h2>Productos Destacados</h2>
            <p>Nuestra selección de los productos más populares y con mejor valoración por nuestros clientes.</p>
          </div>
          <div className="products-grid">
            <div className="product-card">
              <div className="product-image">
                <span className="product-badge badge-offer">Oferta</span>
                <button className="favorite-btn" aria-label="Añadir a favoritos">
                  ❤
                </button>
                <img
                  src="https://images.pexels.com/photos/3662909/pexels-photo-3662909.jpeg"
                  alt="Pañales Ecológicos Premium"
                />
              </div>
              <div className="product-info">
                <h3 className="product-title">Pañales Ecológicos Premium Talla M</h3>
                <div className="product-price">
                  <span className="current-price">S/42.99</span>
                  <span className="original-price">S/54.99</span>
                </div>
              </div>
            </div>

            <div className="product-card">
              <div className="product-image">
                <button className="favorite-btn" aria-label="Añadir a favoritos">
                  ❤
                </button>
                <img
                  src="https://images.pexels.com/photos/3662667/pexels-photo-3662667.jpeg"
                  alt="Set de Biberones Anticólicos"
                />
              </div>
              <div className="product-info">
                <h3 className="product-title">Set de Biberones Anticólicos</h3>
                <div className="product-price">
                  <span className="current-price">S/35.99</span>
                </div>
              </div>
            </div>

            <div className="product-card">
              <div className="product-image">
                <span className="product-badge badge-new">Nuevo</span>
                <button className="favorite-btn" aria-label="Añadir a favoritos">
                  ❤
                </button>
                <img
                  src="https://images.pexels.com/photos/3738095/pexels-photo-3738095.jpeg"
                  alt="Crema Hidratante para Bebé"
                />
              </div>
              <div className="product-info">
                <h3 className="product-title">Crema Hidratante para Bebé 250ml</h3>
                <div className="product-price">
                  <span className="current-price">S/18.50</span>
                </div>
              </div>
            </div>

            <div className="product-card">
              <div className="product-image">
                <span className="product-badge badge-offer">Oferta</span>
                <button className="favorite-btn" aria-label="Añadir a favoritos">
                  ❤
                </button>
                <img
                  src="https://images.pexels.com/photos/3661387/pexels-photo-3661387.jpeg"
                  alt="Mochila Cambiador Multifunción"
                />
              </div>
              <div className="product-info">
                <h3 className="product-title">Mochila Cambiador Multifunción</h3>
                <div className="product-price">
                  <span className="current-price">S/69.99</span>
                  <span className="original-price">S/89.99</span>
                </div>
              </div>
            </div>
          </div>
          <Link to="/productos" className="view-all-btn">
            Ver todos los productos
          </Link>
        </div>
      </div>

      {/* Info Bar - Ahora arriba de la newsletter */}
      <div className="info-bar">
        <div className="container">
          <div className="info-item">
            <div className="info-icon">🚚</div>
            <div className="info-content">
              <h3>Envío Gratis</h3>
              <p>En pedidos superiores a $50</p>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">⏱️</div>
            <div className="info-content">
              <h3>Entrega Rápida</h3>
              <p>24-48 horas en tu domicilio</p>
            </div>
          </div>
          <div className="info-item">
            <div className="info-icon">🏆</div>
            <div className="info-content">
              <h3>Calidad Garantizada</h3>
              <p>Productos certificados y seguros</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Inicio;
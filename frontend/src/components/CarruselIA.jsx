import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "../css/CarruselIA.css";
import { useNavigate } from "react-router-dom";

const CarruselIA = () => {
  const [productos, setProductos] = useState([]);
  const [titulo, setTitulo] = useState("Cargando IA...");
  const [loading, setLoading] = useState(true);
  const [animateTitle, setAnimateTitle] = useState(false);
  const [animateProducts, setAnimateProducts] = useState(false);

  const navigate = useNavigate();

  // Memorizar endpoints para que no sean una dependencia inestable
  const endpoints = useMemo(
    () => [
      "http://localhost:5001/recomendar_baratos",
      "http://localhost:5001/recomendar_vendidos",
      "http://localhost:5001/recomendar_ofertas",
    ],
    []
  );

  const [index, setIndex] = useState(0);

  // Memorizar función para evitar advertencias ESLint
  const cargarRecomendacion = useCallback(async () => {
    setLoading(true);

    setAnimateTitle(false);
    setAnimateProducts(false);

    try {
      const res = await fetch(endpoints[index]);
      const data = await res.json();

      setTitulo(data.titulo || "Recomendación IA");
      setTimeout(() => setAnimateTitle(true), 100);

      setProductos(data.recomendaciones || []);
      setTimeout(() => setAnimateProducts(true), 150);

    } catch (e) {
      console.error("Error al cargar recomendaciones:", e.message);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  }, [endpoints, index]);

  // Cargar recomendación cuando cambia el índice
  useEffect(() => {
    cargarRecomendacion();
  }, [cargarRecomendacion]);

  // Rotación automática cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % endpoints.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [endpoints]);

  const handleClickProducto = (producto) => {
    if (producto.id_categoria === 1) navigate("/zapatillas");
    else if (producto.id_categoria === 2) navigate("/zapatos");
    else navigate("/catalogo");
  };

  if (loading)
    return <p className="carrusel-loading">Cargando recomendación IA...</p>;

  if (!productos.length)
    return (
      <p className="carrusel-empty-message">No hay productos disponibles.</p>
    );

  return (
    <div className="carrusel-ia-container">
      {/* TÍTULO ANIMADO */}
      <h2
        className={`carrusel-titulo ia-title-animate ${
          animateTitle ? "show" : ""
        }`}
      >
        <img
          src="https://www.gstatic.com/lamda/images/gemini_sparkle_aurora_33f86dc0c0257da337c63.svg"
          alt="IA Logo"
          style={{ width: "30px", marginRight: "8px" }}
        />
        {titulo}
      </h2>

      {/* PRODUCTOS ANIMADOS */}
      <div className={`ia-products ${animateProducts ? "show" : ""}`}>
        <Swiper
          modules={[Navigation, Autoplay]}
          navigation
          loop={true}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          spaceBetween={20}
          slidesPerView={3}
          breakpoints={{
            0: { slidesPerView: 1 },
            600: { slidesPerView: 2 },
            900: { slidesPerView: 3 },
          }}
        >
          {productos.map((p) => (
            <SwiperSlide key={p.id_producto}>
              <div
                className="ia-card"
                onClick={() => handleClickProducto(p)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={`http://localhost:8081${p.imagen_url}`}
                  alt={p.nombre}
                />
                <h3>{p.nombre}</h3>
                <p>S/ {p.precio}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default CarruselIA;

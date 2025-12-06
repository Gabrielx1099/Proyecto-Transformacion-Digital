import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "../css/CarruselIA.css";
import { useNavigate } from "react-router-dom";

const CarruselIA = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const cargarRecomendaciones = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5001/recomendar_baratos");
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setProductos(data.recomendaciones || []);
      } catch (e) {
        console.error("Error al cargar recomendaciones:", e.message);
        setProductos([]);
      } finally {
        setLoading(false);
      }
    };

    cargarRecomendaciones();
  }, []);

  const handleClickProducto = (producto) => {
    if (producto.id_categoria === 1) navigate("/zapatillas");
    else if (producto.id_categoria === 2) navigate("/zapatos");
    else navigate("/catalogo");
  };

  if (loading) return <p className="carrusel-loading">Cargando recomendaciones de IA...</p>;
  if (!productos.length)
    return <p className="carrusel-empty-message">No hay productos disponibles.</p>;

  return (
    <div className="carrusel-ia-container">
      <h2 className="carrusel-titulo">
        <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_aurora_33f86dc0c0257da337c63.svg" alt="IA Logo" style={{ width: "30px", marginRight: "8px" }} />
        Recomendación de IA: productos más económicos
      </h2>

      <Swiper
        modules={[Navigation, Autoplay]}
        navigation
        loop={true}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
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
              <img src={`http://localhost:8081${p.imagen_url}`} alt={p.nombre} />
              <h3>{p.nombre}</h3>
              <p>S/ {p.precio}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CarruselIA;

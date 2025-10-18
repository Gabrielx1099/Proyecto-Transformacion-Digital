import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './components/Home';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import VerificacionCodigo from './components/VerificacionCodigo';
import Pañaleria from './components/Pañaleria';
import Higiene from './components/Higiene';
import IntranetLayout from './components/IntranetLayout';
import Dashboard from './components/Dashboard';
import Proveedores from './components/Proveedores';
import Productos from './components/Productos';
import Carrito from './components/Carrito';
import Subcategoria from './components/Subcategoria';
import Marca from './components/Marca';

import DetalleVenta from './components/DetalleVenta';
import FormularioPago from './components/FormularioPago';
import ProcesarPago from './components/ProcesarPago';
import Registro from './components/Registro';


function App() {
    return (
        <Router>
            <Routes>
                {/* Rutas públicas con Layout */}
                <Route path="/" element={<Layout><Home /></Layout>} />
                <Route path="/login" element={<Layout><LoginForm /></Layout>} />
                <Route path="/registrar" element={<Layout><RegisterForm /></Layout>} />
                <Route path="/verificar-codigo" element={<Layout><VerificacionCodigo /></Layout>} />
                <Route path="/pañaleria" element={<Layout><Pañaleria /></Layout>} />
                <Route path="/higiene" element={<Layout><Higiene /></Layout>} />
                
                {/* Rutas privadas o de intranet con otro layout */}
                <Route path="/intranet" element={<IntranetLayout />}>
                    <Route index element={<Navigate to="dashboard" />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="proveedores" element={<Proveedores />} />
                    <Route path="productos" element={<Productos />} />
                    <Route path="subcategoria" element={<Subcategoria />} />
                    <Route path="marca" element={<Marca />} />
                    <Route path="registro" element={<Registro />} />
                </Route>
                
                {/* Rutas del flujo de compra */}
                <Route path="/carrito" element={<Layout><Carrito /></Layout>} />
                
                {/* Rutas para el proceso de venta */}
                <Route path="/detalle-venta/:idVenta" element={<Layout><DetalleVenta /></Layout>} />
                <Route path="/detalle-venta/nuevo" element={<Layout><DetalleVenta /></Layout>} />
                <Route path="/formulario-pago" element={<Layout><FormularioPago /></Layout>} />
                <Route path="/procesar-pago" element={<Layout><ProcesarPago /></Layout>} />
            </Routes>
        </Router>
    );

}
export default App;
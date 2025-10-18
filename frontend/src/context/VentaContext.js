// src/contexts/VentaContext.js
import React, { createContext, useContext, useReducer } from 'react';

const VentaContext = createContext();

// Estados del proceso de venta
const VENTA_STATES = {
  DETALLE: 'DETALLE',
  FORMULARIO_PAGO: 'FORMULARIO_PAGO',
  PROCESAR_PAGO: 'PROCESAR_PAGO',
  COMPLETADO: 'COMPLETADO',
  ERROR: 'ERROR'
};

// Métodos de pago disponibles
const METODOS_PAGO = {
  TARJETA: 'TARJETA',
  YAPE: 'YAPE',
  PLIN: 'PLIN',
  EFECTIVO: 'EFECTIVO'
};

// Estado inicial
const initialState = {
  // Estado del proceso
  currentStep: VENTA_STATES.DETALLE,
  loading: false,
  error: null,
  
  // Datos de la venta
  venta: null,
  detalleVenta: [],
  
  // Datos del formulario
  datosFacturacion: {
    tipoDocumento: 'boleta', // boleta | factura
    nombre: '',
    apellidos: '',
    email: '',
    telefono: '',
    direccion: '',
    distrito: '',
    provincia: '',
    departamento: '',
    codigoPostal: '',
    // Para facturas
    ruc: '',
    razonSocial: '',
    direccionFiscal: ''
  },
  
  // Datos del pago
  datosPago: {
    metodoPago: null,
    // Para tarjeta
    numeroTarjeta: '',
    nombreTarjeta: '',
    fechaVencimiento: '',
    cvv: '',
    // Para Yape/Plin
    numeroTelefono: '',
    // Totales
    subtotal: 0,
    impuestos: 0,
    envio: 0,
    total: 0
  },
  
  // Resultado
  ventaCompletada: null,
  pdfUrl: null
};

// Reducer
function ventaReducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
        error: null
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
      
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
        currentStep: VENTA_STATES.ERROR
      };
      
    case 'SET_DETALLE_VENTA':
      return {
        ...state,
        detalleVenta: action.payload,
        datosPago: {
          ...state.datosPago,
          subtotal: action.payload.reduce((sum, item) => sum + (item.precio * item.cantidad), 0),
          impuestos: action.payload.reduce((sum, item) => sum + (item.precio * item.cantidad * 0.18), 0),
          envio: action.payload.length > 0 ? 15.00 : 0,
          total: action.payload.reduce((sum, item) => sum + (item.precio * item.cantidad), 0) * 1.18 + (action.payload.length > 0 ? 15.00 : 0)
        }
      };
      
    case 'UPDATE_DATOS_FACTURACION':
      return {
        ...state,
        datosFacturacion: {
          ...state.datosFacturacion,
          ...action.payload
        }
      };
      
    case 'UPDATE_DATOS_PAGO':
      return {
        ...state,
        datosPago: {
          ...state.datosPago,
          ...action.payload
        }
      };
      
    case 'SET_VENTA_COMPLETADA':
      return {
        ...state,
        ventaCompletada: action.payload.venta,
        pdfUrl: action.payload.pdfUrl,
        currentStep: VENTA_STATES.COMPLETADO,
        loading: false
      };
      
    case 'RESET_VENTA':
      return initialState;
      
    default:
      return state;
  }
}

// Provider
export function VentaProvider({ children }) {
  const [state, dispatch] = useReducer(ventaReducer, initialState);
  
  // Acciones
  const actions = {
    // Navegación entre pasos
    goToStep: (step) => {
      dispatch({ type: 'SET_STEP', payload: step });
    },
    
    // Inicializar proceso de venta
    iniciarVenta: (productosCarrito) => {
      const detalleVenta = productosCarrito.map(item => ({
        id_producto: item.id,
        producto: item,
        cantidad: item.cantidad,
        precio: item.precio,
        subtotal: item.precio * item.cantidad
      }));
      
      dispatch({ type: 'SET_DETALLE_VENTA', payload: detalleVenta });
      dispatch({ type: 'SET_STEP', payload: VENTA_STATES.DETALLE });
    },
    
    // Actualizar datos de facturación
    actualizarDatosFacturacion: (datos) => {
      dispatch({ type: 'UPDATE_DATOS_FACTURACION', payload: datos });
    },
    
    // Actualizar datos de pago
    actualizarDatosPago: (datos) => {
      dispatch({ type: 'UPDATE_DATOS_PAGO', payload: datos });
    },
    
    // Procesar venta
    procesarVenta: async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        // Preparar datos para el backend
        const ventaData = {
          idUsuario: parseInt(localStorage.getItem('userId')),
          detalles: state.detalleVenta.map(item => ({
            id_producto: item.id_producto,
            cantidad: item.cantidad
          })),
          total: state.datosPago.total,
          datosFacturacion: state.datosFacturacion,
          datosPago: {
            metodoPago: state.datosPago.metodoPago,
            ...(state.datosPago.metodoPago === METODOS_PAGO.TARJETA && {
              numeroTarjeta: state.datosPago.numeroTarjeta.slice(-4), // Solo últimos 4 dígitos
              nombreTarjeta: state.datosPago.nombreTarjeta
            }),
            ...(state.datosPago.metodoPago === METODOS_PAGO.YAPE || state.datosPago.metodoPago === METODOS_PAGO.PLIN) && {
              numeroTelefono: state.datosPago.numeroTelefono
            }
          }
        };
        
        // Llamar al servicio de venta
        const response = await fetch('/api/ventas/procesar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(ventaData)
        });
        
        if (!response.ok) {
          throw new Error('Error al procesar la venta');
        }
        
        const result = await response.json();
        
        dispatch({ 
          type: 'SET_VENTA_COMPLETADA', 
          payload: {
            venta: result.venta,
            pdfUrl: result.pdfUrl
          }
        });
        
        // Limpiar carrito
        if (window.limpiarCarrito) {
          window.limpiarCarrito();
        }
        
      } catch (error) {
        console.error('Error al procesar venta:', error);
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    },
    
    // Reiniciar proceso
    reiniciarVenta: () => {
      dispatch({ type: 'RESET_VENTA' });
    },
    
    // Validaciones
    validarDatosFacturacion: () => {
      const { datosFacturacion } = state;
      const errores = [];
      
      if (!datosFacturacion.nombre.trim()) errores.push('Nombre es requerido');
      if (!datosFacturacion.apellidos.trim()) errores.push('Apellidos son requeridos');
      if (!datosFacturacion.email.trim()) errores.push('Email es requerido');
      if (!datosFacturacion.telefono.trim()) errores.push('Teléfono es requerido');
      if (!datosFacturacion.direccion.trim()) errores.push('Dirección es requerida');
      
      if (datosFacturacion.tipoDocumento === 'factura') {
        if (!datosFacturacion.ruc.trim()) errores.push('RUC es requerido');
        if (!datosFacturacion.razonSocial.trim()) errores.push('Razón Social es requerida');
      }
      
      return errores;
    },
    
    validarDatosPago: () => {
      const { datosPago } = state;
      const errores = [];
      
      if (!datosPago.metodoPago) {
        errores.push('Debe seleccionar un método de pago');
        return errores;
      }
      
      switch (datosPago.metodoPago) {
        case METODOS_PAGO.TARJETA:
          if (!datosPago.numeroTarjeta.trim()) errores.push('Número de tarjeta es requerido');
          if (!datosPago.nombreTarjeta.trim()) errores.push('Nombre en tarjeta es requerido');
          if (!datosPago.fechaVencimiento.trim()) errores.push('Fecha de vencimiento es requerida');
          if (!datosPago.cvv.trim()) errores.push('CVV es requerido');
          break;
          
        case METODOS_PAGO.YAPE:
        case METODOS_PAGO.PLIN:
          if (!datosPago.numeroTelefono.trim()) errores.push('Número de teléfono es requerido');
          break;
      }
      
      return errores;
    }
  };
  
  const value = {
    ...state,
    ...actions,
    VENTA_STATES,
    METODOS_PAGO
  };
  
  return (
    <VentaContext.Provider value={value}>
      {children}
    </VentaContext.Provider>
  );
}

// Hook personalizado
export function useVenta() {
  const context = useContext(VentaContext);
  if (!context) {
    throw new Error('useVenta debe ser usado dentro de VentaProvider');
  }
  return context;
}
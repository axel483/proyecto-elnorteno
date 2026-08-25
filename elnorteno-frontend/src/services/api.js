import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// =======================================================
// FUNCIONES DE PRODUCTOS
// =======================================================
export const getProductos = async () => {
  try {
    const response = await api.get('/productos');
    return response.data;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return [];
  }
};

// Alias para mantener compatibilidad
export const getProductosCompletos = getProductos;

export const createProducto = async (data) => {
  const response = await api.post('/productos', data);
  return response.data;
};

export const updateProducto = async (id, data) => {
  const response = await api.put(`/productos/${id}`, data);
  return response.data;
};

export const deleteProducto = async (id) => {
  const response = await api.delete(`/productos/${id}`);
  return response.data;
};

// =======================================================
// FUNCIONES DE CATEGORÍAS
// =======================================================
export const getCategorias = async () => {
  const response = await api.get('/categorias');
  return response.data;
};

export const createCategoria = async (data) => {
  const response = await api.post('/categorias', data);
  return response.data;
};

export const updateCategoria = async (id, data) => {
  const response = await api.put(`/categorias/${id}`, data);
  return response.data;
};

export const deleteCategoria = async (id) => {
  const response = await api.delete(`/categorias/${id}`);
  return response.data;
};

// =======================================================
// FUNCIONES DE PRESENTACIONES (stock)
// =======================================================
export const getPresentaciones = async () => {
  try {
    const response = await api.get('/productos/presentaciones');
    return response.data;
  } catch (error) {
    console.warn("Ruta /productos/presentaciones no encontrada.");
    return [];
  }
};

export const updatePresentacion = async (id, data) => {
  const response = await api.put(`/presentaciones/${id}`, data);
  return response.data;
};

// =======================================================
// FUNCIONES DE CLIENTES
// =======================================================
export const getClientes = async () => {
  try {
    const response = await api.get('/clientes');
    return response.data;
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return [];
  }
};

export const buscarClientePorDocumento = async (documento) => {
  try {
    const response = await api.get(`/clientes/buscar?documento=${documento}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
};

export const createCliente = async (clienteData) => {
  const response = await api.post('/clientes', clienteData);
  return response.data;
};

export const updateCliente = async (id, clienteData) => {
  const response = await api.put(`/clientes/${id}`, clienteData);
  return response.data;
};

export const deleteCliente = async (id) => {
  const response = await api.delete(`/clientes/${id}`);
  return response.data;
};

// =======================================================
// FUNCIONES DE PROVEEDORES
// =======================================================
export const getProveedores = async () => {
  try {
    const response = await api.get('/proveedores');
    return response.data;
  } catch (error) {
    console.error("Error al obtener proveedores:", error);
    return [];
  }
};

export const createProveedor = async (proveedorData) => {
  const response = await api.post('/proveedores', proveedorData);
  return response.data;
};

// =======================================================
// FUNCIONES DE VENTAS
// =======================================================
export const getVentas = async () => {
  try {
    const response = await api.get('/ventas');
    return response.data;
  } catch (error) {
    console.error("Error al obtener ventas:", error);
    return [];
  }
};

export const getVentaDetalle = async (id) => {
  const response = await api.get(`/ventas/${id}`);
  return response.data;
};

export const createVenta = async (ventaData) => {
  const response = await api.post('/ventas', ventaData);
  return response.data;
};

export const reimprimirComprobante = async (id) => {
  const response = await api.get(`/ventas/${id}/imprimir`);
  return response.data;
};

export default api;
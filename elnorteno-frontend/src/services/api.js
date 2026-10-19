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
// FUNCIONES DE CAJA
// =======================================================
export const getEstadoCaja = async () => {
  try {
    const response = await api.get('/caja/estado');
    return response.data;
  } catch (error) {
    console.error("Error al consultar estado de caja:", error);
    return null;
  }
};

// =======================================================
// FUNCIONES DE PRODUCTOS
// =======================================================
export const getProductos = async () => {
  try {
    const usuarioString = localStorage.getItem('usuario');
    const idEmpresa = usuarioString ? (JSON.parse(usuarioString).datos?.idEmpresa || 1) : 1;
    
    const response = await api.get(`/productos?idEmpresa=${idEmpresa}`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return [];
  }
};

export const getProductosCompletos = getProductos;

export const createProducto = async (data) => {
  const usuarioString = localStorage.getItem('usuario');
  const idEmpresa = usuarioString ? (JSON.parse(usuarioString).datos?.idEmpresa || 1) : 1;
  
  const payload = { ...data, idEmpresa };
  const response = await api.post('/productos', payload);
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

export const getAlertasStock = async () => {
  try {
    const response = await api.get('/productos/alertas-stock');
    return response.data;
  } catch (error) {
    console.error("Error al obtener alertas:", error);
    return { total: 0, alertas: [] };
  }
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
// FUNCIONES DE PRESENTACIONES
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
    const usuarioString = localStorage.getItem('usuario');
    const idEmpresa = usuarioString ? (JSON.parse(usuarioString).datos?.idEmpresa || 1) : 1;
    
    const response = await api.get(`/clientes?idEmpresa=${idEmpresa}`);
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
  const usuarioString = localStorage.getItem('usuario');
  const idEmpresa = usuarioString ? (JSON.parse(usuarioString).datos?.idEmpresa || 1) : 1;
  const payload = { ...clienteData, idEmpresa };

  const response = await api.post('/clientes', payload);
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

export const updateProveedor = async (id, proveedorData) => {
  const response = await api.put(`/proveedores/${id}`, proveedorData);
  return response.data;
};

export const deleteProveedor = async (id) => {
  const response = await api.delete(`/proveedores/${id}`);
  return response.data;
};

export const buscarRucProveedor = async (ruc) => {
  try {
    const response = await api.get(`/proveedores/buscar-ruc?numero=${ruc}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
};

// =======================================================
// FUNCIONES DE VENTAS (MODIFICADO)
// =======================================================
export const getVentas = async () => {
  try {
    const usuarioString = localStorage.getItem('usuario');
    const idEmpresa = usuarioString ? (JSON.parse(usuarioString).datos?.idEmpresa || 1) : 1;

    const response = await api.get(`/ventas?idEmpresa=${idEmpresa}`);
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
  // 👇 INYECTAR EL ID DE LA EMPRESA AL CREAR LA VENTA
  const usuarioString = localStorage.getItem('usuario');
  const idEmpresa = usuarioString ? (JSON.parse(usuarioString).datos?.idEmpresa || 1) : 1;
  
  const payload = { ...ventaData, idEmpresa };
  
  const response = await api.post('/ventas', payload);
  return response.data;
};

export const reimprimirComprobante = async (id) => {
  const response = await api.get(`/ventas/${id}/imprimir`);
  return response.data;
};

// =======================================================
// FUNCIONES DE EMPRESAS (SAAS)
// =======================================================
export const getEmpresas = async () => {
  const response = await api.get('/empresas');
  return response.data;
};

export const getEmpresaPorSlug = async (slug) => {
  const response = await api.get(`/empresas/slug/${slug}`);
  return response.data;
};

export const createEmpresa = async (data) => {
  const response = await api.post('/empresas', data);
  return response.data;
};

export const updateEmpresa = async (id, data) => {
  const response = await api.put(`/empresas/${id}`, data);
  return response.data;
};

export const cambiarEstadoEmpresa = async (id, estado) => {
  const response = await api.put(`/empresas/${id}/estado?estado=${estado}`);
  return response.data;
};

export const registrarPagoEmpresa = async (id) => {
  const response = await api.put(`/empresas/${id}/pagar`);
  return response.data;
};

export const deleteEmpresa = async (id) => {
  const response = await api.delete(`/empresas/${id}`);
  return response.data;
};

export default api;
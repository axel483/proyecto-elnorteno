import React, { useState, useEffect } from 'react';
import {
  getCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  getProductosCompletos,
  createProducto,
  updateProducto,
  deleteProducto,
  updatePresentacion,
} from '../services/api';

export default function Inventario() {
  // Estados para categorías
  const [categorias, setCategorias] = useState([]);
  const [categoriaForm, setCategoriaForm] = useState({ nombre: '', descripcion: '' });
  const [editandoCategoria, setEditandoCategoria] = useState(null);

  // Estados para productos
  const [productos, setProductos] = useState([]);
  const [productoForm, setProductoForm] = useState({
    nombre: '',
    descripcion: '',
    idCategoria: '',
    presentaciones: [{ nombrePresentacion: 'Unidad', factorConversion: 1, precioVenta: 0, stockFisico: 0 }]
  });
  const [editandoProducto, setEditandoProducto] = useState(null);
  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);

  // Cargar datos al inicio
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [cats, prods] = await Promise.all([
        getCategorias(),
        getProductosCompletos()
      ]);
      setCategorias(cats);
      setProductos(prods);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  // ============ CRUD CATEGORÍAS ============
  const handleCategoriaSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editandoCategoria) {
        await updateCategoria(editandoCategoria.idCategoria, categoriaForm);
      } else {
        await createCategoria(categoriaForm);
      }
      setCategoriaForm({ nombre: '', descripcion: '' });
      setEditandoCategoria(null);
      cargarDatos();
    } catch (error) {
      console.error('Error guardando categoría:', error);
    }
  };

  const handleEditarCategoria = (categoria) => {
    setEditandoCategoria(categoria);
    setCategoriaForm({ nombre: categoria.nombre, descripcion: categoria.descripcion || '' });
  };

  const handleEliminarCategoria = async (id) => {
    if (window.confirm('¿Eliminar esta categoría? Se eliminarán también sus productos.')) {
      try {
        await deleteCategoria(id);
        cargarDatos();
      } catch (error) {
        console.error('Error eliminando categoría:', error);
      }
    }
  };

  // ============ CRUD PRODUCTOS ============
  const handleProductoSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editandoProducto) {
        await updateProducto(editandoProducto.idProducto, productoForm);
      } else {
        await createProducto(productoForm);
      }
      setProductoForm({
        nombre: '',
        descripcion: '',
        idCategoria: '',
        presentaciones: [{ nombrePresentacion: 'Unidad', factorConversion: 1, precioVenta: 0, stockFisico: 0 }]
      });
      setEditandoProducto(null);
      setMostrarModalProducto(false);
      cargarDatos();
    } catch (error) {
      console.error('Error guardando producto:', error);
    }
  };

  const handleEditarProducto = (producto) => {
    setEditandoProducto(producto);
    setProductoForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      idCategoria: producto.idCategoria,
      presentaciones: producto.presentaciones || [{ nombrePresentacion: 'Unidad', factorConversion: 1, precioVenta: 0, stockFisico: 0 }]
    });
    setMostrarModalProducto(true);
  };

  const handleEliminarProducto = async (id) => {
    if (window.confirm('¿Eliminar este producto?')) {
      try {
        await deleteProducto(id);
        cargarDatos();
      } catch (error) {
        console.error('Error eliminando producto:', error);
      }
    }
  };

  // ============ ACTUALIZAR STOCK (desde la lista) ============
  const handleActualizarStock = async (idPresentacion, nuevoStock) => {
    try {
      await updatePresentacion(idPresentacion, { stockFisico: parseInt(nuevoStock) });
      cargarDatos(); // Recargar para ver el cambio
    } catch (error) {
      console.error('Error actualizando stock:', error);
    }
  };

  // ============ RENDER ============
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">📦 Gestión de Inventario</h1>

      {/* ===== SECCIÓN CATEGORÍAS ===== */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-slate-200">
        <h2 className="text-lg font-bold text-slate-700 mb-4">Categorías</h2>

        <form onSubmit={handleCategoriaSubmit} className="flex flex-wrap gap-3 mb-4">
          <input
            type="text"
            placeholder="Nombre de categoría"
            value={categoriaForm.nombre}
            onChange={(e) => setCategoriaForm({ ...categoriaForm, nombre: e.target.value })}
            className="px-3 py-2 border rounded-lg text-sm flex-1 min-w-[150px]"
            required
          />
          <input
            type="text"
            placeholder="Descripción"
            value={categoriaForm.descripcion}
            onChange={(e) => setCategoriaForm({ ...categoriaForm, descripcion: e.target.value })}
            className="px-3 py-2 border rounded-lg text-sm flex-1 min-w-[150px]"
          />
          <button
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold"
          >
            {editandoCategoria ? 'Actualizar' : 'Crear'}
          </button>
          {editandoCategoria && (
            <button
              type="button"
              onClick={() => {
                setEditandoCategoria(null);
                setCategoriaForm({ nombre: '', descripcion: '' });
              }}
              className="bg-slate-300 hover:bg-slate-400 text-slate-800 px-4 py-2 rounded-lg text-sm"
            >
              Cancelar
            </button>
          )}
        </form>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {categorias.map((cat) => (
            <div key={cat.idCategoria} className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <p className="font-semibold text-slate-800">{cat.nombre}</p>
                {cat.descripcion && <p className="text-xs text-slate-500">{cat.descripcion}</p>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditarCategoria(cat)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleEliminarCategoria(cat.idCategoria)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== SECCIÓN PRODUCTOS ===== */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-slate-700">Productos</h2>
          <button
            onClick={() => {
              setEditandoProducto(null);
              setProductoForm({
                nombre: '',
                descripcion: '',
                idCategoria: '',
                presentaciones: [{ nombrePresentacion: 'Unidad', factorConversion: 1, precioVenta: 0, stockFisico: 0 }]
              });
              setMostrarModalProducto(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold"
          >
            + Nuevo Producto
          </button>
        </div>

        {/* Listado de productos */}
        <div className="space-y-4">
          {productos.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No hay productos registrados. ¡Crea uno nuevo!</p>
          ) : (
            productos.map((prod) => (
              <div key={prod.idProducto} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-slate-800">{prod.nombre}</h3>
                    <p className="text-xs text-slate-500">
                      Categoría: {categorias.find(c => c.idCategoria === prod.idCategoria)?.nombre || 'Sin categoría'}
                    </p>
                    {prod.descripcion && <p className="text-sm text-slate-600">{prod.descripcion}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditarProducto(prod)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleEliminarProducto(prod.idProducto)}
                      className="text-red-600 hover:text-red-800"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>

                {/* Presentaciones y stock */}
                {prod.presentaciones && prod.presentaciones.length > 0 ? (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {prod.presentaciones.map((pres) => (
                      <div key={pres.idPresentacion} className="bg-white p-3 rounded-lg border border-slate-200">
                        <p className="font-semibold text-sm">{pres.nombrePresentacion}</p>
                        <p className="text-sm text-slate-600">Precio: S/ {pres.precioVenta?.toFixed(2) || '0.00'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm">Stock:</span>
                          <input
                            type="number"
                            value={pres.stockFisico || 0}
                            onChange={(e) => {
                              const nuevoStock = parseInt(e.target.value) || 0;
                              // Actualizar localmente
                              const nuevosProductos = productos.map(p => {
                                if (p.idProducto === prod.idProducto) {
                                  return {
                                    ...p,
                                    presentaciones: p.presentaciones.map(pr => 
                                      pr.idPresentacion === pres.idPresentacion 
                                        ? { ...pr, stockFisico: nuevoStock }
                                        : pr
                                    )
                                  };
                                }
                                return p;
                              });
                              setProductos(nuevosProductos);
                            }}
                            className="w-16 px-1 py-0.5 border rounded text-sm text-center"
                            min="0"
                          />
                          <button
                            onClick={() => handleActualizarStock(pres.idPresentacion, pres.stockFisico)}
                            className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded hover:bg-emerald-200"
                          >
                            Actualizar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 mt-2">No tiene presentaciones registradas</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ===== MODAL PARA CREAR/EDITAR PRODUCTO ===== */}
      {mostrarModalProducto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">
              {editandoProducto ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>

            <form onSubmit={handleProductoSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Nombre</label>
                <input
                  type="text"
                  value={productoForm.nombre}
                  onChange={(e) => setProductoForm({ ...productoForm, nombre: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Categoría</label>
                <select
                  value={productoForm.idCategoria}
                  onChange={(e) => setProductoForm({ ...productoForm, idCategoria: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.idCategoria} value={cat.idCategoria}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Descripción</label>
                <textarea
                  value={productoForm.descripcion}
                  onChange={(e) => setProductoForm({ ...productoForm, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Presentaciones</label>
                {productoForm.presentaciones.map((pres, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 mb-2 bg-slate-50 p-2 rounded">
                    <input
                      type="text"
                      placeholder="Nombre"
                      value={pres.nombrePresentacion}
                      onChange={(e) => {
                        const nuevas = [...productoForm.presentaciones];
                        nuevas[index].nombrePresentacion = e.target.value;
                        setProductoForm({ ...productoForm, presentaciones: nuevas });
                      }}
                      className="px-2 py-1 border rounded text-sm col-span-1"
                    />
                    <input
                      type="number"
                      placeholder="Factor"
                      value={pres.factorConversion}
                      onChange={(e) => {
                        const nuevas = [...productoForm.presentaciones];
                        nuevas[index].factorConversion = parseInt(e.target.value) || 1;
                        setProductoForm({ ...productoForm, presentaciones: nuevas });
                      }}
                      className="px-2 py-1 border rounded text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Precio"
                      step="0.01"
                      value={pres.precioVenta}
                      onChange={(e) => {
                        const nuevas = [...productoForm.presentaciones];
                        nuevas[index].precioVenta = parseFloat(e.target.value) || 0;
                        setProductoForm({ ...productoForm, presentaciones: nuevas });
                      }}
                      className="px-2 py-1 border rounded text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Stock"
                      value={pres.stockFisico}
                      onChange={(e) => {
                        const nuevas = [...productoForm.presentaciones];
                        nuevas[index].stockFisico = parseInt(e.target.value) || 0;
                        setProductoForm({ ...productoForm, presentaciones: nuevas });
                      }}
                      className="px-2 py-1 border rounded text-sm"
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setProductoForm({
                      ...productoForm,
                      presentaciones: [
                        ...productoForm.presentaciones,
                        { nombrePresentacion: 'Unidad', factorConversion: 1, precioVenta: 0, stockFisico: 0 }
                      ]
                    });
                  }}
                  className="text-sm text-emerald-600 hover:text-emerald-800"
                >
                  + Agregar presentación
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold"
                >
                  {editandoProducto ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarModalProducto(false)}
                  className="bg-slate-300 hover:bg-slate-400 text-slate-800 px-6 py-2 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
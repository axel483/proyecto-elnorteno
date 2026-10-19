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
} from '../services/api';

export default function Inventario() {
  const [categorias, setCategorias] = useState([]);
  const [categoriaForm, setCategoriaForm] = useState({ nombre: '', descripcion: '' });
  const [editandoCategoria, setEditandoCategoria] = useState(null);

  const [productos, setProductos] = useState([]);
  const [productoForm, setProductoForm] = useState({
    nombre: '',
    descripcion: '',
    idCategoria: '',
    stock: 0,
    stockMinimo: 5,
    presentaciones: [{ nombrePresentacion: 'Unidad', factorConversion: 1, precioVenta: 0 }]
  });
  const [editandoProducto, setEditandoProducto] = useState(null);
  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);

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

    const presentacionesValidas = productoForm.presentaciones.filter(p =>
      p.nombrePresentacion.trim() !== '' && p.precioVenta > 0
    );

    if (presentacionesValidas.length === 0) {
      alert('❌ Debes agregar al menos una presentación con nombre y precio mayor a 0.');
      return;
    }

    const datosEnviar = {
      nombre: productoForm.nombre,
      descripcion: productoForm.descripcion,
      idCategoria: productoForm.idCategoria,
      stock: productoForm.stock || 0,
      stockMinimo: productoForm.stockMinimo || 5,
      presentaciones: presentacionesValidas.map(p => ({
        idPresentacion: p.idPresentacion || null,
        nombrePresentacion: p.nombrePresentacion,
        factorConversion: p.factorConversion || 1,
        precioVenta: p.precioVenta
      }))
    };

    try {
      if (editandoProducto) {
        await updateProducto(editandoProducto.idProducto, datosEnviar);
      } else {
        await createProducto(datosEnviar);
      }
      setProductoForm({
        nombre: '',
        descripcion: '',
        idCategoria: '',
        stock: 0,
        stockMinimo: 5,
        presentaciones: [{ nombrePresentacion: 'Unidad', factorConversion: 1, precioVenta: 0 }]
      });
      setEditandoProducto(null);
      setMostrarModalProducto(false);
      cargarDatos();
    } catch (error) {
      console.error('Error guardando producto:', error);
      alert('❌ Error al guardar el producto. Revisa la consola.');
    }
  };

  const handleEditarProducto = (producto) => {
    setEditandoProducto(producto);
    setProductoForm({
      nombre: producto.nombre,
      descripcion: producto.descripcion || '',
      idCategoria: producto.idCategoria,
      stock: producto.stock || 0,
      stockMinimo: producto.stockMinimo || 5,
      presentaciones: producto.presentaciones?.length > 0
        ? producto.presentaciones.map(p => ({
            idPresentacion: p.idPresentacion,
            nombrePresentacion: p.nombrePresentacion || 'Unidad',
            factorConversion: p.factorConversion || 1,
            precioVenta: p.precioVenta || 0
          }))
        : [{ nombrePresentacion: 'Unidad', factorConversion: 1, precioVenta: 0 }]
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

  const agregarPresentacion = () => {
    setProductoForm({
      ...productoForm,
      presentaciones: [
        ...productoForm.presentaciones,
        { nombrePresentacion: '', factorConversion: 1, precioVenta: 0 }
      ]
    });
  };

  const eliminarPresentacion = (index) => {
    if (productoForm.presentaciones.length <= 1) {
      alert('❌ Debe haber al menos una presentación.');
      return;
    }
    const nuevas = productoForm.presentaciones.filter((_, i) => i !== index);
    setProductoForm({ ...productoForm, presentaciones: nuevas });
  };

  const handlePresentacionChange = (index, campo, valor) => {
    const nuevas = [...productoForm.presentaciones];
    nuevas[index][campo] = valor;
    setProductoForm({ ...productoForm, presentaciones: nuevas });
  };

  // 👇 Contar productos con stock bajo para mostrarlo en el header
  const productosConStockBajo = productos.filter(
    p => (p.stock || 0) <= (p.stockMinimo || 5)
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-800">📦 Gestión de Inventario</h1>

        {/* 👇 ALERTA GLOBAL DE STOCK BAJO */}
        {productosConStockBajo.length > 0 && (
          <div className="bg-red-50 border border-red-300 rounded-xl px-4 py-2 flex items-center gap-3 animate-pulse">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-sm font-bold text-red-800">
                {productosConStockBajo.length} producto(s) con stock bajo
              </p>
              <p className="text-xs text-red-600">Revisa la lista más abajo</p>
            </div>
          </div>
        )}
      </div>

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
          <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold">
            {editandoCategoria ? 'Actualizar' : 'Crear'}
          </button>
          {editandoCategoria && (
            <button
              type="button"
              onClick={() => { setEditandoCategoria(null); setCategoriaForm({ nombre: '', descripcion: '' }); }}
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
                <button onClick={() => handleEditarCategoria(cat)} className="text-blue-600 hover:text-blue-800 text-sm">✏️</button>
                <button onClick={() => handleEliminarCategoria(cat.idCategoria)} className="text-red-600 hover:text-red-800 text-sm">🗑️</button>
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
                stock: 0,
                stockMinimo: 5,
                presentaciones: [{ nombrePresentacion: 'Unidad', factorConversion: 1, precioVenta: 0 }]
              });
              setMostrarModalProducto(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold"
          >
            + Nuevo Producto
          </button>
        </div>

        <div className="space-y-4">
          {productos.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No hay productos registrados. ¡Crea uno nuevo!</p>
          ) : (
            productos.map((prod) => {
              const stockBajo = (prod.stock || 0) <= (prod.stockMinimo || 5);
              const sinStock = (prod.stock || 0) === 0;

              return (
                <div
                  key={prod.idProducto}
                  className={`border-2 rounded-lg p-4 transition-all ${
                    sinStock
                      ? 'border-red-400 bg-red-50'
                      : stockBajo
                      ? 'border-orange-300 bg-orange-50'
                      : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-800">{prod.nombre}</h3>

                        {/* 👇 BADGES DE ALERTA */}
                        {sinStock && (
                          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            ❌ SIN STOCK
                          </span>
                        )}
                        {!sinStock && stockBajo && (
                          <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                            ⚠️ STOCK BAJO
                          </span>
                        )}
                        {!stockBajo && (
                          <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            ✅ OK
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        Categoría: {categorias.find(c => c.idCategoria === prod.idCategoria)?.nombre || 'Sin categoría'}
                      </p>
                      {prod.descripcion && <p className="text-sm text-slate-600">{prod.descripcion}</p>}

                      {/* 👇 STOCK CON COLOR DINÁMICO */}
                      <p className={`text-sm font-bold ${
                        sinStock ? 'text-red-700' : stockBajo ? 'text-orange-700' : 'text-emerald-600'
                      }`}>
                        Stock: {prod.stock || 0} unidades
                        {prod.stockMinimo && ` (Mínimo: ${prod.stockMinimo})`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditarProducto(prod)} className="text-blue-600 hover:text-blue-800">
                        ✏️ Editar
                      </button>
                      <button onClick={() => handleEliminarProducto(prod.idProducto)} className="text-red-600 hover:text-red-800">
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>

                  {prod.presentaciones && prod.presentaciones.length > 0 ? (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {prod.presentaciones.map((pres) => (
                        <div key={pres.idPresentacion} className="bg-white p-3 rounded-lg border border-slate-200">
                          <p className="font-semibold text-sm">{pres.nombrePresentacion || 'Sin nombre'}</p>
                          <p className="text-sm text-slate-600">Precio: S/ {pres.precioVenta?.toFixed(2) || '0.00'}</p>
                          <p className="text-xs text-slate-500">Factor: {pres.factorConversion || 1} unidades</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 mt-2">No tiene presentaciones registradas</p>
                  )}
                </div>
              );
            })
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
              {/* Nombre */}
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

              {/* Categoría */}
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

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-slate-700">Descripción</label>
                <textarea
                  value={productoForm.descripcion}
                  onChange={(e) => setProductoForm({ ...productoForm, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows="2"
                />
              </div>

              {/* Stock total */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Stock total</label>
                  <input
                    type="number"
                    min="0"
                    value={productoForm.stock === 0 ? '' : productoForm.stock}
                    onChange={(e) => setProductoForm({ ...productoForm, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">Unidades base (ej: botellas).</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">⚠️ Stock mínimo</label>
                  <input
                    type="number"
                    min="0"
                    value={productoForm.stockMinimo === 0 ? '' : productoForm.stockMinimo}
                    onChange={(e) => setProductoForm({ ...productoForm, stockMinimo: parseInt(e.target.value) || 5 })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                  <p className="text-xs text-slate-500 mt-1">Alerta cuando llegue a este valor.</p>
                </div>
              </div>

              {/* PRESENTACIONES */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Presentaciones</label>
                <p className="text-xs text-slate-500 mb-3">
                  Agrega todas las presentaciones que tiene este producto (ej: Unidad, Caja x 12, Sixpack, etc.)
                </p>

                {productoForm.presentaciones.map((pres, index) => (
                  <div key={index} className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-3 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-500 font-medium mb-1">Nombre de la presentación</label>
                        <input
                          type="text"
                          placeholder="Ej: Unidad, Caja x 12, Sixpack"
                          value={pres.nombrePresentacion}
                          onChange={(e) => handlePresentacionChange(index, 'nombrePresentacion', e.target.value)}
                          className="w-full px-3 py-1.5 border rounded-lg text-sm"
                          required={index === 0}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-500 font-medium mb-1">Factor (unidades x presentación)</label>
                        <input
                          type="number"
                          placeholder="Ej: 12"
                          value={pres.factorConversion === 0 ? '' : pres.factorConversion}
                          onChange={(e) => handlePresentacionChange(index, 'factorConversion', e.target.value === '' ? 0 : parseInt(e.target.value))}
                          className="w-full px-3 py-1.5 border rounded-lg text-sm"
                          min="1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-500 font-medium mb-1">Precio de venta (S/)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={pres.precioVenta === 0 ? '' : pres.precioVenta}
                        onChange={(e) => handlePresentacionChange(index, 'precioVenta', e.target.value === '' ? 0 : parseFloat(e.target.value))}
                        className="w-full px-3 py-1.5 border rounded-lg text-sm"
                        min="0"
                        required={index === 0}
                      />
                    </div>

                    {productoForm.presentaciones.length > 1 && (
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => eliminarPresentacion(index)}
                          className="text-xs text-red-600 hover:text-red-800 font-medium"
                        >
                          🗑️ Eliminar esta presentación
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={agregarPresentacion}
                  className="text-sm text-emerald-600 hover:text-emerald-800 font-medium"
                >
                  + Agregar presentación
                </button>
              </div>

              {/* Botones del modal */}
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
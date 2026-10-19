import React, { useState, useEffect } from 'react';
import {
  getProveedores,
  createProveedor,
  updateProveedor,
  deleteProveedor,
  buscarRucProveedor
} from '../services/api';

export default function Proveedores() {
  const [proveedores, setProveedores] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [buscandoRuc, setBuscandoRuc] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    ruc: '',
    razonSocial: '',
    telefono: '',
    email: '',
    direccion: ''
  });

  useEffect(() => {
    cargarProveedores();
  }, []);

  const cargarProveedores = async () => {
    setLoading(true);
    try {
      const data = await getProveedores();
      setProveedores(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      setProveedores([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // 🔍 BUSCAR RUC EN SUNAT (CON LOGS DE DEPURACIÓN)
  // ============================================
  const handleRucChange = async (e) => {
    const valor = e.target.value.replace(/\D/g, ''); // Solo números
    console.log('🔤 Valor ingresado:', valor, '| Longitud:', valor.length);

    setFormData(prev => ({ ...prev, ruc: valor }));

    // Solo buscar si tiene exactamente 11 dígitos
    if (valor.length === 11) {
      console.log('🚀 Iniciando consulta a SUNAT para RUC:', valor);
      setBuscandoRuc(true);

      try {
        const data = await buscarRucProveedor(valor);
        console.log('📦 Respuesta de la API:', data);

        if (data && data.razonSocial) {
          console.log('✅ Actualizando razón social a:', data.razonSocial);
          console.log('✅ Actualizando dirección a:', data.direccion);

          setFormData(prev => ({
            ...prev,
            razonSocial: data.razonSocial || prev.razonSocial,
            direccion: data.direccion || prev.direccion
          }));

          console.log('✅ Estado actualizado correctamente');
        } else {
          console.warn('⚠️ La API no devolvió datos válidos:', data);
        }
      } catch (error) {
        console.error('❌ Error al buscar RUC:', error);
        console.error('❌ Detalle:', error.response?.data || error.message);
      } finally {
        setBuscandoRuc(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await updateProveedor(editando.idProveedor, formData);
      } else {
        await createProveedor(formData);
      }
      resetForm();
      setMostrarModal(false);
      cargarProveedores();
    } catch (error) {
      console.error('Error al guardar proveedor:', error);
      alert('❌ Error al guardar proveedor: ' + (error.response?.data || error.message));
    }
  };

  const handleEditar = (proveedor) => {
    setEditando(proveedor);
    setFormData({
      ruc: proveedor.ruc || '',
      razonSocial: proveedor.razonSocial || '',
      telefono: proveedor.telefono || '',
      email: proveedor.email || '',
      direccion: proveedor.direccion || ''
    });
    setMostrarModal(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Eliminar este proveedor?')) {
      try {
        await deleteProveedor(id);
        cargarProveedores();
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('❌ Error al eliminar: ' + (error.response?.data || error.message));
      }
    }
  };

  const resetForm = () => {
    setFormData({
      ruc: '',
      razonSocial: '',
      telefono: '',
      email: '',
      direccion: ''
    });
    setEditando(null);
  };

  const proveedoresFiltrados = proveedores.filter(p =>
    (p.razonSocial || '').toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.ruc || '').includes(busqueda)
  );

  if (loading) {
    return <div className="text-center py-8 text-slate-500">Cargando proveedores...</div>;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🏭 Gestión de Proveedores</h1>
          <p className="text-sm text-slate-500 mt-1">
            Administra los proveedores de tu negocio
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setMostrarModal(true); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
        >
          + Nuevo Proveedor
        </button>
      </div>

      {/* Buscador */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 border border-slate-200">
        <input
          type="text"
          placeholder="🔍 Buscar por razón social o RUC..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-emerald-700 text-white text-xs uppercase">
            <tr>
              <th className="p-4">RUC</th>
              <th className="p-4">Razón Social</th>
              <th className="p-4">Teléfono</th>
              <th className="p-4">Email</th>
              <th className="p-4">Dirección</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {proveedoresFiltrados.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-slate-400">
                  No hay proveedores registrados
                </td>
              </tr>
            ) : (
              proveedoresFiltrados.map((prov) => (
                <tr key={prov.idProveedor} className="hover:bg-slate-50">
                  <td className="p-4 font-mono font-semibold">{prov.ruc}</td>
                  <td className="p-4 font-semibold text-slate-800">{prov.razonSocial}</td>
                  <td className="p-4 text-slate-600">{prov.telefono || '-'}</td>
                  <td className="p-4 text-slate-600">{prov.email || '-'}</td>
                  <td className="p-4 text-slate-600 text-xs">{prov.direccion || '-'}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleEditar(prov)}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleEliminar(prov.idProveedor)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="bg-emerald-700 text-white p-5 flex justify-between items-center rounded-t-xl">
              <h2 className="text-xl font-bold">
                {editando ? 'Editar Proveedor' : 'Nuevo Proveedor'}
              </h2>
              <button
                onClick={() => { setMostrarModal(false); resetForm(); }}
                className="text-white hover:bg-emerald-600 p-1 rounded transition"
              >
                ✕
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* RUC */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  RUC *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.ruc}
                    onChange={handleRucChange}
                    placeholder="20100113610"
                    maxLength={11}
                    className="w-full border rounded-lg p-2 pr-10"
                    required
                  />
                  {buscandoRuc && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 text-sm animate-pulse">
                      ⏳
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Al escribir 11 dígitos se autocompletará la razón social
                </p>
              </div>

              {/* Razón Social */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Razón Social *
                </label>
                <input
                  type="text"
                  value={formData.razonSocial}
                  onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                  placeholder="Ej. Comercializadora ABC S.A.C."
                  className="w-full border rounded-lg p-2"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Teléfono */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Teléfono / Celular
                  </label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="987654321"
                    className="w-full border rounded-lg p-2"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ejemplo@correo.com"
                    className="w-full border rounded-lg p-2"
                  />
                </div>
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Dirección Fiscal / Domicilio
                </label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Av. Principal 123, Distrito..."
                  className="w-full border rounded-lg p-2"
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => { setMostrarModal(false); resetForm(); }}
                  className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                >
                  {editando ? 'Actualizar' : 'Guardar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
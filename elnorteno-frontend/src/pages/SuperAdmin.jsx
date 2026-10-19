import React, { useState, useEffect } from 'react';
import {
  getEmpresas,
  createEmpresa,
  updateEmpresa,
  cambiarEstadoEmpresa,
  registrarPagoEmpresa,
  deleteEmpresa
} from '../services/api';

export default function SuperAdmin() {
  const [empresas, setEmpresas] = useState([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    ruc: '',
    razonSocial: '',
    nombreComercial: '',
    slug: '',
    logoUrl: '',
    colorPrimario: '#059669',
    direccion: '',
    telefono: '',
    emailAdmin: '',
    montoMensual: 150,
    notas: ''
  });

  useEffect(() => {
    cargarEmpresas();
  }, []);

  const cargarEmpresas = async () => {
    try {
      const data = await getEmpresas();
      setEmpresas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar empresas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await updateEmpresa(editando.idEmpresa, formData);
      } else {
        await createEmpresa(formData);
      }
      resetForm();
      setMostrarModal(false);
      cargarEmpresas();
    } catch (error) {
      alert('Error: ' + (error.response?.data || error.message));
    }
  };

  const handleEditar = (empresa) => {
    setEditando(empresa);
    setFormData({
      ruc: empresa.ruc || '',
      razonSocial: empresa.razonSocial || '',
      nombreComercial: empresa.nombreComercial || '',
      slug: empresa.slug || '',
      logoUrl: empresa.logoUrl || '',
      colorPrimario: empresa.colorPrimario || '#059669',
      direccion: empresa.direccion || '',
      telefono: empresa.telefono || '',
      emailAdmin: empresa.emailAdmin || '',
      montoMensual: empresa.montoMensual || 150,
      notas: empresa.notas || ''
    });
    setMostrarModal(true);
  };

  const handlePagar = async (id) => {
    if (window.confirm('¿Confirmar pago recibido? Se extenderá 30 días.')) {
      await registrarPagoEmpresa(id);
      cargarEmpresas();
    }
  };

  const handleEstado = async (id, estado) => {
    await cambiarEstadoEmpresa(id, estado);
    cargarEmpresas();
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Eliminar esta empresa? Se perderán TODOS sus datos.')) {
      await deleteEmpresa(id);
      cargarEmpresas();
    }
  };

  const resetForm = () => {
    setFormData({
      ruc: '', razonSocial: '', nombreComercial: '', slug: '',
      logoUrl: '', colorPrimario: '#059669', direccion: '', telefono: '',
      emailAdmin: '', montoMensual: 150, notas: ''
    });
    setEditando(null);
  };

  const badgeEstado = (empresa) => {
    if (empresa.estado === 'SUSPENDIDO') return 'bg-red-100 text-red-800';
    if (empresa.estado === 'PRUEBA') return 'bg-yellow-100 text-yellow-800';
    return 'bg-emerald-100 text-emerald-800';
  };

  const diasRestantes = (empresa) => {
    if (!empresa.fechaVencimiento) return 'Sin fecha';
    const hoy = new Date();
    const vence = new Date(empresa.fechaVencimiento);
    const diff = Math.ceil((vence - hoy) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `Vencido hace ${Math.abs(diff)} días`;
    return `${diff} días restantes`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">🌐 Panel de Administración SaaS</h1>
            <p className="text-sm text-slate-500 mt-1">Gestión de empresas y suscripciones</p>
          </div>
          <button
            onClick={() => { resetForm(); setMostrarModal(true); }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-lg font-bold"
          >
            + Nueva Empresa
          </button>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <p className="text-xs text-slate-500 uppercase">Total Empresas</p>
            <p className="text-2xl font-bold text-slate-800">{empresas.length}</p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <p className="text-xs text-slate-500 uppercase">Activas</p>
            <p className="text-2xl font-bold text-emerald-700">
              {empresas.filter(e => e.estado === 'ACTIVO').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <p className="text-xs text-slate-500 uppercase">En Prueba</p>
            <p className="text-2xl font-bold text-yellow-700">
              {empresas.filter(e => e.estado === 'PRUEBA').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border">
            <p className="text-xs text-slate-500 uppercase">Ingreso Mensual</p>
            <p className="text-2xl font-bold text-emerald-700">
              S/ {(empresas.filter(e => e.estado === 'ACTIVO').length * 150).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-800 text-white text-xs uppercase">
              <tr>
                <th className="p-3">Logo</th>
                <th className="p-3">Empresa</th>
                <th className="p-3">Slug / URL</th>
                <th className="p-3">Estado</th>
                <th className="p-3">Vencimiento</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {empresas.map((emp) => (
                <tr key={emp.idEmpresa} className="hover:bg-slate-50">
                  <td className="p-3">
                    {emp.logoUrl ? (
                      <img src={emp.logoUrl} alt="logo" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                           style={{ backgroundColor: emp.colorPrimario || '#059669' }}>
                        {emp.nombreComercial?.charAt(0) || '?'}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <p className="font-bold text-slate-800">{emp.nombreComercial}</p>
                    <p className="text-xs text-slate-500">{emp.ruc}</p>
                  </td>
                  <td className="p-3">
                    <code className="text-xs bg-slate-100 px-2 py-1 rounded">/{emp.slug}</code>
                  </td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${badgeEstado(emp)}`}>
                      {emp.estado}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-slate-600">
                    {diasRestantes(emp)}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex gap-1 justify-center flex-wrap">
                      <button
                        onClick={() => handlePagar(emp.idEmpresa)}
                        className="px-2 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700"
                        title="Registrar pago"
                      >
                        💰 Pagar
                      </button>
                      {emp.estado !== 'SUSPENDIDO' ? (
                        <button
                          onClick={() => handleEstado(emp.idEmpresa, 'SUSPENDIDO')}
                          className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          🔒
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEstado(emp.idEmpresa, 'ACTIVO')}
                          className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          🔓
                        </button>
                      )}
                      <button
                        onClick={() => handleEditar(emp)}
                        className="px-2 py-1 text-xs bg-slate-600 text-white rounded hover:bg-slate-700"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleEliminar(emp.idEmpresa)}
                        className="px-2 py-1 text-xs bg-red-700 text-white rounded hover:bg-red-800"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal crear/editar */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold mb-4">
              {editando ? 'Editar Empresa' : 'Nueva Empresa'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">RUC</label>
                  <input type="text" value={formData.ruc} maxLength={11}
                    onChange={(e) => setFormData({...formData, ruc: e.target.value})}
                    className="w-full border rounded-lg p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Slug (URL)</label>
                  <input type="text" value={formData.slug} placeholder="elnorteno"
                    onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase()})}
                    className="w-full border rounded-lg p-2 text-sm" required />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Razón Social</label>
                <input type="text" value={formData.razonSocial}
                  onChange={(e) => setFormData({...formData, razonSocial: e.target.value})}
                  className="w-full border rounded-lg p-2 text-sm" required />
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Nombre Comercial</label>
                <input type="text" value={formData.nombreComercial}
                  onChange={(e) => setFormData({...formData, nombreComercial: e.target.value})}
                  className="w-full border rounded-lg p-2 text-sm" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Logo URL</label>
                  <input type="text" value={formData.logoUrl} placeholder="https://..."
                    onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                    className="w-full border rounded-lg p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Color Primario</label>
                  <input type="color" value={formData.colorPrimario}
                    onChange={(e) => setFormData({...formData, colorPrimario: e.target.value})}
                    className="w-full h-10 border rounded-lg" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Teléfono</label>
                  <input type="text" value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    className="w-full border rounded-lg p-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1">Email Admin</label>
                  <input type="email" value={formData.emailAdmin}
                    onChange={(e) => setFormData({...formData, emailAdmin: e.target.value})}
                    className="w-full border rounded-lg p-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Dirección</label>
                <input type="text" value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  className="w-full border rounded-lg p-2 text-sm" />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={() => { setMostrarModal(false); resetForm(); }}
                  className="px-5 py-2 border rounded-lg">Cancelar</button>
                <button type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-bold">
                  {editando ? 'Actualizar' : 'Crear Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
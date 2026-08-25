import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Truck, 
  Search, 
  Edit3, 
  Trash2, 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  FileText 
} from 'lucide-react';
import { getClientes, createCliente, updateCliente, deleteCliente, getProveedores, createProveedor } from '../services/api';

export default function Clientes() {
  const [activeTab, setActiveTab] = useState('clientes'); // 'clientes' o 'proveedores'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Estado para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  // Formulario único reutilizable
  const [formData, setFormData] = useState({
    tipoDocumento: 'DNI',
    documento: '',
    nombreRazonSocial: '',
    telefono: '',
    email: '',
    direccion: ''
  });

  useEffect(() => {
    cargarDatos();
  }, [activeTab]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      if (activeTab === 'clientes') {
        const data = await getClientes();
        setItems(data);
      } else {
        const data = await getProveedores();
        setItems(data);
      }
    } catch (error) {
      console.error(`Error al cargar ${activeTab}:`, error);
      // Datos mock de respaldo por si el backend aún no está listo
      if (activeTab === 'clientes') {
        setItems([
          { id: 1, tipoDocumento: 'DNI', documento: '45678912', nombreRazonSocial: 'Juan Pérez Gómez', telefono: '987654321', email: 'juan.perez@gmail.com', direccion: 'Av. El Sol 123' },
          { id: 2, tipoDocumento: 'RUC', documento: '20123456789', nombreRazonSocial: 'Empresa Inversiones SAC', telefono: '014567890', email: 'contacto@inversiones.com', direccion: 'Calle Real 456' }
        ]);
      } else {
        setItems([
          { id: 1, tipoDocumento: 'RUC', documento: '20555888991', nombreRazonSocial: 'Distribuidora Abarrotes del Norte E.I.R.L.', telefono: '945123789', email: 'ventas@abarrotesnorte.pe', direccion: 'Av. Industrial 890' },
          { id: 2, tipoDocumento: 'RUC', documento: '20100012345', nombreRazonSocial: 'Cervecería & Licores Perú S.A.A.', telefono: '013110000', email: 'pedidos@licoresperu.pe', direccion: 'Panamericana Norte Km 15' }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const itemsFiltrados = items.filter(item => 
    item.nombreRazonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.documento.includes(searchTerm)
  );

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData({
      tipoDocumento: activeTab === 'clientes' ? 'DNI' : 'RUC',
      documento: '',
      nombreRazonSocial: '',
      telefono: '',
      email: '',
      direccion: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      tipoDocumento: item.tipoDocumento || 'DNI',
      documento: item.documento,
      nombreRazonSocial: item.nombreRazonSocial,
      telefono: item.telefono || '',
      email: item.email || '',
      direccion: item.direccion || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'clientes') {
        if (editingId) {
          await updateCliente(editingId, formData);
        } else {
          await createCliente(formData);
        }
      } else {
        await createProveedor(formData);
      }
      cargarDatos();
      setIsModalOpen(false);
    } catch (error) {
      console.error(`Error al guardar en ${activeTab}:`, error);
      alert("Hubo un error al guardar los datos.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`¿Está seguro de eliminar este registro de ${activeTab}?`)) {
      try {
        if (activeTab === 'clientes') {
          await deleteCliente(id);
        }
        cargarDatos();
      } catch (error) {
        console.error("Error al eliminar:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Encabezado y Selector de Pestaña */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Users className="text-emerald-600" /> Directorio de Contactos
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Comercial El Norteño — Gestión de Clientes para comprobantes y Proveedores
            </p>
          </div>

          <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl border border-gray-200">
            <button
              onClick={() => setActiveTab('clientes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'clientes'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users size={16} /> Clientes
            </button>
            <button
              onClick={() => setActiveTab('proveedores')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'proveedores'
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Truck size={16} /> Proveedores
            </button>
          </div>
        </div>

        {/* Buscador y Botón de Acción */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder={`Buscar por nombre, RUC o DNI de ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
            />
          </div>

          <button
            onClick={handleOpenNew}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-5 py-2.5 rounded-lg transition shadow-sm"
          >
            <UserPlus size={18} /> Registrar {activeTab === 'clientes' ? 'Cliente' : 'Proveedor'}
          </button>
        </div>

        {/* Tabla de Registros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-800 text-white text-xs uppercase tracking-wider">
                  <th className="p-4">Tipo Doc.</th>
                  <th className="p-4">N° Documento</th>
                  <th className="p-4">Nombre / Razón Social</th>
                  <th className="p-4">Teléfono</th>
                  <th className="p-4">Correo</th>
                  <th className="p-4">Dirección</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {itemsFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-400">
                      No se encontraron {activeTab} registrados.
                    </td>
                  </tr>
                ) : (
                  itemsFiltrados.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="p-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                          item.tipoDocumento === 'RUC' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.tipoDocumento}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-semibold text-gray-700">{item.documento}</td>
                      <td className="p-4 font-bold text-gray-800">{item.nombreRazonSocial}</td>
                      <td className="p-4 text-gray-600">
                        {item.telefono ? (
                          <span className="flex items-center gap-1"><Phone size={14} className="text-gray-400" /> {item.telefono}</span>
                        ) : '-'}
                      </td>
                      <td className="p-4 text-gray-600">
                        {item.email ? (
                          <span className="flex items-center gap-1"><Mail size={14} className="text-gray-400" /> {item.email}</span>
                        ) : '-'}
                      </td>
                      <td className="p-4 text-gray-600 truncate max-w-xs">
                        {item.direccion ? (
                          <span className="flex items-center gap-1"><MapPin size={14} className="text-gray-400" /> {item.direccion}</span>
                        ) : '-'}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Editar"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Modal para Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="bg-emerald-800 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg">
                {editingId ? 'Editar' : 'Nuevo'} {activeTab === 'clientes' ? 'Cliente' : 'Proveedor'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="hover:bg-emerald-700 p-1 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Tipo Doc. *</label>
                  <select
                    value={formData.tipoDocumento}
                    onChange={(e) => setFormData({ ...formData, tipoDocumento: e.target.value })}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm bg-white"
                  >
                    <option value="DNI">DNI</option>
                    <option value="RUC">RUC</option>
                    <option value="CE">Carné Ext.</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">N° Documento *</label>
                  <input
                    type="text"
                    required
                    maxLength={formData.tipoDocumento === 'RUC' ? 11 : 8}
                    value={formData.documento}
                    onChange={(e) => setFormData({ ...formData, documento: e.target.value })}
                    placeholder={formData.tipoDocumento === 'RUC' ? '11 dígitos' : '8 dígitos'}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                  {formData.tipoDocumento === 'RUC' ? 'Razón Social *' : 'Nombre Completo *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombreRazonSocial}
                  onChange={(e) => setFormData({ ...formData, nombreRazonSocial: e.target.value })}
                  placeholder="Ej. Comercializadora ABC S.A.C. o Juan Pérez"
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Teléfono / Celular</label>
                  <input
                    type="text"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    placeholder="987654321"
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ejemplo@correo.com"
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Dirección Fiscal / Domicilio</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Av. Principal 123, Distrito..."
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition"
                >
                  {editingId ? 'Actualizar' : 'Guardar Registro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
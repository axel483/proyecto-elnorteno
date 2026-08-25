import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Search, 
  Calendar, 
  Printer, 
  Eye, 
  FileText, 
  DollarSign, 
  CreditCard, 
  X, 
  Filter,
  TrendingUp
} from 'lucide-react';
import { getVentas, reimprimirComprobante } from '../services/api';

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDocType, setFilterDocType] = useState('Todos');
  const [filterDate, setFilterDate] = useState('');

  // Estado para Modal de Detalle
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    setLoading(true);
    try {
      const data = await getVentas();
      setVentas(data);
    } catch (error) {
      console.error("Error al cargar historial de ventas:", error);
      // Datos mock de respaldo con la identidad de Comercial El Norteño
      setVentas([
        {
          id: 101,
          numComprobante: 'B001-000452',
          tipoComprobante: 'Boleta',
          fechaHora: '2026-07-27 18:30:12',
          cliente: 'Juan Pérez Gómez',
          docCliente: '45678912',
          metodoPago: 'Efectivo',
          cajero: 'Carlos Ramos',
          total: 42.50,
          detalles: [
            { producto: 'Arroz Superior 1kg', cantidad: 3, precioUnitario: 4.20, subtotal: 12.60 },
            { producto: 'Aceite Primor 1L', cantidad: 2, precioUnitario: 9.80, subtotal: 19.60 },
            { producto: 'Gaseosa Inka Kola 1.5L', cantidad: 1, precioUnitario: 10.30, subtotal: 10.30 },
          ]
        },
        {
          id: 102,
          numComprobante: 'F001-000089',
          tipoComprobante: 'Factura',
          fechaHora: '2026-07-27 19:15:00',
          cliente: 'Empresa Inversiones SAC',
          docCliente: '20123456789',
          metodoPago: 'Yape / Digital',
          cajero: 'Carlos Ramos',
          total: 154.00,
          detalles: [
            { producto: 'Cerveza Pilsen Callao 630ml (Caja x 12)', cantidad: 2, precioUnitario: 77.00, subtotal: 154.00 }
          ]
        },
        {
          id: 103,
          numComprobante: 'NV-000128',
          tipoComprobante: 'Nota de Venta',
          fechaHora: '2026-07-27 20:05:44',
          cliente: 'Cliente Eventual',
          docCliente: '-',
          metodoPago: 'Efectivo',
          cajero: 'Carlos Ramos',
          total: 18.50,
          detalles: [
            { producto: 'Azúcar Rubia 1kg', cantidad: 2, precioUnitario: 4.00, subtotal: 8.00 },
            { producto: 'Leche Gloria Azul 400g', cantidad: 2, precioUnitario: 4.25, subtotal: 8.50 },
            { producto: 'Galleta Soda Sayón', cantidad: 2, precioUnitario: 1.00, subtotal: 2.00 }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado
  const ventasFiltradas = ventas.filter(v => {
    const coincideBusqueda = 
      v.numComprobante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.docCliente.includes(searchTerm);
    
    const coincideTipo = filterDocType === 'Todos' || v.tipoComprobante === filterDocType;
    const coincideFecha = !filterDate || v.fechaHora.startsWith(filterDate);

    return coincideBusqueda && coincideTipo && coincideFecha;
  });

  // Cálculo de resumen rápido
  const totalRecaudado = ventasFiltradas.reduce((acc, v) => acc + v.total, 0);
  const totalEfectivo = ventasFiltradas.filter(v => v.metodoPago === 'Efectivo').reduce((acc, v) => acc + v.total, 0);
  const totalDigital = ventasFiltradas.filter(v => v.metodoPago !== 'Efectivo').reduce((acc, v) => acc + v.total, 0);

  const handleVerDetalle = (venta) => {
    setSelectedVenta(venta);
    setIsModalOpen(true);
  };

  const handleImprimir = (ventaId) => {
    try {
      reimprimirComprobante(ventaId);
      alert(`Enviando a impresión comprobante de la venta #${ventaId}...`);
    } catch (err) {
      alert("Error al intentar imprimir.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Receipt className="text-emerald-600" /> Historial de Ventas y Comprobantes
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Comercial El Norteño — Auditoría de transacciones, reimpresión y arqueo
            </p>
          </div>
        </div>

        {/* Tarjetas KPI de Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Total Filtrado</p>
              <h3 className="text-2xl font-extrabold text-emerald-800 mt-1">S/ {totalRecaudado.toFixed(2)}</h3>
              <p className="text-xs text-gray-500 mt-1">{ventasFiltradas.length} transacciones</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-full text-emerald-600">
              <TrendingUp size={24} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Ventas en Efectivo</p>
              <h3 className="text-2xl font-extrabold text-gray-800 mt-1">S/ {totalEfectivo.toFixed(2)}</h3>
              <p className="text-xs text-emerald-600 mt-1 font-semibold">Caja Chica</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-full text-emerald-700">
              <DollarSign size={24} />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Yape / Plin / Tarjetas</p>
              <h3 className="text-2xl font-extrabold text-gray-800 mt-1">S/ {totalDigital.toFixed(2)}</h3>
              <p className="text-xs text-blue-600 mt-1 font-semibold">Pagos Digitales</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full text-blue-600">
              <CreditCard size={24} />
            </div>
          </div>
        </div>

        {/* Filtros de Búsqueda */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          
          {/* Buscador */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar N° comprobante, cliente o DNI..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
            />
          </div>

          <div className="flex flex-wrap w-full md:w-auto gap-3 items-center">
            {/* Tipo de Comprobante */}
            <select
              value={filterDocType}
              onChange={(e) => setFilterDocType(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Todos">Todos los comprobantes</option>
              <option value="Boleta">Boletas</option>
              <option value="Factura">Facturas</option>
              <option value="Nota de Venta">Notas de Venta</option>
            </select>

            {/* Fecha */}
            <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5 bg-white">
              <Calendar size={16} className="text-gray-400" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="text-sm focus:outline-none text-gray-700"
              />
              {filterDate && (
                <button onClick={() => setFilterDate('')} className="text-xs text-red-500 hover:underline">Limpiar</button>
              )}
            </div>
          </div>
        </div>

        {/* Tabla de Historial */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-800 text-white text-xs uppercase tracking-wider">
                  <th className="p-4">N° Comprobante</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Fecha y Hora</th>
                  <th className="p-4">Cliente / RUC</th>
                  <th className="p-4">Método Pago</th>
                  <th className="p-4 text-right">Monto Total</th>
                  <th className="p-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {ventasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-gray-400">
                      No se registraron ventas con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  ventasFiltradas.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-mono font-bold text-gray-800">{item.numComprobante}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                          item.tipoComprobante === 'Factura'
                            ? 'bg-blue-100 text-blue-800'
                            : item.tipoComprobante === 'Boleta'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {item.tipoComprobante}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-gray-600">{item.fechaHora}</td>
                      <td className="p-4">
                        <p className="font-semibold text-gray-800">{item.cliente}</p>
                        <p className="text-xs text-gray-400">{item.docCliente}</p>
                      </td>
                      <td className="p-4 text-gray-700">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gray-100 px-2.5 py-1 rounded-md">
                          {item.metodoPago}
                        </span>
                      </td>
                      <td className="p-4 text-right font-extrabold text-emerald-800 text-base">
                        S/ {item.total.toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleVerDetalle(item)}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                            title="Ver Detalle"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleImprimir(item.id)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Reimprimir Comprobante"
                          >
                            <Printer size={18} />
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

      {/* Modal de Detalle de Venta */}
      {isModalOpen && selectedVenta && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-150">
            
            {/* Header del Ticket */}
            <div className="bg-emerald-800 p-4 text-white text-center relative">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute right-3 top-3 hover:bg-emerald-700 p-1 rounded-lg transition"
              >
                <X size={20} />
              </button>
              <h3 className="font-bold text-lg">COMERCIAL EL NORTEÑO</h3>
              <p className="text-xs text-emerald-200 mt-0.5">Venta de Abarrotes y Licores</p>
              <div className="mt-2 inline-block bg-emerald-900 px-3 py-1 rounded text-xs font-mono tracking-wide">
                {selectedVenta.numComprobante} ({selectedVenta.tipoComprobante})
              </div>
            </div>

            {/* Cuerpo del Ticket */}
            <div className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 text-xs border-b pb-3 gap-1">
                <div><span className="text-gray-400">Fecha:</span> {selectedVenta.fechaHora}</div>
                <div><span className="text-gray-400">Atendido por:</span> {selectedVenta.cajero}</div>
                <div><span className="text-gray-400">Cliente:</span> {selectedVenta.cliente}</div>
                <div><span className="text-gray-400">Doc:</span> {selectedVenta.docCliente}</div>
                <div><span className="text-gray-400">Pago:</span> {selectedVenta.metodoPago}</div>
              </div>

              {/* Items */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Detalle de Productos</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedVenta.detalles.map((det, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs border-b border-dashed pb-1.5">
                      <div>
                        <p className="font-semibold text-gray-800">{det.producto}</p>
                        <p className="text-gray-400">{det.cantidad} x S/ {det.precioUnitario.toFixed(2)}</p>
                      </div>
                      <span className="font-bold text-gray-800">S/ {det.subtotal.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-3 flex justify-between items-center font-bold text-base text-emerald-900">
                <span>Total Comprobante:</span>
                <span>S/ {selectedVenta.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="bg-gray-50 px-5 py-3 border-t flex justify-between items-center">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-1.5 border rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                Cerrar
              </button>
              <button
                onClick={() => handleImprimir(selectedVenta.id)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold"
              >
                <Printer size={14} /> Reimprimir Ticket
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
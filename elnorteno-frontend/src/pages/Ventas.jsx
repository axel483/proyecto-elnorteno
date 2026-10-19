import React, { useState, useEffect, useMemo } from 'react';
import { 
  Receipt, Search, Calendar, Printer, Eye, 
  DollarSign, CreditCard, X, TrendingUp,
  CalendarDays, CalendarRange, CalendarCheck
} from 'lucide-react';
import { getVentas, reimprimirComprobante } from '../services/api';

export default function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDocType, setFilterDocType] = useState('Todos');
  const [filterDate, setFilterDate] = useState('');
  const [selectedVenta, setSelectedVenta] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 📊 Resúmenes por día, semana y mes
  const [resumenes, setResumenes] = useState({ dia: 0, semana: 0, mes: 0, total: 0 });

  useEffect(() => {
    cargarVentas();
  }, []);

  const cargarVentas = async () => {
    setLoading(true);
    try {
      const data = await getVentas();
      const ventasMapeadas = (data || []).map(v => ({
        id: v.idVenta,
        numComprobante: v.numComprobante || `NV-${String(v.idVenta).padStart(6, '0')}`,
        tipoComprobante: v.tipoComprobante || 'NOTA_VENTA',
        fechaHora: v.fechaHora ? new Date(v.fechaHora).toISOString().split('T')[0] : 'Sin fecha',
        fechaDisplay: v.fechaHora ? new Date(v.fechaHora).toLocaleString() : 'Sin fecha',
        fechaRaw: v.fechaHora ? new Date(v.fechaHora) : null,
        cliente: v.cliente?.nombreRazonSocial || 'PÚBLICO EN GENERAL',
        docCliente: v.cliente?.numeroDocumento || '-',
        metodoPago: v.metodoPago || 'EFECTIVO',
        cajero: v.usuario?.nombreUsuario || 'Admin',
        total: v.total || v.montoTotal || 0,
        detalles: v.detalles || []
      }));
      setVentas(ventasMapeadas);
      calcularResumenes(ventasMapeadas);
    } catch (error) {
      console.error("Error al cargar historial de ventas:", error);
      setVentas([]);
    } finally {
      setLoading(false);
    }
  };

  // 📊 Calcular resúmenes por día, semana y mes
  const calcularResumenes = (listaVentas) => {
    const hoy = new Date();
    const hace7Dias = new Date();
    hace7Dias.setDate(hoy.getDate() - 7);
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    let sumaDia = 0;
    let sumaSemana = 0;
    let sumaMes = 0;
    let sumaTotal = 0;

    listaVentas.forEach(v => {
      if (!v.fechaRaw) return;
      const fechaVenta = new Date(v.fechaRaw);
      const monto = v.total || 0;

      if (fechaVenta.toDateString() === hoy.toDateString()) {
        sumaDia += monto;
      }
      if (fechaVenta >= hace7Dias) {
        sumaSemana += monto;
      }
      if (fechaVenta >= inicioMes) {
        sumaMes += monto;
      }
      sumaTotal += monto;
    });

    setResumenes({
      dia: sumaDia,
      semana: sumaSemana,
      mes: sumaMes,
      total: sumaTotal
    });
  };

  // 🔍 Filtrado
  const ventasFiltradas = ventas.filter(v => {
    const coincideBusqueda = 
      (v.numComprobante || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.cliente || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.docCliente || '').includes(searchTerm);
    
    const coincideTipo = filterDocType === 'Todos' || v.tipoComprobante === filterDocType;
    
    let coincideFecha = true;
    if (filterDate) {
      coincideFecha = v.fechaHora === filterDate;
    }
    
    return coincideBusqueda && coincideTipo && coincideFecha;
  });

  // 📅 Agrupar ventas por día (calculado con useMemo para optimizar)
  const ventasPorDia = useMemo(() => {
    const mapa = {};

    ventasFiltradas.forEach(v => {
      const fechaKey = v.fechaHora; // "YYYY-MM-DD"
      if (!fechaKey || fechaKey === 'Sin fecha') return;

      if (!mapa[fechaKey]) {
        const fechaObj = new Date(fechaKey + 'T00:00:00');
        mapa[fechaKey] = {
          fecha: fechaKey,
          diaSemana: fechaObj.toLocaleDateString('es-ES', { weekday: 'short' }),
          transacciones: 0,
          efectivo: 0,
          yape: 0,
          tarjeta: 0,
          otros: 0,
          total: 0
        };
      }

      const metodo = (v.metodoPago || 'EFECTIVO').toUpperCase();
      const monto = v.total || 0;

      mapa[fechaKey].transacciones += 1;
      mapa[fechaKey].total += monto;

      if (metodo === 'EFECTIVO') {
        mapa[fechaKey].efectivo += monto;
      } else if (metodo === 'YAPE' || metodo === 'PLIN') {
        mapa[fechaKey].yape += monto;
      } else if (metodo === 'TARJETA') {
        mapa[fechaKey].tarjeta += monto;
      } else {
        mapa[fechaKey].otros += monto;
      }
    });

    // Ordenar por fecha descendente (más reciente primero)
    return Object.values(mapa).sort((a, b) => b.fecha.localeCompare(a.fecha));
  }, [ventasFiltradas]);

  // 💰 Totales generales de ventasPorDia
  const totalesPorDia = useMemo(() => {
    return ventasPorDia.reduce((acc, d) => ({
      transacciones: acc.transacciones + d.transacciones,
      efectivo: acc.efectivo + d.efectivo,
      yape: acc.yape + d.yape,
      tarjeta: acc.tarjeta + d.tarjeta,
      otros: acc.otros + d.otros,
      total: acc.total + d.total
    }), { transacciones: 0, efectivo: 0, yape: 0, tarjeta: 0, otros: 0, total: 0 });
  }, [ventasPorDia]);

  // 💰 Totales para KPIs (efectivo vs digital)
  const totalRecaudado = ventasFiltradas.reduce((acc, v) => acc + (v.total || 0), 0);
  const totalEfectivo = ventasFiltradas
    .filter(v => v.metodoPago?.toLowerCase() === 'efectivo')
    .reduce((acc, v) => acc + (v.total || 0), 0);
  const totalDigital = ventasFiltradas
    .filter(v => v.metodoPago?.toLowerCase() !== 'efectivo')
    .reduce((acc, v) => acc + (v.total || 0), 0);

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

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-slate-500 font-medium">Cargando ventas...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Receipt className="text-emerald-600" /> Historial de Ventas y Comprobantes
            </h1>
            <p className="text-sm text-gray-500 mt-1">Comercial El Norteño — Auditoría de transacciones, reimpresión y arqueo</p>
          </div>
        </div>

        {/* 📊 TARJETAS DE RESÚMEN POR DÍA, SEMANA Y MES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
                <CalendarDays size={14} /> Total General
              </p>
              <h3 className="text-2xl font-extrabold text-emerald-800 mt-1">S/ {resumenes.total.toFixed(2)}</h3>
              <p className="text-xs text-gray-500 mt-1">{ventas.length} transacciones</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-full text-emerald-600"><TrendingUp size={24} /></div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
                <CalendarRange size={14} /> Hoy
              </p>
              <h3 className="text-2xl font-extrabold text-blue-700 mt-1">S/ {resumenes.dia.toFixed(2)}</h3>
              <p className="text-xs text-gray-500 mt-1">Ventas del día</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full text-blue-600"><Calendar size={24} /></div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
                <CalendarRange size={14} /> Última Semana
              </p>
              <h3 className="text-2xl font-extrabold text-purple-700 mt-1">S/ {resumenes.semana.toFixed(2)}</h3>
              <p className="text-xs text-gray-500 mt-1">Últimos 7 días</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-full text-purple-600"><CalendarRange size={24} /></div>
          </div>

          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase flex items-center gap-1">
                <CalendarCheck size={14} /> Este Mes
              </p>
              <h3 className="text-2xl font-extrabold text-orange-700 mt-1">S/ {resumenes.mes.toFixed(2)}</h3>
              <p className="text-xs text-gray-500 mt-1">Mes actual</p>
            </div>
            <div className="bg-orange-50 p-3 rounded-full text-orange-600"><CalendarCheck size={24} /></div>
          </div>
        </div>

        {/* 💰 KPIs de Efectivo vs Digital */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Ventas en Efectivo</p>
              <h3 className="text-2xl font-extrabold text-gray-800 mt-1">S/ {totalEfectivo.toFixed(2)}</h3>
              <p className="text-xs text-emerald-600 mt-1 font-semibold">Caja Chica</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-full text-emerald-700"><DollarSign size={24} /></div>
          </div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase">Yape / Plin / Tarjetas</p>
              <h3 className="text-2xl font-extrabold text-gray-800 mt-1">S/ {totalDigital.toFixed(2)}</h3>
              <p className="text-xs text-blue-600 mt-1 font-semibold">Pagos Digitales</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-full text-blue-600"><CreditCard size={24} /></div>
          </div>
        </div>

        {/* 📅 NUEVA SECCIÓN: VENTAS POR DÍA */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <CalendarRange className="text-emerald-600" size={20} />
                Ventas por Día
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Resumen agrupado de transacciones por fecha
              </p>
            </div>
            <span className="text-xs bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold">
              {ventasPorDia.length} días con ventas
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-xs uppercase tracking-wider">
                  <th className="p-3">Fecha</th>
                  <th className="p-3 text-center">Transacciones</th>
                  <th className="p-3 text-right">Efectivo</th>
                  <th className="p-3 text-right">Yape / Plin</th>
                  <th className="p-3 text-right">Tarjeta</th>
                  <th className="p-3 text-right">Total del Día</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {ventasPorDia.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-gray-400">
                      No hay ventas registradas con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  ventasPorDia.map((dia) => (
                    <tr key={dia.fecha} className="hover:bg-gray-50 transition">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="bg-emerald-50 text-emerald-700 rounded-lg px-2 py-1 text-xs font-bold uppercase">
                            {dia.diaSemana}
                          </div>
                          <span className="font-mono font-semibold text-gray-800">{dia.fecha}</span>
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-bold">
                          {dia.transacciones}
                        </span>
                      </td>
                      <td className="p-3 text-right text-gray-700 font-semibold">
                        S/ {dia.efectivo.toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-gray-700 font-semibold">
                        S/ {dia.yape.toFixed(2)}
                      </td>
                      <td className="p-3 text-right text-gray-700 font-semibold">
                        S/ {dia.tarjeta.toFixed(2)}
                      </td>
                      <td className="p-3 text-right font-extrabold text-emerald-800 text-base">
                        S/ {dia.total.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {ventasPorDia.length > 0 && (
                <tfoot>
                  <tr className="bg-emerald-50 font-bold text-emerald-900 border-t-2 border-emerald-200">
                    <td className="p-3">TOTALES</td>
                    <td className="p-3 text-center">{totalesPorDia.transacciones}</td>
                    <td className="p-3 text-right">S/ {totalesPorDia.efectivo.toFixed(2)}</td>
                    <td className="p-3 text-right">S/ {totalesPorDia.yape.toFixed(2)}</td>
                    <td className="p-3 text-right">S/ {totalesPorDia.tarjeta.toFixed(2)}</td>
                    <td className="p-3 text-right text-lg">S/ {totalesPorDia.total.toFixed(2)}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* 🔍 Filtros de Búsqueda */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
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
            <select
              value={filterDocType}
              onChange={(e) => setFilterDocType(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="Todos">Todos los comprobantes</option>
              <option value="BOLETA">Boletas</option>
              <option value="FACTURA">Facturas</option>
              <option value="NOTA_VENTA">Notas de Venta</option>
            </select>

            <div className="flex items-center gap-2 border rounded-lg px-3 py-1.5 bg-white">
              <Calendar size={16} className="text-gray-400" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="text-sm focus:outline-none text-gray-700"
              />
              {filterDate && (
                <button onClick={() => setFilterDate('')} className="text-xs text-red-500 hover:underline">
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 📋 Tabla de Historial Detallado */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <Receipt className="text-emerald-600" size={20} />
              Historial Detallado de Ventas
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              {ventasFiltradas.length} transacciones encontradas
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-emerald-800 text-white text-xs uppercase tracking-wider">
                  <th className="p-4">N° Comprobante</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Fecha</th>
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
                  ventasFiltradas.map((item) => {
                    const tipoDisplay = {
                      'BOLETA': 'Boleta',
                      'FACTURA': 'Factura',
                      'NOTA_VENTA': 'Nota de Venta',
                      'COTIZACION': 'Cotización'
                    }[item.tipoComprobante] || item.tipoComprobante;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition">
                        <td className="p-4 font-mono font-bold text-gray-800">{item.numComprobante}</td>
                        <td className="p-4">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                            item.tipoComprobante === 'FACTURA'
                              ? 'bg-blue-100 text-blue-800'
                              : item.tipoComprobante === 'BOLETA'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {tipoDisplay}
                          </span>
                        </td>
                        <td className="p-4 text-xs text-gray-600">{item.fechaDisplay}</td>
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
                          S/ {(item.total || 0).toFixed(2)}
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
                    );
                  })
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
            <div className="bg-emerald-800 p-4 text-white text-center relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute right-3 top-3 hover:bg-emerald-700 p-1 rounded-lg transition">
                <X size={20} />
              </button>
              <h3 className="font-bold text-lg">COMERCIAL EL NORTEÑO</h3>
              <p className="text-xs text-emerald-200 mt-0.5">Venta de Abarrotes y Licores</p>
              <div className="mt-2 inline-block bg-emerald-900 px-3 py-1 rounded text-xs font-mono tracking-wide">
                {selectedVenta.numComprobante} ({selectedVenta.tipoComprobante})
              </div>
            </div>
            <div className="p-5 space-y-4 text-sm">
              <div className="grid grid-cols-2 text-xs border-b pb-3 gap-1">
                <div><span className="text-gray-400">Fecha:</span> {selectedVenta.fechaDisplay}</div>
                <div><span className="text-gray-400">Atendido por:</span> {selectedVenta.cajero}</div>
                <div><span className="text-gray-400">Cliente:</span> {selectedVenta.cliente}</div>
                <div><span className="text-gray-400">Doc:</span> {selectedVenta.docCliente}</div>
                <div><span className="text-gray-400">Pago:</span> {selectedVenta.metodoPago}</div>
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Detalle de Productos</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(selectedVenta.detalles || []).map((det, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs border-b border-dashed pb-1.5">
                      <div>
                        <p className="font-semibold text-gray-800">{det.producto || 'Producto'}</p>
                        <p className="text-gray-400">{det.cantidad || 0} x S/ {(det.precioUnitario || 0).toFixed(2)}</p>
                      </div>
                      <span className="font-bold text-gray-800">S/ {(det.subtotal || 0).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t pt-3 flex justify-between items-center font-bold text-base text-emerald-900">
                <span>Total Comprobante:</span>
                <span>S/ {(selectedVenta.total || 0).toFixed(2)}</span>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3 border-t flex justify-between items-center">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-1.5 border rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-100">
                Cerrar
              </button>
              <button onClick={() => handleImprimir(selectedVenta.id)} className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold">
                <Printer size={14} /> Reimprimir Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
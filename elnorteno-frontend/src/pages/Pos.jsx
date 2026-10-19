import React, { useState, useEffect } from 'react';
import { 
  getProductosCompletos, 
  createVenta,
  buscarClientePorDocumento,
  getEstadoCaja
} from '../services/api';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

// Inicialización robusta del VFS
if (pdfFonts) {
  if (pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
    pdfMake.vfs = pdfFonts.pdfMake.vfs;
  } else if (pdfFonts.vfs) {
    pdfMake.vfs = pdfFonts.vfs;
  } else if (pdfFonts.default && pdfFonts.default.vfs) {
    pdfMake.vfs = pdfFonts.default.vfs;
  } else if (pdfFonts.default) {
    pdfMake.vfs = pdfFonts.default;
  } else {
    pdfMake.vfs = pdfFonts;
  }
}
console.log("🔤 pdfMake VFS:", pdfMake.vfs ? "✅ CARGADO" : "❌ NO CARGADO");

export default function Pos({ onCambiarVista }) {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [montoRecibido, setMontoRecibido] = useState('');
  const [tipoComprobante, setTipoComprobante] = useState('BOLETA');
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [mostrarDatosCliente, setMostrarDatosCliente] = useState(false);

  // 👇 CLIENTE CON TODOS LOS CAMPOS Y idCliente
  const [cliente, setCliente] = useState({ 
    idCliente: null,
    documento: '', 
    nombre: '', 
    telefono: '',
    correo: '',
    direccion: '' 
  });

  const [sesionActiva, setSesionActiva] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [cargando, setCargando] = useState(false);
  const [buscandoCliente, setBuscandoCliente] = useState(false);

  const [modalPresentaciones, setModalPresentaciones] = useState({
    abierto: false,
    producto: null,
    presentaciones: []
  });

  const [cantidadesModal, setCantidadesModal] = useState({});

  useEffect(() => {
    cargarEstadoCaja();
    cargarDatos();
  }, []);

  const cargarEstadoCaja = async () => {
    try {
      setCargandoSesion(true);
      const res = await getEstadoCaja();
      setSesionActiva(res);
    } catch (error) {
      console.error("Error al consultar estado de caja:", error);
    } finally {
      setCargandoSesion(false);
    }
  };

  const cargarDatos = async () => {
    try {
      const prods = await getProductosCompletos();
      setProductos(Array.isArray(prods) ? prods : []);
    } catch (err) {
      console.error("Error al cargar datos:", err);
    }
  };

  // 👇 BÚSQUEDA DE CLIENTE CON GUARDADO DE idCliente
  const handleDocumentoChange = async (e) => {
    const valor = e.target.value.replace(/\D/g, ''); // solo números

    // Actualizar el documento mientras escribe
    setCliente(prev => ({ 
      ...prev, 
      documento: valor,
      idCliente: null // resetear id al escribir
    }));

    // Solo buscar cuando tiene 8 (DNI) u 11 (RUC) dígitos
    if (valor.length === 8 || valor.length === 11) {
      setBuscandoCliente(true);
      try {
        const clienteEncontrado = await buscarClientePorDocumento(valor);
        if (clienteEncontrado) {
          // ✅ GUARDAR TODOS LOS DATOS INCLUYENDO idCliente
          setCliente({
            idCliente: clienteEncontrado.idCliente,
            documento: valor,
            nombre: clienteEncontrado.nombreRazonSocial || '',
            telefono: clienteEncontrado.telefono || '',
            correo: clienteEncontrado.correo || '',
            direccion: clienteEncontrado.direccion || ''
          });
        } else {
          // Si no lo encuentra, dejar los campos vacíos pero mantener el documento
          setCliente(prev => ({
            ...prev,
            idCliente: null,
            nombre: '',
            telefono: '',
            correo: '',
            direccion: ''
          }));
        }
      } catch (error) {
        console.error('Error al buscar cliente:', error);
      } finally {
        setBuscandoCliente(false);
      }
    } else if (valor.length < 8) {
      // Si borra el documento, limpiar todo
      setCliente(prev => ({
        ...prev,
        idCliente: null,
        nombre: '',
        telefono: '',
        correo: '',
        direccion: ''
      }));
    }
  };

  const abrirModalPresentaciones = (prod) => {
    try {
      const presList = prod.presentaciones || [];
      if (presList.length === 0) {
        alert(`❌ El producto "${prod.nombre}" no tiene presentaciones registradas.`);
        return;
      }

      const cantIniciales = {};
      presList.forEach(p => {
        cantIniciales[p.idPresentacion] = 1;
      });

      setCantidadesModal(cantIniciales);
      setModalPresentaciones({
        abierto: true,
        producto: prod,
        presentaciones: presList
      });
    } catch (error) {
      console.error("❌ Error al abrir modal:", error);
      alert("⚠️ Ocurrió un error al abrir el modal.");
    }
  };

  const cerrarModalPresentaciones = () => {
    setModalPresentaciones({ abierto: false, producto: null, presentaciones: [] });
    setCantidadesModal({});
  };

  const cambiarCantidadModal = (idPresentacion, delta, stock) => {
    setCantidadesModal(prev => {
      const nuevaCant = Math.max(1, Math.min(stock || 999, (prev[idPresentacion] || 1) + delta));
      return { ...prev, [idPresentacion]: nuevaCant };
    });
  };

  const agregarAlCarrito = (prod, idPresentacion, cantidad) => {
    try {
      const pres = prod.presentaciones.find(p => p.idPresentacion === idPresentacion);
      if (!pres) {
        alert("❌ Presentación no encontrada.");
        return;
      }

      const nuevoItem = {
        idItem: prod.idProducto + '-' + pres.idPresentacion + '-' + Date.now(),
        idProducto: prod.idProducto,
        idPresentacion: pres.idPresentacion,
        nombre: prod.nombre,
        presentacionNombre: pres.nombrePresentacion,
        precio: Number(pres.precioVenta || 0),
        cantidad: cantidad || 1,
        subtotal: Number(pres.precioVenta || 0) * (cantidad || 1),
        factorConversion: pres.factorConversion || 1
      };

      const existeIndice = carrito.findIndex(item => 
        item.idProducto === prod.idProducto && item.idPresentacion === pres.idPresentacion
      );

      if (existeIndice !== -1) {
        const nuevoCarrito = [...carrito];
        nuevoCarrito[existeIndice].cantidad += cantidad || 1;
        nuevoCarrito[existeIndice].subtotal = nuevoCarrito[existeIndice].cantidad * nuevoCarrito[existeIndice].precio;
        setCarrito(nuevoCarrito);
      } else {
        setCarrito([...carrito, nuevoItem]);
      }
      cerrarModalPresentaciones();
    } catch (error) {
      console.error("❌ Error al agregar al carrito:", error);
      alert("⚠️ Error al agregar el producto al carrito.");
    }
  };

  const cambiarCantidad = (index, delta) => {
    const nuevoCarrito = [...carrito];
    const item = nuevoCarrito[index];
    const nuevaCant = item.cantidad + delta;
    if (nuevaCant <= 0) {
      eliminarDelCarrito(index);
    } else {
      item.cantidad = nuevaCant;
      item.subtotal = item.cantidad * item.precio;
      setCarrito(nuevoCarrito);
    }
  };

  const cambiarPrecioAplicado = (index, nuevoPrecio) => {
    const precio = parseFloat(nuevoPrecio) || 0;
    const nuevoCarrito = [...carrito];
    nuevoCarrito[index].precio = precio;
    nuevoCarrito[index].subtotal = nuevoCarrito[index].cantidad * precio;
    setCarrito(nuevoCarrito);
  };

  const eliminarDelCarrito = (index) => {
    setCarrito(carrito.filter((_, i) => i !== index));
  };

  const totalCobrar = carrito.reduce((acc, item) => acc + (parseFloat(item.subtotal) || 0), 0);
  const vuelto = parseFloat(montoRecibido) > totalCobrar ? parseFloat(montoRecibido) - totalCobrar : 0;

  // ============ GENERAR PDF FORMATO TICKET (80mm) ============
  const generarPDFNativo = (dataVenta) => {
    const subtotal = dataVenta.total / 1.18;
    const igv = dataVenta.total - subtotal;

    // 👇 OBTENER DATOS DE LA EMPRESA LOGUEADA PARA EL TICKET
    const usuarioString = localStorage.getItem('usuario');
    const userData = usuarioString ? JSON.parse(usuarioString) : null;
    const nombreEmpresa = userData?.datos?.nombreEmpresa || 'COMERCIAL "EL NORTEÑO"';

    const filasProductos = [];
    dataVenta.detalles.forEach(d => {
      filasProductos.push([
        { text: d.cantidad.toString(), fontSize: 7 },
        { text: (d.presentacionNombre || 'Unidad').substring(0, 5), fontSize: 7 },
        { text: (d.nombre || '').substring(0, 20), fontSize: 7 },
        { text: `S/${parseFloat(d.precio).toFixed(2)}`, fontSize: 7, alignment: 'right' },
        { text: `S/${parseFloat(d.subtotal).toFixed(2)}`, fontSize: 7, alignment: 'right' }
      ]);
    });

    const docDefinition = {
      pageSize: {
        width: 226,
        height: 'auto'
      },
      pageMargins: [8, 8, 8, 8],
      defaultStyle: { fontSize: 7 },
      content: [
        { text: nombreEmpresa.toUpperCase(), style: 'titulo' }, // 👈 NOMBRE DINÁMICO
        { text: 'Venta de Cervezas, Licores y Abarrotes', style: 'subtitulo' },
        { text: 'Huamanga - Ayacucho', style: 'subtitulo' },
        { text: 'RUC: 20601234567', style: 'subtitulo' },
        { text: 'Tel: 064-123456', style: 'subtitulo' },
        { text: '-------------------------------------', style: 'sep' },
        { text: `${dataVenta.tipoComprobante} N° 001-${String(dataVenta.idVenta).padStart(6, '0')}`, style: 'docNumero' },
        { text: '-------------------------------------', style: 'sep' },
        { text: `Fecha: ${dataVenta.fecha}`, style: 'info' },
        { text: `Cliente: ${dataVenta.cliente.nombre || 'PÚBLICO EN GENERAL'}`, style: 'info' },
        { text: `DNI/RUC: ${dataVenta.cliente.documento || '-'}`, style: 'info' },
        // 👇 AGREGAMOS TELÉFONO Y CORREO
        { text: `Teléfono: ${dataVenta.cliente.telefono || '-'}`, style: 'info' },
        { text: `Correo: ${dataVenta.cliente.correo || '-'}`, style: 'info' },
        { text: `Dirección: ${dataVenta.cliente.direccion || '-'}`, style: 'info' },
        { text: '-------------------------------------', style: 'sep' },
        {
          table: {
            headerRows: 1,
            widths: [18, 25, '*', 38, 38],
            body: [
              [
                { text: 'Cant', style: 'th' },
                { text: 'Pres', style: 'th' },
                { text: 'Descripción', style: 'th' },
                { text: 'P.U.', style: 'th', alignment: 'right' },
                { text: 'Importe', style: 'th', alignment: 'right' }
              ],
              ...filasProductos
            ]
          },
          layout: 'noBorders'
        },
        { text: '-------------------------------------', style: 'sep' },
        {
          columns: [
            { width: '*', text: 'OP. GRAVADAS:', style: 'totalLabel' },
            { width: 'auto', text: `S/ ${subtotal.toFixed(2)}`, style: 'totalValue' }
          ]
        },
        {
          columns: [
            { width: '*', text: 'I.G.V. (18%):', style: 'totalLabel' },
            { width: 'auto', text: `S/ ${igv.toFixed(2)}`, style: 'totalValue' }
          ]
        },
        {
          columns: [
            { width: '*', text: 'TOTAL VENTA:', style: 'totalFinalLabel' },
            { width: 'auto', text: `S/ ${dataVenta.total.toFixed(2)}`, style: 'totalFinalValue' }
          ]
        },
        { text: '-------------------------------------', style: 'sep' },
        { text: `Método de pago: ${dataVenta.metodoPago || 'EFECTIVO'}`, style: 'info' },
        { text: `Efectivo Recibido: S/ ${dataVenta.montoRecibido.toFixed(2)}`, style: 'info' },
        { text: `Vuelto: S/ ${dataVenta.vuelto.toFixed(2)}`, style: 'info' },
        { text: `Vendedor: ${dataVenta.vendedor || 'Admin'}`, style: 'info' },
        { text: '\n' },
        { text: '¡Gracias por su preferencia!', style: 'footer' },
        { text: 'Representación impresa del comprobante', style: 'footer' }
      ],
      styles: {
        titulo: { fontSize: 9, bold: true, alignment: 'center' },
        subtitulo: { fontSize: 6, alignment: 'center' },
        sep: { fontSize: 6, alignment: 'center' },
        docNumero: { fontSize: 8, bold: true, alignment: 'center' },
        info: { fontSize: 7 },
        th: { fontSize: 7, bold: true },
        totalLabel: { fontSize: 7 },
        totalValue: { fontSize: 7, alignment: 'right' },
        totalFinalLabel: { fontSize: 9, bold: true },
        totalFinalValue: { fontSize: 9, bold: true, alignment: 'right' },
        footer: { fontSize: 6, alignment: 'center', italics: true }
      }
    };

    pdfMake.createPdf(docDefinition).print();
  };

  // 👇 PROCESAR VENTA CON idCliente
  const procesarVenta = async () => {
    if (carrito.length === 0) return;
    if (!sesionActiva) {
      alert("⚠️ No puedes realizar ventas. La caja está CERRADA. Abre un turno primero.");
      return;
    }

    const montoRecibidoNum = parseFloat(montoRecibido);
    if (isNaN(montoRecibidoNum) || montoRecibidoNum < totalCobrar) {
      alert(`❌ El monto recibido (S/ ${montoRecibido || '0'}) es menor al total a cobrar (S/ ${totalCobrar.toFixed(2)}).`);
      return;
    }

    setCargando(true);

    for (let item of carrito) {
      if (!item.idPresentacion) {
        alert(`❌ El producto "${item.nombre}" no tiene una presentación válida. Configúralo en inventario.`);
        setCargando(false);
        return;
      }
    }

    const datosVenta = {
      idSesion: sesionActiva.idSesion,
      metodoPago: metodoPago,
      tipoComprobante: tipoComprobante,
      montoTotal: totalCobrar,
      idCliente: cliente.idCliente || 1,   // 1 = CLIENTES VARIOS
      idUsuario: null,
      detalles: carrito.map(item => ({
        idPresentacion: item.idPresentacion,
        cantidad: item.cantidad,
        precioAplicado: item.precio,
        subtotal: item.subtotal
      }))
    };

    try {
      const res = await createVenta(datosVenta);
      
      generarPDFNativo({
        idVenta: res.idVenta,
        fecha: new Date().toLocaleString(),
        tipoComprobante,
        metodoPago,
        cliente: cliente.nombre ? cliente : { nombre: 'PÚBLICO EN GENERAL', documento: '-', telefono: '-', correo: '-', direccion: '-' },
        detalles: carrito.map(item => ({
          ...item,
          presentacionNombre: item.presentacionNombre || 'Unidad'
        })),
        total: totalCobrar,
        montoRecibido: parseFloat(montoRecibido) || totalCobrar,
        vuelto: vuelto,
        vendedor: 'Admin'
      });

      // Limpiar todo
      setCarrito([]);
      setMontoRecibido('');
      setCliente({ 
        idCliente: null,
        documento: '', 
        nombre: '', 
        telefono: '',
        correo: '',
        direccion: '' 
      });
      setMostrarDatosCliente(false);
      cargarDatos();
      cargarEstadoCaja();
    } catch (err) {
      console.error("Error al procesar venta:", err);
      alert("❌ Error al procesar la venta: " + (err.response?.data || err.message));
    } finally {
      setCargando(false);
    }
  };

  const productosFiltrados = productos.filter(p => p.nombre?.toLowerCase().includes(busqueda.toLowerCase()));

  if (cargandoSesion) {
    return <div className="flex items-center justify-center h-64 text-slate-500 font-medium">Verificando estado de la caja...</div>;
  }

  if (!sesionActiva) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-red-700 mb-2">Caja Cerrada</h2>
          <p className="text-red-600 mb-4">No puedes realizar ventas porque la caja está cerrada.</p>
          <p className="text-sm text-slate-500 mb-6">Por favor, abre un turno de caja desde el módulo de <strong>Caja</strong>.</p>
          <button onClick={() => onCambiarVista('caja')} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-xl shadow-md transition-all">Ir a Apertura de Caja</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Izquierdo: Catálogo */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-3 text-sm">
            <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">CAJA ABIERTA</span>
            <span className="text-emerald-800 font-medium">Turno activo - Puedes vender</span>
          </div>
          <div className="relative">
            <input type="text" placeholder="🔍 Buscar cerveza, gaseosa, licor o abarrotes..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {productosFiltrados.map((prod) => {
              const presList = prod.presentaciones || [];
              const precioMin = presList.length > 0 ? Math.min(...presList.map(p => p.precioVenta || 0)) : 0;
              const stockTotal = prod.stock || 0;
              return (
                <div key={prod.idProducto} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-semibold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
                        {presList.length} presentaciones
                      </span>
                      <span className="text-xs text-slate-500 font-medium">Stock: {stockTotal}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm">{prod.nombre}</h3>
                    {prod.descripcion && <p className="text-xs text-slate-400 mt-1">{prod.descripcion}</p>}
                  </div>
                  <div className="mt-4 flex justify-between items-end">
                    <span className="text-xs text-slate-400">Desde</span>
                    <span className="text-lg font-bold text-emerald-600">S/ {precioMin.toFixed(2)}</span>
                  </div>
                  <button onClick={() => abrirModalPresentaciones(prod)} className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-sm transition-all">+ Agregar</button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Panel Derecho: Orden de Venta */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-full">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">🛒 Orden de Venta</h2>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold">{carrito.length} ítems</span>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Tipo de Documento:</label>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => setTipoComprobante('COTIZACION')} className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${tipoComprobante === 'COTIZACION' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Cotización</button>
                <button type="button" onClick={() => setTipoComprobante('NOTA_VENTA')} className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${tipoComprobante === 'NOTA_VENTA' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Nota Venta</button>
                <button type="button" onClick={() => setTipoComprobante('BOLETA')} className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${tipoComprobante === 'BOLETA' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Boleta / Factura</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-2">Método de Pago:</label>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => setMetodoPago('EFECTIVO')} className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${metodoPago === 'EFECTIVO' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Efectivo</button>
                <button type="button" onClick={() => setMetodoPago('YAPE')} className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${metodoPago === 'YAPE' ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>YAPE / PLIN</button>
                <button type="button" onClick={() => setMetodoPago('TARJETA')} className={`py-1.5 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${metodoPago === 'TARJETA' ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Tarjeta</button>
              </div>
            </div>
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
              <button type="button" onClick={() => setMostrarDatosCliente(!mostrarDatosCliente)} className="text-xs font-bold text-slate-700 flex justify-between items-center w-full cursor-pointer">
                <span>👤 Datos del Cliente ({mostrarDatosCliente ? 'Ocultar' : 'Agregar DNI/RUC'})</span>
                <span className="text-slate-400">{mostrarDatosCliente ? '▲' : '▼'}</span>
              </button>
              {mostrarDatosCliente && (
                <div className="mt-3 space-y-2">
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="DNI / RUC" 
                      value={cliente.documento} 
                      onChange={handleDocumentoChange} 
                      maxLength={11}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                    />
                    {buscandoCliente && <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-slate-400">⏳</span>}
                    {cliente.idCliente && <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-emerald-600">✅</span>}
                  </div>
                  <input 
                    type="text" 
                    placeholder="Nombre / Razón Social" 
                    value={cliente.nombre} 
                    onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })} 
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                  />
                  <input 
                    type="text" 
                    placeholder="Teléfono" 
                    value={cliente.telefono} 
                    onChange={(e) => setCliente({ ...cliente, telefono: e.target.value })} 
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                  />
                  <input 
                    type="text" 
                    placeholder="Correo" 
                    value={cliente.correo} 
                    onChange={(e) => setCliente({ ...cliente, correo: e.target.value })} 
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                  />
                  <input 
                    type="text" 
                    placeholder="Dirección" 
                    value={cliente.direccion} 
                    onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })} 
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                  />
                </div>
              )}
            </div>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {carrito.length === 0 ? (
                <p className="text-center text-slate-400 text-sm py-8">El carrito está vacío</p>
              ) : (
                carrito.map((item, index) => (
                  <div key={item.idItem || index} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{item.nombre}</p>
                        <p className="text-xs text-slate-500">{item.presentacionNombre || 'Unidad'}</p>
                      </div>
                      <button type="button" onClick={() => eliminarDelCarrito(index)} className="text-red-500 hover:text-red-700 font-bold text-xs p-1 hover:bg-red-50 rounded cursor-pointer">✕</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500">Presentación:</label>
                        <p className="w-full bg-slate-100 border border-slate-200 rounded px-1.5 py-1 font-semibold text-slate-700">
                          {item.presentacionNombre || 'Unidad'}
                        </p>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500">Precio Venta (S/):</label>
                        <input type="number" step="0.10" value={item.precio} onChange={(e) => cambiarPrecioAplicado(index, e.target.value)} className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 font-bold text-emerald-700 text-right" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => cambiarCantidad(index, -1)} className="w-6 h-6 bg-white border border-slate-300 rounded font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">-</button>
                        <span className="font-bold text-slate-800 text-xs px-1">{item.cantidad}</span>
                        <button type="button" onClick={() => cambiarCantidad(index, 1)} className="w-6 h-6 bg-white border border-slate-300 rounded font-bold text-slate-600 hover:bg-slate-100 cursor-pointer">+</button>
                      </div>
                      <span className="font-bold text-slate-900 text-sm">S/ {(parseFloat(item.subtotal) || 0).toFixed(2)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="border-t border-slate-100 pt-4 space-y-3 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-slate-600">TOTAL A COBRAR:</span>
              <span className="text-2xl font-black text-emerald-600">S/ {totalCobrar.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="Efectivo recibido" value={montoRecibido} onChange={(e) => setMontoRecibido(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" />
              <div className="bg-emerald-50 p-2 rounded-xl text-right">
                <span className="block text-[10px] text-emerald-700 font-bold uppercase">Vuelto</span>
                <span className="text-sm font-bold text-emerald-700">S/ {vuelto.toFixed(2)}</span>
              </div>
            </div>
            <button type="button" onClick={procesarVenta} disabled={carrito.length === 0 || cargando} className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all cursor-pointer shadow-sm text-sm">
              {cargando ? 'PROCESANDO...' : '📄 PAGAR Y GENERAR TICKET'}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL DE PRESENTACIONES */}
      {modalPresentaciones.abierto && modalPresentaciones.producto && Array.isArray(modalPresentaciones.presentaciones) && modalPresentaciones.presentaciones.length > 0 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{modalPresentaciones.producto.nombre}</h3>
                <p className="text-sm text-slate-500">Selecciona una presentación y cantidad</p>
              </div>
              <button onClick={cerrarModalPresentaciones} className="text-slate-400 hover:text-slate-600 text-xl">✕</button>
            </div>

            <div className="space-y-3">
              {modalPresentaciones.presentaciones.map((pres) => {
                const cantidad = cantidadesModal[pres.idPresentacion] || 1;
                return (
                  <div key={pres.idPresentacion} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 text-lg">{pres.nombrePresentacion}</p>
                        <p className="text-xs text-slate-500">Factor: {pres.factorConversion || 1} unidades</p>
                        <p className="text-sm font-bold text-emerald-600 mt-1">S/ {pres.precioVenta?.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => cambiarCantidadModal(pres.idPresentacion, -1, 999)} className="w-8 h-8 bg-white border border-slate-300 rounded font-bold text-slate-600 hover:bg-slate-100">-</button>
                        <span className="font-bold text-slate-800 w-10 text-center">{cantidad}</span>
                        <button onClick={() => cambiarCantidadModal(pres.idPresentacion, 1, 999)} className="w-8 h-8 bg-white border border-slate-300 rounded font-bold text-slate-600 hover:bg-slate-100">+</button>
                      </div>
                    </div>
                    <button onClick={() => agregarAlCarrito(modalPresentaciones.producto, pres.idPresentacion, cantidad)} className="w-full mt-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg text-sm transition-all">
                      Agregar {cantidad} {pres.nombrePresentacion}
                    </button>
                  </div>
                );
              })}
            </div>

            <button onClick={cerrarModalPresentaciones} className="mt-4 w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 rounded-lg transition-all">Cancelar</button>
          </div>
        </div>
      )}

      {modalPresentaciones.abierto && modalPresentaciones.producto && (!Array.isArray(modalPresentaciones.presentaciones) || modalPresentaciones.presentaciones.length === 0) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl text-center">
            <p className="text-slate-700">❌ Este producto no tiene presentaciones disponibles.</p>
            <button onClick={cerrarModalPresentaciones} className="mt-4 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-6 rounded-lg transition-all">Cerrar</button>
          </div>
        </div>
      )}
    </>
  );
}
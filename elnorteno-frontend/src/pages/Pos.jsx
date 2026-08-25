import React, { useState, useEffect } from 'react';
import { 
  getProductos, 
  getPresentaciones, 
  createVenta,
  buscarClientePorDocumento  // <-- Importamos la nueva función
} from '../services/api';

// Importación de pdfmake y sus fuentes
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

if (pdfFonts && pdfFonts.pdfMake) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs;
} else if (pdfMake.vfs) {
  pdfMake.vfs = pdfMake.vfs;
}

const OPCIONES_PRESENTACION = [
  'Unidad',
  'Botella',
  'Litro',
  'Sixpack',
  'Caja',
  'Paquete',
  'Galón',
  'Lata',
  'Fardo'
];

export default function Pos() {
  const [productos, setProductos] = useState([]);
  const [presentaciones, setPresentaciones] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  
  // Carrito de Compras
  const [carrito, setCarrito] = useState([]);
  const [montoRecibido, setMontoRecibido] = useState('');
  const [tipoComprobante, setTipoComprobante] = useState('BOLETA');
  
  // Datos del Cliente (Opcional)
  const [mostrarDatosCliente, setMostrarDatosCliente] = useState(false);
  const [cliente, setCliente] = useState({
    documento: '', // DNI o RUC
    nombre: '',    // Nombre o Razón Social
    direccion: ''  // Dirección / Domicilio fiscal
  });

  const [cargando, setCargando] = useState(false);
  // Estado para controlar si estamos buscando cliente (para mostrar spinner o mensaje)
  const [buscandoCliente, setBuscandoCliente] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const resProd = await getProductos();
      const resPres = await getPresentaciones();
      setProductos(Array.isArray(resProd) ? resProd : []);
      setPresentaciones(Array.isArray(resPres) ? resPres : []);
    } catch (err) {
      console.error("Error al cargar datos:", err);
    }
  };

  // === NUEVA FUNCIÓN: Buscar cliente automáticamente al escribir el documento ===
  const handleDocumentoChange = async (e) => {
    const valor = e.target.value;
    setCliente({ ...cliente, documento: valor });

    // Si el documento tiene al menos 8 dígitos (DNI) o 11 (RUC), buscamos
    if (valor.length >= 8) {
      setBuscandoCliente(true);
      try {
        const clienteEncontrado = await buscarClientePorDocumento(valor);
        if (clienteEncontrado) {
          setCliente({
            documento: valor,
            nombre: clienteEncontrado.nombreRazonSocial || '',
            direccion: clienteEncontrado.direccion || ''
          });
        } else {
          // Si no existe, dejamos los campos vacíos (el usuario puede escribirlos manualmente)
          setCliente(prev => ({
            ...prev,
            nombre: '',
            direccion: ''
          }));
        }
      } catch (error) {
        console.error('Error al buscar cliente:', error);
        // En caso de error, no modificamos los campos
      } finally {
        setBuscandoCliente(false);
      }
    } else {
      // Si el documento es muy corto, limpiamos nombre y dirección para evitar datos obsoletos
      setCliente(prev => ({
        ...prev,
        nombre: '',
        direccion: ''
      }));
    }
  };

  const obtenerDetalleProducto = (prod) => {
    const pres = presentaciones.find(p => p.producto?.idProducto === prod.idProducto || p.idProducto === prod.idProducto);
    const precioFinal = Number(pres?.precioVenta || prod.precioVenta || prod.precio || 0);
    const stockFinal = Number(pres?.stockFisico || prod.stock || 0);

    return {
      idItem: prod.idProducto + '-' + Date.now(),
      idProducto: prod.idProducto,
      nombre: prod.nombre,
      precio: isNaN(precioFinal) ? 0 : precioFinal,
      stock: isNaN(stockFinal) ? 0 : stockFinal,
      unidadMedida: pres?.nombrePresentacion || 'Unidad',
      cantidad: 1,
      subtotal: isNaN(precioFinal) ? 0 : precioFinal
    };
  };

  const agregarAlCarrito = (prod) => {
    const nuevoItem = obtenerDetalleProducto(prod);
    const existeIndice = carrito.findIndex(item => item.idProducto === prod.idProducto);

    if (existeIndice !== -1) {
      const nuevoCarrito = [...carrito];
      const itemExistente = nuevoCarrito[existeIndice];
      itemExistente.cantidad += 1;
      itemExistente.subtotal = itemExistente.cantidad * itemExistente.precio;
      setCarrito(nuevoCarrito);
    } else {
      setCarrito([...carrito, nuevoItem]);
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

  const cambiarUnidadMedida = (index, nuevaUnidad) => {
    const nuevoCarrito = [...carrito];
    nuevoCarrito[index].unidadMedida = nuevaUnidad;
    setCarrito(nuevoCarrito);
  };

  const eliminarDelCarrito = (index) => {
    setCarrito(carrito.filter((_, i) => i !== index));
  };

  const totalCobrar = carrito.reduce((acc, item) => acc + (parseFloat(item.subtotal) || 0), 0);
  const vuelto = parseFloat(montoRecibido) > totalCobrar ? parseFloat(montoRecibido) - totalCobrar : 0;

  const generarPDFNativo = (dataVenta) => {
    const filasTabla = [
      [
        { text: 'Cant.', style: 'tableHeader' },
        { text: 'Pres.', style: 'tableHeader' },
        { text: 'Descripción', style: 'tableHeader' },
        { text: 'P. Unit', style: 'tableHeader', alignment: 'right' },
        { text: 'Importe', style: 'tableHeader', alignment: 'right' }
      ]
    ];

    dataVenta.detalles.forEach(d => {
      filasTabla.push([
        { text: d.cantidad.toString(), fontSize: 9 },
        { text: d.unidadMedida, fontSize: 9 },
        { text: d.nombre, fontSize: 9 },
        { text: `S/ ${parseFloat(d.precio).toFixed(2)}`, fontSize: 9, alignment: 'right' },
        { text: `S/ ${parseFloat(d.subtotal).toFixed(2)}`, fontSize: 9, alignment: 'right' }
      ]);
    });

    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [40, 40, 40, 40],
      content: [
        { text: 'COMERCIAL "EL NORTEÑO"', style: 'headerTitle' },
        { text: 'Venta de Cervezas, Licores y Abarrotes', style: 'subTitle' },
        { text: 'Huancayo - Junín', style: 'subTitle' },
        { text: '\n' },
        { 
          text: `${dataVenta.tipoComprobante} N° 001-${String(dataVenta.idVenta).padStart(6, '0')}`, 
          style: 'docNumber' 
        },
        { text: '\n' },
        {
          columns: [
            {
              width: '*',
              text: [
                { text: 'Fecha: ', bold: true }, `${dataVenta.fecha}\n`,
                { text: 'Cliente: ', bold: true }, `${dataVenta.cliente.nombre || 'PÚBLICO EN GENERAL'}\n`
              ]
            },
            {
              width: '*',
              text: [
                { text: 'DNI/RUC: ', bold: true }, `${dataVenta.cliente.documento || '-'}\n`,
                { text: 'Dirección: ', bold: true }, `${dataVenta.cliente.direccion || '-'}\n`
              ]
            }
          ],
          style: 'infoSection'
        },
        { text: '\n' },
        {
          table: {
            headerRows: 1,
            widths: [40, 60, '*', 70, 70],
            body: filasTabla
          },
          layout: 'lightHorizontalLines'
        },
        { text: '\n' },
        {
          text: [
            { text: `TOTAL: S/ ${dataVenta.total.toFixed(2)}\n`, style: 'grandTotal' },
            { text: `Efectivo Recibido: S/ ${dataVenta.montoRecibido.toFixed(2)}\n`, fontSize: 10 },
            { text: `Vuelto: S/ ${dataVenta.vuelto.toFixed(2)}`, fontSize: 10 }
          ],
          alignment: 'right'
        }
      ],
      styles: {
        headerTitle: { fontSize: 18, bold: true, alignment: 'center', color: '#059669' },
        subTitle: { fontSize: 10, alignment: 'center', color: '#475569' },
        docNumber: { fontSize: 14, bold: true, alignment: 'center', color: '#0f172a' },
        infoSection: { fontSize: 10, color: '#334155' },
        tableHeader: { bold: true, fontSize: 9, color: '#0f172a', fillColor: '#f1f5f9' },
        grandTotal: { fontSize: 14, bold: true, color: '#059669' }
      }
    };

    pdfMake.createPdf(docDefinition).open();
  };

  const procesarVenta = async () => {
    if (carrito.length === 0) return;
    setCargando(true);

    const datosVenta = {
      tipoComprobante,
      montoTotal: totalCobrar,
      cliente: cliente.nombre ? cliente : { nombre: 'PÚBLICO EN GENERAL', documento: '-', direccion: '-' },
      detalles: carrito.map(item => ({
        idProducto: item.idProducto,
        nombre: item.nombre,
        unidadMedida: item.unidadMedida,
        cantidad: item.cantidad,
        precioAplicado: item.precio,
        subtotal: item.subtotal
      }))
    };

    try {
      let res;
      try {
        res = await createVenta(datosVenta);
      } catch (e) {
        res = { idVenta: Math.floor(Math.random() * 90000) + 10000, ...datosVenta };
      }

      generarPDFNativo({
        idVenta: res.idVenta || Math.floor(Math.random() * 90000) + 10000,
        fecha: new Date().toLocaleString(),
        tipoComprobante,
        cliente: datosVenta.cliente,
        detalles: [...carrito],
        total: totalCobrar,
        montoRecibido: parseFloat(montoRecibido) || totalCobrar,
        vuelto: vuelto
      });

      setCarrito([]);
      setMontoRecibido('');
      setCliente({ documento: '', nombre: '', direccion: '' });
      setMostrarDatosCliente(false);
      cargarDatos();
    } catch (err) {
      alert("Error procesando la venta");
    } finally {
      setCargando(false);
    }
  };

  const productosFiltrados = productos.filter(p => 
    p.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Panel Izquierdo: Catálogo de Productos */}
      <div className="lg:col-span-2 space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="🔍 Buscar cerveza, gaseosa, licor o abarrotes..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {productosFiltrados.map((prod) => {
            const detalle = obtenerDetalleProducto(prod);
            return (
              <div 
                key={prod.idProducto}
                onClick={() => agregarAlCarrito(prod)}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-500 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-semibold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg">
                      {detalle.unidadMedida}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Stock: {detalle.stock}</span>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">{prod.nombre}</h3>
                </div>

                <div className="mt-4 flex justify-between items-end">
                  <span className="text-xs text-slate-400">Precio Sugerido</span>
                  <span className="text-lg font-bold text-emerald-600">S/ {detalle.precio.toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Panel Derecho: Orden de Venta */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between h-full">
        <div className="space-y-4">
          
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <h2 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              🛒 Orden de Venta
            </h2>
            <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-bold">
              {carrito.length} ítems
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
              Tipo de Documento:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTipoComprobante('COTIZACION')}
                className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  tipoComprobante === 'COTIZACION'
                    ? 'bg-amber-50 border-amber-500 text-amber-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Cotización
              </button>
              <button
                type="button"
                onClick={() => setTipoComprobante('NOTA_VENTA')}
                className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  tipoComprobante === 'NOTA_VENTA'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Nota Venta
              </button>
              <button
                type="button"
                onClick={() => setTipoComprobante('BOLETA')}
                className={`py-2 px-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                  tipoComprobante === 'BOLETA'
                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Boleta / Factura
              </button>
            </div>
          </div>

          {/* Sección de Datos del Cliente con autocompletado */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
            <button
              type="button"
              onClick={() => setMostrarDatosCliente(!mostrarDatosCliente)}
              className="text-xs font-bold text-slate-700 flex justify-between items-center w-full cursor-pointer"
            >
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
                    onChange={handleDocumentoChange}  // <-- Nueva función
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  {buscandoCliente && (
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-slate-400">
                      ⏳
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  placeholder="Nombre / Razón Social / Institución"
                  value={cliente.nombre}
                  onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <input
                  type="text"
                  placeholder="Lugar / Dirección de residencia"
                  value={cliente.direccion}
                  onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            )}
          </div>

          {/* Resto del componente (carrito, total, botón) */}
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {carrito.length === 0 ? (
              <p className="text-center text-slate-400 text-sm py-8">El carrito está vacío</p>
            ) : (
              carrito.map((item, index) => (
                <div key={item.idItem || index} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{item.nombre}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => eliminarDelCarrito(index)}
                      className="text-red-500 hover:text-red-700 font-bold text-xs p-1 hover:bg-red-50 rounded cursor-pointer"
                      title="Eliminar producto de la orden"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500">Presentación:</label>
                      <select
                        value={item.unidadMedida}
                        onChange={(e) => cambiarUnidadMedida(index, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 font-semibold text-slate-700"
                      >
                        {OPCIONES_PRESENTACION.map(op => (
                          <option key={op} value={op}>{op}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500">Precio Venta (S/):</label>
                      <input
                        type="number"
                        step="0.10"
                        value={item.precio}
                        onChange={(e) => cambiarPrecioAplicado(index, e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded px-1.5 py-1 font-bold text-emerald-700 text-right"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(index, -1)}
                        className="w-6 h-6 bg-white border border-slate-300 rounded font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-bold text-slate-800 text-xs px-1">{item.cantidad}</span>
                      <button
                        type="button"
                        onClick={() => cambiarCantidad(index, 1)}
                        className="w-6 h-6 bg-white border border-slate-300 rounded font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                      >
                        +
                      </button>
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
            <input
              type="number"
              placeholder="Efectivo recibido"
              value={montoRecibido}
              onChange={(e) => setMontoRecibido(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <div className="bg-emerald-50 p-2 rounded-xl text-right">
              <span className="block text-[10px] text-emerald-700 font-bold uppercase">Vuelto</span>
              <span className="text-sm font-bold text-emerald-700">S/ {vuelto.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={procesarVenta}
            disabled={carrito.length === 0 || cargando}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all cursor-pointer shadow-sm text-sm"
          >
            {cargando ? 'PROCESANDO...' : '📄 PAGAR Y GENERAR DOCUMENTO / PDF'}
          </button>
        </div>

      </div>

    </div>
  );
}
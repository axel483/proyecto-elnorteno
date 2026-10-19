import { useState, useEffect } from 'react';
import api from '../services/api';
import { 
  Wallet, 
  Lock, 
  Unlock, 
  DollarSign, 
  QrCode, 
  CreditCard, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function Caja() {
  const [cajaActiva, setCajaActiva] = useState(null);
  const [montoInicial, setMontoInicial] = useState('');
  const [montoFinalEfectivo, setMontoFinalEfectivo] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState(null);

  // Cargar estado de la caja desde Spring Boot
  const cargarEstadoCaja = async () => {
    try {
      const res = await api.get('/caja/estado'); // RUTA CORREGIDA
      setCajaActiva(res.data); // null si no hay sesión abierta, o el objeto SesionCaja
    } catch (error) {
      console.error("Error al consultar estado de caja:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarEstadoCaja();
  }, []);

  // Abrir Turno de Caja
  const handleAbrirCaja = async (e) => {
    e.preventDefault();
    if (!montoInicial || parseFloat(montoInicial) < 0) {
      alert("Ingresa un monto inicial válido.");
      return;
    }

    try {
      // ENVIAR SOLO montoInicial (el backend usará caja y usuario por defecto)
      const res = await api.post('/caja/abrir', {
        montoInicial: parseFloat(montoInicial)
      });
      setCajaActiva(res.data);
      setMontoInicial('');
      setMensaje({ tipo: 'exito', texto: '¡Caja abierta exitosamente!' });
      setTimeout(() => setMensaje(null), 3000);
    } catch (error) {
      console.error("Error al abrir caja:", error);
      // Mostrar el mensaje de error del backend si existe
      const mensajeError = error.response?.data || "No se pudo abrir la caja. Inténtalo de nuevo.";
      alert(mensajeError);
    }
  };

  // Cerrar Turno de Caja (Arqueo)
  const handleCerrarCaja = async (e) => {
    e.preventDefault();
    if (!montoFinalEfectivo || parseFloat(montoFinalEfectivo) < 0) {
      alert("Ingresa el monto final en efectivo contado.");
      return;
    }

    try {
      await api.post('/caja/cerrar', {
        idSesion: cajaActiva.idSesion,
        montoFinal: parseFloat(montoFinalEfectivo),
        observaciones: observaciones
      });
      setCajaActiva(null);
      setMontoFinalEfectivo('');
      setObservaciones('');
      setMensaje({ tipo: 'exito', texto: '¡Caja cerrada y arqueo completado correctamente!' });
      setTimeout(() => setMensaje(null), 4000);
    } catch (error) {
      console.error("Error al cerrar caja:", error);
      alert("No se pudo cerrar la caja.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 font-medium">
        Cargando estado de la caja...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      
      {/* Alerta de notificación */}
      {mensaje && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 border font-medium ${
          mensaje.tipo === 'exito' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
          <span>{mensaje.texto}</span>
        </div>
      )}

      {/* SI LA CAJA ESTÁ CERRADA: MOSTRAR FORMULARIO DE APERTURA */}
      {!cajaActiva ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm max-w-xl mx-auto text-center space-y-6">
          <div className="inline-flex bg-emerald-100 p-4 rounded-2xl text-emerald-600">
            <Unlock className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Apertura de Turno de Caja</h2>
            <p className="text-slate-500 text-sm mt-1">
              Ingresa el monto de dinero en efectivo con el que se inicia la caja chica hoy.
            </p>
          </div>

          <form onSubmit={handleAbrirCaja} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                Monto Inicial (S/)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-slate-400 font-bold">S/</span>
                <input 
                  type="number" 
                  step="0.10"
                  required
                  placeholder="0.00"
                  value={montoInicial}
                  onChange={(e) => setMontoInicial(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none text-slate-900 font-bold text-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Wallet className="w-5 h-5" />
              <span>ABRIR CAJA AHORA</span>
            </button>
          </form>
        </div>
      ) : (
        /* SI LA CAJA ESTÁ ABIERTA: RESUMEN DE VENTAS Y ARQUEO DE CIERRE */
        <div className="space-y-6">
          
          {/* Header de Estado */}
          <div className="bg-emerald-600 text-white p-6 rounded-3xl shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-500/50 p-3 rounded-2xl backdrop-blur-sm">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <div>
                <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Caja Abierta
                </span>
                <h2 className="text-xl font-bold mt-1">Turno Actual en Curso</h2>
                <p className="text-emerald-100 text-xs">Monto Inicial: S/ {Number(cajaActiva.montoInicial || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Tarjetas de Métodos de Pago */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Ventas Efectivo</p>
                <p className="text-xl font-black text-slate-900">S/ {Number(cajaActiva.montoEfectivo || 0).toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Yape / Plin</p>
                <p className="text-xl font-black text-slate-900">S/ {Number(cajaActiva.montoYape || 0).toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase">Tarjetas</p>
                <p className="text-xl font-black text-slate-900">S/ 0.00</p>
              </div>
            </div>
          </div>

          {/* Formulario de Arqueo y Cierre */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" /> Cierre y Arqueo de Turno
            </h3>

            <form onSubmit={handleCerrarCaja} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Efectivo Total en Cuentagotas (S/)
                  </label>
                  <input 
                    type="number"
                    step="0.10"
                    required
                    placeholder="Efectivo contado físicamente"
                    value={montoFinalEfectivo}
                    onChange={(e) => setMontoFinalEfectivo(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                    Observaciones / Notas de Cierre
                  </label>
                  <input 
                    type="text"
                    placeholder="Ej. Sin novedades / Vuelto exacto"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-red-600/20 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Lock className="w-4 h-4" />
                  <span>CERRAR TURNO Y REALIZAR ARQUEO</span>
                </button>
              </div>
            </form>
          </div>

        </div>
      )}

    </div>
  );
}
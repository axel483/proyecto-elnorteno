import React, { useState, useEffect } from 'react';
import { getVentas } from '../services/api';

export default function ReporteVentas() {
  const [ventas, setVentas] = useState([]);
  const [totales, setTotales] = useState({ dia: 0, semana: 0, mes: 0 });

  useEffect(() => {
    obtenerYCalcularVentas();
  }, []);

  const obtenerYCalcularVentas = async () => {
    try {
      const data = await getVentas();
      const listaVentas = Array.isArray(data) ? data : [];
      setVentas(listaVentas);

      const hoy = new Date();
      let sumaDia = 0;
      let sumaSemana = 0;
      let sumaMes = 0;

      // Calcular diferencia de días para la semana
      const hace7Dias = new Date();
      hace7Dias.setDate(hoy.getDate() - 7);

      listaVentas.forEach(v => {
        const fechaVenta = new Date(v.fecha || v.created_at);
        const monto = parseFloat(v.montoTotal || v.total || 0);

        // Venta del día
        if (fechaVenta.toDateString() === hoy.toDateString()) {
          sumaDia += monto;
        }

        // Venta de la semana (últimos 7 días)
        if (fechaVenta >= hace7Dias) {
          sumaSemana += monto;
        }

        // Venta del mes actual
        if (
          fechaVenta.getMonth() === hoy.getMonth() &&
          fechaVenta.getFullYear() === hoy.getFullYear()
        ) {
          sumaMes += monto;
        }
      });

      setTotales({ dia: sumaDia, semana: sumaSemana, mes: sumaMes });
    } catch (err) {
      console.error("Error al calcular reportes:", err);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Venta del día */}
      <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm">
        <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">Venta del Día</p>
        <h2 className="text-2xl font-black text-emerald-900 mt-1">S/ {totales.dia.toFixed(2)}</h2>
      </div>

      {/* Venta de la semana */}
      <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl shadow-sm">
        <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">Venta Semanal (7 días)</p>
        <h2 className="text-2xl font-black text-blue-900 mt-1">S/ {totales.semana.toFixed(2)}</h2>
      </div>

      {/* Venta del mes */}
      <div className="bg-purple-50 border border-purple-200 p-5 rounded-2xl shadow-sm">
        <p className="text-xs font-bold text-purple-700 uppercase tracking-wide">Venta Mensual</p>
        <h2 className="text-2xl font-black text-purple-900 mt-1">S/ {totales.mes.toFixed(2)}</h2>
      </div>
    </div>
  );
}
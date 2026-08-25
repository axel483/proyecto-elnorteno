import React, { useState } from 'react';
import Inventario from './pages/Inventario';
import Clientes from './pages/Clientes';
import Ventas from './pages/Ventas';
import Login from './pages/Login';
import Pos from './pages/Pos';
import Caja from './pages/Caja';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('usuario');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [vistaActual, setVistaActual] = useState('pos');

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    setUser(null);
  };

  if (!user) {
    return <Login onLogin={(userData) => setUser(userData)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header / Navegación Principal */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          
          {/* Logo y Nombre */}
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-xl text-white font-bold text-lg">
              🍺
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">Comercial "El Norteño"</h1>
              <p className="text-xs text-emerald-600 font-semibold">Sistema de Gestión e Inventario</p>
            </div>
          </div>

          {/* Menú de Navegación Completo */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 overflow-x-auto">
            <button
              onClick={() => setVistaActual('pos')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                vistaActual === 'pos' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🛒 Ventas (POS)
            </button>

            <button
              onClick={() => setVistaActual('caja')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                vistaActual === 'caja' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              💵 Caja
            </button>

            <button
              onClick={() => setVistaActual('inventario')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                vistaActual === 'inventario' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📦 Inventario / Catálogo
            </button>

            <button
              onClick={() => setVistaActual('clientes')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                vistaActual === 'clientes' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              👥 Clientes / Proveedores
            </button>

            <button
              onClick={() => setVistaActual('ventas')}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                vistaActual === 'ventas' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🧾 Comprobantes
            </button>
          </div>

          {/* Usuario y Salir */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">{user.username}</p>
              <p className="text-xs text-slate-500 font-medium">{user.rol}</p>
            </div>
            <button 
              onClick={handleLogout}
              title="Cerrar Sesión"
              className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-red-200"
            >
              Salir
            </button>
          </div>

        </div>
      </header>

      {/* Contenido Dinámico */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {vistaActual === 'pos' && <Pos />}
        {vistaActual === 'caja' && <Caja />}
        {vistaActual === 'inventario' && <Inventario />}
        {vistaActual === 'clientes' && <Clientes />}
        {vistaActual === 'ventas' && <Ventas />}
      </main>
    </div>
  );
}
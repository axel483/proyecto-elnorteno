import React, { useState } from 'react';
import Inventario from './pages/Inventario';
import Clientes from './pages/Clientes';
import Ventas from './pages/Ventas';
import Login from './pages/Login';
import Pos from './pages/Pos';
import Caja from './pages/Caja';
import SuperAdmin from './pages/SuperAdmin';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('usuario');
    return saved ? JSON.parse(saved) : null;
  });
  
  const esSuperAdmin = user?.rol === 'SUPERADMIN' || user?.username === 'superadmin';
  const [vistaActual, setVistaActual] = useState(esSuperAdmin ? 'superadmin' : 'pos');

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    setUser(null);
  };

  const cambiarVista = (vista) => {
    setVistaActual(vista);
  };

  if (!user) {
    return <Login onLogin={(userData) => setUser(userData)} />;
  }

  // ============================================================
  // 🎯 VISTA EXCLUSIVA PARA SUPERADMIN
  // ============================================================
  if (esSuperAdmin) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-slate-800 p-2 rounded-xl text-white font-bold text-lg">🌐</div>
              <div>
                <h1 className="font-bold text-slate-900 leading-tight">Panel SaaS</h1>
                <p className="text-xs text-slate-500 font-semibold">Administración de Empresas</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-slate-800">{user.username}</p>
                <p className="text-xs text-emerald-700 font-bold">SUPERADMIN</p>
              </div>
              <button onClick={handleLogout} className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl border border-red-200">Salir</button>
            </div>
          </div>
        </header>
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
          <SuperAdmin />
        </main>
      </div>
    );
  }

  // ============================================================
  // 🏪 VISTA NORMAL DE LA TIENDA (DINÁMICA SAAS)
  // ============================================================
  const colorEmpresa = user?.datos?.colorEmpresa || '#059669';
  const nombreEmpresa = user?.datos?.nombreEmpresa || 'Comercial "El Norteño"';
  const logoEmpresa = user?.datos?.logoEmpresa;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            {/* 👇 LOGO Y COLOR DINÁMICO */}
            <div 
              className="p-2 rounded-xl text-white font-bold text-lg flex items-center justify-center min-w-[40px]"
              style={{ backgroundColor: colorEmpresa }}
            >
              {logoEmpresa ? (
                <img src={logoEmpresa} alt="logo" className="w-6 h-6 object-cover rounded" />
              ) : (
                nombreEmpresa.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              {/* 👇 NOMBRE DINÁMICO */}
              <h1 className="font-bold text-slate-900 leading-tight">{nombreEmpresa}</h1>
              <p className="text-xs text-slate-500 font-semibold">Sistema de Gestión e Inventario</p>
            </div>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 overflow-x-auto">
            <button onClick={() => setVistaActual('pos')} className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${vistaActual === 'pos' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>🛒 Ventas (POS)</button>
            <button onClick={() => setVistaActual('caja')} className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${vistaActual === 'caja' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>💵 Caja</button>
            <button onClick={() => setVistaActual('inventario')} className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${vistaActual === 'inventario' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>📦 Inventario</button>
            <button onClick={() => setVistaActual('clientes')} className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${vistaActual === 'clientes' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>👥 Clientes</button>
            <button onClick={() => setVistaActual('ventas')} className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${vistaActual === 'ventas' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}>🧾 Comprobantes</button>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-800">{user.username}</p>
              <p className="text-xs text-slate-500 font-medium">{user.rol}</p>
            </div>
            <button onClick={handleLogout} className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl border border-red-200">Salir</button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {vistaActual === 'pos' && <Pos onCambiarVista={cambiarVista} />}
        {vistaActual === 'caja' && <Caja />}
        {vistaActual === 'inventario' && <Inventario />}
        {vistaActual === 'clientes' && <Clientes />}
        {vistaActual === 'ventas' && <Ventas />}
      </main>
    </div>
  );
}
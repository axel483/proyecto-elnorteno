import React, { useState } from 'react';
import api from '../services/api';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Petición POST a Spring Boot (http://localhost:8080/api/usuarios/login)
      const response = await api.post('/usuarios/login', {
        username: username,
        password: password
      });

      // Mapeamos los datos devueltos por Spring Boot para que coincidan con lo que espera App.jsx
      const usuarioFormateado = {
        username: response.data.nombreUsuario || response.data.username || username,
        rol: response.data.rol?.nombre || 'ADMINISTRADOR',
        datos: response.data
      };

      // Guardamos la sesión localmente
      localStorage.setItem('usuario', JSON.stringify(usuarioFormateado));

      // Notificamos a App.jsx para que le quite la pantalla de Login y muestre el POS
      if (onLogin) {
        onLogin(usuarioFormateado);
      }

    } catch (err) {
      console.error("Error al iniciar sesión:", err);

      if (err.response && err.response.data) {
        const mensajeServidor = typeof err.response.data === 'string' 
          ? err.response.data 
          : err.response.data.mensaje;

        setError(mensajeServidor || "Usuario o contraseña incorrectos.");
      } else if (err.request) {
        setError("No se pudo conectar con Spring Boot (puerto 8080). Revisa que esté corriendo.");
      } else {
        setError("Ocurrió un error inesperado al intentar ingresar.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Comercial "El Norteño"</h2>
          <p className="text-sm text-emerald-600 font-semibold mt-1">Sistema de Gestión e Inventario</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Ej: admin"
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Verificando...' : 'Ingresar al Sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}
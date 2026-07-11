import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Rocket, ShieldCheck, Zap, Store, ChevronRight, BarChart3, Users, ChefHat } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      background: 'var(--bg-gradient)',
      overflowX: 'hidden'
    }}>
      {/* ── NAVBAR ── */}
      <nav style={{
        padding: '1.5rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--top-nav-bg)',
        backdropFilter: 'blur(10px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 800, fontSize: '1.5rem', color: 'var(--text-primary)' }}>
          <div style={{ background: 'var(--primary-color)', padding: '0.4rem', borderRadius: '8px', color: '#fff' }}>
            <Store size={24} />
          </div>
          POS Solution
        </div>
        <div>
          <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Ingresar <ChevronRight size={16} />
          </button>
        </div>
      </nav>

      {/* ── HERO SECTION ── */}
      <section style={{
        padding: '6rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        <div style={{
          background: 'var(--primary-subtle)',
          color: 'var(--primary-color)',
          padding: '0.5rem 1rem',
          borderRadius: '999px',
          fontWeight: 600,
          fontSize: '0.85rem',
          marginBottom: '1.5rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <Rocket size={14} /> El futuro de la gestión gastronómica
        </div>
        
        <h1 className="title" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: '1.1', marginBottom: '1.5rem', fontWeight: 800 }}>
          Revoluciona el control de tu <span style={{ color: 'var(--primary-color)' }}>Restaurante</span>
        </h1>
        
        <p className="subtitle" style={{ fontSize: '1.15rem', maxWidth: '700px', margin: '0 auto 3rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
          Un sistema de Punto de Venta (POS) ultrarrápido, diseñado para dueños de restaurantes y cafeterías que exigen control total, velocidad y seguridad sin complicaciones.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '0.8rem 2rem', borderRadius: '12px' }}>
            Comenzar Ahora
          </button>
          <a href="#features" className="btn btn-outline" style={{ fontSize: '1.1rem', padding: '0.8rem 2rem', borderRadius: '12px' }}>
            Conocer más
          </a>
        </div>
      </section>

      {/* ── MOCKUP / DASHBOARD PREVIEW ── */}
      <section style={{ padding: '0 2rem 4rem', display: 'flex', justifyContent: 'center' }}>
        <div style={{
          width: '100%',
          maxWidth: '1000px',
          background: 'var(--surface-solid)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-xl), var(--glow-primary)',
          padding: '1rem',
          position: 'relative'
        }}>
          {/* Faux Window Controls */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1rem' }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f' }} />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-color)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Ventas del Día</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary-color)' }}>S/ 1,450.00</div>
            </div>
            <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-color)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Mesas Activas</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>8</div>
            </div>
            <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-color)' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Día Operativo</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success-color)' }}>Abierto</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '6rem 2rem', background: 'var(--surface-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 className="title" style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '4rem' }}>
            Diseñado para la <span style={{ color: 'var(--primary-color)' }}>velocidad</span>
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            
            <div className="card" style={{ padding: '2rem', transition: 'transform 0.3s', cursor: 'default' }}>
              <div style={{ width: '50px', height: '50px', background: 'var(--info-bg)', color: 'var(--info-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <Zap size={28} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Rendimiento PWA</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                No requiere descargas de la App Store. Funciona en segundos desde cualquier navegador, guardando datos localmente para que nunca te detengas si el internet falla.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ width: '50px', height: '50px', background: 'var(--success-subtle)', color: 'var(--success-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <ShieldCheck size={28} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Seguridad Nivel Banco</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Autenticación robusta (JWT). Ningún usuario puede anular, modificar o cuadrar cajas sin autorización. Todo queda registrado en nuestro riguroso módulo de Auditoría.
              </p>
            </div>

            <div className="card" style={{ padding: '2rem' }}>
              <div style={{ width: '50px', height: '50px', background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <BarChart3 size={28} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Inteligencia Financiera</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Monitorea el Kardex, controla el stock de insumos críticos en tiempo real y recibe reportes diarios de ventas centralizados por sucursal.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── PARA TODO EL EQUIPO ── */}
      <section style={{ padding: '6rem 2rem', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <h2 className="title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Sincronización Total</h2>
        <p className="subtitle" style={{ marginBottom: '4rem' }}>Un módulo especializado para cada miembro de tu equipo.</p>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem', background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', minWidth: '160px' }}>
            <Users size={32} color="var(--primary-color)" style={{ marginBottom: '0.5rem' }} />
            <h4 style={{ fontWeight: 600 }}>Caja y Mozo</h4>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Toma de pedidos ágil</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem', background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', minWidth: '160px' }}>
            <ChefHat size={32} color="var(--warning-color)" style={{ marginBottom: '0.5rem' }} />
            <h4 style={{ fontWeight: 600 }}>Cocina y Bar</h4>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Visor de comandas (KDS)</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', padding: '1.5rem', background: 'var(--glass-bg)', border: '1px solid var(--border-color)', borderRadius: '16px', minWidth: '160px' }}>
            <ShieldCheck size={32} color="var(--success-color)" style={{ marginBottom: '0.5rem' }} />
            <h4 style={{ fontWeight: 600 }}>Administrador</h4>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Control y Auditoría total</span>
          </div>
        </div>
      </section>

      {/* ── PRICING / PLANES DE MEMBRESÍA ── */}
      <section id="pricing" style={{ padding: '6rem 2rem', background: 'var(--bg-color)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 className="title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Planes transparentes, sin sorpresas</h2>
            <p className="subtitle" style={{ color: 'var(--text-secondary)' }}>Escala tu negocio gastronómico con la herramienta adecuada.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', alignItems: 'start' }}>
            
            {/* PLAN BÁSICO */}
            <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>Emprendedor</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Ideal para cafeterías pequeñas empezando su digitalización.</p>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '2rem' }}>
                S/ 69<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>/mes</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={18} color="var(--success-color)" /> 1 Local / Sede</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={18} color="var(--success-color)" /> Roles: Caja y Mozo</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={18} color="var(--success-color)" /> Toma de pedidos táctil</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={18} color="var(--success-color)" /> Resumen de ventas diario</li>
              </ul>
              <button onClick={() => navigate('/login')} className="btn btn-outline" style={{ marginTop: 'auto', width: '100%' }}>Comenzar Gratis</button>
            </div>

            {/* PLAN PRO */}
            <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', height: '100%', border: '2px solid var(--primary-color)', transform: 'scale(1.05)', position: 'relative', boxShadow: 'var(--glow-primary)' }}>
              <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary-color)', color: '#fff', padding: '0.2rem 1rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                MÁS POPULAR
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>Profesional</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Para restaurantes establecidos que buscan control total.</p>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '2rem' }}>
                S/ 129<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>/mes</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={18} color="var(--success-color)" /> Hasta 3 Locales / Sedes</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={18} color="var(--success-color)" /> KDS para Cocina y Bar</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={18} color="var(--success-color)" /> Gestión de Inventario (Kardex)</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={18} color="var(--success-color)" /> Dashboard BI y Auditoría</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={18} color="var(--success-color)" /> Soporte PWA Offline</li>
              </ul>
              <button onClick={() => navigate('/login')} className="btn btn-primary" style={{ marginTop: 'auto', width: '100%' }}>Prueba de 14 Días</button>
            </div>

            {/* PLAN FRANQUICIA */}
            <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>Franquicia</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Escalabilidad sin límites para cadenas en expansión.</p>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '2rem' }}>
                S/ 299<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>/mes</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-secondary)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={18} color="var(--success-color)" /> Locales Ilimitados</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={18} color="var(--success-color)" /> Roles y Usuarios Ilimitados</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={18} color="var(--success-color)" /> Soporte Técnico Prioritario 24/7</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={18} color="var(--success-color)" /> Setup Asistido (Servicio Conserje)</li>
              </ul>
              <button onClick={() => navigate('/login')} className="btn btn-outline" style={{ marginTop: 'auto', width: '100%' }}>Contactar Ventas</button>
            </div>

          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        marginTop: 'auto',
        padding: '3rem 2rem',
        borderTop: '1px solid var(--border-color)',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.9rem'
      }}>
        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Store size={24} color="var(--primary-color)" />
        </div>
        <p>&copy; {new Date().getFullYear()} POS Solution. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import { Users, LogOut, CheckCircle, Clock, Trash2, Home, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useEscapeKey } from '../hooks/useEscapeKey';

export default function Anfitriona() {
  const { currentUser, logout, zones, activeTables, tableFamilies, setTableFamily, developerSettings } = useStore();
  const navigate = useNavigate();
  const [selectedTable, setSelectedTable] = useState(null);
  const [familyNameInput, setFamilyNameInput] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [viewMode, setViewMode] = useState('mesas'); // 'mesas' | 'asignadas'

  useEscapeKey(() => {
    if (selectedTable) setSelectedTable(null);
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);
  
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  React.useEffect(() => {
    if (zones && zones.length > 0 && !selectedZoneId) {
      setSelectedZoneId(zones[0].id);
    }
  }, [zones, selectedZoneId]);

  // Authentication check
  React.useEffect(() => {
    if (!currentUser) {
      const lastRole = localStorage.getItem('lastRole');
      const isIncognito = developerSettings?.isSuperAdminIncognito;
      if (lastRole === 'superadmin' && !isIncognito) {
        navigate('/super-admin');
      } else {
        const locId = localStorage.getItem('currentLocationId');
        navigate(locId ? `/login/${encodeURIComponent(locId.replace(/\s+/g, ''))}` : '/');
      }
      return;
    }
    if (currentUser.role !== 'anfitriona' && currentUser.role !== 'admin' && currentUser.role !== 'superadmin') {
      navigate('/');
    }
  }, [currentUser, navigate, developerSettings]);

  if (!currentUser) return null;

  const handleLogout = () => {
    if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
      navigate('/admin');
    } else {
      const role = currentUser?.role;
      const locId = localStorage.getItem('currentLocationId');
      logout();
      if (role === 'superadmin') {
        navigate('/super-admin');
      } else {
        navigate(locId ? `/login/${encodeURIComponent(locId.replace(/\s+/g, ''))}` : '/');
      }
    }
  };

  const handleTableClick = (zoneName, tableNum) => {
    const key = `${zoneName}-${tableNum}`;
    const familyData = tableFamilies[key];
    const isOccupied = activeTables[key] && activeTables[key].length > 0;
    
    setSelectedTable({ key, zoneName, tableNum, familyData, isOccupied });
    setFamilyNameInput(familyData ? familyData.familyName : '');
  };

  const saveFamily = () => {
    if (!selectedTable) return;
    if (familyNameInput.trim()) {
      const currentStatus = selectedTable.familyData?.status || (selectedTable.isOccupied ? 'seated' : 'reserved');
      setTableFamily(selectedTable.key, familyNameInput.trim(), currentStatus);
    } else {
      setTableFamily(selectedTable.key, null);
    }
    setSelectedTable(null);
  };

  const [currentTime, setCurrentTime] = useState(Date.now());
  React.useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const getOccupiedTime = (cartArray) => {
    if (!cartArray || cartArray.length === 0) return '';
    const earliest = Math.min(...cartArray.map(item => item.timestamp || Date.now()));
    const diff = Math.max(0, currentTime - earliest);
    const totalSeconds = Math.floor(diff / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getTableStyle = (key) => {
    if (activeTables[key] && activeTables[key].length > 0) return {
      backgroundColor: 'color-mix(in srgb, var(--danger-color) 15%, transparent)',
      color: 'var(--danger-color)',
      borderColor: 'color-mix(in srgb, var(--danger-color) 30%, transparent)'
    };
    if (tableFamilies[key] && tableFamilies[key].status === 'reserved') return {
      backgroundColor: 'color-mix(in srgb, var(--info-color) 15%, transparent)',
      color: 'var(--info-color)',
      borderColor: 'color-mix(in srgb, var(--info-color) 30%, transparent)'
    };
    return {
      backgroundColor: 'color-mix(in srgb, var(--success-color) 10%, transparent)',
      color: 'var(--success-color)',
      borderColor: 'color-mix(in srgb, var(--success-color) 20%, transparent)'
    };
  };

  const assignedFamilies = Object.keys(tableFamilies).map(key => {
    const data = tableFamilies[key];
    let zoneId = '';
    let tableNum = key;
    if (zones) {
      const z = zones.find(zone => key.startsWith(`${zone.id}-`));
      if (z) {
        zoneId = z.id;
        tableNum = key.substring(z.id.length + 1);
      }
    }
    const zoneName = zones?.find(z => z.id === zoneId)?.name || 'Zona Desconocida';
    const isOccupied = activeTables[key] && activeTables[key].length > 0;
    const occupiedTime = isOccupied ? getOccupiedTime(activeTables[key]) : '';
    return { key, zoneName, tableNum, ...data, isOccupied, occupiedTime };
  }).sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="flex flex-col" style={{ height: '100dvh', backgroundColor: 'var(--bg-color)', overflow: 'hidden' }}>
      <PageHeader 
        icon={<Users size={28} color="#fff" />}
        title="Anfitriona"
        subtitle={currentUser.name}
        badge={(currentUser.role === 'admin' || currentUser.role === 'superadmin') ? 'Modo Supervisor' : null}
        actions={
          <button onClick={handleLogout} className="btn btn-outline text-xs px-3 py-1 flex items-center gap-2">
            <LogOut size={14} />
            <span className="inline">{(currentUser.role === 'admin' || currentUser.role === 'superadmin') ? 'Volver al Admin' : 'Cerrar Sesión'}</span>
          </button>
        }
      />

      {/* Mobile Toggle */}
      {isMobile && (
        <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex" style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: '9999px', padding: '4px' }}>
            <button 
              className="flex-1"
              style={{ 
                padding: '0.6rem 0.25rem', fontSize: 'clamp(0.7rem, 2.5vw, 0.85rem)', fontWeight: 600, borderRadius: '9999px', transition: 'all 0.3s',
                backgroundColor: viewMode === 'mesas' ? 'var(--primary-color)' : 'transparent',
                color: viewMode === 'mesas' ? '#fff' : 'var(--text-secondary)',
                boxShadow: viewMode === 'mesas' ? '0 4px 12px rgba(255,107,0,0.3)' : 'none',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
              }}
              onClick={() => setViewMode('mesas')}
            >
              Plano de Mesas
            </button>
            <button 
              className="flex-1"
              style={{ 
                padding: '0.6rem 0.25rem', fontSize: 'clamp(0.7rem, 2.5vw, 0.85rem)', fontWeight: 600, borderRadius: '9999px', transition: 'all 0.3s',
                backgroundColor: viewMode === 'asignadas' ? 'var(--primary-color)' : 'transparent',
                color: viewMode === 'asignadas' ? '#fff' : 'var(--text-secondary)',
                boxShadow: viewMode === 'asignadas' ? '0 4px 12px rgba(255,107,0,0.3)' : 'none',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
              }}
              onClick={() => setViewMode('asignadas')}
            >
              Asignaciones ({assignedFamilies.length})
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1" style={{ minHeight: 0, overflow: 'hidden' }}>
        {/* Main Map Area */}
        <div className="flex-1" style={{ padding: isMobile ? '1rem' : '1.5rem', overflowY: 'auto', display: (!isMobile || viewMode === 'mesas') ? 'block' : 'none' }}>
          <div style={{ maxWidth: '1024px', margin: '0 auto', paddingBottom: '5rem' }}>
            <div className="flex flex-wrap items-center justify-center sm:justify-start" style={{ gap: '0.75rem', marginBottom: '1.5rem', padding: '0.75rem 1rem', backgroundColor: 'var(--surface-solid)', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
               <div className="flex items-center gap-2 text-xs sm:text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--success-color)', boxShadow: '0 0 10px var(--success-color)' }}></div> Libre
               </div>
               <div className="flex items-center gap-2 text-xs sm:text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--info-color)', boxShadow: '0 0 10px var(--info-color)' }}></div> Reservada
               </div>
               <div className="flex items-center gap-2 text-xs sm:text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                 <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--danger-color)', boxShadow: '0 0 10px var(--danger-color)' }}></div> Ocupada
               </div>
            </div>

            {/* Tabs for zones */}
            <div className="flex custom-scrollbar" style={{ gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              {zones.filter(z => z.active !== false).map((zone) => (
                <button
                  key={zone.id}
                  onClick={() => setSelectedZoneId(zone.id)}
                  className={`btn px-4 py-2 whitespace-nowrap transition-all duration-200`}
                  style={{
                    backgroundColor: selectedZoneId === zone.id ? 'var(--primary-color)' : 'transparent',
                    color: selectedZoneId === zone.id ? '#fff' : 'var(--text-secondary)',
                    borderColor: selectedZoneId === zone.id ? 'var(--primary-color)' : 'var(--border-color)',
                    borderWidth: '1px',
                    borderStyle: 'solid',
                    borderRadius: '8px'
                  }}
                >
                  {zone.name}
                </button>
              ))}
            </div>

            {/* Selected Zone map */}
            {zones.filter(z => z.id === selectedZoneId).map((zone) => (
              <div key={zone.id} className="card relative animate-fade-in group" style={{ padding: isMobile ? '1rem' : '1.5rem', marginBottom: '1.5rem', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', backgroundColor: 'var(--primary-color)' }}></div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'capitalize' }}>
                  {zone.name}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem' }}>
                  {zone.tables && zone.tables.map((tableName, idx) => {
                    const key = `${zone.id}-${tableName}`;
                    const family = tableFamilies[key];
                    const occupied = activeTables[key] && activeTables[key].length > 0;
                    
                    return (
                      <button
                        key={idx}
                        onClick={() => handleTableClick(zone.id, tableName)}
                        className="card-btn flex flex-col items-center justify-center"
                        style={{ 
                          position: 'relative', padding: '1rem', borderRadius: '12px', border: '1px solid', textAlign: 'center', transition: 'all 0.3s', 
                          minHeight: '100px', ...getTableStyle(key) 
                        }}
                      >
                        <span style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.25rem' }}>{tableName}</span>
                        {occupied && (
                          <span style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '0.7rem', fontWeight: 600, color: 'var(--danger-color)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                            <Clock size={10} /> {getOccupiedTime(activeTables[key])}
                          </span>
                        )}
                        {family && (
                          <div style={{ position: 'absolute', bottom: '8px', left: 0, width: '100%', padding: '0 4px' }}>
                            <div 
                              style={{ 
                                fontSize: '0.65rem', fontWeight: 'bold', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: 1.2, padding: '2px 4px', borderRadius: '4px',
                                backgroundColor: occupied ? 'color-mix(in srgb, var(--danger-color) 30%, transparent)' : 'color-mix(in srgb, var(--info-color) 30%, transparent)', 
                                color: occupied ? 'var(--danger-color)' : 'var(--info-color)',
                                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                              }}
                            >
                              {family.familyName}
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="flex-col relative z-10" style={{ width: isMobile ? '100%' : '320px', display: (!isMobile || viewMode === 'asignadas') ? 'flex' : 'none', backgroundColor: 'var(--surface-solid)', borderLeft: '1px solid var(--border-color)', boxShadow: '-4px 0 15px rgba(0,0,0,0.1)' }}>
          <div style={{ padding: '1rem', position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)' }}>
            <h3 className="flex items-center" style={{ fontWeight: 'bold', gap: '0.5rem', color: 'var(--text-primary)', margin: 0 }}><Users size={18} style={{ color: 'var(--primary-color)' }} /> Mesas Asignadas</h3>
            <p style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: 'var(--text-secondary)' }}>Lista en vivo de familias</p>
          </div>
          <div className="flex-1 custom-scrollbar" style={{ overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {assignedFamilies.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <Home size={32} style={{ margin: '0 auto 0.5rem', opacity: 0.2 }} />
                No hay familias asignadas a ninguna mesa.
              </div>
            ) : (
              assignedFamilies.map((fam) => (
                <div 
                  key={fam.key} 
                  style={{
                    padding: '0.75rem', borderRadius: '8px', border: '1px solid', cursor: 'pointer', transition: 'all 0.2s',
                    backgroundColor: fam.isOccupied ? 'color-mix(in srgb, var(--danger-color) 10%, transparent)' : 'color-mix(in srgb, var(--info-color) 10%, transparent)',
                    borderColor: fam.isOccupied ? 'color-mix(in srgb, var(--danger-color) 20%, transparent)' : 'color-mix(in srgb, var(--info-color) 20%, transparent)'
                  }}
                  onClick={() => handleTableClick(fam.zoneName, fam.tableNum)}
                >
                  <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.875rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '0.5rem', color: 'var(--text-primary)' }}>{fam.familyName}</span>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', padding: '0.125rem 0.5rem', borderRadius: '4px', whiteSpace: 'nowrap', backgroundColor: 'rgba(0,0,0,0.3)', color: 'var(--text-secondary)' }}>Mesa {fam.tableNum}</span>
                  </div>
                  <div className="flex" style={{ justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                    <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{fam.zoneName}</span>
                    {fam.isOccupied ? (
                      <span className="flex items-center" style={{ gap: '0.25rem', color: '#f87171' }}><CheckCircle size={12}/> Ocupada {fam.occupiedTime && `(${fam.occupiedTime})`}</span>
                    ) : (
                      <span className="flex items-center" style={{ gap: '0.25rem', color: '#60a5fa' }}><Clock size={12}/> Reservada</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {selectedTable && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
          <div className="rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200" style={{ backgroundColor: 'var(--surface-solid)', border: '1px solid var(--border-color)' }}>
            <div className="p-4 flex justify-between items-center" style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--surface-color)' }}>
              <h3 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>Mesa {selectedTable.tableNum} <span className="text-sm font-normal capitalize" style={{ color: 'var(--text-secondary)' }}>({selectedTable.zoneName})</span></h3>
              <button onClick={() => setSelectedTable(null)} style={{ color: 'var(--text-muted)' }} className="hover:text-white"><X size={20}/></button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>Nombre de la Familia / Reserva</label>
                <input
                  type="text"
                  autoFocus
                  className="input w-full text-lg py-3"
                  placeholder="Ej. Familia Pérez"
                  value={familyNameInput}
                  onChange={(e) => setFamilyNameInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') saveFamily(); }}
                />
              </div>
              
              <div className="flex gap-3">
                <button 
                  className="btn btn-outline flex-1" 
                  onClick={() => setSelectedTable(null)}
                >
                  Cancelar
                </button>
                <button 
                  className="btn btn-primary flex-1" 
                  onClick={saveFamily}
                >
                  Guardar
                </button>
              </div>
              
              {selectedTable.familyData && !selectedTable.isOccupied && (
                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                   <button 
                    className="btn w-full flex items-center justify-center gap-2"
                    style={{ backgroundColor: 'transparent', color: 'var(--danger-color)', border: '1px solid var(--danger-color)' }}
                    onClick={() => { setTableFamily(selectedTable.key, null); setSelectedTable(null); }}
                  >
                    <Trash2 size={16} /> Liberar Mesa
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useAlert } from '../context/AlertContext';
import React, { useState } from 'react';
import { useEscapeKey } from '../hooks/useEscapeKey';
import { createPortal } from 'react-dom';
import { useStore } from '../context/StoreContext';
import { Award, Gift, Search, Star, User, Plus, Trash2, Edit2, Bell, ChevronDown } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import CustomSelect from './CustomSelect';

export default function CrmTab() {
  const { showAlert, showConfirm } = useAlert();
  const { customers, promotions, addPromotion, updatePromotion, deletePromotion } = useStore();
  const [activeTab, setActiveTab] = useState('customers'); // 'customers' or 'promotions'
  const [search, setSearch] = useState('');
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [editingPromo, setEditingPromo] = useState(null);
  
  // Send Offer Modal State
  const [offerModalCustomer, setOfferModalCustomer] = useState(null);
  const [selectedPromoToSend, setSelectedPromoToSend] = useState('');
  
  useEscapeKey(() => {
    if (showPromoModal) setShowPromoModal(false);
    if (offerModalCustomer) setOfferModalCustomer(null);
  });
  
  // Promo Form State
  const [promoForm, setPromoForm] = useState({
    title: '',
    description: '',
    discountType: 'percentage', // percentage, fixed, 2x1, free_delivery
    discountValue: '',
    targetLevels: [],
    isActive: true
  });

  const levels = ['Bronce', 'Plata', 'Oro', 'VIP', 'Platinum'];

  const filteredCustomers = (customers || []).filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.phone.includes(search)
  ).sort((a, b) => b.points - a.points);

  const getLevelColor = (level) => {
    switch(level) {
      case 'Bronce': return '#cd7f32';
      case 'Plata': return '#c0c0c0';
      case 'Oro': return '#ffd700';
      case 'VIP': return '#8a2be2';
      case 'Platinum': return '#e5e4e2';
      default: return 'var(--text-secondary)';
    }
  };

  const handleSendOffer = (customer) => {
    setOfferModalCustomer(customer);
    setSelectedPromoToSend('');
  };

  const confirmSendOffer = (e) => {
    e.preventDefault();
    if (!selectedPromoToSend) {
      showAlert('Selecciona una promoción para enviar', 'error');
      return;
    }
    const promo = promotions.find(p => p.id === selectedPromoToSend);
    showAlert(`Se ha enviado la promoción "${promo.title}" por Push / SMS a ${offerModalCustomer.name} (${offerModalCustomer.phone}).`, 'success');
    setOfferModalCustomer(null);
  };

  const resetPromoForm = () => {
    setPromoForm({
      title: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      targetLevels: [],
      isActive: true
    });
    setEditingPromo(null);
  };

  const handleSavePromo = (e) => {
    e.preventDefault();
    if (!promoForm.title || promoForm.targetLevels.length === 0) {
      showAlert('El título y al menos un nivel destino son requeridos.', 'error');
      return;
    }

    if (editingPromo) {
      updatePromotion({ ...editingPromo, ...promoForm });
      showAlert('Promoción actualizada con éxito.', 'success');
    } else {
      addPromotion({
        id: uuidv4(),
        ...promoForm,
        createdAt: new Date().toISOString()
      });
      showAlert('¡Promoción publicada y enviada a los clientes!', 'success');
    }
    setShowPromoModal(false);
    resetPromoForm();
  };

  const handleDeletePromo = (promo) => {
    showConfirm('¿Estás seguro de eliminar esta promoción?', () => {
      deletePromotion(promo);
      showAlert('Promoción eliminada', 'success');
    });
  };

  const toggleLevel = (level) => {
    if (promoForm.targetLevels.includes(level)) {
      setPromoForm(prev => ({ ...prev, targetLevels: prev.targetLevels.filter(l => l !== level) }));
    } else {
      setPromoForm(prev => ({ ...prev, targetLevels: [...prev.targetLevels, level] }));
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="title" style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award style={{ color: 'var(--primary-color)' }} /> CRM y Fidelización
          </h2>
          <p className="subtitle">Gestiona a tus clientes, sus niveles y ofréceles promociones.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            className={`btn ${activeTab === 'customers' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('customers')}
          >
            Directorio
          </button>
          <button 
            className={`btn ${activeTab === 'promotions' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('promotions')}
          >
            Promociones
          </button>
        </div>
      </div>

      {activeTab === 'customers' && (
        <div className="animate-fade-in">
          {/* Share App Link */}
          <div style={{ background: 'linear-gradient(to right, rgba(255,107,0,0.1), rgba(255,204,0,0.1))', padding: '1rem', borderRadius: '1rem', border: '1px solid var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <h4 style={{ margin: 0, color: 'var(--primary-color)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Star size={16} /> ¡Invita a tus clientes a la App!
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Comparte este enlace único para que tus clientes inicien sesión, ganen puntos y hagan pedidos.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-color)', padding: '0.5rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600, userSelect: 'all' }}>
                {window.location.origin}/app
              </span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/app`);
                  showAlert('¡Enlace copiado al portapapeles!');
                }}
                className="btn btn-primary" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
              >
                Copiar
              </button>
            </div>
          </div>
          
          <div style={{ position: 'relative', width: '300px', maxWidth: '100%', marginBottom: '1.5rem' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="input w-full" 
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Buscar por nombre o celular..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Stats Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'var(--surface-color)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(255, 107, 0, 0.1)', padding: '1rem', borderRadius: '50%', color: 'var(--primary-color)' }}>
                <User size={24} />
              </div>
              <div>
                <p className="subtitle" style={{ margin: 0 }}>Total Clientes</p>
                <h3 className="title" style={{ fontSize: '1.5rem', margin: 0 }}>{(customers || []).length}</h3>
              </div>
            </div>
            <div style={{ background: 'var(--surface-color)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ background: 'rgba(255, 215, 0, 0.1)', padding: '1rem', borderRadius: '50%', color: '#ffd700' }}>
                <Star size={24} />
              </div>
              <div>
                <p className="subtitle" style={{ margin: 0 }}>Clientes VIP/Oro</p>
                <h3 className="title" style={{ fontSize: '1.5rem', margin: 0 }}>
                  {(customers || []).filter(c => c.level === 'VIP' || c.level === 'Oro' || c.level === 'Platinum').length}
                </h3>
              </div>
            </div>
          </div>

          {/* Customers Table */}
          <div style={{ overflowX: 'auto', background: 'var(--surface-color)', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)' }}>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Cliente</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Celular</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Nivel Actual</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Puntos / Gasto</th>
                  <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary-color)' }}>
                          {customer.name.charAt(0)}
                        </div>
                        {customer.name}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{customer.phone}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        background: `${getLevelColor(customer.level)}20`, 
                        color: getLevelColor(customer.level), 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '99px', 
                        fontWeight: 700,
                        fontSize: '0.85rem'
                      }}>
                        {customer.level}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 700, color: 'var(--success-color)' }}>S/ {(customer.totalSpent || 0).toFixed(2)}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{customer.points || 0} pts</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button 
                        onClick={() => handleSendOffer(customer)}
                        className="btn btn-outline" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary-color)', borderColor: 'var(--primary-color)' }}
                      >
                        <Gift size={14} /> Enviar Oferta
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No se encontraron clientes.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'promotions' && (
        <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
            <button 
              className="btn btn-primary"
              onClick={() => { resetPromoForm(); setShowPromoModal(true); }}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Plus size={18} /> Nueva Promoción
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {(promotions || []).length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', background: 'var(--surface-color)', borderRadius: '1rem', border: '1px dashed var(--border-color)' }}>
                <Gift size={48} style={{ color: 'var(--text-secondary)', marginBottom: '1rem', opacity: 0.5 }} />
                <h3 className="title">No hay promociones activas</h3>
                <p className="subtitle">Crea una promoción para recompensar a tus mejores clientes.</p>
              </div>
            ) : (
              (promotions || []).map(promo => (
                <div key={promo.id} style={{ background: 'var(--surface-color)', borderRadius: '1rem', border: '1px solid var(--border-color)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', opacity: promo.isActive ? 1 : 0.6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h3 className="title" style={{ margin: 0, fontSize: '1.2rem', paddingRight: '2rem' }}>{promo.title}</h3>
                    <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={promo.isActive}
                          onChange={() => updatePromotion({ ...promo, isActive: !promo.isActive })}
                          style={{ marginRight: '0.5rem' }}
                        />
                        <span style={{ fontSize: '0.8rem', color: promo.isActive ? 'var(--success-color)' : 'var(--text-secondary)' }}>
                          {promo.isActive ? 'Activa' : 'Inactiva'}
                        </span>
                      </label>
                    </div>
                  </div>
                  
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                    {promo.description}
                  </p>
                  
                  <div style={{ background: 'var(--bg-color)', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Beneficio:</span>
                    <span style={{ fontWeight: 700, color: 'var(--primary-color)' }}>
                      {promo.discountType === 'percentage' && `${promo.discountValue}% Dscto.`}
                      {promo.discountType === 'fixed' && `- S/ ${parseFloat(promo.discountValue).toFixed(2)}`}
                      {promo.discountType === 'free_delivery' && 'Delivery Gratis'}
                      {promo.discountType === '2x1' && '2x1'}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Niveles objetivo:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                      {promo.targetLevels.map(l => (
                        <span key={l} style={{ 
                          background: `${getLevelColor(l)}20`, 
                          color: getLevelColor(l), 
                          padding: '0.2rem 0.5rem', 
                          borderRadius: '99px', 
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}>
                          {l}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                    <button 
                      className="btn btn-outline" 
                      style={{ flex: 1, padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                      onClick={() => {
                        setPromoForm(promo);
                        setEditingPromo(promo);
                        setShowPromoModal(true);
                      }}
                    >
                      <Edit2 size={16} /> Editar
                    </button>
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '0.5rem', color: 'var(--danger-color)', borderColor: 'transparent' }}
                      onClick={() => handleDeletePromo(promo)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Modal for creating/editing promo */}
      {showPromoModal && createPortal(
        <div className="modal-overlay animate-fade-in" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="modal-content animate-bounce-in premium-glass-modal" style={{ padding: '2rem', borderRadius: '1.25rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 className="title" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Gift style={{ color: 'var(--primary-color)' }} /> 
              {editingPromo ? 'Editar Promoción' : 'Crear Promoción'}
            </h3>
            
            <form onSubmit={handleSavePromo} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="subtitle" style={{ display: 'block', marginBottom: '0.5rem' }}>Título de la Oferta</label>
                <input 
                  type="text" 
                  className="input w-full" 
                  required
                  placeholder="Ej. 20% en Postres, Delivery Gratis, etc."
                  value={promoForm.title}
                  onChange={e => setPromoForm({...promoForm, title: e.target.value})}
                />
              </div>

              <div>
                <label className="subtitle" style={{ display: 'block', marginBottom: '0.5rem' }}>Descripción / Mensaje</label>
                <textarea 
                  className="input w-full" 
                  rows="3"
                  placeholder="Este mensaje le llegará al cliente..."
                  value={promoForm.description}
                  onChange={e => setPromoForm({...promoForm, description: e.target.value})}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label className="subtitle" style={{ display: 'block', marginBottom: '0.5rem' }}>Tipo de Beneficio</label>
                  <CustomSelect 
                    value={promoForm.discountType}
                    onChange={(val) => setPromoForm({...promoForm, discountType: val, discountValue: ''})}
                    options={[
                      { value: 'percentage', label: 'Porcentaje (%)' },
                      { value: 'fixed', label: 'Monto Fijo (- S/)' },
                      { value: 'free_delivery', label: 'Delivery Gratis' },
                      { value: '2x1', label: '2x1 en Productos' }
                    ]}
                  />
                </div>
                
                {(promoForm.discountType === 'percentage' || promoForm.discountType === 'fixed') && (
                  <div style={{ flex: 1 }}>
                    <label className="subtitle" style={{ display: 'block', marginBottom: '0.5rem' }}>Valor</label>
                    <input 
                      type="number" 
                      className="input w-full" 
                      required
                      min="1"
                      step="any"
                      placeholder={promoForm.discountType === 'percentage' ? '%' : 'S/'}
                      value={promoForm.discountValue}
                      onChange={e => setPromoForm({...promoForm, discountValue: e.target.value})}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="subtitle" style={{ display: 'block', marginBottom: '0.75rem' }}>Niveles Objetivo (¿Quién lo recibe?)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {levels.map(level => (
                    <button
                      type="button"
                      key={level}
                      onClick={() => toggleLevel(level)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '99px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        border: `1px solid ${promoForm.targetLevels.includes(level) ? getLevelColor(level) : 'var(--border-color)'}`,
                        background: promoForm.targetLevels.includes(level) ? `${getLevelColor(level)}20` : 'transparent',
                        color: promoForm.targetLevels.includes(level) ? getLevelColor(level) : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                {promoForm.targetLevels.length === 0 && (
                  <p style={{ color: 'var(--danger-color)', fontSize: '0.8rem', marginTop: '0.5rem' }}>Debes seleccionar al menos un nivel.</p>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowPromoModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {editingPromo ? 'Guardar Cambios' : <><Bell size={16} /> Publicar y Notificar</>}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
      {/* Modal for sending offer to specific customer */}
      {offerModalCustomer && createPortal(
        <div className="modal-overlay animate-fade-in" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="modal-content animate-bounce-in premium-glass-modal" style={{ padding: '2rem', borderRadius: '1.25rem', width: '100%', maxWidth: '400px' }}>
            <h3 className="title" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell style={{ color: 'var(--primary-color)' }} /> Enviar Oferta
            </h3>
            <p className="subtitle" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              Selecciona una promoción activa para <strong>{offerModalCustomer.name}</strong> (Nivel: {offerModalCustomer.level}).
            </p>
            
            <form onSubmit={confirmSendOffer} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <CustomSelect 
                  className="w-full"
                  value={selectedPromoToSend}
                  onChange={val => setSelectedPromoToSend(val)}
                  options={[
                    { value: '', label: '-- Selecciona una promoción --' },
                    ...(promotions || [])
                      .filter(p => p.isActive && p.targetLevels.includes(offerModalCustomer.level))
                      .map(p => ({
                        value: p.id,
                        label: `${p.title} (${p.discountType === 'percentage' ? `-${p.discountValue}%` : p.discountType === 'fixed' ? `-S/${p.discountValue}` : p.discountType === '2x1' ? '2x1' : 'Delivery Gratis'})`
                      }))
                  ]}
                />
              </div>

              {(promotions || []).filter(p => p.isActive && p.targetLevels.includes(offerModalCustomer.level)).length === 0 && (
                <p style={{ color: 'var(--danger-color)', fontSize: '0.8rem', margin: 0 }}>
                  No hay promociones activas para el nivel {offerModalCustomer.level}. Crea una primero.
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setOfferModalCustomer(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Bell size={16} /> Enviar Push/SMS
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

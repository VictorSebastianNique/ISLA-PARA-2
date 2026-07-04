import React, { useState } from 'react';
import { X, Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { v4 as uuidv4 } from 'uuid';

export default function SplitBillModal({ isOpen, onClose, tableKey, tableName }) {
  const { activeTables, splitTableItem } = useStore();
  
  if (!isOpen || !tableKey) return null;

  const cart = activeTables[tableKey] || [];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '1rem'
    }}>
      <SplitBillManager cart={cart} tableKey={tableKey} tableName={tableName} onClose={onClose} splitTableItem={splitTableItem} />
    </div>
  );
}

function SplitBillManager({ cart, tableKey, tableName, onClose, splitTableItem }) {
  const [customAccounts, setCustomAccounts] = useState([]);
  const [newAcc, setNewAcc] = useState('');
  
  // State for multiple selected items: { itemId: quantityToMove }
  const [selectedItems, setSelectedItems] = useState({});
  const [targetAccount, setTargetAccount] = useState('');

  // Agrupar ítems
  const accountGroups = {};
  cart.forEach(c => {
    const acc = c.accountName || 'Cuenta Principal';
    if (!accountGroups[acc]) accountGroups[acc] = [];
    accountGroups[acc].push(c);
  });

  // Asegurar que las cuentas creadas manualmente existan
  customAccounts.forEach(acc => {
    if (!accountGroups[acc]) accountGroups[acc] = [];
  });
  if (!accountGroups['Cuenta Principal']) accountGroups['Cuenta Principal'] = [];

  const handleCreateAccount = (e) => {
    e.preventDefault();
    const name = newAcc.trim();
    if (name && !customAccounts.includes(name) && !accountGroups[name]) {
      setCustomAccounts([...customAccounts, name]);
      setNewAcc('');
    }
  };

  const handleSelectSource = (item) => {
    setSelectedItems(prev => {
      const newSelections = { ...prev };
      if (newSelections[item.id]) {
        delete newSelections[item.id];
      } else {
        newSelections[item.id] = 1; // Default to 1
      }
      return newSelections;
    });
  };

  const handleUpdateQuantity = (itemId, newQty, maxQty) => {
    if (newQty < 1 || newQty > maxQty) return;
    setSelectedItems(prev => ({ ...prev, [itemId]: newQty }));
  };

  const handleMove = () => {
    if (Object.keys(selectedItems).length === 0 || !targetAccount) return;
    
    Object.entries(selectedItems).forEach(([itemId, qty]) => {
      splitTableItem(tableKey, itemId, qty, targetAccount);
    });
    
    setSelectedItems({});
    setTargetAccount('');
  };

  const selectedCount = Object.keys(selectedItems).length;

  return (
    <div className="card" style={{ width: '100%', maxWidth: '900px', height: '85vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--surface-solid)', padding: 0 }}>
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.2rem', fontWeight: 600 }}>Cuentas Separadas - {tableName}</h2>
        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <X size={24} />
        </button>
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        
        {/* Lado izquierdo */}
        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', borderRight: '1px solid var(--border-color)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>
            Productos por Cuenta
          </h3>
          
          {Object.entries(accountGroups).map(([accName, items]) => (
            <div key={accName} style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--border-radius)', padding: '1rem', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>{accName}</h4>
                <span style={{ color: 'var(--success-color)', fontWeight: 600 }}>
                  S/ {items.reduce((sum, i) => sum + (i.item.price * i.quantity), 0).toFixed(2)}
                </span>
              </div>
              
              {items.length === 0 ? (
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>No hay productos en esta cuenta</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {items.map(item => {
                    const isSelected = !!selectedItems[item.id];
                    return (
                      <div 
                        key={item.id} 
                        onClick={() => handleSelectSource(item)}
                        style={{ 
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
                          padding: '0.75rem', borderRadius: '8px', 
                          backgroundColor: isSelected ? 'var(--primary-subtle)' : 'var(--surface-color)',
                          border: isSelected ? '1px solid var(--primary-color)' : '1px solid transparent',
                          cursor: 'pointer', transition: 'var(--transition)'
                        }}
                      >
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                          <span style={{ backgroundColor: 'var(--surface-hover)', width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                            {item.quantity}
                          </span>
                          <div>
                            <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{item.item.name}</p>
                            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>S/ {item.item.price.toFixed(2)} c/u</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {isSelected && <span style={{ fontSize: '0.75rem', color: 'var(--primary-color)', fontWeight: 600 }}>SELECCIONADO</span>}
                          <ChevronRight size={18} color={isSelected ? 'var(--primary-color)' : 'var(--text-secondary)'} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Lado derecho */}
        <div style={{ width: '400px', padding: '1.5rem', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--surface-color)' }}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Gestión de División</h3>
          
          <form onSubmit={handleCreateAccount} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input 
              type="text" 
              value={newAcc} 
              onChange={e => setNewAcc(e.target.value)} 
              placeholder="Nueva cuenta (ej. Gabriela)" 
              className="input-field" 
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-outline" style={{ padding: '0.5rem' }}>
              <Plus size={20} />
            </button>
          </form>

          {selectedCount > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--primary-color)', display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-primary)', fontSize: '1rem' }}>Mover {selectedCount} Producto{selectedCount !== 1 ? 's' : ''}</h4>
                
                {/* Scrollable list of selected items to adjust quantity */}
                <div style={{ overflowY: 'auto', marginBottom: '1.5rem', flex: 1, paddingRight: '0.5rem' }}>
                  {Object.entries(selectedItems).map(([itemId, qty]) => {
                    const originalItem = cart.find(c => c.id === itemId);
                    if (!originalItem) return null;
                    return (
                      <div key={itemId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', padding: '0.5rem', backgroundColor: 'var(--surface-color)', borderRadius: '8px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', flex: 1 }}>{originalItem.item.name}</span>
                        
                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-color)', borderRadius: '6px', overflow: 'hidden' }}>
                          <button 
                            onClick={() => handleUpdateQuantity(itemId, qty - 1, originalItem.quantity)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', padding: '0.25rem 0.6rem', cursor: 'pointer' }}
                          >-</button>
                          <span style={{ padding: '0 0.5rem', fontWeight: 600, fontSize: '0.85rem', minWidth: '24px', textAlign: 'center' }}>{qty}</span>
                          <button 
                            onClick={() => handleUpdateQuantity(itemId, qty + 1, originalItem.quantity)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', padding: '0.25rem 0.6rem', cursor: 'pointer' }}
                          >+</button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: 'auto' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Selecciona destino:</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {Object.keys(accountGroups).map(acc => (
                      <button
                        key={acc}
                        onClick={() => setTargetAccount(acc)}
                        style={{
                          padding: '0.5rem 0.75rem',
                          borderRadius: '8px',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: targetAccount === acc ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                          backgroundColor: targetAccount === acc ? 'var(--primary-subtle)' : 'var(--surface-color)',
                          color: targetAccount === acc ? 'var(--primary-color)' : 'var(--text-primary)'
                        }}
                      >
                        {acc}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  className="btn btn-primary w-full" 
                  style={{ marginTop: '1.5rem', padding: '0.85rem', fontSize: '1rem' }}
                  disabled={!targetAccount}
                  onClick={handleMove}
                >
                  Confirmar Traspaso
                </button>
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              <ChevronLeft size={40} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>Selecciona uno o más productos de la izquierda para moverlos.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}


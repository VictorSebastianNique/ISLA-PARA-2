import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X, Plus, Trash2, Save } from 'lucide-react';

const MenuRecipeModal = ({ menuItem, catalogId, onClose }) => {
  const { kardexItems, catalogs, setCatalogs } = useStore();
  const [recipe, setRecipe] = useState(menuItem.kardexRecipe || []);
  const [newItemId, setNewItemId] = useState('');
  const [newQty, setNewQty] = useState('1');

  const handleAdd = () => {
    if (!newItemId || !newQty) return;
    setRecipe([...recipe, { kardexId: newItemId, qty: parseFloat(newQty) }]);
    setNewItemId('');
    setNewQty('1');
  };

  const handleRemove = (index) => {
    setRecipe(recipe.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    setCatalogs(prev => prev.map(c => {
      if (c.id !== catalogId) return c;
      return {
        ...c,
        items: c.items.map(item => item.id === menuItem.id ? { ...item, kardexRecipe: recipe } : item)
      };
    }));
    onClose();
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '90%', maxWidth: '450px', padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="title" style={{ fontSize: '1.1rem', margin: 0 }}>Receta Kardex: {menuItem.name}</h2>
          <button className="btn btn-outline" style={{ padding: '0.4rem' }} onClick={onClose}><X size={16} /></button>
        </div>

        <p className="subtitle" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>
          Configura qué insumos de producción se descontarán automáticamente cuando se venda este plato.
        </p>

        {/* Existing Recipe Items */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Insumos vinculados:</h3>
          {recipe.length === 0 ? (
            <p className="subtitle" style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>No hay insumos vinculados a este plato.</p>
          ) : (
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: 0, margin: 0, listStyle: 'none' }}>
              {recipe.map((r, idx) => {
                const kardexItem = kardexItems.find(k => k.id === r.kardexId);
                return (
                  <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-color)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <div>
                      <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{kardexItem ? kardexItem.name : 'Insumo desconocido'}</span>
                      <span style={{ fontSize: '0.75rem', marginLeft: '0.5rem', backgroundColor: 'var(--primary-color)', color: '#000', padding: '0.1rem 0.4rem', borderRadius: '4px', fontWeight: 'bold' }}>Cant: {r.qty}</span>
                    </div>
                    <button className="btn btn-outline" style={{ padding: '0.3rem', color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }} onClick={() => handleRemove(idx)}>
                      <Trash2 size={15} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Add new Item */}
        <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label className="subtitle" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>Agregar Insumo</label>
              <select className="input" style={{ width: '100%', padding: '0.5rem' }} value={newItemId} onChange={e => setNewItemId(e.target.value)}>
                <option value="">Seleccione...</option>
                {kardexItems.filter(k => k.active !== false).map(k => (
                  <option key={k.id} value={k.id}>{k.name}</option>
                ))}
              </select>
            </div>
            <div style={{ width: '80px' }}>
              <label className="subtitle" style={{ fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>Cant.</label>
              <input type="number" step="0.1" className="input" style={{ width: '100%', padding: '0.5rem' }} value={newQty} onChange={e => setNewQty(e.target.value)} />
            </div>
            <button className="btn btn-primary" style={{ padding: '0.5rem 0.75rem' }} onClick={handleAdd}>
              <Plus size={18} />
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', alignItems: 'center' }}>
            <span className="subtitle" style={{ fontSize: '0.75rem', marginRight: '0.2rem' }}>Rápidos:</span>
            <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => setNewQty('0.5')}>0.5</button>
            <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => setNewQty('1')}>1</button>
            <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }} onClick={() => setNewQty('2')}>2</button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }} onClick={handleSave}>
            <Save size={16} /> Guardar Receta
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuRecipeModal;

import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Plus, Check } from 'lucide-react';
import { createPortal } from 'react-dom';

export default function DailyMenuModal({ isOpen, onClose, onSkip, onSave }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [step, setStep] = useState(1);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleProcessImage = async () => {
    if (!file) return;
    setIsProcessing(true);
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      const token = localStorage.getItem('jwtToken');
      const res = await fetch('/api/extract-menu', {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData
      });
      
      const data = await res.json();
      if (res.ok && data.success) {
        setMenuItems(data.items || []);
        setStep(2);
      } else {
        alert(data.error || 'Error procesando la imagen. Revisa la consola o tu API Key de Gemini.');
      }
    } catch (err) {
      console.error(err);
      alert('Error de red al procesar la imagen.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateItem = (index, field, value) => {
    const updated = [...menuItems];
    updated[index] = { ...updated[index], [field]: value };
    setMenuItems(updated);
  };

  const handleRemoveItem = (index) => {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    setMenuItems([...menuItems, { name: '', category: 'Fondo del Día', price: 0 }]);
  };

  const handleSave = () => {
    onSave(menuItems);
  };

  return createPortal(
    <div className="modal-overlay animate-fade-in" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="modal-content animate-bounce-in premium-glass-modal" style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', borderRadius: '1.25rem' }}>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="title" style={{ fontSize: '1.5rem', margin: 0 }}>
            {step === 1 ? 'Configurar Menú del Día' : 'Revisar Platos Detectados'}
          </h2>
          <button onClick={onClose} className="btn btn-outline" style={{ border: 'none', padding: '0.5rem' }}><X size={24} /></button>
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-6">
            <p className="subtitle">Sube el flyer (imagen) del menú de hoy para extraer automáticamente los platos.</p>
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--primary-color)',
                borderRadius: '16px',
                padding: '3rem 1rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: preview ? `url(${preview}) center/contain no-repeat` : 'rgba(var(--primary-rgb), 0.05)',
                position: 'relative'
              }}
            >
              {!preview && (
                <div className="flex flex-col items-center gap-4 opacity-80">
                  <Upload size={48} color="var(--primary-color)" />
                  <p>Haz clic para seleccionar la imagen</p>
                </div>
              )}
              {preview && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ color: 'white', fontWeight: 'bold' }}>Cambiar Imagen</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
            </div>

            <div className="flex justify-between items-center mt-4">
              <button className="btn btn-outline" onClick={onSkip} style={{ color: 'var(--text-secondary)' }}>
                Saltar (Hoy no hay menú)
              </button>
              
              <button 
                className="btn btn-primary" 
                onClick={handleProcessImage} 
                disabled={!file || isProcessing}
                style={{ padding: '0.75rem 2rem' }}
              >
                {isProcessing ? <><Loader2 size={18} className="animate-spin" /> Procesando IA...</> : 'Escanear Menú'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <p className="subtitle">Corrige cualquier error de lectura y asigna los precios correspondientes.</p>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th className="pb-2">Plato</th>
                    <th className="pb-2">Categoría (Ej. Entrada, Fondo)</th>
                    <th className="pb-2">Precio (S/)</th>
                    <th className="pb-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td className="py-2 pr-2">
                        <input className="input w-full" value={item.name} onChange={e => handleUpdateItem(idx, 'name', e.target.value)} />
                      </td>
                      <td className="py-2 pr-2">
                        <input className="input w-full" value={item.category} onChange={e => handleUpdateItem(idx, 'category', e.target.value)} />
                      </td>
                      <td className="py-2 pr-2">
                        <input type="number" className="input w-full" value={item.price} onChange={e => handleUpdateItem(idx, 'price', parseFloat(e.target.value) || 0)} style={{ width: '80px' }} />
                      </td>
                      <td className="py-2">
                        <button className="btn btn-outline" onClick={() => handleRemoveItem(idx)} style={{ color: 'var(--danger-color)', border: 'none' }}><X size={18}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
              <button className="btn btn-outline flex items-center gap-2" onClick={handleAddItem}><Plus size={18}/> Agregar Fila</button>
              <div className="flex gap-2">
                <button className="btn btn-outline" onClick={() => setStep(1)}>Volver</button>
                <button className="btn btn-primary flex items-center gap-2" onClick={handleSave}><Check size={18}/> Guardar en Sistema</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

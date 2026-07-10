import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';

const CustomSelect = ({ value, onChange, options, className = '', style = {}, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);
  
  const selected = options.find(o => String(o.value) === String(value)) || options[0] || { label: 'Seleccione...' };
  
  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={selectRef} style={{ position: 'relative', ...style }} className={`${className} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <div 
        className="input" 
        style={{ cursor: disabled ? 'not-allowed' : 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none', width: '100%', height: '100%', padding: '0.8rem' }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '1rem' }}>
          {selected.label}
        </span>
        <ChevronDown size={16} style={{ color: 'var(--text-secondary)', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
      </div>
      
      {isOpen && createPortal(
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 100000 }} onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}></div>
          <div 
            className="animate-fade-in premium-glass-modal" 
            style={{ 
              position: 'fixed', 
              top: selectRef.current ? selectRef.current.getBoundingClientRect().bottom + 8 : 0, 
              left: selectRef.current ? selectRef.current.getBoundingClientRect().left : 0,
              width: selectRef.current ? selectRef.current.getBoundingClientRect().width : 'auto',
              minWidth: '150px',
              borderRadius: '0.75rem', 
              zIndex: 100001, 
              overflowY: 'auto',
              maxHeight: '300px'
            }}
          >
            {options.map(opt => (
              <div 
                key={opt.value}
                style={{ 
                  padding: '0.8rem 1rem', 
                  cursor: 'pointer', 
                  background: String(value) === String(opt.value) ? 'var(--primary-subtle)' : 'transparent', 
                  color: String(value) === String(opt.value) ? 'var(--primary-color)' : 'var(--text-primary)', 
                  borderBottom: '1px solid rgba(255,255,255,0.05)', 
                  transition: 'background 0.2s', 
                  fontWeight: String(value) === String(opt.value) ? 700 : 500 
                }}
                onMouseOver={e => e.currentTarget.style.background = 'var(--surface-hover)'}
                onMouseOut={e => e.currentTarget.style.background = String(value) === String(opt.value) ? 'var(--primary-subtle)' : 'transparent'}
                onClick={(e) => { e.stopPropagation(); onChange(opt.value); setIsOpen(false); }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default CustomSelect;

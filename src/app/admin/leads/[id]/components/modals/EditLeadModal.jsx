// src/app/admin/leads/[id]/components/modals/EditLeadModal.jsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function EditLeadModal({ lead, onClose, onSuccess }) {
  const [editData, setEditData] = useState({
    name: lead.name || '',
    possibleEmails: lead.possibleEmails || [],
    phoneNumbers: lead.phoneNumbers || [],
    website: lead.website || '',
    location: lead.location || '',
    companyName: lead.companyName || ''
  });
  
  const [saving, setSaving] = useState(false);

  const addEmail = () => {
    setEditData({
      ...editData,
      possibleEmails: [...editData.possibleEmails, '']
    });
  };

  const removeEmail = (index) => {
    setEditData({
      ...editData,
      possibleEmails: editData.possibleEmails.filter((_, i) => i !== index)
    });
  };

  const updateEmail = (index, value) => {
    const newEmails = [...editData.possibleEmails];
    newEmails[index] = value;
    setEditData({ ...editData, possibleEmails: newEmails });
  };

  const addPhone = () => {
    setEditData({
      ...editData,
      phoneNumbers: [...editData.phoneNumbers, '']
    });
  };

  const removePhone = (index) => {
    setEditData({
      ...editData,
      phoneNumbers: editData.phoneNumbers.filter((_, i) => i !== index)
    });
  };

  const updatePhone = (index, value) => {
    const newPhones = [...editData.phoneNumbers];
    newPhones[index] = value;
    setEditData({ ...editData, phoneNumbers: newPhones });
  };

  const handleSave = async () => {
  setSaving(true);
  try {
    console.log('💾 Guardando lead con datos:', editData);
    
    // ✅ PREPARAR DATOS PARA ENVIAR
    const dataToSend = {
      name: editData.name,
      website: editData.website || null,
      location: editData.location || editData.address || null,
      address: editData.location || editData.address || null,
      notes: editData.notes || null,
      
      // ✅ EMAILS
      possibleEmails: editData.possibleEmails || [],
      
      // ✅ TELÉFONOS - Enviar como array
      phoneNumbers: editData.phoneNumbers || [],
      
      // ✅ TAMBIÉN enviar phone por compatibilidad
      phone: (editData.phoneNumbers && editData.phoneNumbers.length > 0) 
        ? editData.phoneNumbers[0] 
        : null
    };
    
    console.log('📤 Enviando:', dataToSend);
    
    const res = await fetch(`/api/leads/${lead._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataToSend)
    });
    
    const data = await res.json();
    
    if (data.success) {
      console.log('✅ Lead actualizado correctamente');
      alert('✅ Lead actualizado correctamente');
      onSuccess(); // Recargar datos
      onClose();
    } else {
      console.error('❌ Error:', data.error);
      alert(`❌ Error: ${data.error}`);
    }
  } catch (error) {
    console.error('❌ Error guardando:', error);
    alert(`❌ Error: ${error.message}`);
  } finally {
    setSaving(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-slate-800 rounded-lg p-8 max-w-2xl w-full border border-cyan-500/30 my-8"
      >
        <h2 className="text-2xl font-bold text-white mb-6">
          ✏️ Editar Lead
        </h2>
        
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          {/* Nombre */}
          <div>
            <label className="block text-gray-300 mb-2 font-semibold">
              Nombre / Empresa
            </label>
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({...editData, name: e.target.value})}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="Ej: Juan Pérez"
            />
          </div>

          {/* Nombre de empresa */}
          <div>
            <label className="block text-gray-300 mb-2 font-semibold">
              Nombre de Empresa (opcional)
            </label>
            <input
              type="text"
              value={editData.companyName}
              onChange={(e) => setEditData({...editData, companyName: e.target.value})}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="Ej: Tech Solutions SL"
            />
          </div>

          {/* Emails */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-gray-300 font-semibold">Emails</label>
              <button
                onClick={addEmail}
                className="text-cyan-400 hover:text-cyan-300 text-sm"
              >
                ➕ Añadir email
              </button>
            </div>
            {editData.possibleEmails.length === 0 ? (
              <button
                onClick={addEmail}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-dashed border-slate-600 rounded-lg text-gray-400 hover:text-cyan-400 hover:border-cyan-500 transition"
              >
                ➕ Añadir primer email
              </button>
            ) : (
              <div className="space-y-2">
                {editData.possibleEmails.map((email, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => updateEmail(index, e.target.value)}
                      className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                      placeholder="email@ejemplo.com"
                    />
                    <button
                      onClick={() => removeEmail(index)}
                      className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Teléfonos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-gray-300 font-semibold">Teléfonos</label>
              <button
                onClick={addPhone}
                className="text-cyan-400 hover:text-cyan-300 text-sm"
              >
                ➕ Añadir teléfono
              </button>
            </div>
            {editData.phoneNumbers.length === 0 ? (
              <button
                onClick={addPhone}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-dashed border-slate-600 rounded-lg text-gray-400 hover:text-cyan-400 hover:border-cyan-500 transition"
              >
                ➕ Añadir primer teléfono
              </button>
            ) : (
              <div className="space-y-2">
                {editData.phoneNumbers.map((phone, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => updatePhone(index, e.target.value)}
                      className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
                      placeholder="+34 600 000 000"
                    />
                    <button
                      onClick={() => removePhone(index)}
                      className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Website */}
          <div>
            <label className="block text-gray-300 mb-2 font-semibold">Website</label>
            <input
              type="url"
              value={editData.website}
              onChange={(e) => setEditData({...editData, website: e.target.value})}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="https://ejemplo.com"
            />
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-gray-300 mb-2 font-semibold">Ubicación</label>
            <input
              type="text"
              value={editData.location}
              onChange={(e) => setEditData({...editData, location: e.target.value})}
              className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none"
              placeholder="Ej: Valencia, España"
            />
          </div>
        </div>
        
        <div className="flex gap-4 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
          >
            {saving ? 'Guardando...' : '💾 Guardar Cambios'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
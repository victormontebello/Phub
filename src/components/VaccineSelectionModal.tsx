import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface Vaccine {
  id: string;
  name: string;
}

interface VaccineSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedIds: string[]) => void;
  vaccines: Vaccine[];
  initialSelectedIds: string[];
}

export const VaccineSelectionModal: React.FC<VaccineSelectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  vaccines,
  initialSelectedIds,
}) => {
  const [selected, setSelected] = useState<string[]>(initialSelectedIds);

  useEffect(() => {
    setSelected(initialSelectedIds);
  }, [initialSelectedIds, isOpen]);

  const handleToggle = (vaccineId: string) => {
    setSelected(prev =>
      prev.includes(vaccineId)
        ? prev.filter(id => id !== vaccineId)
        : [...prev, vaccineId]
    );
  };

  const handleConfirm = () => {
    onConfirm(selected);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Selecione as Vacinas</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto pr-2 space-y-3">
          {vaccines.map(vaccine => (
            <label key={vaccine.id} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                className="h-5 w-5 rounded text-primary-600 border-gray-300 focus:ring-primary-500"
                checked={selected.includes(vaccine.id)}
                onChange={() => handleToggle(vaccine.id)}
              />
              <span className="text-gray-700">{vaccine.name}</span>
            </label>
          ))}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            Cancelar
          </button>
          <button onClick={handleConfirm} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}; 
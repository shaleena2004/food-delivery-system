import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { AlertTriangle, Trash2 } from 'lucide-react';

export const RestaurantDeleteModal = ({
  isOpen,
  onClose,
  restaurant,
  onConfirmDelete,
}) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  if (!restaurant) return null;

  const handleDelete = async () => {
    setError('');
    setDeleting(true);
    try {
      const restId = restaurant._id || restaurant.id;
      await onConfirmDelete(restId);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete restaurant');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Restaurant?"
      subtitle="This action cannot be undone."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={deleting}>
            Keep Restaurant
          </Button>
          <Button
            variant="danger"
            size="sm"
            loading={deleting}
            onClick={handleDelete}
            icon={Trash2}
          >
            Confirm Delete
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
            {error}
          </div>
        )}

        <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-amber-900">
              Are you sure you want to permanently delete:
            </p>
            <p className="text-sm font-black text-slate-900">
              {restaurant.name}
            </p>
            <p className="text-amber-800 text-[11px] leading-relaxed">
              All associated data, menus, and incoming order configurations for this restaurant will be removed from BiteFlow.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

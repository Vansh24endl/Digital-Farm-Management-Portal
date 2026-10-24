import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { useApp } from '../context/AppContext';
import {
  Package,
  Search,
  Plus,
  AlertTriangle,
  Pencil,
  X,
  Save,
  Trash2,
} from 'lucide-react';

type InventoryItem = {
  _id?: string;
  id?: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  minimumStock: number;
  location?: string;
};

export const InventoryScreen: React.FC = () => {
  const { openModal } = useApp();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editForm, setEditForm] = useState({ itemName: '', category: 'other', quantity: '0', unit: 'units', minimumStock: '0' });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    const loadInventory = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await api.getInventory() as any;
        const items = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response?.data?.items)
              ? response.data.items
              : [];

        setInventory(items.map((item: any) => ({
          ...item,
          _id: item._id || item.id,
          itemName: item.itemName || item.name || 'Unnamed item',
          minimumStock: item.minimumStock ?? item.minThreshold ?? 0,
          location: item.location || item.depotLocation || item.farmId?.location || 'Not specified',
          category: item.category || 'other',
          quantity: Number(item.quantity ?? 0),
          unit: item.unit || 'units',
        })));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Could not load inventory.'
        );
      } finally {
        setLoading(false);
      }
    };

    void loadInventory();

    const handleInventoryUpdated = () => {
      void loadInventory();
    };

    window.addEventListener('inventory-updated', handleInventoryUpdated);
    return () => {
      window.removeEventListener('inventory-updated', handleInventoryUpdated);
    };
  }, []);

  const startEditing = (item: InventoryItem) => {
    setEditingItem(item);
    setEditError('');
    setEditForm({
      itemName: item.itemName,
      category: item.category || 'other',
      quantity: String(item.quantity ?? 0),
      unit: item.unit || 'units',
      minimumStock: String(item.minimumStock ?? 0),
    });
  };

  const saveEditedItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const itemId = editingItem._id || editingItem.id;
    if (!itemId) {
      setEditError('Item ID is missing.');
      return;
    }

    try {
      setSavingEdit(true);
      setEditError('');

      const quantityNum = Number(editForm.quantity);
      const minStockNum = Number(editForm.minimumStock);

      if (Number.isNaN(quantityNum) || quantityNum < 0) {
        throw new Error('Quantity must be a valid non-negative number.');
      }
      if (Number.isNaN(minStockNum) || minStockNum < 0) {
        throw new Error('Minimum stock must be a valid non-negative number.');
      }

      const payload = {
        itemName: editForm.itemName.trim(),
        category: editForm.category,
        quantity: quantityNum,
        unit: editForm.unit.trim(),
        minimumStock: minStockNum,
      };

      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/inventory/${editingItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('farmdrishti_token') ? { Authorization: `Bearer ${localStorage.getItem('farmdrishti_token')}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update inventory item.');
      }

      const updated = result.data || { ...editingItem, ...payload };

      setInventory((current) =>
        current.map((item) =>
          (item._id || item.id) === itemId
            ? { ...item, ...updated, itemName: payload.itemName, category: payload.category, quantity: payload.quantity, unit: payload.unit, minimumStock: payload.minimumStock }
            : item
        )
      );

      setEditingItem(null);
      window.dispatchEvent(new Event('inventory-updated'));
    } catch (err) {
      setEditError(
        err instanceof Error
          ? err.message
          : 'Could not save inventory changes.'
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteInventoryItem = async (item: InventoryItem) => {
    const itemId = item._id || item.id;
    if (!itemId) return;

    const confirmed = window.confirm(`Delete "${item.itemName}" from inventory? This cannot be undone.`);
    if (!confirmed) return;

    try {
      setDeletingItemId(itemId);
      setActionError('');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/inventory/${itemId}`, {
        method: 'DELETE',
        headers: {
          ...(localStorage.getItem('farmdrishti_token') ? { Authorization: `Bearer ${localStorage.getItem('farmdrishti_token')}` } : {}),
        },
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || 'Could not delete inventory item.');
      setInventory((current) => current.filter((currentItem) => (currentItem._id || currentItem.id) !== itemId));
      window.dispatchEvent(new Event('inventory-updated'));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not delete inventory item.');
    } finally {
      setDeletingItemId(null);
    }
  };

  const lowStockItems = useMemo(
    () => inventory.filter((item) => item.quantity <= item.minimumStock),
    [inventory]
  );

  const categories = ['All', 'disinfectant', 'ppe', 'medicine', 'equipment', 'other'];

  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const name = item.itemName || '';
      const location = item.location || '';

      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        categoryFilter === 'All' ||
        item.category.toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [inventory, searchTerm, categoryFilter]);

  return (
    <div className="space-y-5 pb-20 animate-fadeIn font-sans">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <p className="fd-label mb-1">FarmDrishti / Logistics & Stock</p>
          <h1
            className="text-2xl font-bold font-display"
            style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}
          >
            Chemical & PPE Stock
          </h1>
          <p className="text-xs mt-1 font-mono" style={{ color: 'var(--text-secondary)' }}>
            Real-time stock tracking for virucides, PCR reagents, Tyvek PPE & therapeutics
          </p>
        </div>

        <button
          onClick={() => openModal('add-inventory')}
          className="fd-btn self-start flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Add New Stock
        </button>
      </div>

      {loading && (
        <div className="fd-card p-3 text-xs font-mono text-[var(--text-secondary)]">
          Syncing biosecurity inventory database…
        </div>
      )}
      {error && (
        <div className="fd-card p-3 bg-[var(--critical-bg)] border-[var(--critical-dim)] text-xs font-mono text-[var(--critical)]">
          Inventory telemetry error: {error}
        </div>
      )}

      {/* ── 1. Summary Metric Tiles ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="fd-card p-4">
          <span className="fd-label block mb-1">Total Stock Items</span>
          <p className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {loading ? '…' : inventory.length}
          </p>
          <span className="text-[11px] font-mono mt-1 block" style={{ color: 'var(--lime)' }}>
            Active Stock SKUs
          </span>
        </div>

        <div
          className="fd-card p-4"
          style={{ borderColor: lowStockItems.length > 0 ? 'var(--critical-dim)' : 'var(--border)', background: lowStockItems.length > 0 ? 'var(--critical-bg)' : 'var(--bg-panel)' }}
        >
          <span className="fd-label block mb-1" style={{ color: lowStockItems.length > 0 ? 'var(--critical)' : 'var(--text-dim)' }}>
            Low Stock Alerts
          </span>
          <p
            className="font-display text-3xl font-bold"
            style={{ color: lowStockItems.length > 0 ? 'var(--critical)' : 'var(--text-primary)' }}
          >
            {loading ? '…' : lowStockItems.length}
          </p>
          <span className="text-[11px] font-mono mt-1 block font-semibold" style={{ color: lowStockItems.length > 0 ? 'var(--critical)' : 'var(--success)' }}>
            {lowStockItems.length > 0 ? 'Replenishment Needed' : 'All Stock Healthy'}
          </span>
        </div>

        <div className="fd-card p-4">
          <span className="fd-label block mb-1">Disinfectants</span>
          <p className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {loading ? '…' : inventory.filter((item) => item.category.toLowerCase() === 'disinfectant').length}
          </p>
          <span className="text-[11px] font-mono mt-1 block" style={{ color: 'var(--success)' }}>
            Virucides & Footbaths
          </span>
        </div>

        <div className="fd-card p-4">
          <span className="fd-label block mb-1">PPE & Protective Gear</span>
          <p className="font-display text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {loading ? '…' : inventory.filter((item) => item.category.toLowerCase() === 'ppe').length}
          </p>
          <span className="text-[11px] font-mono mt-1 block" style={{ color: 'var(--text-secondary)' }}>
            Tyvek Suits & N95 Masks
          </span>
        </div>
      </div>

      {/* ── 2. Low Stock Warning Card ── */}
      {lowStockItems.length > 0 && (
        <div className="fd-card p-4 space-y-3" style={{ borderColor: 'var(--critical-dim)', background: 'var(--critical-bg)' }}>
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--critical)' }}>
              <AlertTriangle className="w-4 h-4" />
              Critical Re-Order Threshold Reached ({lowStockItems.length} Items)
            </h3>
            <span className="fd-badge fd-badge-critical">CRITICAL DEPLETION</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {lowStockItems.slice(0, 3).map((item) => (
              <div
                key={item._id || item.id}
                className="p-3 rounded-sm fd-raised space-y-1"
                style={{ borderColor: 'var(--critical-dim)' }}
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="font-bold text-xs truncate" style={{ color: 'var(--text-primary)' }}>
                    {item.itemName}
                  </span>
                  <span className="fd-badge fd-badge-critical">LOW</span>
                </div>
                <p className="text-[11px] font-mono" style={{ color: 'var(--text-secondary)' }}>
                  Qty: <strong style={{ color: 'var(--critical)' }}>{item.quantity} {item.unit}</strong> (Min: {item.minimumStock})
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. Search Bar & Category Filter Chips ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[var(--text-dim)]" />
          <input
            type="text"
            placeholder="Filter chemical, disinfectant, or PPE..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="fd-input pl-9"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-sm fd-raised overflow-x-auto w-full sm:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-mono font-bold uppercase transition-all whitespace-nowrap rounded-sm ${
                categoryFilter === cat
                  ? 'bg-[var(--lime)] text-black shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-hover)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {actionError && (
        <div className="p-3 rounded-sm bg-[var(--critical-bg)] border border-[var(--critical-dim)] text-xs font-mono text-[var(--critical)]">
          {actionError}
        </div>
      )}

      {/* ── 4. Inventory Items Table ── */}
      <div className="fd-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="text-[var(--text-secondary)] font-mono uppercase font-semibold border-b border-[var(--border)]" style={{ background: 'var(--bg-raised)' }}>
              <tr>
                <th className="p-3">Item Description</th>
                <th className="p-3">Category</th>
                <th className="p-3">In-Stock Qty</th>
                <th className="p-3">Min Threshold</th>
                <th className="p-3">Depot Location</th>
                <th className="p-3">Stock Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-dim)]" style={{ background: 'var(--bg-panel)' }}>
              {!loading && !error && filteredInventory.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center font-mono text-xs text-[var(--text-dim)]">
                    No matching chemical or PPE inventory records found.
                  </td>
                </tr>
              )}
              {filteredInventory.map((item) => {
                const isLow = item.quantity <= item.minimumStock;

                return (
                  <tr key={item._id || item.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="p-3 font-semibold text-[var(--text-primary)]">{item.itemName}</td>
                    <td className="p-3 font-mono text-[11px] uppercase text-[var(--lime)]">{item.category}</td>
                    <td className="p-3 font-mono text-sm font-bold text-[var(--text-primary)]">
                      {item.quantity} <span className="text-xs text-[var(--text-dim)] font-sans">{item.unit}</span>
                    </td>
                    <td className="p-3 font-mono text-[var(--text-secondary)]">{item.minimumStock} {item.unit}</td>
                    <td className="p-3 text-[var(--text-secondary)]">{item.location || 'Central Depot'}</td>
                    <td className="p-3">
                      <span className={`fd-badge ${isLow ? 'fd-badge-critical' : 'fd-badge-success'}`}>
                        {isLow ? 'LOW STOCK' : 'OPTIMAL'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => startEditing(item)}
                          className="fd-btn-ghost px-2.5 py-1 text-xs"
                          aria-label={`Edit ${item.itemName}`}
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteInventoryItem(item)}
                          disabled={deletingItemId === (item._id || item.id)}
                          className="fd-btn-danger px-2.5 py-1 text-xs disabled:opacity-50"
                          aria-label={`Delete ${item.itemName}`}
                        >
                          <Trash2 className="h-3 w-3" />
                          {deletingItemId === (item._id || item.id) ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 5. Edit Modal ── */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn" role="dialog" aria-modal="true">
          <form onSubmit={saveEditedItem} className="w-full max-w-lg space-y-4 rounded-sm fd-card p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
              <div>
                <h3 className="text-base font-bold font-display text-[var(--text-primary)]">Edit Inventory Item</h3>
                <p className="text-xs font-mono text-[var(--text-secondary)]">Update chemical titration and stock parameters</p>
              </div>
              <button type="button" onClick={() => setEditingItem(null)} className="fd-btn-icon" aria-label="Close edit form">
                <X className="h-4 w-4" />
              </button>
            </div>

            {editError && (
              <div className="p-2.5 rounded-sm bg-[var(--critical-bg)] border border-[var(--critical-dim)] text-xs font-mono text-[var(--critical)]">
                {editError}
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="edit-item-name" className="fd-label block">Item Description</label>
              <input id="edit-item-name" value={editForm.itemName} onChange={(e) => setEditForm({ ...editForm, itemName: e.target.value })} required className="fd-input" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label htmlFor="edit-item-category" className="fd-label block">Category</label>
                <select id="edit-item-category" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="fd-select">
                  <option value="disinfectant">Disinfectant</option>
                  <option value="ppe">PPE</option>
                  <option value="medicine">Medicine</option>
                  <option value="equipment">Equipment</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-1">
                <label htmlFor="edit-item-unit" className="fd-label block">Stock Unit</label>
                <input id="edit-item-unit" value={editForm.unit} onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })} required className="fd-input" />
              </div>
              <div className="space-y-1">
                <label htmlFor="edit-item-quantity" className="fd-label block">In-Stock Quantity</label>
                <input id="edit-item-quantity" type="number" min="0" step="any" value={editForm.quantity} onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })} required className="fd-input font-mono" />
              </div>
              <div className="space-y-1">
                <label htmlFor="edit-item-minimum" className="fd-label block">Minimum Threshold</label>
                <input id="edit-item-minimum" type="number" min="0" step="any" value={editForm.minimumStock} onChange={(e) => setEditForm({ ...editForm, minimumStock: e.target.value })} required className="fd-input font-mono" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button type="button" onClick={() => setEditingItem(null)} disabled={savingEdit} className="fd-btn-ghost">
                Cancel
              </button>
              <button type="submit" disabled={savingEdit} className="fd-btn">
                <Save className="h-4 w-4" /> {savingEdit ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
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

    // Load once when the Inventory screen opens.
    void loadInventory();

    // Reload automatically after AddInventoryModal saves a new item.
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
      itemName: item.itemName || '',
      category: (item.category || 'other').toLowerCase(),
      quantity: String(item.quantity ?? 0),
      unit: item.unit || 'units',
      minimumStock: String(item.minimumStock ?? 0),
    });
  };

  const saveEditedItem = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingItem?._id) {
      setEditError('This item does not have a valid database ID.');
      return;
    }

    const quantity = Number(editForm.quantity);
    const minimumStock = Number(editForm.minimumStock);
    if (!editForm.itemName.trim() || !editForm.unit.trim() || !Number.isFinite(quantity) || quantity < 0 || !Number.isFinite(minimumStock) || minimumStock < 0) {
      setEditError('Enter an item name, unit, and valid non-negative quantities.');
      return;
    }

    try {
      setSavingEdit(true);
      setEditError('');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/inventory/${editingItem._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemName: editForm.itemName.trim(),
          category: editForm.category,
          quantity,
          unit: editForm.unit.trim(),
          minimumStock,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Could not update inventory item.');
      setEditingItem(null);
      window.dispatchEvent(new Event('inventory-updated'));
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Could not update inventory item.');
    } finally {
      setSavingEdit(false);
    }
  };

  const deleteInventoryItem = async (item: InventoryItem) => {
    const itemId = item._id || item.id;
    if (!itemId) {
      setActionError('This item does not have a valid database ID.');
      return;
    }

    const confirmed = window.confirm(`Delete "${item.itemName}" from inventory? This cannot be undone.`);
    if (!confirmed) return;

    try {
      setDeletingItemId(itemId);
      setActionError('');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/inventory/${itemId}`, { method: 'DELETE' });
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
    <div className="space-y-6 pb-20 animate-fadeIn font-sans">
      {loading && (
        <p className="rounded-xl border border-[#34343c] p-3 text-slate-300">
          Loading inventory...
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-red-300">
          Inventory error: {error}
        </p>
      )}

      {/* 1. Inventory Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="surface-card p-4 rounded-xl border border-[#34343c]">
          <span className="text-xs text-slate-400 font-sans">Total Stock Items</span>
          <p className="font-display text-3xl text-white">{loading ? "..." : inventory.length}</p>
          <span className="text-[10px] text-[#c0c1ff] font-semibold">Active Categories</span>
        </div>

        <div className="surface-card p-4 rounded-xl border border-[#ba1a1a]/60 bg-[#ba1a1a]/10">
          <span className="text-xs text-slate-400 font-sans">Low Stock Urgent</span>
          <p className="font-display text-3xl text-[#ffb4ab]">{loading ? "..." : lowStockItems.length}</p>
          <span className="text-[10px] text-[#ffb4ab] font-bold">Replenishment Needed</span>
        </div>

        <div className="surface-card p-4 rounded-xl border border-[#34343c]">
          <span className="text-xs text-slate-400 font-sans">Disinfectants</span>
          <p className="font-display text-3xl text-white">{loading ? "..." : inventory.filter((item) => item.category.toLowerCase() === "disinfectant").length}</p>
          <span className="text-[10px] text-[#4CAF50] font-semibold">200ppm Virucides</span>
        </div>

        <div className="surface-card p-4 rounded-xl border border-[#34343c]">
          <span className="text-xs text-slate-400 font-sans">PPE Suits & Gloves</span>
          <p className="font-display text-3xl text-white">{loading ? "..." : inventory.filter((item) => item.category.toLowerCase() === "ppe").length}</p>
          <span className="text-[10px] text-slate-400 font-sans">Tyvek & N95</span>
        </div>
      </div>
{/* 2. Title & Add Item CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold font-serif text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-[#c0c1ff]" />
            Biosecurity Chemical & PPE Inventory
          </h2>
          <p className="text-xs text-slate-400">
            Real-time stock tracking for virucides, PCR kits, Tyvek suits, and vaccines
          </p>
        </div>

        <button
          onClick={() => openModal('add-inventory')}
          className="px-4 py-2 rounded-xl bg-[#1a178c] hover:bg-[#1a178c]/80 text-[#c0c1ff] border border-[#c0c1ff]/40 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> + Add New Item
        </button>
      </div>

      {/* 3. Low Stock Highlight Banner List */}
      <div className="surface-card p-4 rounded-2xl border border-[#ba1a1a]/60 bg-[#ba1a1a]/15 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#ffb4ab] flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-[#ba1a1a]" />
          Low Stock Critical Highlight List (Re-order Required)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {lowStockItems.slice(0, 3).map((item) => (
            <div
              key={item._id || item.id}
              className="p-3 rounded-xl bg-[#12131a] border border-[#ba1a1a]/40 text-xs font-sans space-y-1"
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-white truncate">{item.itemName}</span>
                <span className="px-2 py-0.2 rounded text-[9px] font-bold bg-[#ba1a1a] text-white">
                  LOW
                </span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Qty: <strong className="text-[#ffb4ab]">{item.quantity} {item.unit}</strong> (Min: {item.minimumStock})
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Search Bar & Category Filter Chips */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search chemical, disinfectant, or PPE..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#1b1b22] border border-[#34343c] text-slate-100 text-xs focus:border-[#c0c1ff] outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#1f1f26] border border-[#34343c] overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-[#1a178c] text-[#c0c1ff] shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Inventory Items Table */}
      {actionError && (
        <p className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{actionError}</p>
      )}
      <div className="surface-card rounded-2xl border border-[#34343c] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#1f1f26] text-slate-400 uppercase font-semibold border-b border-[#34343c]">
              <tr>
                <th className="p-3.5">Item Description</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">In-Stock Qty</th>
                <th className="p-3.5">Min Threshold</th>
                <th className="p-3.5">Depot Location</th>
                <th className="p-3.5">Stock Status</th>
                <th className="p-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#34343c] bg-[#1b1b22]">
              {!loading && !error && filteredInventory.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    No inventory items found.
                  </td>
                </tr>
              )}
              {filteredInventory.map((item) => {
                const isLow = item.quantity <= item.minimumStock;

                return (
                  <tr key={item._id || item.id} className="hover:bg-[#1f1f26] transition-colors">
                    <td className="p-3.5 font-bold text-white">{item.itemName}</td>
                    <td className="p-3.5 font-semibold text-[#c0c1ff]">{item.category}</td>
                    <td className="p-3.5 font-mono text-sm font-bold text-white">
                      {item.quantity} <span className="text-xs text-slate-400 font-sans">{item.unit}</span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">{item.minimumStock} {item.unit}</td>
                    <td className="p-3.5 text-slate-300">{item.location || 'Not specified'}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          isLow
                            ? 'bg-[#ba1a1a]/30 text-[#ffb4ab] border-[#ba1a1a]'
                            : 'bg-[#316342]/40 text-[#4CAF50] border-[#4CAF50]/40'
                        }`}
                      >
                        {isLow ? 'LOW STOCK' : 'OPTIMAL'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#c0c1ff]/40 px-3 py-1.5 text-[#c0c1ff] hover:bg-[#1a178c]/40 transition-colors"
                          aria-label={`Edit ${item.itemName}`}
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => void deleteInventoryItem(item)}
                          disabled={deletingItemId === (item._id || item.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/40 px-3 py-1.5 text-red-300 hover:bg-red-500/10 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label={`Delete ${item.itemName}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {deletingItemId === (item._id || item.id) ? 'Deleting...' : 'Delete'}
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

      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="edit-inventory-title">
          <form onSubmit={saveEditedItem} className="w-full max-w-lg space-y-4 rounded-2xl border border-[#34343c] bg-[#1b1b22] p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 id="edit-inventory-title" className="text-lg font-bold text-white">Edit Inventory Item</h3>
                <p className="text-xs text-slate-400">Update item details and save them to the database.</p>
              </div>
              <button type="button" onClick={() => setEditingItem(null)} className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Close edit form">
                <X className="h-5 w-5" />
              </button>
            </div>

            {editError && <p className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{editError}</p>}

            <div className="space-y-1.5">
              <label htmlFor="edit-item-name" className="text-xs font-semibold text-slate-300">Item name</label>
              <input id="edit-item-name" value={editForm.itemName} onChange={(e) => setEditForm({ ...editForm, itemName: e.target.value })} required className="w-full rounded-xl border border-[#34343c] bg-[#12131a] px-3 py-2.5 text-sm text-white outline-none focus:border-[#c0c1ff]" />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="edit-item-category" className="text-xs font-semibold text-slate-300">Category</label>
                <select id="edit-item-category" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="w-full rounded-xl border border-[#34343c] bg-[#12131a] px-3 py-2.5 text-sm text-white outline-none focus:border-[#c0c1ff]">
                  <option value="disinfectant">Disinfectant</option>
                  <option value="ppe">PPE</option>
                  <option value="medicine">Medicine</option>
                  <option value="equipment">Equipment</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="edit-item-unit" className="text-xs font-semibold text-slate-300">Unit</label>
                <input id="edit-item-unit" value={editForm.unit} onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })} required className="w-full rounded-xl border border-[#34343c] bg-[#12131a] px-3 py-2.5 text-sm text-white outline-none focus:border-[#c0c1ff]" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="edit-item-quantity" className="text-xs font-semibold text-slate-300">Current quantity</label>
                <input id="edit-item-quantity" type="number" min="0" step="any" value={editForm.quantity} onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })} required className="w-full rounded-xl border border-[#34343c] bg-[#12131a] px-3 py-2.5 text-sm text-white outline-none focus:border-[#c0c1ff]" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="edit-item-minimum" className="text-xs font-semibold text-slate-300">Minimum stock</label>
                <input id="edit-item-minimum" type="number" min="0" step="any" value={editForm.minimumStock} onChange={(e) => setEditForm({ ...editForm, minimumStock: e.target.value })} required className="w-full rounded-xl border border-[#34343c] bg-[#12131a] px-3 py-2.5 text-sm text-white outline-none focus:border-[#c0c1ff]" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setEditingItem(null)} disabled={savingEdit} className="rounded-xl border border-[#34343c] px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5 disabled:opacity-50">Cancel</button>
              <button type="submit" disabled={savingEdit} className="inline-flex items-center gap-2 rounded-xl bg-[#1a178c] px-4 py-2.5 text-sm font-bold text-[#c0c1ff] hover:bg-[#1a178c]/80 disabled:opacity-50">
                <Save className="h-4 w-4" /> {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
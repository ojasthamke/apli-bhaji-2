import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import type { Item } from '../db/db';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash } from 'react-icons/fa';

export default function ItemsManagement() {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [name, setName] = useState('');
    const [mrp, setMrp] = useState('');
    const [price, setPrice] = useState('');
    const [costPrice, setCostPrice] = useState('');
    const [unit, setUnit] = useState('kg');
    const [category, setCategory] = useState<'Vegetable' | 'Medicine'>('Vegetable');
    const [isOffer, setIsOffer] = useState(false);
    const [inStock, setInStock] = useState(true);

    const items = useLiveQuery(() => db.items.toArray());
    const enableMedicine = localStorage.getItem('enableMedicine') !== 'false';

    const handleSave = async () => {
        if (!name.trim() || !mrp || !price) {
            Swal.fire({ title: 'Error', text: 'Please fill name, price, and MRP', icon: 'error', background: '#222', color: '#fff' });
            return;
        }

        const data = {
            name,
            mrp: Number(mrp),
            price: Number(price),
            costPrice: Number(costPrice || 0),
            unit,
            category,
            isEnabled: inStock ? 1 : 0,
            isOffer,
            updatedAt: new Date().toISOString()
        };

        if (editingId) {
            await db.items.update(editingId, data);
            Swal.fire({ title: 'Success', text: 'Item updated!', icon: 'success', timer: 1200, showConfirmButton: false, background: '#222', color: '#fff' });
        } else {
            await db.items.add({
                ...data,
                createdAt: new Date().toISOString()
            });
            Swal.fire({ title: 'Success', text: 'Item added!', icon: 'success', timer: 1200, showConfirmButton: false, background: '#222', color: '#fff' });
        }
        resetForm();
    };

    const handleEdit = (item: Item) => {
        setEditingId(item.id!);
        setName(item.name);
        setMrp(item.mrp.toString());
        setPrice(item.price.toString());
        setCostPrice(item.costPrice?.toString() || '0');
        setUnit(item.unit);
        setCategory(item.category);
        setIsOffer(!!item.isOffer);
        setInStock(item.isEnabled === 1);
        window.scrollTo(0, 0);
    };

    const handleDelete = async (id: number, e: any) => {
        e.stopPropagation();
        const res = await Swal.fire({
            title: 'Delete Item?',
            text: 'Are you sure?',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            background: '#222',
            color: '#fff'
        });
        if (res.isConfirmed) {
            await db.items.delete(id);
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setName('');
        setMrp('');
        setPrice('');
        setCostPrice('');
        setUnit('kg');
        setCategory('Vegetable');
        setIsOffer(false);
        setInStock(true);
    };

    return (
        <div className="pb-16">
            <h1 className="text-2xl font-bold mb-6">Manage Items</h1>

            <div className="card p-4 space-y-4 mb-8">
                <h2 className="text-lg font-bold">{editingId ? 'Edit Item' : 'Add New Item'}</h2>
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Name" className="input-field col-span-2" value={name} onChange={e => setName(e.target.value)} />
                    <input type="number" placeholder="Cost Price" className="input-field" value={costPrice} onChange={e => setCostPrice(e.target.value)} />
                    <input type="number" placeholder="MRP" className="input-field" value={mrp} onChange={e => setMrp(e.target.value)} />
                    <input type="number" placeholder="Sell Price" className="input-field" value={price} onChange={e => setPrice(e.target.value)} />
                    <select className="input-field" value={unit} onChange={e => setUnit(e.target.value)}>
                        <option value="kg">kg</option>
                        <option value="g">gram</option>
                        <option value="piece">piece</option>
                        <option value="box">box</option>
                        <option value="bunch">bunch</option>
                    </select>
                    <select className="input-field col-span-2" value={category} onChange={e => setCategory(e.target.value as any)}>
                        <option value="Vegetable">Vegetable</option>
                        {enableMedicine && <option value="Medicine">Medicine</option>}
                    </select>
                    <label className="flex items-center gap-2 cursor-pointer bg-[#222] p-2 rounded border border-[#333]">
                        <input type="checkbox" checked={inStock} onChange={e => setInStock(e.target.checked)} className="accent-emerald-500 w-5 h-5" />
                        <span className="text-sm font-bold {inStock ? 'text-emerald-500' : 'text-gray-500'}">In Stock</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer bg-[#222] p-2 rounded border border-[#333]">
                        <input type="checkbox" checked={isOffer} onChange={e => setIsOffer(e.target.checked)} className="accent-yellow-500 w-5 h-5" />
                        <span className="text-sm font-bold {isOffer ? 'text-yellow-500' : 'text-gray-500'}">Special Offer</span>
                    </label>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleSave} className="btn-primary flex-1">{editingId ? 'Update Item' : 'Save Item'}</button>
                    {editingId && <button onClick={resetForm} className="btn-secondary flex-1 bg-gray-600">Cancel</button>}
                </div>
            </div>

            <h2 className="text-lg font-bold mb-4">Item List ({items?.length || 0})</h2>
            <div className="space-y-4">
                {items?.filter(i => enableMedicine || i.category !== 'Medicine').map(item => (
                    <div key={item.id} className="card p-4 flex justify-between items-center group">
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className={`font-bold text-lg ${item.isEnabled === 0 ? 'text-gray-500 line-through' : 'text-white'}`}>{item.name}</h3>
                                {item.isOffer && <span className="text-[10px] bg-yellow-900/40 text-yellow-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider border border-yellow-900 text-center animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.5)]">🔥 Offer</span>}
                                {item.isEnabled === 0 && <span className="text-[10px] bg-red-900/40 text-red-500 border border-red-900/50 px-2 py-0.5 rounded uppercase font-bold text-center">Out of Stock</span>}
                            </div>
                            <div className="flex flex-wrap items-center gap-x-3 mt-1 text-sm">
                                <span className="text-emerald-400 font-bold">₹{item.price}/{item.unit}</span>
                                <span className="text-gray-500 line-through">MRP ₹{item.mrp}</span>
                                <span className="text-gray-400">| Cost: ₹{item.costPrice || 0}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                            <button onClick={() => handleEdit(item)} className="p-2 text-gray-400 hover:text-white rounded bg-[#222] hover:bg-[#333]">
                                <FaEdit />
                            </button>
                            <button onClick={(e) => handleDelete(item.id!, e)} className="p-2 text-red-500 hover:text-red-400 rounded bg-red-900/20 hover:bg-red-900/40">
                                <FaTrash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

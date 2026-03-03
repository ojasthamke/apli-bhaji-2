import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export default function ItemsManagement() {
    const [name, setName] = useState('');
    const [mrp, setMrp] = useState('');
    const [price, setPrice] = useState('');
    const [unit, setUnit] = useState('kg');
    const [category, setCategory] = useState<'Vegetable' | 'Medicine'>('Vegetable');

    const items = useLiveQuery(() => db.items.toArray());

    const enableMedicine = localStorage.getItem('enableMedicine') !== 'false';

    const handleSave = async () => {
        if (!name.trim() || !mrp || !price) return;
        await db.items.add({
            name, mrp: Number(mrp), price: Number(price), unit, category, isEnabled: 1, createdAt: new Date().toISOString()
        });
        setName(''); setMrp(''); setPrice('');
    };

    const toggleEnable = async (id: number, currentStatus: number) => {
        await db.items.update(id, { isEnabled: currentStatus === 1 ? 0 : 1 });
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Manage Items</h1>

            <div className="card p-4 space-y-4 mb-8">
                <h2 className="text-lg font-bold">Add New Item</h2>
                <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Name" className="input-field col-span-2" value={name} onChange={e => setName(e.target.value)} />
                    <input type="number" placeholder="MRP" className="input-field" value={mrp} onChange={e => setMrp(e.target.value)} />
                    <input type="number" placeholder="Sell Price" className="input-field" value={price} onChange={e => setPrice(e.target.value)} />
                    <select className="input-field" value={category} onChange={e => setCategory(e.target.value as any)}>
                        <option>Vegetable</option>
                        {enableMedicine && <option>Medicine</option>}
                    </select>
                    <select className="input-field" value={unit} onChange={e => setUnit(e.target.value)}>
                        <option value="kg">kg</option>
                        <option value="g">gram</option>
                        <option value="piece">piece</option>
                        <option value="box">box</option>
                    </select>
                </div>
                <button onClick={handleSave} className="btn-primary w-full">Save Item</button>
            </div>

            <h2 className="text-lg font-bold mb-4">Item List</h2>
            <div className="space-y-4">
                {items?.filter(i => enableMedicine || i.category !== 'Medicine').map(item => (
                    <div key={item.id} className="card p-4 flex justify-between items-center opacity-100">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold">{item.name}</h3>
                                <span className="text-xs bg-gray-800 px-2 py-1 rounded">{item.category}</span>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">₹{item.price}/{item.unit} <span className="line-through text-gray-600">₹{item.mrp}</span></p>
                        </div>
                        <button
                            onClick={() => toggleEnable(item.id!, item.isEnabled)}
                            className={`px-4 py-2 rounded text-sm font-bold ${item.isEnabled ? 'bg-green-900/40 text-green-500' : 'bg-red-900/40 text-red-500'}`}
                        >
                            {item.isEnabled ? 'Active' : 'Disabled'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

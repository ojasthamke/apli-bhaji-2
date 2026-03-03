import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useNavigate } from 'react-router-dom';

export default function Orders() {
    const navigate = useNavigate();
    const [tab, setTab] = useState<'all' | 'pending'>('all');
    const [search, setSearch] = useState('');

    const orders = useLiveQuery(() => db.orders.toArray());
    const customers = useLiveQuery(() => db.customers.toArray());

    const enrichedOrders = orders?.map(o => {
        const c = customers?.find(c => c.id === o.customerId);
        return { ...o, customerName: c?.name || 'Unknown', phone: c?.phone || '' };
    }).sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()) || [];

    const filtered = enrichedOrders.filter(o => {
        if (tab === 'pending' && o.status !== 'Pending') return false;
        if (search) {
            const term = search.toLowerCase();
            return String(o.id).includes(term) || o.customerName.toLowerCase().includes(term);
        }
        return true;
    });

    const updateStatus = async (orderId: number, status: string, e: any) => {
        e.stopPropagation();
        await db.orders.update(orderId, { status: status as any, updatedAt: new Date().toISOString() });
    };

    return (
        <div className="pb-16">
            <h1 className="text-2xl font-bold mb-6">Orders Management</h1>

            <div className="flex bg-[#222] rounded-lg p-1 mb-6">
                <button
                    className={`flex-1 py-2 text-center rounded-md text-sm font-bold transition-colors ${tab === 'all' ? 'bg-[#10b981] text-white' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setTab('all')}
                >
                    All Orders
                </button>
                <button
                    className={`flex-1 py-2 text-center rounded-md text-sm font-bold transition-colors ${tab === 'pending' ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white'}`}
                    onClick={() => setTab('pending')}
                >
                    Pending Orders
                </button>
            </div>

            <input
                type="text"
                placeholder="Search by Order ID or Customer Name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field mb-4 w-full"
            />

            <div className="space-y-4">
                {filtered.map(o => (
                    <div key={o.id} onClick={() => navigate(`/orders/${o.id}`)} className="card p-4 cursor-pointer hover:bg-[#222]">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold text-lg">Order #{o.id}</h3>
                                <p className="text-gray-400 text-sm">{new Date(o.dateTime).toLocaleString()}</p>
                            </div>
                            <select
                                value={o.status}
                                onClick={e => e.stopPropagation()}
                                onChange={e => updateStatus(o.id!, e.target.value, e)}
                                className={`text-xs font-bold px-2 py-1 rounded bg-transparent border ${o.status === 'Pending' ? 'text-yellow-500 border-yellow-500' :
                                    o.status === 'Cancelled' ? 'text-red-500 border-red-500' : 'text-emerald-500 border-emerald-500'
                                    }`}
                            >
                                <option className="text-black" value="Delivered">Delivered</option>
                                <option className="text-black" value="Pending">Pending</option>
                                <option className="text-black" value="Cancelled">Cancelled</option>
                            </select>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-gray-300">{o.customerName}</span>
                            <span className="font-bold text-white text-lg">₹{o.finalAmount}</span>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">No orders found.</div>
                )}
            </div>
        </div>
    );
}

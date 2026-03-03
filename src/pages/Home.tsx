import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaTrash } from 'react-icons/fa';

import type { Expense } from './Expenses';

export default function Home() {
    const navigate = useNavigate();
    const areas = useLiveQuery(() => db.areas.toArray());
    const orders = useLiveQuery(() => db.orders.toArray());
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [search, setSearch] = useState('');

    useState(() => {
        const stored = localStorage.getItem('expenses');
        if (stored) {
            setExpenses(JSON.parse(stored));
        }
    });

    const metrics = useMemo(() => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

        let totalRev = 0, todayRev = 0, monthlyRev = 0;
        let totalProf = 0, todayProf = 0, monthlyProf = 0;
        let pendingCount = 0;

        orders?.forEach(o => {
            const time = new Date(o.dateTime).getTime();
            const isToday = time >= startOfDay;
            const isMonth = time >= startOfMonth;

            totalRev += o.finalAmount;
            totalProf += (o.profit || 0);

            if (isToday) {
                todayRev += o.finalAmount;
                todayProf += (o.profit || 0);
            }
            if (isMonth) {
                monthlyRev += o.finalAmount;
                monthlyProf += (o.profit || 0);
            }

            if (o.status === 'Pending') pendingCount++;
        });

        let totalExp = 0, todayExp = 0, monthlyExp = 0;
        expenses.forEach(e => {
            const time = new Date(e.date).getTime();
            const isToday = time >= startOfDay;
            const isMonth = time >= startOfMonth;

            totalExp += e.amount;
            if (isToday) todayExp += e.amount;
            if (isMonth) monthlyExp += e.amount;
        });

        return {
            totalRev, todayRev, monthlyRev,
            totalProf, todayProf, monthlyProf,
            totalExp, todayExp, monthlyExp,
            pendingCount,
            netProf: totalProf - totalExp
        };
    }, [orders, expenses]);

    const filteredAreas = areas?.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleDeleteArea = async (areaId: number, areaName: string, e: any) => {
        e.stopPropagation();
        const customersInArea = await db.customers.where('areaId').equals(areaId).count();
        if (customersInArea > 0) {
            Swal.fire({
                title: 'Cannot Delete',
                text: 'Delete all customers in this area first!',
                icon: 'error',
                background: '#222',
                color: '#fff'
            });
            return;
        }

        const result = await Swal.fire({
            title: `Delete ${areaName}?`,
            text: 'This action cannot be undone',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete',
            confirmButtonColor: '#ef4444',
            background: '#222',
            color: '#fff'
        });

        if (result.isConfirmed) {
            await db.areas.delete(areaId);
        }
    };

    return (
        <div className="pb-8">
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="card p-3 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] border border-[#333] group hover:border-[#10b981] transition-colors rounded-xl flex flex-col items-center shadow-lg">
                    <p className="text-xs text-gray-400 font-bold mb-1">Today Revenue</p>
                    <p className="text-xl font-bold text-white">₹{metrics.todayRev.toFixed(0)}</p>
                </div>
                <div className="card p-3 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] border border-[#333] group hover:border-[#10b981] transition-colors rounded-xl flex flex-col items-center shadow-lg">
                    <p className="text-xs text-gray-400 font-bold mb-1">Monthly Rev</p>
                    <p className="text-xl font-bold text-[#10b981]">₹{metrics.monthlyRev.toFixed(0)}</p>
                </div>
                <div className="card p-3 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] border border-[#333] group hover:border-[#25D366] transition-colors rounded-xl flex flex-col items-center shadow-lg">
                    <p className="text-xs text-gray-400 font-bold mb-1">Today Profit</p>
                    <p className="text-xl font-bold text-[#25D366]">₹{metrics.todayProf.toFixed(0)}</p>
                </div>
                <div className="card p-3 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] border border-[#333] group hover:border-[#25D366] transition-colors rounded-xl flex flex-col items-center shadow-lg col-span-2">
                    <p className="text-xs text-gray-400 font-bold mb-1">Net Profit (Overall)</p>
                    <p className="text-3xl font-black text-[#25D366]">₹{metrics.netProf.toFixed(0)}</p>
                </div>
                <div className="card p-3 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] border border-[#333] group hover:border-red-500 transition-colors rounded-xl flex flex-col items-center shadow-lg">
                    <p className="text-xs text-gray-400 font-bold mb-1">Total Exp</p>
                    <p className="text-xl font-bold text-red-500">₹{metrics.totalExp.toFixed(0)}</p>
                </div>
                <div className="card p-3 bg-gradient-to-br from-[#1A1A1A] to-[#2A2A2A] border border-[#333] group hover:border-yellow-500 transition-colors rounded-xl flex flex-col items-center shadow-lg">
                    <p className="text-xs text-gray-400 font-bold mb-1">Pending Orders</p>
                    <p className="text-xl font-bold text-yellow-500">{metrics.pendingCount}</p>
                </div>
            </div>

            <div className="flex justify-between items-center mb-6 mt-2">
                <h1 className="text-2xl font-bold">Areas</h1>
                <button
                    onClick={() => navigate('/areas/add')}
                    className="btn-primary text-sm px-4 py-2"
                >
                    + Add Area
                </button>
            </div>

            <input
                type="text"
                placeholder="Search areas..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field mb-4 w-full"
            />

            <div className="grid gap-4">
                {filteredAreas?.map(area => (
                    <div
                        key={area.id}
                        onClick={() => navigate(`/areas/${area.id}/customers`)}
                        className="card p-4 flex justify-between items-center cursor-pointer hover:bg-[#222]"
                    >
                        <div className="flex gap-4 items-center">
                            {area.photoPath ? (
                                <img src={area.photoPath} alt="Area" className="w-12 h-12 rounded-full object-cover border border-[#333]" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-[#333] flex items-center justify-center text-xl">🏙️</div>
                            )}
                            <div>
                                <h2 className="text-xl font-semibold">{area.name}</h2>
                                <p className="text-sm text-gray-400">Created: {new Date(area.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={(e) => handleDeleteArea(area.id!, area.name, e)}
                                className="text-red-500 hover:text-red-400 p-2"
                            >
                                <FaTrash />
                            </button>
                            <span className="text-[#10b981] text-xl">→</span>
                        </div>
                    </div>
                ))}
                {filteredAreas?.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        No areas found. Add your first area!
                    </div>
                )}
            </div>
        </div>
    );
}

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import Swal from 'sweetalert2';

export default function Reports() {
    const orders = useLiveQuery(() => db.orders.toArray());
    const customers = useLiveQuery(() => db.customers.count());

    const [enableMedicine, setEnableMedicine] = useState(() => {
        return localStorage.getItem('enableMedicine') !== 'false';
    });

    const toggleMedicine = () => {
        const newValue = !enableMedicine;
        setEnableMedicine(newValue);
        localStorage.setItem('enableMedicine', String(newValue));
    };

    // Aggregate Data
    const totalEarnings = orders?.filter(o => o.status !== 'Cancelled').reduce((acc, order) => acc + order.finalAmount, 0) || 0;
    const pendingOrders = orders?.filter(o => o.status === 'Pending').length || 0;

    const handleBackup = async () => {
        Swal.fire({ title: 'Exporting...', text: 'Creating database backup, please wait.', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
        try {
            const data = {
                areas: await db.areas.toArray(),
                customers: await db.customers.toArray(),
                items: await db.items.toArray(),
                orders: await db.orders.toArray(),
                orderItems: await db.orderItems.toArray(),
                schemaVersion: 1,
                timestamp: new Date().toISOString(),
            };

            const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `APLI_BHAJI_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            Swal.fire({ title: 'Success', text: 'Backup downloaded completely!', icon: 'success', background: '#222', color: '#fff', timer: 1500 });
        } catch (e) {
            Swal.fire({ title: 'Error', text: 'Failed to create backup.', icon: 'error', background: '#222', color: '#fff' });
        }
    };

    const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                Swal.fire({ title: 'Restoring...', text: 'Importing data, this may take a moment.', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
                const data = JSON.parse(event.target?.result as string);
                if (data.schemaVersion) {
                    await db.transaction('rw', [db.areas, db.customers, db.items, db.orders, db.orderItems], async () => {
                        await db.areas.clear();
                        if (data.areas) await db.areas.bulkAdd(data.areas);
                        await db.customers.clear();
                        if (data.customers) await db.customers.bulkAdd(data.customers);
                        await db.items.clear();
                        if (data.items) await db.items.bulkAdd(data.items);
                        await db.orders.clear();
                        if (data.orders) await db.orders.bulkAdd(data.orders);
                        await db.orderItems.clear();
                        if (data.orderItems) await db.orderItems.bulkAdd(data.orderItems);
                    });
                    await Swal.fire({ title: 'Restored!', text: 'Database restored successfully!', icon: 'success', background: '#222', color: '#fff' });
                    window.location.reload();
                } else {
                    Swal.fire({ title: 'Invalid File', text: 'This doesn\'t look like a valid backup file.', icon: 'error', background: '#222', color: '#fff' });
                }
            } catch (err) {
                Swal.fire({ title: 'Error', text: 'Corrupted backup file.', icon: 'error', background: '#222', color: '#fff' });
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="pb-16">
            <h1 className="text-2xl font-bold mb-6">Reports & Settings</h1>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="card p-4 text-center">
                    <p className="text-gray-400 text-sm">Total Earnings</p>
                    <p className="text-3xl font-black text-[#10b981]">₹{totalEarnings.toFixed(2)}</p>
                </div>
                <div className="card p-4 text-center">
                    <p className="text-gray-400 text-sm">Total Orders</p>
                    <p className="text-3xl font-bold">{orders?.length || 0}</p>
                </div>
                <div className="card p-4 text-center">
                    <p className="text-gray-400 text-sm">Customers</p>
                    <p className="text-3xl font-bold">{customers || 0}</p>
                </div>
                <div className="card p-4 text-center">
                    <p className="text-gray-400 text-sm">Pending Orders</p>
                    <p className="text-3xl font-bold text-yellow-500">{pendingOrders || 0}</p>
                </div>
            </div>

            <div className="card p-4 mb-4">
                <h2 className="text-lg font-bold mb-2">Settings</h2>
                <div className="flex justify-between items-center py-2 border-b border-[#333]">
                    <span className="text-gray-300">Enable Medicine Category</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={enableMedicine} onChange={toggleMedicine} />
                        <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10b981]"></div>
                    </label>
                </div>
            </div>

            <div className="card p-4 mb-4">
                <h2 className="text-lg font-bold mb-2">Backup & Restore</h2>
                <p className="text-sm text-gray-400 mb-4">Export your offline database securely to a JSON file format. Restore from backup below.</p>
                <div className="flex flex-col gap-4">
                    <button onClick={handleBackup} className="btn-primary w-full bg-[#1A1A1A] border border-[#10b981] text-[#10b981]">
                        📥 Export Backup
                    </button>

                    <label className="btn-primary w-full bg-[#1A1A1A] border border-blue-500 text-blue-500 cursor-pointer flex justify-center items-center">
                        <input type="file" accept=".json" className="hidden" onChange={handleRestore} />
                        📤 Restore Database
                    </label>
                </div>
            </div>
        </div>
    );
}

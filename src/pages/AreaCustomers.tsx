import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';

export default function AreaCustomers() {
    const { areaId } = useParams();
    const navigate = useNavigate();
    const area = useLiveQuery(() => db.areas.get(Number(areaId)));
    const [search, setSearch] = useState('');

    const customers = useLiveQuery(
        () => db.customers.where('areaId').equals(Number(areaId)).toArray(),
        [areaId]
    );

    const filtered = customers?.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
    );

    if (!area) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4 items-center">
                    <button className="text-gray-400 text-xl" onClick={() => navigate('/')}>←</button>
                    <h1 className="text-2xl font-bold">{area.name}</h1>
                </div>
                <button
                    onClick={() => navigate(`/areas/${areaId}/customers/add`)}
                    className="btn-primary text-sm px-4 py-2"
                >
                    + Add
                </button>
            </div>

            <input
                type="text"
                placeholder="Search customers..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field mb-4"
            />

            <div className="grid gap-4">
                {filtered?.map(c => (
                    <div
                        key={c.id}
                        onClick={() => navigate(`/customers/${c.id}`)}
                        className="card p-4 cursor-pointer hover:bg-[#222]"
                    >
                        <h2 className="text-xl font-semibold">{c.name}</h2>
                        <p className="text-gray-400">{c.phone}</p>
                    </div>
                ))}
                {filtered?.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        No customers found. Add your first customer here!
                    </div>
                )}
            </div>
        </div>
    );
}

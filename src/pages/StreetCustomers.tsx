import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';

export default function StreetCustomers() {
    const { streetId } = useParams();
    const navigate = useNavigate();
    const street = useLiveQuery(() => db.streets.get(Number(streetId)));
    const area = useLiveQuery(() => street ? db.areas.get(street.areaId) : undefined, [street]);
    const [search, setSearch] = useState('');

    const customers = useLiveQuery(
        () => db.customers.where({ streetId: Number(streetId) }).toArray(),
        [streetId]
    );

    const filtered = customers?.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
    );

    if (!street || !area) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4 items-center">
                    <button className="text-gray-400 text-xl" onClick={() => navigate(`/areas/${street.areaId}/streets`)}>←</button>
                    <div>
                        <h1 className="text-2xl font-bold">{street.name}</h1>
                        <p className="text-xs text-emerald-500">{area.name}</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate(`/streets/${streetId}/customers/add`)}
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
                        className="card p-4 cursor-pointer hover:bg-[#222] flex gap-4 items-center"
                    >
                        {c.photoPath ? (
                            <img src={c.photoPath} alt={c.name} className="w-12 h-12 rounded-full object-cover border border-[#333]" />
                        ) : (
                            <div className="w-12 h-12 rounded-full bg-[#333] flex items-center justify-center text-xl text-gray-400">
                                {c.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h2 className="text-xl font-semibold">{c.name}</h2>
                            <p className="text-gray-400">{c.phone}</p>
                        </div>
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

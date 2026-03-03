import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaTrash, FaEdit } from 'react-icons/fa';

export default function AreaStreets() {
    const { areaId } = useParams();
    const navigate = useNavigate();
    const area = useLiveQuery(() => db.areas.get(Number(areaId)));
    const streets = useLiveQuery(() => db.streets.where({ areaId: Number(areaId) }).toArray(), [areaId]);
    const [search, setSearch] = useState('');

    const filteredStreets = streets?.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleAddStreet = () => {
        navigate(`/areas/${areaId}/streets/add`);
    };

    const handleDelete = async (streetId: number, name: string, e: any) => {
        e.stopPropagation();
        const customersCount = await db.customers.where({ streetId }).count();
        if (customersCount > 0) {
            Swal.fire({
                title: 'Cannot Delete',
                text: 'Delete all customers in this street first!',
                icon: 'error',
                background: '#222',
                color: '#fff'
            });
            return;
        }

        const result = await Swal.fire({
            title: `Delete ${name}?`,
            text: 'This action cannot be undone',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete',
            confirmButtonColor: '#ef4444',
            background: '#222',
            color: '#fff'
        });

        if (result.isConfirmed) {
            await db.streets.delete(streetId);
        }
    };

    if (!area) return <div>Loading...</div>;

    return (
        <div className="pb-16">
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4 items-center">
                    <button className="text-gray-400 text-xl" onClick={() => navigate('/')}>←</button>
                    <h1 className="text-2xl font-bold">{area.name} / Streets</h1>
                </div>
                <button
                    onClick={handleAddStreet}
                    className="btn-primary text-sm px-4 py-2"
                >
                    + Add Street
                </button>
            </div>

            <input
                type="text"
                placeholder="Search streets..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field mb-4 w-full"
            />

            <div className="grid gap-4">
                {filteredStreets?.map(street => (
                    <div
                        key={street.id}
                        onClick={() => navigate(`/streets/${street.id}/customers`)}
                        className="card p-4 flex flex-col cursor-pointer hover:bg-[#222]"
                    >
                        {street.photoPath && (
                            <img src={street.photoPath} alt="Street" className="w-full h-32 object-cover rounded-md mb-3 border border-[#333]" />
                        )}
                        <div className="flex justify-between items-start">
                            <div className="flex-1 pr-4">
                                <h2 className="text-xl font-semibold mb-1">{street.name}</h2>
                                {street.notes && <p className="text-sm text-gray-400 truncate">{street.notes}</p>}
                            </div>
                            <div className="flex items-center gap-3">
                                {street.locationLink && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); window.open(street.locationLink, '_blank'); }}
                                        className="text-blue-400 p-2 hover:bg-blue-900/30 rounded"
                                        title="Open Maps"
                                    >
                                        📍
                                    </button>
                                )}
                                <button
                                    onClick={(e) => { e.stopPropagation(); navigate(`/streets/${street.id}/edit`); }}
                                    className="text-gray-400 hover:text-white p-2"
                                >
                                    <FaEdit />
                                </button>
                                <button
                                    onClick={(e) => handleDelete(street.id!, street.name, e)}
                                    className="text-red-500 hover:text-red-400 p-2"
                                >
                                    <FaTrash />
                                </button>
                                <span className="text-[#10b981] text-xl ml-2">→</span>
                            </div>
                        </div>
                    </div>
                ))}
                {filteredStreets?.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        No streets found in this area.
                    </div>
                )}
            </div>
        </div>
    );
}

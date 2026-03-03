import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaTrash } from 'react-icons/fa';

export default function Home() {
    const navigate = useNavigate();
    const areas = useLiveQuery(() => db.areas.toArray());

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
        <div>
            <div className="flex justify-between items-center mb-6 mt-2">
                <h1 className="text-2xl font-bold">Areas</h1>
                <button
                    onClick={() => navigate('/areas/add')}
                    className="btn-primary text-sm px-4 py-2"
                >
                    + Add Area
                </button>
            </div>

            <div className="grid gap-4">
                {areas?.map(area => (
                    <div
                        key={area.id}
                        onClick={() => navigate(`/areas/${area.id}/customers`)}
                        className="card p-4 flex justify-between items-center cursor-pointer hover:bg-[#222]"
                    >
                        <div>
                            <h2 className="text-xl font-semibold">{area.name}</h2>
                            <p className="text-sm text-gray-400">Created: {new Date(area.createdAt).toLocaleDateString()}</p>
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
                {areas?.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        No areas found. Add your first area!
                    </div>
                )}
            </div>
        </div>
    );
}

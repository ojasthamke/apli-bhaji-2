import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useNavigate } from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();
    const areas = useLiveQuery(() => db.areas.toArray());

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
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
                        <span className="text-[#10b981] text-xl">→</span>
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

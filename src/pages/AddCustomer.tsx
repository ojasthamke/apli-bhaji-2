import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../db/db';

export default function AddCustomer() {
    const { areaId } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');

    const handleSave = async () => {
        if (!name.trim() || !phone.trim() || !areaId) return;

        await db.customers.add({
            name,
            phone,
            address,
            areaId: Number(areaId),
            createdAt: new Date().toISOString()
        });
        navigate(-1);
    };

    return (
        <div>
            <div className="flex gap-4 items-center mb-6">
                <button className="text-gray-400 text-xl" onClick={() => navigate(-1)}>←</button>
                <h1 className="text-2xl font-bold">Add Customer</h1>
            </div>

            <div className="space-y-4 max-w-md">
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Name *</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field"
                        placeholder="e.g. Rahul Patil"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Phone *</label>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="input-field"
                        placeholder="10 digit number"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Address (Optional)</label>
                    <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="input-field h-24"
                        placeholder="House Number, Street..."
                    />
                </div>

                <button
                    onClick={handleSave}
                    className="btn-primary w-full mt-6"
                    disabled={!name.trim() || !phone.trim()}
                >
                    Save Customer
                </button>
            </div>
        </div>
    );
}

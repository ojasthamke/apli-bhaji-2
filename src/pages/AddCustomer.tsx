import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '../db/db';
import Swal from 'sweetalert2';

export default function AddCustomer() {
    const { areaId } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [houseNumber, setHouseNumber] = useState('');
    const [locationLink, setLocationLink] = useState('');
    const [notes, setNotes] = useState('');

    const handleSave = async () => {
        if (!name.trim() || !phone.trim() || !areaId) {
            Swal.fire({ title: 'Validation Error', text: 'Name and Phone are mandatory', icon: 'error', background: '#222', color: '#fff' });
            return;
        }

        await db.customers.add({
            name,
            phone,
            address,
            houseNumber,
            locationLink,
            notes,
            areaId: Number(areaId),
            createdAt: new Date().toISOString()
        });

        Swal.fire({ title: 'Success', text: 'Customer Added!', icon: 'success', background: '#222', color: '#fff', timer: 1200, showConfirmButton: false });
        navigate(-1);
    };

    return (
        <div className="pb-8">
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
                    <label className="block text-sm text-gray-400 mb-2">House Number</label>
                    <input
                        type="text"
                        value={houseNumber}
                        onChange={(e) => setHouseNumber(e.target.value)}
                        className="input-field"
                        placeholder="Apt 123"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Address</label>
                    <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="input-field h-24"
                        placeholder="Street details..."
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Google Maps Link</label>
                    <input
                        type="url"
                        value={locationLink}
                        onChange={(e) => setLocationLink(e.target.value)}
                        className="input-field"
                        placeholder="https://maps.google.com/..."
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Notes</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="input-field h-24"
                        placeholder="Delivery preferences..."
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

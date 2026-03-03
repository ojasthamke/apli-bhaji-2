import { useState, useEffect } from 'react';
import { db } from '../db/db';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { fileToBase64 } from '../utils/imageConverter';

export default function AddEditStreet() {
    const { areaId, streetId } = useParams();
    const navigate = useNavigate();
    const isEditing = !!streetId;

    const [name, setName] = useState('');
    const [notes, setNotes] = useState('');
    const [locationLink, setLocationLink] = useState('');
    const [photoPath, setPhotoPath] = useState('');

    useEffect(() => {
        if (isEditing) {
            db.streets.get(Number(streetId)).then(street => {
                if (street) {
                    setName(street.name);
                    setNotes(street.notes || '');
                    setLocationLink(street.locationLink || '');
                    setPhotoPath(street.photoPath || '');
                }
            });
        }
    }, [streetId, isEditing]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            try {
                const base64 = await fileToBase64(e.target.files[0]);
                setPhotoPath(base64);
            } catch (error) {
                console.error("Error reading image:", error);
                Swal.fire({ title: 'Error', text: 'Could not parse image', icon: 'error', background: '#222', color: '#fff' });
            }
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Swal.fire({ title: 'Error', text: 'Street name is required', icon: 'error', background: '#222', color: '#fff' });
            return;
        }

        const data = {
            name,
            notes,
            locationLink,
            photoPath,
            updatedAt: new Date().toISOString()
        };

        if (isEditing) {
            await db.streets.update(Number(streetId), data);
        } else {
            await db.streets.add({
                areaId: Number(areaId),
                ...data,
                createdAt: new Date().toISOString()
            });
        }

        navigate(-1);
    };

    return (
        <div className="pb-8">
            <div className="flex items-center gap-4 mb-6">
                <button className="text-gray-400 text-xl" onClick={() => navigate(-1)}>←</button>
                <h1 className="text-2xl font-bold">{isEditing ? 'Edit Street' : 'Add Street'}</h1>
            </div>

            <div className="card p-6 space-y-6">
                <div>
                    <label className="block text-gray-400 text-sm mb-2">Street Name</label>
                    <input type="text" className="input-field w-full" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                    <label className="block text-gray-400 text-sm mb-2">Notes</label>
                    <input type="text" className="input-field w-full" value={notes} onChange={e => setNotes(e.target.value)} />
                </div>
                <div>
                    <label className="block text-gray-400 text-sm mb-2">Google Maps Link</label>
                    <input type="text" className="input-field w-full text-blue-400" value={locationLink} onChange={e => setLocationLink(e.target.value)} />
                </div>
                <div>
                    <label className="block text-gray-400 text-sm mb-2 font-bold">Street Photo</label>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-gray-400 block mb-4 w-full border border-[#333] rounded p-2 bg-[#222]" />
                    {photoPath && (
                        <div className="mt-4 relative group">
                            <img src={photoPath} alt="Street Preview" className="w-full max-h-[300px] object-cover rounded-xl border-2 border-[#10b981]" />
                            <button onClick={() => setPhotoPath('')} className="absolute top-2 right-2 bg-red-600/80 p-2 rounded-full shadow-lg text-white">✕</button>
                        </div>
                    )}
                </div>
                <button onClick={handleSave} className="btn-primary w-full py-4 text-lg mt-6">
                    {isEditing ? 'Update Street' : 'Save Street'}
                </button>
            </div>
        </div>
    );
}

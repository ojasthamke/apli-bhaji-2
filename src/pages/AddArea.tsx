import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/db';
import { fileToBase64 } from '../utils/imageConverter';

export default function AddArea() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [photoPath, setPhotoPath] = useState('');

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const base64 = await fileToBase64(e.target.files[0]);
            setPhotoPath(base64);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) return;
        await db.areas.add({
            name,
            photoPath,
            createdAt: new Date().toISOString()
        });
        navigate(-1);
    };

    return (
        <div>
            <div className="flex gap-4 items-center mb-6">
                <button className="text-gray-400 text-xl" onClick={() => navigate(-1)}>←</button>
                <h1 className="text-2xl font-bold">Add New Area</h1>
            </div>

            <div className="space-y-4 max-w-md">
                <div>
                    <label className="block text-sm text-gray-400 mb-2">Area Name *</label>
                    <input
                        autoFocus
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field"
                        placeholder="e.g. Downtown"
                    />
                </div>

                <div>
                    <label className="block text-sm text-gray-400 mb-2">Area Photo</label>
                    <div className="flex items-center gap-4">
                        {photoPath && <img src={photoPath} alt="Area" className="w-16 h-16 rounded object-cover" />}
                        <label className="btn-primary w-full cursor-pointer bg-[#333] hover:bg-[#444] text-white">
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                            📷 Choose Photo
                        </label>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    className="btn-primary w-full mt-6"
                    disabled={!name.trim()}
                >
                    Save Area
                </button>
            </div>
        </div>
    );
}

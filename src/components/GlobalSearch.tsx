import { useState, useMemo, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useNavigate } from 'react-router-dom';

export default function GlobalSearch() {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedTerm, setDebouncedTerm] = useState('');
    const navigate = useNavigate();

    // Debounce Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTerm(searchTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const areas = useLiveQuery(() => db.areas.toArray());
    const customers = useLiveQuery(() => db.customers.toArray());
    const orders = useLiveQuery(() => db.orders.toArray());

    const results = useMemo(() => {
        if (!debouncedTerm || debouncedTerm.length < 2) return null;

        const term = debouncedTerm.toLowerCase();
        const matches: { type: string, title: string, subtitle: string, link: string }[] = [];

        // Search Areas
        areas?.forEach(a => {
            if (a.name.toLowerCase().includes(term)) {
                matches.push({ type: 'Area', title: a.name, subtitle: '', link: `/areas/${a.id}/streets` });
            }
        });

        // Search Customers
        customers?.forEach(c => {
            if (c.name.toLowerCase().includes(term) || c.phone.includes(term)) {
                const area = areas?.find(a => a.id === c.areaId)?.name || 'Unknown Area';
                matches.push({ type: 'Customer', title: c.name, subtitle: `${c.phone} (${area})`, link: `/customers/${c.id}` });
            }
        });

        // Search Orders
        orders?.forEach(o => {
            const strDate = new Date(o.dateTime).toLocaleDateString().toLowerCase();
            const strId = o.id?.toString() || '';
            const c = customers?.find(c => c.id === o.customerId);
            const cName = c?.name.toLowerCase() || '';

            if (strDate.includes(term) || strId === term || cName.includes(term)) {
                matches.push({ type: 'Order', title: `Order #${o.id} - ${c?.name || 'Unknown'}`, subtitle: `${new Date(o.dateTime).toLocaleDateString()} • ₹${o.finalAmount}`, link: `/orders/${o.id}` });
            }
        });

        return matches;
    }, [debouncedTerm, areas, customers, orders]);

    const highlightText = (text: string, highlight: string) => {
        if (!highlight.trim()) return <span>{text}</span>;
        const regex = new RegExp(`(${highlight})`, 'gi');
        const parts = text.split(regex);
        return (
            <span>
                {parts.map((part, i) =>
                    regex.test(part) ? <span key={i} className="bg-emerald-500/40 text-emerald-400 rounded px-0.5">{part}</span> : <span key={i}>{part}</span>
                )}
            </span>
        );
    };

    return (
        <>
            <button onClick={() => setIsOpen(true)} className="p-2 text-xl hover:text-emerald-400">
                🔍
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black z-50 flex flex-col pt-4">
                    <div className="flex items-center gap-3 px-4 pb-4 border-b border-[#333]">
                        <button onClick={() => setIsOpen(false)} className="text-xl text-gray-400 hover:text-white">✕</button>
                        <input
                            type="text"
                            autoFocus
                            placeholder="Search names, phone, areas, orders..."
                            className="flex-1 bg-transparent text-lg outline-none text-white placeholder-gray-500"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {results === null ? (
                            <p className="text-center text-gray-500 mt-10">Type at least 2 characters to search...</p>
                        ) : results.length === 0 ? (
                            <p className="text-center text-red-500 mt-10 font-bold">No results found.</p>
                        ) : (
                            <>
                                <p className="text-sm text-emerald-500 font-bold mb-4">{results.length} matches found</p>
                                {results.map((res, i) => (
                                    <div
                                        key={i}
                                        onClick={() => { setIsOpen(false); navigate(res.link); }}
                                        className="card p-3 flex justify-between items-center cursor-pointer hover:bg-[#222]"
                                    >
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] bg-gray-800 text-gray-300 px-2 rounded uppercase font-bold">{res.type}</span>
                                                <h3 className="font-bold text-lg">{highlightText(res.title, debouncedTerm)}</h3>
                                            </div>
                                            {res.subtitle && <p className="text-sm text-gray-400 mt-1">{highlightText(res.subtitle, debouncedTerm)}</p>}
                                        </div>
                                        <span className="text-emerald-500">→</span>
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

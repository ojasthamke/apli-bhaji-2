import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaTrash, FaWhatsapp, FaMapMarkerAlt } from 'react-icons/fa';

export default function CustomerDetail() {
    const { customerId } = useParams();
    const navigate = useNavigate();

    const customer = useLiveQuery(() => db.customers.get(Number(customerId)));
    const orders = useLiveQuery(
        () => db.orders.where('customerId').equals(Number(customerId)).reverse().sortBy('dateTime'),
        [customerId]
    );

    const handleDelete = async () => {
        if (!customer) return;
        const orderCount = await db.orders.where('customerId').equals(Number(customerId)).count();
        if (orderCount > 0) {
            Swal.fire({ title: 'Cannot Delete', text: 'Delete all orders for this customer first!', icon: 'error', background: '#222', color: '#fff' });
            return;
        }

        const result = await Swal.fire({
            title: `Delete ${customer.name}?`,
            text: 'This action cannot be undone',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete',
            confirmButtonColor: '#ef4444',
            background: '#222',
            color: '#fff'
        });

        if (result.isConfirmed) {
            await db.customers.delete(customer.id!);
            navigate(-1);
        }
    };

    const handleWhatsApp = () => {
        if (!customer) return;
        let phoneStr = customer.phone.replace(/\D/g, '');
        if (phoneStr.length === 10) phoneStr = '91' + phoneStr;
        window.open(`https://wa.me/${phoneStr}`, '_blank');
    };

    if (!customer) return <div className="p-8 text-center text-red-500 font-bold">Customer Loading / Not Found...</div>;

    return (
        <div className="pb-12">
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4 items-center">
                    <button className="text-gray-400 text-xl" onClick={() => navigate(-1)}>←</button>
                    {customer.photoPath ? (
                        <img src={customer.photoPath} alt={customer.name} className="w-10 h-10 rounded-full object-cover border border-[#333]" />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center font-bold">{customer.name.charAt(0)}</div>
                    )}
                    <h1 className="text-2xl font-bold">{customer.name}</h1>
                </div>
                <button onClick={handleDelete} className="text-red-500 hover:text-red-400 p-2"><FaTrash /></button>
            </div>

            <div className="card p-4 space-y-2 mb-6 text-gray-300">
                <p><span className="text-gray-500">Phone:</span> {customer.phone}</p>
                {customer.houseNumber && <p><span className="text-gray-500">House No:</span> {customer.houseNumber}</p>}
                {customer.address && <p><span className="text-gray-500">Address:</span> {customer.address}</p>}
                {customer.notes && <p><span className="text-gray-500">Notes:</span> {customer.notes}</p>}
                {customer.notes && <p><span className="text-gray-500">Notes:</span> {customer.notes}</p>}

                <div className="flex gap-4 mt-4 pt-2">
                    <button onClick={handleWhatsApp} className="btn-primary flex-1 bg-[#25D366] text-white py-2 text-sm flex justify-center items-center gap-2">
                        <FaWhatsapp size={18} /> Chat
                    </button>
                    {customer.locationLink && (
                        <a href={customer.locationLink} target="_blank" rel="noreferrer" className="btn-primary flex-1 bg-[#1A1A1A] border border-[#10b981] text-[#10b981] py-2 text-sm flex justify-center items-center gap-2">
                            <FaMapMarkerAlt size={18} /> Map
                        </a>
                    )}
                </div>
            </div>

            <button
                onClick={() => navigate(`/customers/${customer.id}/order`)}
                className="btn-primary w-full mb-8 py-4 text-lg shadow-[0_0_15px_rgba(16,185,129,0.5)]"
            >
                + Create Order
            </button>

            <h2 className="text-xl font-bold mb-4">Order History</h2>
            <div className="space-y-4">
                {orders?.map(order => (
                    <div key={order.id} onClick={() => navigate(`/orders/${order.id}`)} className="card p-4 cursor-pointer hover:bg-[#222]">
                        <div className="flex justify-between text-sm text-gray-400 mb-2">
                            <span>{new Date(order.dateTime).toLocaleString()}</span>
                            <span className={order.status === 'Delivered' ? 'text-green-500' : order.status === 'Pending' ? 'text-yellow-500' : 'text-red-500'}>
                                {order.status}
                            </span>
                        </div>
                        <div className="text-2xl font-bold text-white mb-2">
                            ₹{order.finalAmount.toFixed(2)}
                        </div>
                        <p className="text-sm text-gray-500">Discount: ₹{order.discount}</p>
                    </div>
                ))}
                {orders?.length === 0 && (
                    <div className="text-center text-gray-500">No previous orders.</div>
                )}
            </div>
        </div>
    );
}

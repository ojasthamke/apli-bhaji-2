import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useNavigate, useParams } from 'react-router-dom';


export default function CustomerDetail() {
    const { customerId } = useParams();
    const navigate = useNavigate();

    const customer = useLiveQuery(() => db.customers.get(Number(customerId)));
    const orders = useLiveQuery(
        () => db.orders.where('customerId').equals(Number(customerId)).reverse().sortBy('dateTime'),
        [customerId]
    );

    if (!customer) return <div className="p-8 text-center text-red-500 font-bold">Customer Loading / Not Found...</div>;

    return (
        <div className="pb-12">
            <div className="flex justify-between items-center mb-6">
                <div className="flex gap-4 items-center">
                    <button className="text-gray-400 text-xl" onClick={() => navigate(-1)}>←</button>
                    <h1 className="text-2xl font-bold">{customer.name}</h1>
                </div>
            </div>

            <div className="card p-4 space-y-2 mb-6 text-gray-300">
                <p><span className="text-gray-500">Phone:</span> {customer.phone}</p>
                {customer.houseNumber && <p><span className="text-gray-500">House No:</span> {customer.houseNumber}</p>}
                {customer.address && <p><span className="text-gray-500">Address:</span> {customer.address}</p>}
                {customer.notes && <p><span className="text-gray-500">Notes:</span> {customer.notes}</p>}
                {customer.locationLink && (
                    <a href={customer.locationLink} target="_blank" rel="noreferrer" className="text-blue-500 underline inline-block mt-2">
                        View on Google Maps
                    </a>
                )}
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
                    <div key={order.id} className="card p-4">
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

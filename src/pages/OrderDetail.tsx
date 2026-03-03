import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useNavigate, useParams } from 'react-router-dom';
import { generatePDFAndShare } from '../utils/pdfGenerator';

export default function OrderDetail() {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const order = useLiveQuery(() => db.orders.get(Number(orderId)));
    const customer = useLiveQuery(() => order ? db.customers.get(order.customerId) : undefined, [order]);
    const area = useLiveQuery(() => customer ? db.areas.get(customer.areaId) : undefined, [customer]);
    const orderItemsList = useLiveQuery(
        () => db.orderItems.where('orderId').equals(Number(orderId)).toArray(),
        [orderId]
    );
    const items = useLiveQuery(() => db.items.toArray());

    if (!order || !orderItemsList) return <div className="p-8 text-center text-gray-400">Loading Order Details...</div>;

    const populatedOrderItems = orderItemsList.map(oi => {
        const matchingItem = items?.find(i => i.id === oi.itemId);
        return {
            ...oi,
            name: matchingItem?.name || 'Unknown Item',
            unit: matchingItem?.unit || 'unit'
        };
    });

    const handleGenerateInvoice = async () => {
        if (!customer) return;
        await generatePDFAndShare(
            populatedOrderItems,
            order.id!,
            order.finalAmount,
            customer.name,
            customer.phone,
            area?.name,
            order.totalAmount, // Assuming totalMrp here is not saved, we pass totalAmount as MRP proxy if needed
            order.discount
        );
    };

    return (
        <div className="pb-12">
            <div className="flex gap-4 items-center mb-6">
                <button className="text-gray-400 text-xl" onClick={() => navigate(-1)}>←</button>
                <h1 className="text-2xl font-bold">Order Details</h1>
            </div>

            <div className="card p-4 mb-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-sm text-gray-400">Date</p>
                        <p className="font-semibold">{new Date(order.dateTime).toLocaleString()}</p>
                    </div>
                    <div className={'px-3 py-1 rounded-full text-sm font-bold ' +
                        (order.status === 'Delivered' ? 'bg-green-900/40 text-green-500' :
                            order.status === 'Pending' ? 'bg-yellow-900/40 text-yellow-500' : 'bg-red-900/40 text-red-500')}>
                        {order.status}
                    </div>
                </div>

                <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex justify-between border-b border-[#333] pb-2 text-gray-400 uppercase font-bold text-xs">
                        <span>Item</span>
                        <span>Total (₹)</span>
                    </div>
                    {populatedOrderItems.map(item => (
                        <div key={item.id} className="flex justify-between py-1">
                            <span>{item.name} <span className="text-gray-500">x{item.quantity} {item.unit}</span></span>
                            <span>{item.total.toFixed(2)}</span>
                        </div>
                    ))}
                    <div className="flex justify-between border-t border-[#333] pt-4 mt-4">
                        <span className="text-gray-400">Subtotal</span>
                        <span>₹{order.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-red-400">
                        <span>Discount</span>
                        <span>- ₹{order.discount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-[#333] mt-2">
                        <span>Final Amount</span>
                        <span className="text-[#10b981]">₹{order.finalAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <button
                onClick={handleGenerateInvoice}
                className="btn-primary w-full py-4 text-lg bg-[#25D366] text-white shadow-[0_0_15px_rgba(37,211,102,0.4)] border-none flex justify-center items-center gap-2"
            >
                📄 Get Invoice / Share
            </button>
        </div>
    );
}

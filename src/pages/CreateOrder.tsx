import { useState, useMemo, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import { useNavigate, useParams } from 'react-router-dom';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

export default function CreateOrder() {
    const { customerId } = useParams();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = useState(true);

    const customer = useLiveQuery(() => db.customers.get(Number(customerId)));
    const area = useLiveQuery(() => {
        if (!customer?.areaId) return undefined;
        return db.areas.get(Number(customer.areaId));
    }, [customer]);
    const availableItems = useLiveQuery(() => db.items.where('isEnabled').equals(1).toArray());

    const [quantities, setQuantities] = useState<Record<number, string>>({});
    const [discount, setDiscount] = useState<string>('0');
    const [status, setStatus] = useState<'Pending' | 'Delivered' | 'Cancelled'>('Delivered');

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 500);
        return () => clearTimeout(timer);
    }, []);

    const { totalMrp, totalPrice } = useMemo(() => {
        let tMrp = 0;
        let tPrice = 0;
        if (!availableItems) return { totalMrp: 0, totalPrice: 0 };
        availableItems.forEach(item => {
            const q = parseFloat(quantities[item.id!] || '0');
            if (q > 0) {
                tMrp += q * item.mrp;
                tPrice += q * item.price;
            }
        });
        return { totalMrp: tMrp, totalPrice: tPrice };
    }, [availableItems, quantities]);

    const discNum = parseFloat(discount || '0');
    const finalAmount = Math.max(0, totalPrice - discNum);

    const generatePDFAndShare = async (orderItems: any[], orderId: number, orderTotal: number, customerName: string) => {
        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(22);
        doc.text("APLI BHAJI", 14, 20);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");

        doc.text(`Customer: ${customerName}`, 14, 30);
        if (customer?.phone) doc.text(`Phone: ${customer.phone}`, 14, 35);
        if (area?.name) doc.text(`Area: ${area.name}`, 14, 40);
        doc.text(`Date: ${new Date().toLocaleString()}`, 14, 45);

        const tableData = orderItems.map((item, i) => [
            i + 1,
            item.name,
            `${item.quantity} ${item.unit}`,
            item.price.toFixed(2),
            item.total.toFixed(2)
        ]);

        autoTable(doc, {
            startY: 55,
            head: [['#', 'Item', 'Qty', 'Price', 'Total']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [16, 185, 129] }
        });

        const finalY = (doc as any).lastAutoTable.finalY || 55;

        doc.setFont("helvetica", "bold");
        doc.text(`Total MRP Amount: Rs ${totalMrp.toFixed(2)}`, 130, finalY + 10);
        doc.text(`Selling Total: Rs ${totalPrice.toFixed(2)}`, 130, finalY + 20);
        doc.text(`Discount: Rs ${discNum.toFixed(2)}`, 130, finalY + 30);

        doc.setFontSize(14);
        doc.text(`FINAL AMOUNT: Rs ${orderTotal.toFixed(2)}`, 130, finalY + 45);

        const pdfBlob = doc.output('blob');
        const fileName = `Invoice_${customerName}_${orderId}.pdf`;

        try {
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([pdfBlob], fileName, { type: 'application/pdf' })] })) {
                const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
                await navigator.share({
                    title: 'Apli Bhaji Invoice',
                    text: `Hello ${customerName}, here is your latest invoice from APLI BHAJI. Total: Rs ${orderTotal.toFixed(2)}.`,
                    files: [file]
                });
            } else {
                // Fallback to download and copy WA link
                doc.save(fileName);
                const waLink = `https://wa.me/${customer?.phone?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${customerName}, your order total is Rs ${orderTotal.toFixed(2)}. I have sent the invoice PDF here.`)}`;
                setTimeout(() => {
                    window.open(waLink, '_blank');
                }, 1000);
            }
        } catch (e) {
            console.log("Sharing failed or cancelled", e);
            doc.save(fileName);
        }
    };

    const handleSave = async () => {
        if (!availableItems) return;
        const selected = availableItems.filter(i => parseFloat(quantities[i.id!] || '0') > 0);
        if (selected.length === 0) {
            Swal.fire({ title: 'Error', text: 'Please select at least one item.', icon: 'error', background: '#222', color: '#fff' });
            return;
        }

        try {
            await db.transaction('rw', db.orders, db.orderItems, async () => {
                const orderId = await db.orders.add({
                    customerId: Number(customerId),
                    totalAmount: totalPrice,
                    discount: discNum,
                    finalAmount,
                    status: status,
                    dateTime: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                });

                const orderItemsList: any[] = [];

                for (const item of selected) {
                    const q = parseFloat(quantities[item.id!] || '0');
                    const total = q * item.price;
                    const orderItemObj = {
                        orderId,
                        itemId: item.id!,
                        quantity: q,
                        price: item.price,
                        mrp: item.mrp,
                        total
                    };
                    await db.orderItems.add(orderItemObj);
                    orderItemsList.push({ ...orderItemObj, name: item.name, unit: item.unit });
                }

                Swal.fire({ title: 'Success', text: 'Order saved successfully!', icon: 'success', background: '#222', color: '#fff', timer: 1500, showConfirmButton: false });

                // Generate PDF Document
                await generatePDFAndShare(orderItemsList, orderId as number, finalAmount, customer?.name || "Unknown");

                navigate(-1);
            });
        } catch (e) {
            console.error(e);
            Swal.fire({ title: 'Error', text: 'Failed to save order.', icon: 'error', background: '#222', color: '#fff' });
        }
    };

    if (isLoading) return <div className="p-4 text-center text-gray-500">Loading Order Settings...</div>;
    if (!customer) return <div className="p-4 text-center text-red-500 font-bold">Customer Not Found</div>;

    return (
        <div className="pb-48">
            <div className="flex gap-4 items-center mb-6">
                <button className="text-gray-400 text-xl" onClick={() => navigate(-1)}>←</button>
                <h1 className="text-2xl font-bold">Billing: {customer.name}</h1>
            </div>

            <div className="space-y-4 mb-32">
                {availableItems?.map(item => (
                    <div key={item.id} className="card p-4 flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold">{item.name}</h3>
                                {item.category === 'Medicine' && <span className="text-[10px] bg-blue-900/40 text-blue-400 px-2 py-0.5 rounded">Medicine</span>}
                            </div>
                            <p className="text-sm text-gray-400">Rs {item.price} / {item.unit} (MRP {item.mrp})</p>
                        </div>
                        <div className="w-24">
                            <input
                                type="number"
                                placeholder="Qty"
                                value={quantities[item.id!] || ''}
                                onChange={e => setQuantities({ ...quantities, [item.id!]: e.target.value })}
                                className="input-field text-center p-2"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <div className="fixed bottom-14 left-0 right-0 p-4 bg-[#111] border-t border-[#333] z-10 shadow-lg">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 line-through">MRP: ₹{totalMrp.toFixed(2)}</span>
                    <span className="text-gray-200">Total: ₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Discount: Rs</span>
                    <input
                        type="number"
                        placeholder="0"
                        value={discount}
                        onChange={e => setDiscount(e.target.value)}
                        className="input-field w-24 p-2 text-center h-10"
                    />
                </div>
                <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-400">Status:</span>
                    <select
                        value={status}
                        onChange={e => setStatus(e.target.value as any)}
                        className="input-field w-32 p-2 text-center h-10"
                    >
                        <option value="Delivered">Delivered</option>
                        <option value="Pending">Pending</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
                <button onClick={handleSave} className="btn-primary w-full shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                    <span className="font-bold">SAVE & SHARE PDF</span>
                    <span className="text-2xl font-black">₹{finalAmount.toFixed(2)}</span>
                </button>
            </div>
        </div>
    );
}

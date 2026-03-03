import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

export const generatePDFAndShare = async (orderItems: any[], orderId: number, orderTotal: number, customerName: string, customerPhone: string = '', areaName: string = '', totalMrp: number, discNum: number) => {
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("APLI BHAJI", 14, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    doc.text(`Customer: ${customerName}`, 14, 30);
    if (customerPhone) doc.text(`Phone: ${customerPhone}`, 14, 35);
    if (areaName) doc.text(`Area: ${areaName}`, 14, 40);
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
    const totalPrice = orderItems.reduce((acc, item) => acc + item.total, 0);

    doc.setFont("helvetica", "bold");
    if (totalMrp > 0) doc.text(`Total MRP Amount: Rs ${totalMrp.toFixed(2)}`, 130, finalY + 10);
    doc.text(`Selling Total: Rs ${totalPrice.toFixed(2)}`, 130, finalY + 20);
    doc.text(`Discount: Rs ${discNum.toFixed(2)}`, 130, finalY + 30);

    doc.setFontSize(14);
    doc.text(`FINAL AMOUNT: Rs ${orderTotal.toFixed(2)}`, 130, finalY + 45);

    const pdfBlob = doc.output('blob');
    const fileName = `Invoice_${customerName}_${orderId}.pdf`;

    const result = await Swal.fire({
        title: 'Share Invoice',
        text: 'Choose how you want to send this invoice',
        icon: 'question',
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: 'WhatsApp',
        denyButtonText: 'Telegram',
        cancelButtonText: 'Download Only',
        background: '#222',
        color: '#fff',
        confirmButtonColor: '#25D366',
        denyButtonColor: '#0088cc'
    });

    if (result.isConfirmed) {
        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: 'Apli Bhaji Invoice',
                text: `Hello ${customerName}, here is your latest invoice from APLI BHAJI. Total: Rs ${orderTotal.toFixed(2)}.`,
                files: [file]
            });
        } else {
            doc.save(fileName);
            const phoneStr = customerPhone?.replace(/\D/g, '');
            const waLink = `https://wa.me/${phoneStr}?text=${encodeURIComponent(`Hello ${customerName}, your order total is Rs ${orderTotal.toFixed(2)}. I have sent the invoice PDF here.`)}`;
            setTimeout(() => window.open(waLink, '_blank'), 1000);
        }
    } else if (result.isDenied) {
        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                title: 'Apli Bhaji Invoice',
                text: `Hello ${customerName}, here is your latest invoice from APLI BHAJI. Total: Rs ${orderTotal.toFixed(2)}.`,
                files: [file]
            });
        } else {
            doc.save(fileName);
            const tgLink = `https://t.me/share/url?url=${encodeURIComponent('Please check the downloaded PDF.')}&text=${encodeURIComponent(`Hello ${customerName}, your order total is Rs ${orderTotal.toFixed(2)}.`)}`;
            setTimeout(() => window.open(tgLink, '_blank'), 1000);
        }
    } else {
        doc.save(fileName);
    }
};

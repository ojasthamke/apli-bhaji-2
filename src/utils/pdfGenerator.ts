import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

export const generatePDFAndShare = async (orderItems: any[], orderId: number, orderTotal: number, customerName: string, customerPhone: string = '', areaName: string = '', totalMrp: number, discNum: number, customerAddress: string = '', customerLocationLink: string = '') => {
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


    const fileName = `Invoice_${customerName}_${orderId}.pdf`;

    const choice = await new Promise((resolve) => {
        Swal.fire({
            title: 'Share Invoice',
            html: `
                <div class="flex flex-col gap-3 mt-4">
                    <button id="btn-wa" class="btn-primary w-full bg-[#25D366] text-white border-none py-3 flex items-center justify-center font-bold">WhatsApp Direct</button>
                    <button id="btn-group" class="btn-primary w-full bg-[#128C7E] text-white border-none py-3 flex items-center justify-center font-bold">WhatsApp Group + Link</button>
                    <button id="btn-tg" class="btn-primary w-full bg-[#0088cc] text-white border-none py-3 flex items-center justify-center font-bold">Telegram Group + Link</button>
                    <button id="btn-dl" class="btn-primary w-full bg-[#333] text-white border-none py-3 flex items-center justify-center font-bold">Download PDF Only</button>
                </div>
            `,
            showConfirmButton: false,
            showCancelButton: true,
            cancelButtonText: 'Cancel',
            background: '#222',
            color: '#fff',
            didOpen: () => {
                document.getElementById('btn-wa')?.addEventListener('click', () => { Swal.close(); resolve('wa'); });
                document.getElementById('btn-group')?.addEventListener('click', () => { Swal.close(); resolve('group'); });
                document.getElementById('btn-tg')?.addEventListener('click', () => { Swal.close(); resolve('tg'); });
                document.getElementById('btn-dl')?.addEventListener('click', () => { Swal.close(); resolve('dl'); });
            }
        }).then((res) => {
            if (res.isDismissed) resolve(null);
        });
    });

    if (!choice) return;

    // Generate Text Invoice Data
    let textInvoice = `*APLI BHAJI*\n`;
    textInvoice += `*Customer:* ${customerName}\n`;
    if (customerAddress) textInvoice += `*Address:* ${customerAddress}\n`;
    if (customerLocationLink) textInvoice += `*Location:* ${customerLocationLink}\n`;
    textInvoice += `\n*Items:*\n`;

    orderItems.forEach((item, i) => {
        textInvoice += `${i + 1}. ${item.name} (${item.quantity} ${item.unit}) - Rs ${item.total.toFixed(2)}\n`;
    });
    if (totalMrp > 0) textInvoice += `\n*Total MRP:* Rs ${totalMrp.toFixed(2)}`;
    if (discNum > 0) textInvoice += `\n*Discount:* - Rs ${discNum.toFixed(2)}`;
    textInvoice += `\n*FINAL AMOUNT: Rs ${orderTotal.toFixed(2)}*\n\n`;

    const groupLink = `https://chat.whatsapp.com/DAaIl8d4ObQ2UyBi64Q4qz?mode=gi_t`;
    const tgGroupLink = `https://t.me/+F5e9iIc9o9I2NGFl`;
    const phoneStr = customerPhone?.replace(/\D/g, '') || '';
    let waPhoneStr = phoneStr;
    if (waPhoneStr.length === 10) waPhoneStr = '91' + waPhoneStr;

    if (choice === 'wa') {
        // WhatsApp Text Only
        const waLink = `https://wa.me/${waPhoneStr}?text=${encodeURIComponent(textInvoice)}`;
        window.open(waLink, '_blank');
    } else if (choice === 'group') {
        // WhatsApp Text + Group Link
        const textWithGroup = textInvoice + `*Join our WhatsApp Group:*\n${groupLink}`;
        const waLink = `https://wa.me/${waPhoneStr}?text=${encodeURIComponent(textWithGroup)}`;
        window.open(waLink, '_blank');
    } else if (choice === 'tg') {
        // Telegram text rendering + Group Link
        const textWithGroupTg = textInvoice + `*Join our Telegram Group:*\n${tgGroupLink}`;
        const tgLink = `https://t.me/share/url?url=${encodeURIComponent(tgGroupLink)}&text=${encodeURIComponent(textWithGroupTg)}`;
        window.open(tgLink, '_blank');
    } else if (choice === 'dl') {
        doc.save(fileName);
    }
};

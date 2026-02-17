const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const drawBox = (doc, x, y, width, height, title) => {
    // Background for header
    doc.fillColor('#f8f9fa').rect(x, y, width, 20).fill();
    doc.rect(x, y, width, height).strokeColor('#333333').stroke();

    // Title
    doc.fillColor('#000000').fontSize(9).font('Helvetica-Bold').text((title || '').toUpperCase(), x + 5, y + 5);

    // Reset
    doc.fillColor('#000000').font('Helvetica').fontSize(9);
    return y + 25; // Return content start Y
};

const drawBarcode = (doc, x, y, text, scale = 1.2, height = 35) => {
    const patterns = [
        "212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213",
        "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132",
        "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211",
        "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313",
        "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331",
        "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111",
        "314111", "221411", "431111", "111124", "111422", "121124", "121421", "141122", "141221", "112214",
        "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111",
        "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141",
        "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141",
        "114131", "311141", "411131", "211412", "211214", "211232", "2331112"
    ];

    let currentX = x;
    doc.fillColor('#000000');

    // Start B
    const startPattern = patterns[104];
    for (let i = 0; i < startPattern.length; i++) {
        const w = parseInt(startPattern[i]) * scale;
        if (i % 2 === 0) doc.rect(currentX, y, w, height).fill();
        currentX += w;
    }

    let checksum = 104;
    for (let i = 0; i < text.length; i++) {
        const val = text.charCodeAt(i) - 32;
        if (val < 0 || val > 102) continue;
        const pattern = patterns[val];
        for (let j = 0; j < pattern.length; j++) {
            const w = parseInt(pattern[j]) * scale;
            if (j % 2 === 0) doc.rect(currentX, y, w, height).fill();
            currentX += w;
        }
        checksum += val * (i + 1);
    }

    // Checksum
    const checkPattern = patterns[checksum % 103];
    for (let i = 0; i < checkPattern.length; i++) {
        const w = parseInt(checkPattern[i]) * scale;
        if (i % 2 === 0) doc.rect(currentX, y, w, height).fill();
        currentX += w;
    }

    // Stop
    const stopPattern = patterns[106];
    for (let i = 0; i < stopPattern.length; i++) {
        const w = parseInt(stopPattern[i]) * scale;
        if (i % 2 === 0) doc.rect(currentX, y, w, height).fill();
        currentX += w;
    }
};

const generateWaybill = (shipment, res) => {
    // A5 Landscape: ~595 x 420 pts
    const doc = new PDFDocument({ margin: 15, size: 'A5', layout: 'landscape' });

    doc.pipe(res);

    // Helpers
    const drawSectionHeader = (x, y, w, title) => {
        doc.fillColor('#d1d5db').rect(x, y, w, 15).fill();
        doc.rect(x, y, w, 15).strokeColor('#000000').lineWidth(0.5).stroke();
        doc.fillColor('#000000').font('Helvetica-Bold').fontSize(8).text((title || '').toUpperCase(), x, y + 4, {
            width: w,
            align: 'center'
        });
    };

    const drawSectionBody = (x, y, w, h) => {
        doc.rect(x, y, w, h).strokeColor('#000000').lineWidth(0.5).stroke();
    };

    // ================= HEADER [Y: 15-75] =================
    // Logo
    const logoJPG = path.join(__dirname, '../assets/logo.jpg');
    const logoPNG = path.join(__dirname, '../assets/logo.png');
    if (fs.existsSync(logoJPG)) {
        doc.image(logoJPG, 20, 15, { width: 100 });
    } else if (fs.existsSync(logoPNG)) {
        doc.image(logoPNG, 20, 15, { width: 100 });
    }

    // Centered Barcode and ID
    const sId = shipment.shipmentId || 'SD-UNKNOWN';
    drawBarcode(doc, 195, 15, sId, 1.0, 30);
    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(10).text(sId, 140, 48, { align: 'center', width: 320 });

    // Right Side Labels
    doc.font('Helvetica-Bold').fontSize(24).text('WAYBILL', 430, 20, { align: 'right' });
    doc.fontSize(10).text(`Ref: ${sId}`, 430, 48, { align: 'right' });
    doc.text(`Date: ${new Date().toISOString().split('T')[0]}`, 430, 60, { align: 'right' });


    // ================= ROW 1 [Y: 85 - 175] =================
    const row1Y = 80;
    const colWidth = 185;
    const row1Height = 85;

    // COL 1: SENDER
    drawSectionHeader(20, row1Y, colWidth, 'SENDER DETAILS');
    drawSectionBody(20, row1Y + 15, colWidth, row1Height);

    const sender = shipment.senderDetails || { fullName: shipment.senderName, mobile: shipment.senderPhone, address: { city: shipment.start } };
    doc.font('Helvetica').fontSize(8).fillColor('#000000');
    let textY = row1Y + 21;
    doc.text(sender.fullName || '', 25, textY);

    doc.font('Helvetica-Bold');
    doc.text(sender.company || '', 25, textY + 10);

    doc.font('Helvetica');
    doc.text(sender.mobile || '', 25, textY + 20);

    doc.fillColor('#000000');
    doc.text(sender.email || '', 25, textY + 30);

    if (sender.address) {
        doc.text(sender.address.street || '', 25, textY + 40);
        const addrLine2 = `${sender.address.suburb || ''}, ${sender.address.city || ''}`.replace(/^, /, '').trim();
        doc.text(addrLine2 === ',' ? '' : addrLine2, 25, textY + 50);
        const addrLine3 = `${sender.address.province || ''} ${sender.address.postalCode || ''}`.trim();
        doc.text(addrLine3, 25, textY + 60);
    }

    // COL 2: RECEIVER
    drawSectionHeader(20 + colWidth, row1Y, colWidth, 'RECEIVER DETAILS');
    drawSectionBody(20 + colWidth, row1Y + 15, colWidth, row1Height);

    const receiver = shipment.deliveryDetails || { receiverName: shipment.receiverName, mobile: shipment.receiverPhone, address: { city: shipment.end } };
    textY = row1Y + 21;
    const rX = 20 + colWidth + 5;

    doc.font('Helvetica-Bold').fillColor('#000000').text(receiver.receiverName || '', rX, textY, { align: 'center', width: colWidth - 10 });
    doc.text(receiver.company || '', rX, textY + 10, { align: 'center', width: colWidth - 10 });

    doc.font('Helvetica');
    doc.text(receiver.mobile || '', rX, textY + 20, { align: 'center', width: colWidth - 10 });
    doc.text(receiver.email || '', rX, textY + 30, { align: 'center', width: colWidth - 10 });

    if (receiver.address) {
        doc.text(receiver.address.street || '', rX, textY + 40, { align: 'center', width: colWidth - 10 });
        const rAddr2 = `${receiver.address.city || ''}`;
        doc.text(rAddr2 || '', rX, textY + 50, { align: 'center', width: colWidth - 10 });
        const rAddr3 = `${receiver.address.province || ''} ${receiver.address.postalCode || ''}`.trim();
        doc.text(rAddr3, rX, textY + 60, { align: 'center', width: colWidth - 10 });
    }

    // COL 3: SERVICE
    drawSectionHeader(20 + colWidth * 2, row1Y, colWidth, 'SERVICE INFO');
    drawSectionBody(20 + colWidth * 2, row1Y + 15, colWidth, row1Height);

    const sX = 20 + colWidth * 2 + 5;
    textY = row1Y + 21;
    const parcel = shipment.parcelDetails || { serviceType: 'Standard', parcelType: shipment.packageType, dimensions: { weight: shipment.parcelWeight } };

    const drawLabelVal = (lbl, val, y) => {
        doc.fillColor('#000000').font('Helvetica-Bold').text(lbl, sX, y, { width: 40 });
        doc.font('Helvetica').text(val || '-', sX + 45, y);
    }
    drawLabelVal('Service:', (parcel.serviceType || 'ECONOMY').toUpperCase(), textY);
    drawLabelVal('Type:', (parcel.parcelType || 'Parcel').toUpperCase(), textY + 12);
    drawLabelVal('Weight:', `${parcel.dimensions?.weight || shipment.parcelWeight || 0} kg`, textY + 24);
    if (parcel.dimensions?.length) {
        drawLabelVal('Dims:', `${parcel.dimensions.length}x${parcel.dimensions.width}x${parcel.dimensions.height}`, textY + 36);
        doc.text('Carrier: Shipday Courier', sX, textY + 48, { width: colWidth - 10 });
    } else {
        doc.text('Carrier: Shipday Courier', sX, textY + 36, { width: colWidth - 10 });
    }


    // ================= ROW 2 [Y: ~185 - 235] =================
    const row2Y = row1Y + 15 + row1Height + 5;
    const row2Height = 45;

    // COL 1: INSTRUCTIONS
    drawSectionHeader(20, row2Y, colWidth, 'INSTRUCTIONS');
    drawSectionBody(20, row2Y + 15, colWidth, row2Height);
    doc.fillColor('#000000').font('Helvetica-Bold').fontSize(7).text(parcel.specialInstructions || 'None', 25, row2Y + 20, { width: colWidth - 10 });

    // COL 2: PAYMENT
    drawSectionHeader(20 + colWidth, row2Y, colWidth - 40, 'PAYMENT INFO');
    drawSectionBody(20 + colWidth, row2Y + 15, colWidth - 40, row2Height);

    const pay = shipment.payment || { method: 'COD', amount: shipment.cost, status: 'Pending' };
    doc.font('Helvetica-Bold').fontSize(8).text('Method:', 20 + colWidth + 5, row2Y + 21);
    doc.font('Helvetica').text((pay.method || 'Account').toUpperCase(), 20 + colWidth + 50, row2Y + 21);

    doc.font('Helvetica-Bold').text('Status:', 20 + colWidth + 5, row2Y + 32);
    doc.font('Helvetica').text((pay.status || 'Pending').toUpperCase(), 20 + colWidth + 50, row2Y + 32);

    // COL 3: REF
    const col3X = 20 + colWidth + (colWidth - 40);
    const col3W = colWidth + 40;
    drawSectionHeader(col3X, row2Y, col3W, 'MARKETPLACE / REF');
    drawSectionBody(col3X, row2Y + 15, col3W, row2Height);

    let refY = row2Y + 21;
    doc.font('Helvetica-Bold').fontSize(8).text(`Ref: ${shipment.shipmentId || '-'}`, col3X + 5, refY);
    doc.font('Helvetica');
    doc.text(`Order: ${shipment.orderNumber || '-'}`, col3X + 5, refY + 11);
    doc.text(`Market: ${shipment.marketplaceName || '-'}`, col3X + 5, refY + 22);


    // ================= PROOF OF DELIVERY [Y: ~245 - 305] =================
    const podY = row2Y + 15 + row2Height + 10;
    const podHeight = 65;
    const pageWidth = 595 - 30; // 565

    drawSectionHeader(20, podY, pageWidth, 'Proof of Delivery');
    drawSectionBody(20, podY + 15, pageWidth, podHeight);

    const midPoint = 20 + (pageWidth / 2);

    // Vertical line in middle
    doc.lineWidth(0.5).moveTo(midPoint, podY + 15).lineTo(midPoint, podY + 15 + podHeight).stroke();

    // POD Labels
    doc.fillColor('#4a5568').font('Helvetica-Bold').fontSize(11);
    doc.text('Sender Details', 20, podY + 20, { width: pageWidth / 2, align: 'center' });
    doc.text('Reciever Details', midPoint, podY + 20, { width: pageWidth / 2, align: 'center' });

    doc.fillColor('#a0aec0').fontSize(12);
    doc.text('NAME', 20, podY + 35, { width: pageWidth / 2, align: 'center' });
    doc.text('NAME', midPoint, podY + 35, { width: pageWidth / 2, align: 'center' });

    doc.fontSize(9);
    doc.text('SENDER SIGNATURE', 20, podY + 52, { width: pageWidth / 2, align: 'center' });
    doc.text('RECEIVER SIGNATURE', midPoint, podY + 52, { width: pageWidth / 2, align: 'center' });

    doc.end();
};

const generatePOD = (shipment, res) => {
    const doc = new PDFDocument();
    doc.pipe(res);

    // Header
    doc.fontSize(20).text('SHIPDAY WAYBILL', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Waybill No: ${shipment.shipmentId}`, { align: 'right' });
    doc.moveDown();

    // Basic Info
    doc.fontSize(12).text(`Date Shipped: ${shipment.createdAt ? new Date(shipment.createdAt).toLocaleDateString() : 'N/A'}`);
    doc.text(`From: ${shipment.senderName || (shipment.senderDetails ? shipment.senderDetails.fullName : '')}`);
    doc.text(`To: ${shipment.receiverName || (shipment.deliveryDetails ? shipment.deliveryDetails.receiverName : '')}`);
    doc.moveDown();

    // Content
    doc.text('Received in good order and condition:');
    doc.moveDown(2);

    // Signature Block
    const sigY = 400;
    doc.moveTo(50, sigY).lineTo(250, sigY).stroke();
    doc.text('Receiver Signature', 50, sigY + 10);

    doc.moveTo(300, sigY).lineTo(500, sigY).stroke();
    doc.text('Date & Time', 300, sigY + 10);

    doc.end();
};

module.exports = {
    generateWaybill,
    generatePOD
};

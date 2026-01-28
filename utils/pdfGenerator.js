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
        doc.image(logoJPG, 20, 15, { width: 110 });
    } else if (fs.existsSync(logoPNG)) {
        doc.image(logoPNG, 20, 15, { width: 110 });
    }

    // Centered Tracking Numbers
    doc.font('Times-Roman').fontSize(32).text(shipment.shipmentId, 140, 15, { align: 'center', width: 320 });

    // Middle ID
    const sId = shipment.shipmentId || 'SD-UNKNOWN';
    const midId = sId.slice(-3);
    doc.font('Helvetica-Bold').fontSize(26).text(midId, 140, 48, { align: 'center', width: 320 });
    doc.fontSize(8).text(shipment.shipmentId, 140, 74, { align: 'center', width: 320 });

    // Right Side Labels
    doc.font('Helvetica-Bold').fontSize(24).text('WAYBILL', 430, 20, { align: 'right' });
    doc.fontSize(10).text(`Ref: ${shipment.shipmentId}`, 430, 48, { align: 'right' });
    doc.text(`Date: ${new Date().toISOString().split('T')[0]}`, 430, 60, { align: 'right' });


    // ================= ROW 1 [Y: 85 - 170] =================
    const row1Y = 85;
    const colWidth = 185;
    const row1Height = 85;

    // COL 1: SENDER
    drawSectionHeader(20, row1Y, colWidth, 'SENDER DETAILS');
    drawSectionBody(20, row1Y + 15, colWidth, row1Height);

    const sender = shipment.senderDetails || { fullName: shipment.senderName, mobile: shipment.senderPhone, address: { city: shipment.start } };
    doc.font('Helvetica').fontSize(8).fillColor('#000000');
    let textY = row1Y + 20;
    doc.text(sender.fullName || '', 25, textY);
    doc.text(sender.company || '', 25, textY + 10);
    doc.text(sender.mobile || '', 25, textY + 20);
    if (sender.address) {
        doc.text(sender.address.street || '', 25, textY + 30);
        doc.text(`${sender.address.suburb || ''}, ${sender.address.city || ''}`, 25, textY + 40);
        doc.text(sender.address.province || '', 25, textY + 50);
        doc.text(sender.address.postalCode || '', 25, textY + 60);
    }

    // COL 2: RECEIVER
    drawSectionHeader(20 + colWidth, row1Y, colWidth, 'RECEIVER DETAILS');
    drawSectionBody(20 + colWidth, row1Y + 15, colWidth, row1Height);

    const receiver = shipment.deliveryDetails || { receiverName: shipment.receiverName, mobile: shipment.receiverPhone, address: { city: shipment.end } };
    textY = row1Y + 20;
    const rX = 20 + colWidth + 5;

    doc.font('Helvetica-Bold').text(receiver.receiverName || '', rX, textY, { align: 'center', width: colWidth - 10 });
    doc.font('Helvetica').text(receiver.company || '', rX, textY + 10, { align: 'center', width: colWidth - 10 });
    doc.text(receiver.mobile || '', rX, textY + 20, { align: 'center', width: colWidth - 10 });

    if (receiver.address) {
        doc.fillColor('blue').text(receiver.email || '', rX, textY + 30, { align: 'center', width: colWidth - 10 }).fillColor('black');
        doc.text(`${receiver.address.street || ''}`, rX, textY + 40, { align: 'center', width: colWidth - 10 });
        doc.text(`${receiver.address.city || ''}, ${receiver.address.province || ''}`, rX, textY + 50, { align: 'center', width: colWidth - 10 });
        doc.text(receiver.address.postalCode || '', rX, textY + 60, { align: 'center', width: colWidth - 10 });
    }

    // COL 3: SERVICE
    drawSectionHeader(20 + colWidth * 2, row1Y, colWidth, 'SERVICE INFO');
    drawSectionBody(20 + colWidth * 2, row1Y + 15, colWidth, row1Height);

    const sX = 20 + colWidth * 2 + 5;
    textY = row1Y + 20;
    const parcel = shipment.parcelDetails || { serviceType: 'Standard', parcelType: shipment.packageType, dimensions: { weight: shipment.parcelWeight } };

    const drawLabelVal = (lbl, val, y) => {
        doc.font('Helvetica-Bold').text(lbl, sX, y, { width: 40 });
        doc.font('Helvetica').text(val, sX + 45, y);
    }
    drawLabelVal('Service:', (parcel.serviceType || 'ECONOMY').toUpperCase(), textY);
    drawLabelVal('Type:', (parcel.parcelType || 'Parcel').toUpperCase(), textY + 12);
    drawLabelVal('Weight:', `${parcel.dimensions?.weight || shipment.parcelWeight} kg`, textY + 24);
    if (parcel.dimensions?.length) drawLabelVal('Dims:', `${parcel.dimensions.length}x${parcel.dimensions.width}x${parcel.dimensions.height}`, textY + 36);


    // ================= ROW 2 [Y: ~180 - 220] =================
    const row2Y = row1Y + 15 + row1Height + 5;
    const row2Height = 40;

    // COL 1: INSTRUCTIONS
    drawSectionHeader(20, row2Y, colWidth, 'INSTRUCTIONS');
    drawSectionBody(20, row2Y + 15, colWidth, row2Height);
    doc.font('Helvetica-Bold').fontSize(7).text(parcel.specialInstructions || 'None', 25, row2Y + 20, { width: colWidth - 10 });

    // COL 2: PAYMENT
    drawSectionHeader(20 + colWidth, row2Y, colWidth - 40, 'PAYMENT INFO');
    drawSectionBody(20 + colWidth, row2Y + 15, colWidth - 40, row2Height);

    const pay = shipment.payment || { method: 'COD', amount: shipment.cost, status: 'Pending' };
    doc.font('Helvetica-Bold').text('Method:', 20 + colWidth + 5, row2Y + 20);
    doc.text((pay.method || 'Account').toUpperCase(), 20 + colWidth + 45, row2Y + 20);

    doc.text('Status:', 20 + colWidth + 5, row2Y + 30);
    doc.text((pay.status || 'Unknown').toUpperCase(), 20 + colWidth + 45, row2Y + 30);

    // COL 3: REF
    const col3X = 20 + colWidth + (colWidth - 40);
    const col3W = colWidth + 40;
    drawSectionHeader(col3X, row2Y, col3W, 'MARKETPLACE / REF');
    drawSectionBody(col3X, row2Y + 15, col3W, row2Height);

    let refY = row2Y + 20;
    if (shipment.marketplaceName) {
        doc.font('Helvetica-Bold').fontSize(9).text((shipment.marketplaceName || '').toUpperCase(), col3X + 5, refY);
        refY += 12;
    }

    doc.font('Helvetica-Bold').fontSize(8).text(`Ref: ${shipment.orderNumber || shipment.shipmentId}`, col3X + 5, refY);
    if (shipment.numberOfBoxes && shipment.numberOfBoxes > 1) {
        doc.font('Helvetica').fontSize(7).text(`Boxes: ${shipment.numberOfBoxes}`, col3X + 5, refY + 10);
    }


    // ================= SPACE GAP =================
    const gapAfterRow2 = 25;


    // ================= BIG BOX [Y: ~260 - 355] =================
    const bottomY = row2Y + 15 + row2Height + gapAfterRow2;
    const bottomHeight = 90;

    // Left Box (Blank)
    doc.rect(20, bottomY, colWidth + 40, bottomHeight).stroke();

    // Right Box (Sort Code)
    const bigBoxX = 20 + colWidth + 40;
    const bigBoxW = (colWidth * 2) - 40;

    doc.rect(bigBoxX, bottomY, bigBoxW, bottomHeight).fillColor('#ffffff').fill();
    doc.rect(bigBoxX, bottomY, bigBoxW, bottomHeight).strokeColor('#000000').stroke();

    // Text Content
    const recName = (receiver.company || receiver.receiverName || 'UNK').toString().substring(0, 3);
    const idValue = (shipment.shipmentId || 'UNKNOWN');
    const idSuffix = idValue.slice(-4);
    const sortCode = `${recName}${idSuffix}`;

    // Large ID - Reduced to 50
    doc.fillColor('#000000').font('Helvetica').fontSize(50)
        .text(sortCode, bigBoxX, bottomY + 15, { width: bigBoxW, align: 'center' });

    doc.fontSize(40).text('6', bigBoxX, bottomY + 60, { width: bigBoxW, align: 'center' });


    // ================= FOOTER - CENTERED STACK [Y: ~385] =================
    const footerY = bottomY + bottomHeight + 10;

    doc.fontSize(6).font('Helvetica');

    // Stacked Vertically, Centered
    // Using full page width (595) for perfect centering

    doc.text('SENDER SIGNATURE', 0, footerY, { align: 'center', width: 595 });
    doc.text('RECEIVER SIGNATURE', 0, footerY + 12, { align: 'center', width: 595 });

    // Names side-by-side below
    doc.text('NAME:', 0, footerY + 24, { align: 'center', width: 595 });

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

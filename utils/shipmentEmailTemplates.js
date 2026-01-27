
const sendMail = require('./mail');

const getStatusColor = (status) => {
    switch (status) {
        case 'Collected': return '#10b981'; // Green
        case 'Shipping': return '#8b5cf6'; // Violet
        case 'In-transit': return '#3b82f6'; // Blue
        case 'Delivered': return '#059669'; // Dark Green
        case 'Out For delivery': return '#f59e0b'; // Amber
        case 'Pending':
        case 'Pending Collect': return '#64748b'; // Slate
        default: return '#64748b'; // Slate
    }
};

const getStatusMessage = (status) => {
    switch (status) {
        case 'Collected': return 'Your parcel has been picked up and is now with us.';
        case 'Shipping': return 'A driver has been assigned and is heading to collect your parcel.';
        case 'In-transit': return 'Your parcel is on its way to the destination hub.';
        case 'Out For delivery': return 'Your parcel is out for delivery and will reach you soon.';
        case 'Delivered': return 'Great news! Your parcel has been successfully delivered.';
        case 'Pending':
        case 'Pending Collect': return 'Your shipment order has been received and is awaiting collection.';
        default: return `Your parcel status has been updated to: ${status}`;
    }
};

const sendShipmentStatusEmail = async (shipment, status) => {
    const receiverEmail = shipment.deliveryDetails?.email;
    const senderEmail = shipment.senderDetails?.email || shipment.collectionDetails?.email;
    const trackingUrl = `https://shipday.vercel.app/track/${shipment.trackingNumber || shipment.shipmentId}`; // Adjust if you have a different tracking URL

    const color = getStatusColor(status);
    const message = getStatusMessage(status);

    const htmlTemplate = (role) => `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">ShipDay Logistics</h1>
                <p style="color: #94a3b8; margin-top: 5px;">Real-time Parcel Tracking</p>
            </div>
            
            <div style="padding: 40px; background-color: #ffffff;">
                <h2 style="color: #1e293b; margin-top: 0;">Parcel Status Update</h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.6;">
                    Hello ${role === 'receiver' ? (shipment.deliveryDetails?.receiverName || 'there') : (shipment.senderDetails?.fullName || 'there')},
                </p>
                
                <div style="background-color: #f8fafc; border-left: 4px solid ${color}; padding: 20px; margin: 25px 0; border-radius: 0 8px 8px 0;">
                    <p style="margin: 0; font-weight: 600; color: ${color}; font-size: 18px;">${status}</p>
                    <p style="margin: 10px 0 0 0; color: #64748b;">${message}</p>
                </div>
                
                <table style="width: 100%; border-collapse: collapse; margin: 25px 0;">
                    <tr>
                        <td style="padding: 10px 0; color: #64748b; font-size: 14px; width: 40%;">Shipment ID:</td>
                        <td style="padding: 10px 0; color: #1e293b; font-weight: 600;">${shipment.shipmentId}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Tracking Number:</td>
                        <td style="padding: 10px 0; color: #1e293b; font-weight: 600;">${shipment.trackingNumber || 'N/A'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Origin:</td>
                        <td style="padding: 10px 0; color: #1e293b;">${shipment.start}</td>
                    </tr>
                    <tr>
                        <td style="padding: 10px 0; color: #64748b; font-size: 14px;">Destination:</td>
                        <td style="padding: 10px 0; color: #1e293b;">${shipment.end}</td>
                    </tr>
                </table>
                
                <div style="text-align: center; margin-top: 40px;">
                    <a href="${trackingUrl}" style="background-color: #0f172a; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; transition: background-color 0.3s ease;">
                        Track My Parcel
                    </a>
                </div>
            </div>
            
            <div style="background-color: #f1f5f9; padding: 20px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                    &copy; ${new Date().getFullYear()} ShipDay Logistics. All rights reserved.
                </p>
                <p style="margin: 5px 0 0 0; color: #94a3b8; font-size: 12px;">
                    This is an automated notification. Please do not reply to this email.
                </p>
            </div>
        </div>
    `;

    // Send to Receiver
    if (receiverEmail) {
        try {
            await sendMail(
                receiverEmail,
                `ShipDay: Your parcel status updated to ${status} (${shipment.shipmentId})`,
                `Your parcel status: ${status}. Shipment ID: ${shipment.shipmentId}`,
                htmlTemplate('receiver')
            );
            console.log(`📧 Status email sent to Receiver: ${receiverEmail}`);
        } catch (err) {
            console.error(`❌ Failed to send email to Receiver: ${receiverEmail}`, err.message);
        }
    }

    // Send to Sender for certain statuses
    if (senderEmail && (status === 'Collected' || status === 'Delivered')) {
        try {
            await sendMail(
                senderEmail,
                `ShipDay: Shipment ${shipment.shipmentId} status: ${status}`,
                `Shipment status: ${status}. Shipment ID: ${shipment.shipmentId}`,
                htmlTemplate('sender')
            );
            console.log(`📧 Status email sent to Sender: ${senderEmail}`);
        } catch (err) {
            console.error(`❌ Failed to send email to Sender: ${senderEmail}`, err.message);
        }
    }
};

module.exports = { sendShipmentStatusEmail };

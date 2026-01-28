const crypto = require('crypto');

const pfValidSignature = (data, passPhrase = null) => {
    let pfOutput = "";

    // PayFast requires specific order or at least consistent order
    // We iterate through keys and build the string
    for (let key in data) {
        if (data.hasOwnProperty(key) && key !== "signature") {
            let val = data[key];
            if (val !== undefined && val !== null && String(val).trim() !== "") {
                pfOutput += `${key}=${encodeURIComponent(String(val).trim()).replace(/%20/g, "+")}&`;
            }
        }
    }

    // Remove last ampersand
    let getString = pfOutput.slice(0, -1);

    // Append Passphrase if it exists
    if (passPhrase && passPhrase.trim() !== "") {
        getString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`;
    }

    return crypto.createHash("md5").update(getString).digest("hex");
};

const generatePaymentData = (shipment) => {
    const mode = (process.env.PAYFAST_MODE || 'sandbox').trim().toLowerCase();
    const isSandbox = mode === 'sandbox';

    const merchantId = process.env.PAYFAST_MERCHANT_ID || '10045256';
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY || '2ib6bssct5vzd';
    const passPhrase = process.env.PAYFAST_PASSPHRASE || "";

    const frontendUrl = (process.env.BASE_URL || 'https://shipday-be.vercel.app').trim();
    let finalBackendUrl = (process.env.API_URL || 'https://shipday-fe.vercel.app/api').trim();

    // SAFETY: PayFast CloudFront blocks requests with "localhost" in ANY field.
    // If API_URL is still localhost, we need a valid production fallback or it will fail.
    if (finalBackendUrl.includes('localhost')) {
        console.warn('⚠️ PayFast: API_URL contains localhost. This will FAIL in production.');
    }

    // Construct data in the EXACT order expected/sent
    const data = {
        merchant_id: merchantId.trim(),
        merchant_key: merchantKey.trim(),
        return_url: `${frontendUrl}/payment/success`.trim(),
        cancel_url: `${frontendUrl}/payment/cancel`.trim(),
        notify_url: `${finalBackendUrl}/payments/notify`.trim(),
        name_first: shipment.senderDetails.fullName.split(' ')[0].trim(),
        name_last: (shipment.senderDetails.fullName.split(' ').slice(1).join(' ') || 'Sender').trim(),
        email_address: isSandbox ? 'sbtester@payfast.co.za' : shipment.senderDetails.email.trim(),
        m_payment_id: shipment.shipmentId.trim(),
        amount: shipment.payment.amount.toFixed(2),
        item_name: `Shipment ${shipment.shipmentId}`.trim(),
        item_description: `${shipment.parcelDetails.serviceType} delivery`.trim()
    };

    // Generate Signature
    data.signature = pfValidSignature(data, passPhrase);

    const payfastUrl = isSandbox
        ? 'https://sandbox.payfast.co.za/eng/process'
        : 'https://www.payfast.co.za/eng/process';

    console.log(`🚀 PayFast [${mode.toUpperCase()}]: Redirecting Shipment ${data.m_payment_id} to ${payfastUrl}`);

    return {
        url: payfastUrl,
        data
    };
};

module.exports = {
    pfValidSignature,
    generatePaymentData
};

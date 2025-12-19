const crypto = require('crypto');

const pfValidSignature = (data, passPhrase = null) => {
    // Config
    let pfOutput = "";
    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            // Check for valid value (not undefined or null or empty string) - Matching Controller Logic
            if (data[key] !== undefined && data[key] !== null && data[key] !== "") {
                // Determine value (string or number)
                let val = data[key];
                // Convert to string to be safe
                val = String(val);

                pfOutput += `${key}=${encodeURIComponent(val).replace(/%20/g, "+")}&`
            }
        }
    }

    // Remove last ampersand
    let getString = pfOutput.slice(0, -1);

    // Append Passphrase if it exists (for hashing only)
    if (passPhrase !== null && passPhrase !== "") {
        getString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`;
    }

    return crypto.createHash("md5").update(getString).digest("hex");
};

const generatePaymentData = (shipment) => {
    // Determine mode from Environment Variables
    const isSandbox = process.env.PAYFAST_MODE === 'sandbox';

    const merchantId = process.env.PAYFAST_MERCHANT_ID;
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
    const passPhrase = process.env.PAYFAST_PASSPHRASE;

    if (!merchantId || !merchantKey) {
        // Fallback or warn
        console.warn("PayFast Vars Check: ID/Key might be missing");
    }

    // Use Env vars or Defaults (User Force Update)
    // Production default fallback as per user request
    const finalMerchantId = merchantId || '21751525';
    const finalMerchantKey = merchantKey || 'eisp6twqb8yof';
    const finalPassPhrase = passPhrase || null;

    // Base URLs
    const frontendUrl = process.env.BASE_URL || process.env.PRODUCTION_FRONTEND_URL || 'http://localhost:5173';
    const backendUrl = process.env.API_URL || 'https://swiftship-be-bxcwgcbzauhuekas.canadacentral-01.azurewebsites.net';

    // Helper to safely trim strings
    const safeTrim = (str) => (str ? String(str).trim() : "");

    const data = {
        merchant_id: safeTrim(finalMerchantId),
        merchant_key: safeTrim(finalMerchantKey),
        return_url: safeTrim(`${frontendUrl}/payment/success`),
        cancel_url: safeTrim(`${frontendUrl}/payment/cancel`),
        notify_url: safeTrim(`${backendUrl}/api/payment/notify`),

        // Buyer Details - Ensure trimmed
        name_first: safeTrim(shipment.senderDetails.fullName.split(' ')[0]),
        name_last: safeTrim(shipment.senderDetails.fullName.split(' ').slice(1).join(' ') || 'Sender'),
        email_address: safeTrim(shipment.senderDetails.email),

        // Transaction Details
        m_payment_id: safeTrim(shipment.shipmentId),
        amount: shipment.payment.amount.toFixed(2), // toFixed returns string
        item_name: safeTrim(`Shipment ${shipment.shipmentId}`),
        item_description: safeTrim(`${shipment.parcelDetails.serviceType} delivery`)
    };

    // Generate Signature (passphrase is used for signing but NOT sent as a parameter)
    const signature = pfValidSignature(data, finalPassPhrase);
    data.signature = signature;

    // Production URL as requested
    const payfastUrl = 'https://www.payfast.co.za/eng/process';

    return {
        url: payfastUrl,
        data
    };
};

module.exports = {
    pfValidSignature,
    generatePaymentData
};

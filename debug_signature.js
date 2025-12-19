const crypto = require('crypto');

const pfValidSignature = (data, passPhrase = null) => {
    // Config
    let pfOutput = "";
    for (let key in data) {
        if (data.hasOwnProperty(key)) {
            if (data[key] !== undefined && data[key] !== null && data[key] !== "") {
                let val = String(data[key]);
                pfOutput += `${key}=${encodeURIComponent(val.trim()).replace(/%20/g, "+")}&`
            }
        }
    }

    // Remove last ampersand
    let getString = pfOutput.slice(0, -1);

    // Append Passphrase if it exists (for hashing only)
    if (passPhrase !== null && passPhrase !== "") {
        getString += `&passphrase=${encodeURIComponent(passPhrase.trim()).replace(/%20/g, "+")}`;
    }

    console.log("String to Hash:", getString);
    return crypto.createHash("md5").update(getString).digest("hex");
};

// Data from user request
const data = {
    merchant_id: '21751525',
    merchant_key: 'eisp6twqb8yof',
    return_url: 'https://shipday-be.vercel.app/payment/success',
    cancel_url: 'https://shipday-be.vercel.app/payment/cancel',
    notify_url: 'https://swiftship-backend-production.up.railway.app/api/payment/notify',
    name_first: 'Latifah',
    name_last: 'Maldonado',
    email_address: 'wymirobuf@mailinator.com',
    m_payment_id: 'SHP051009',
    amount: '110.00',
    item_name: 'Shipment SHP051009',
    item_description: 'express delivery'
};

const signature = pfValidSignature(data, null); // Test without passphrase first
console.log("Generated Signature (No Passphrase):", signature);
console.log("Expected Signature:", "76dc63fea1fd0ef781a9ebacdc949aa2");

const match = signature === "76dc63fea1fd0ef781a9ebacdc949aa2";
console.log("Match?", match);

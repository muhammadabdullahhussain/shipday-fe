// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { createPaymentIntent, initiatePayFastPayment, payWithWallet, initiateWalletTopup, confirmSandboxPayment } = require('../controller/payment');

router.post('/create-payment-intent', createPaymentIntent);
router.post('/payfast', initiatePayFastPayment);
router.post('/wallet', payWithWallet);
router.post('/topup', initiateWalletTopup);
router.post('/notify', require('../controller/payment').handlePayFastNotify);
router.post('/confirm-sandbox', confirmSandboxPayment);

module.exports = router;

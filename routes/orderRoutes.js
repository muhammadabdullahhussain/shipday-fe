
const express = require('express');
const router = express.Router();
const { createOrder, getOrderById, deleteOrderById, getAllOrders, updateOrderStatus, getOrdersByPhone, getOrdersWithTracking } = require('../controller/order');
const { getOrderDetails, getShipmentById } = require('../controller/admin');

router.post('/', createOrder);
router.get('/with-tracking', getOrdersWithTracking);
router.get('/by-phone/:phone', getOrdersByPhone);
router.get('/details/:orderId', getOrderDetails);
router.get('/:id', getOrderById);
router.get('/', getAllOrders);
router.put('/:id/status', updateOrderStatus);
router.delete('/:id', deleteOrderById);
router.get('/shipments/:shipmentId', getShipmentById);



module.exports = router;

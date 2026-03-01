const express = require('express');
const router = express.Router();
const {
  generateShipments,
  getAllShipments,
  updateOrderStatus,
  getShipmentMetrics,
  getShipmentStatusBreakdown,
  trackShipment
} = require('../controller/shipment');
const { createShipment, getShipmentById, updateShipment, downloadWaybill, downloadPOD } = require('../controller/admin');
const authMiddleware = require('../middleware/authMiddleware');

// Shipment routes
router.post('/generate', authMiddleware, generateShipments);
router.patch('/orders/status', authMiddleware, updateOrderStatus);
router.get('/metrics', authMiddleware, getShipmentMetrics);
router.get('/status-breakdown', authMiddleware, getShipmentStatusBreakdown);
router.get('/track/:trackingNumber', trackShipment); // Public tracking route
router.get('/', authMiddleware, getAllShipments);
router.post('/', authMiddleware, createShipment);
router.get('/:shipmentId', authMiddleware, getShipmentById);
router.put('/:shipmentId', authMiddleware, updateShipment);
router.get('/:shipmentId/waybill', authMiddleware, downloadWaybill);
router.get('/:shipmentId/pod', authMiddleware, downloadPOD);

module.exports = router;
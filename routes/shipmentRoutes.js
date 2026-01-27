const express = require('express');
const router = express.Router();
const { generateShipments, getAllShipments, updateOrderStatus, syncShipmentStatuses, getShipmentCount, getShipmentMetrics, getShipmentStatusBreakdown, trackShipment } = require('../controller/shipment');
const { createShipment, getShipmentById, updateShipment, deleteShipment } = require('../controller/admin');
const authMiddleware = require("../middleware/authMiddleware");
const { verifyAdmin } = require("../middleware/roleMiddleware");

router.post('/', createShipment); //  Main POST route for creating individual shipments
router.get('/:shipmentId', getShipmentById); //  Get shipment by ID
router.put('/:shipmentId', updateShipment); //  Update shipment by ID
router.delete('/:shipmentId', authMiddleware, verifyAdmin, deleteShipment); // Delete shipment by ID
router.post('/generate', generateShipments);
router.get('/', getAllShipments);
router.post("/update-order-status", updateOrderStatus);
router.put("/sync-statuses", syncShipmentStatuses);
router.get("/count", getShipmentCount);
router.get('/metrics', getShipmentMetrics); //  new route
router.get("/status-breakdown", getShipmentStatusBreakdown);
router.get("/track/:trackingNumber", trackShipment);


module.exports = router;

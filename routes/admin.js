const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { verifyAdmin, verifySuperAdmin } = require("../middleware/roleMiddleware");

const {
  getPendingDrivers,
  getAcceptedDrivers,
  getAllDrivers,
  updateDriverStatus,
  createShipment,
  assignShipmentToDriver,
  getAssignedShipments,
  getAllShipments,
  getShipmentById,
  getDriversByVehicleType,
  updateShipment,
  deleteShipment,
  downloadWaybill,
  downloadPOD,
  createCustomer,
  deleteDriver
} = require('../controller/admin');

// Customer handling
router.post('/customers/create', authMiddleware, verifyAdmin, createCustomer);

// Driver routes
router.get('/drivers/all', authMiddleware, verifyAdmin, getAllDrivers);
router.get('/drivers/pending', authMiddleware, verifyAdmin, getPendingDrivers);
router.get('/drivers/approved', authMiddleware, verifyAdmin, getAcceptedDrivers);
router.get('/drivers/:vehicleType', authMiddleware, verifyAdmin, getDriversByVehicleType);
router.patch('/drivers/status', authMiddleware, verifySuperAdmin, updateDriverStatus);
router.delete('/drivers/:driverId', authMiddleware, verifySuperAdmin, deleteDriver);

// Shipment routes
// Specific routes first
router.get('/shipments/assign', authMiddleware, verifyAdmin, getAssignedShipments);
router.post('/shipments/assign', authMiddleware, verifyAdmin, assignShipmentToDriver);

router.get('/shipments', authMiddleware, verifyAdmin, getAllShipments);
router.post('/shipments', authMiddleware, verifyAdmin, createShipment);
router.get('/shipments/:shipmentId', authMiddleware, verifyAdmin, getShipmentById);
router.delete('/shipments/:shipmentId', authMiddleware, verifyAdmin, deleteShipment);
router.get('/shipments/:shipmentId/waybill', downloadWaybill);
router.get('/shipments/:shipmentId/pod', downloadPOD);

module.exports = router;
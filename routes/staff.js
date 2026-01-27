const express = require("express");
const router = express.Router();

const {
  addNewStaff,
  getAllStaff,
  assignTaskToStaff,
  getAssignedTasks,
  updateRoute,
  updateStaff,
  deleteRoute,
  deleteStaff,
  getRoutesGroupedByStaff,
  getDriverByRoute,
  getDriverByName,

} = require("../controller/staff");


const authMiddleware = require("../middleware/authMiddleware");
const { verifySuperAdmin } = require("../middleware/roleMiddleware");

router.post("/add", addNewStaff);
router.get("/all", getAllStaff);
router.post("/assign-task/:staffId", assignTaskToStaff);
router.get("/:id/tasks", getAssignedTasks);
router.put("/:staffId/update-task/:routeId", updateRoute);
router.put("/update/:id", authMiddleware, verifySuperAdmin, updateStaff); //  Protected
router.delete("/delete/:id", authMiddleware, verifySuperAdmin, deleteStaff); // Protected

router.delete("/:staffId/remove-task/:routeId", deleteRoute);


router.get("/grouped-routes", getRoutesGroupedByStaff); //  NEW ENDPOINT
router.get("/driver-by-route", getDriverByRoute);
router.get("/driver-by-name", getDriverByName); //  NEW ENDPOINT





module.exports = router;

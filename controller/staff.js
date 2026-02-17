const Staff = require("../models/Staff");
const Route = require("../models/Route");
const Shipment = require("../models/Shipment");
const Driver = require("../models/Driver");
const bcrypt = require("bcryptjs"); // Ensure bcrypt is installed

// Helper to generate unique driverId
const generateDriverId = async () => {
  let driverId;
  let isUnique = false;
  let counter = 1;

  while (!isUnique) {
    const padded = String(counter).padStart(3, '0');
    driverId = `DRV${padded}`;
    const existing = await Driver.findOne({ driverId });
    if (!existing) isUnique = true;
    else counter++;
  }
  return driverId;
};

// Add New Staff
exports.addNewStaff = async (req, res) => {
  try {
    const {
      profilePicture,
      fullName,
      contactInfo,
      role,
      shift,
      email,
      baseLocation,
      latitude,
      longitude,
    } = req.body;

    // Check if staff already exists by email
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({ message: `Staff with email ${email} already exists.` });
    }

    // If role is Driver, check if a driver with same phone or email exists
    if (role === 'Driver') {
      const existingDriverByEmail = await Driver.findOne({ email });
      if (existingDriverByEmail) {
        return res.status(400).json({ message: `A driver with email ${email} already exists.` });
      }

      // Check for phone number specifically since it has a unique index in DB
      const existingDriverByPhone = await Driver.findOne({ phone: contactInfo });
      if (existingDriverByPhone) {
        return res.status(400).json({ message: `A driver with phone number ${contactInfo} already exists.` });
      }
    }

    const lastStaff = await Staff.findOne().sort({ createdAt: -1 });
    let newStaffId = "staff001";
    if (lastStaff && lastStaff.staffId) {
      const lastNumber = parseInt(lastStaff.staffId.replace("staff", ""));
      const nextNumber = (lastNumber + 1).toString().padStart(3, "0");
      newStaffId = `staff${nextNumber}`;
    }

    const newStaff = new Staff({
      staffId: newStaffId,
      profilePicture,
      fullName,
      contactInfo,
      role,
      shift,
      email,
      baseLocation,
      latitude,
      longitude,
    });

    await newStaff.save();


    // If role is Driver, automatically create a Driver account
    if (role === 'Driver') {

      const existingDriver = await Driver.findOne({ email });
      if (!existingDriver) {
        const driverId = await generateDriverId();
        const hashedPassword = await bcrypt.hash("Driver@123", 10); // Default password

        const newDriver = new Driver({
          driverId,
          username: fullName,
          email: email,
          phone: contactInfo,
          password: hashedPassword,
          vehicleType: 'car', // Default
          vehicleNumber: 'TEMP-' + Math.floor(Math.random() * 10000), // Placeholder
          idProof: 'Admin-Created',
          status: 'approved' // Auto-approve admin created drivers
        });
        await newDriver.save();

      } else {

      }
    }

    res.status(201).json({ message: "Staff added successfully", staff: newStaff });
  } catch (error) {
    console.error("❌ Error adding staff:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all staff
exports.getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Assign route to staff
exports.assignTaskToStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const staff = await Staff.findById(staffId);
    if (!staff) return res.status(404).json({ message: "Staff not found" });

    const {
      routeId,
      origin,
      destination,
      vehicle,
      date,
      packageDetails,
      instructions
    } = req.body;

    const existingRoute = await Route.findOne({ routeId });
    if (existingRoute) {
      return res.status(400).json({ message: "Route ID already exists." });
    }

    const newRoute = new Route({
      routeId,
      origin,
      destination,
      vehicle,
      date,
      packageDetails,
      instructions,
      staffId,
      status: "Assigned"
    });

    await newRoute.save();
    res.status(200).json({ message: "Route assigned successfully", route: newRoute });
  } catch (err) {
    console.error("Error assigning task:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all routes assigned to a staff
exports.getAssignedTasks = async (req, res) => {
  try {
    const { id } = req.params;
    const routes = await Route.find({ staffId: id }).populate("staffId", "fullName email baseLocation");
    res.status(200).json({ tasks: routes });
  } catch (err) {
    console.error("Error fetching routes:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update staff
exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Staff.findByIdAndUpdate(id, req.body, { new: true });

    if (!updated) {
      return res.status(404).json({ message: "Staff not found" });
    }

    res.status(200).json({ message: "Staff updated successfully", staff: updated });
  } catch (error) {
    console.error("Error updating staff:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update a route
exports.updateRoute = async (req, res) => {
  try {
    const { routeId } = req.params;
    const existing = await Route.findOne({ routeId });

    if (!existing) {
      return res.status(404).json({ message: "Route not found" });
    }

    const updated = await Route.findOneAndUpdate({ routeId }, req.body, { new: true });
    res.status(200).json({ success: true, message: "Route updated", route: updated });
  } catch (err) {
    console.error("Error updating route:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete a route
exports.deleteRoute = async (req, res) => {
  try {
    const { routeId } = req.params;
    const deleted = await Route.findOneAndDelete({ routeId });

    if (!deleted) {
      return res.status(404).json({ message: "Route not found" });
    }

    res.status(200).json({ message: "Route deleted" });
  } catch (err) {
    console.error("Error deleting route:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete staff
exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Staff.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Staff not found" });
    }

    res.status(200).json({ message: "Staff deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Group all routes by staff fullName
exports.getRoutesGroupedByStaff = async (req, res) => {
  try {
    const grouped = await Route.aggregate([
      {
        $lookup: {
          from: "staffs",
          localField: "staffId",
          foreignField: "_id",
          as: "staffInfo"
        }
      },
      { $unwind: "$staffInfo" },
      {
        $group: {
          _id: {
            staffId: "$staffInfo._id",
            fullName: "$staffInfo.fullName"
          },
          routes: {
            $push: {
              _id: "$_id",
              routeId: "$routeId",
              origin: "$origin",
              destination: "$destination",
              vehicle: "$vehicle",
              date: "$date",
              packageDetails: "$packageDetails",
              instructions: "$instructions",
              status: "$status",
              assignedAt: "$assignedAt"
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          staffId: "$_id.staffId",
          staffName: "$_id.fullName",
          routes: 1
        }
      }
    ]);

    res.status(200).json(grouped);
  } catch (err) {
    console.error("Error grouping routes:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getDriverByRoute = async (req, res) => {
  const { origin, destination } = req.query;

  try {
    const route = await Route.findOne({ origin, destination }).populate({
      path: "staffId",
      select: "fullName role", // Only need name & role from route
    });

    if (!route || !route.staffId) {
      return res.status(404).json({ message: "Route or driver not found" });
    }

    const driverName = route.staffId.fullName;

    // Now match fullName and role in Staff collection
    const staff = await Staff.findOne({ fullName: driverName, role: "Driver" });

    if (!staff) {
      return res.status(404).json({ message: "Driver not found in Staff collection" });
    }

    return res.json({
      driverName: staff.fullName,
      email: staff.email,
      contact: staff.contactInfo,
    });
  } catch (err) {
    console.error("Error getting driver by name and role:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};
// GET /api/staff/driver-by-name?name=John Doe
exports.getDriverByName = async (req, res) => {
  const { name } = req.query;
  try {
    const staff = await Staff.findOne({ fullName: name, role: "Driver" });
    if (!staff) return res.status(404).json({ message: "Driver not found" });

    res.json({
      driverName: staff.fullName,
      email: staff.email,
      contact: staff.contactInfo,
    });
  } catch (err) {
    console.error("Error fetching driver by name:", err);
    res.status(500).json({ message: "Server error" });
  }
};



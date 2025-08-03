import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    applyForLeave,
    updateLeaveStatus,
    getLeaveById,
    getAllLeaves,
    getEmployeeLeaves,
    cancelLeave
} from "../controllers/leaves.controllers.js";

const router = Router();

// Secure all routes with JWT authentication
router.use(verifyJWT);

// Leave routes
router.route("/")
    .post(
        upload.fields([
            {
                name: "attachments",
                maxCount: 1
            }
        ]),
        applyForLeave
    )
    .get(getAllLeaves);

// Get employee's own leaves
router.route("/my-leaves")
    .get(getEmployeeLeaves);

// Individual leave operations
router.route("/:leaveId")
    .get(getLeaveById)
    .patch(updateLeaveStatus)
    .delete(cancelLeave);

export default router;
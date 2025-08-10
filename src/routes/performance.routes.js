import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    createPerformanceReview,
    updatePerformanceStatus,
    getPerformanceById,
    getAllPerformanceReviews,
    getEmployeePerformanceHistory,
    deletePerformanceReview
} from "../controllers/performance.controllers.js";

const router = Router();

// Secure all routes with JWT authentication
router.use(verifyJWT);

// Base performance routes
router.route("/")
    .post(createPerformanceReview)
    .get(getAllPerformanceReviews);

// Employee specific performance history
router.route("/employee/:empId")
    .get(getEmployeePerformanceHistory);

// Individual performance operations
router.route("/:performanceId")
    .get(getPerformanceById)
    .patch(updatePerformanceStatus)
    .delete(deletePerformanceReview);

export default router;
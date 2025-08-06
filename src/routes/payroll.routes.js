import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    generatePayroll,
    updatePayrollStatus,
    getPayrollById,
    getAllPayrolls,
    getEmployeePayrollHistory,
    deletePayroll
} from "../controllers/payroll.controllers.js";

const router = Router();

// Secure all routes with JWT authentication
router.use(verifyJWT);

// Base payroll routes
router.route("/")
    .post(generatePayroll)
    .get(getAllPayrolls);

// Employee specific payroll history
router.route("/employee/:empId")
    .get(getEmployeePayrollHistory);

// Individual payroll operations
router.route("/:payrollId")
    .get(getPayrollById)
    .patch(updatePayrollStatus)
    .delete(deletePayroll);

export default router;
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Payroll } from "../models/payroll.model.js";

const generatePayroll = asyncHandler(async (req, res) => {
    const {
        emp_id,
        basic_salary,
        allowances,
        deductions,
        month,
        year
    } = req.body;

    if (!emp_id || !basic_salary || !month || !year) {
        throw new ApiError(400, "All required fields must be provided");
    }

    // Calculate total salary
    const total_salary = basic_salary + 
        (allowances?.reduce((sum, item) => sum + item.amount, 0) || 0) -
        (deductions?.reduce((sum, item) => sum + item.amount, 0) || 0);

    const payroll = await Payroll.create({
        emp_id,
        basic_salary,
        allowances: allowances || [],
        deductions: deductions || [],
        total_salary,
        month,
        year,
        payment_status: "Pending"
    });

    return res.status(201).json(
        new ApiResponse(201, payroll, "Payroll generated successfully")
    );
});

const updatePayrollStatus = asyncHandler(async (req, res) => {
    const { payrollId } = req.params;
    const { payment_status } = req.body;

    if (!["Pending", "Processing", "Paid", "Failed"].includes(payment_status)) {
        throw new ApiError(400, "Invalid payment status");
    }

    const payroll = await Payroll.findByIdAndUpdate(
        payrollId,
        { $set: { payment_status } },
        { new: true }
    );

    if (!payroll) {
        throw new ApiError(404, "Payroll record not found");
    }

    return res.status(200).json(
        new ApiResponse(200, payroll, "Payment status updated successfully")
    );
});

const getPayrollById = asyncHandler(async (req, res) => {
    const { payrollId } = req.params;

    const payroll = await Payroll.findById(payrollId)
        .populate("emp_id", "emp_name email department");

    if (!payroll) {
        throw new ApiError(404, "Payroll record not found");
    }

    return res.status(200).json(
        new ApiResponse(200, payroll, "Payroll details fetched successfully")
    );
});

const getAllPayrolls = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, month, year, status } = req.query;

    const filter = {};
    if (month) filter.month = month;
    if (year) filter.year = year;
    if (status) filter.payment_status = status;

    const payrolls = await Payroll.aggregate([
        {
            $match: filter
        },
        {
            $lookup: {
                from: "employees",
                localField: "emp_id",
                foreignField: "_id",
                as: "employee"
            }
        },
        {
            $unwind: "$employee"
        }
    ]).skip((page - 1) * limit).limit(parseInt(limit));

    return res.status(200).json(
        new ApiResponse(200, payrolls, "Payrolls fetched successfully")
    );
});

const getEmployeePayrollHistory = asyncHandler(async (req, res) => {
    const { empId } = req.params;
    const { year } = req.query;

    const filter = { emp_id: empId };
    if (year) filter.year = parseInt(year);

    const payrollHistory = await Payroll.find(filter)
        .sort({ year: -1, month: -1 });

    return res.status(200).json(
        new ApiResponse(200, payrollHistory, "Payroll history fetched successfully")
    );
});

const deletePayroll = asyncHandler(async (req, res) => {
    const { payrollId } = req.params;

    const payroll = await Payroll.findById(payrollId);

    if (!payroll) {
        throw new ApiError(404, "Payroll record not found");
    }

    if (payroll.payment_status === "Paid") {
        throw new ApiError(400, "Cannot delete processed payroll");
    }

    await Payroll.findByIdAndDelete(payrollId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Payroll record deleted successfully")
    );
});

export {
    generatePayroll,
    updatePayrollStatus,
    getPayrollById,
    getAllPayrolls,
    getEmployeePayrollHistory,
    deletePayroll
};
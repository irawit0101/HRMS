import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Performance } from "../models/performance.model.js";

const createPerformanceReview = asyncHandler(async (req, res) => {
    const {
        emp_id,
        review_period,
        goals,
        achievements,
        areas_of_improvement,
        rating,
        reviewer_comments
    } = req.body;

    if (!emp_id || !review_period || !rating) {
        throw new ApiError(400, "Required fields missing");
    }

    const performance = await Performance.create({
        emp_id,
        review_period,
        goals: goals || [],
        achievements: achievements || [],
        areas_of_improvement: areas_of_improvement || [],
        rating,
        reviewer_id: req.employee?._id,
        reviewer_comments,
        status: "Pending"
    });

    return res.status(201).json(
        new ApiResponse(201, performance, "Performance review created successfully")
    );
});

const updatePerformanceStatus = asyncHandler(async (req, res) => {
    const { performanceId } = req.params;
    const { status, employee_comments } = req.body;

    if (!["Pending", "Acknowledged", "Disputed"].includes(status)) {
        throw new ApiError(400, "Invalid status");
    }

    const performance = await Performance.findByIdAndUpdate(
        performanceId,
        {
            $set: { 
                status,
                employee_comments,
                acknowledgement_date: status === "Acknowledged" ? Date.now() : null
            }
        },
        { new: true }
    );

    if (!performance) {
        throw new ApiError(404, "Performance review not found");
    }

    return res.status(200).json(
        new ApiResponse(200, performance, "Performance status updated successfully")
    );
});

const getPerformanceById = asyncHandler(async (req, res) => {
    const { performanceId } = req.params;

    const performance = await Performance.findById(performanceId)
        .populate("emp_id", "emp_name email department")
        .populate("reviewer_id", "emp_name position");

    if (!performance) {
        throw new ApiError(404, "Performance review not found");
    }

    return res.status(200).json(
        new ApiResponse(200, performance, "Performance review fetched successfully")
    );
});

const getAllPerformanceReviews = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, period, status } = req.query;

    const filter = {};
    if (period) filter.review_period = period;
    if (status) filter.status = status;

    const performances = await Performance.aggregate([
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
            $lookup: {
                from: "employees",
                localField: "reviewer_id",
                foreignField: "_id",
                as: "reviewer"
            }
        },
        {
            $unwind: "$employee"
        },
        {
            $unwind: "$reviewer"
        }
    ]).skip((page - 1) * limit).limit(parseInt(limit));

    return res.status(200).json(
        new ApiResponse(200, performances, "Performance reviews fetched successfully")
    );
});

const getEmployeePerformanceHistory = asyncHandler(async (req, res) => {
    const { empId } = req.params;
    const { year } = req.query;

    const filter = { emp_id: empId };
    if (year) {
        filter.review_period = { $regex: year };
    }

    const performanceHistory = await Performance.find(filter)
        .populate("reviewer_id", "emp_name position")
        .sort({ review_period: -1 });

    return res.status(200).json(
        new ApiResponse(200, performanceHistory, "Performance history fetched successfully")
    );
});

const deletePerformanceReview = asyncHandler(async (req, res) => {
    const { performanceId } = req.params;

    const performance = await Performance.findById(performanceId);

    if (!performance) {
        throw new ApiError(404, "Performance review not found");
    }

    if (performance.status !== "Pending") {
        throw new ApiError(400, "Cannot delete acknowledged/disputed review");
    }

    await Performance.findByIdAndDelete(performanceId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Performance review deleted successfully")
    );
});

export {
    createPerformanceReview,
    updatePerformanceStatus,
    getPerformanceById,
    getAllPerformanceReviews,
    getEmployeePerformanceHistory,
    deletePerformanceReview
};
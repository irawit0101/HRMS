import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Leaves } from "../models/leaves.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const applyForLeave = asyncHandler(async (req, res) => {
    const {
        leave_type,
        start_date,
        end_date,
        is_paid,
        is_halfday,
        attendance
    } = req.body;

    // Validate required fields
    if (!leave_type || !start_date || !end_date) {
        throw new ApiError(400, "All required fields must be filled");
    }

    // Handle attachments upload
    const attachmentLocalPath = req.files?.attachments[0]?.path;
    if (!attachmentLocalPath) {
        throw new ApiError(400, "Supporting document is required");
    }

    // Upload attachment to Cloudinary
    const attachment = await uploadOnCloudinary(attachmentLocalPath);
    if (!attachment) {
        throw new ApiError(400, "Attachment upload failed");
    }

    // Create leave application
    const leave = await Leaves.create({
        leave_id: Math.floor(Math.random() * 1000000), // Generate unique leave ID
        emp_id: req.employee?._id,
        emp_name: req.employee?.name,
        attendance,
        leave_type,
        start_date: new Date(start_date),
        end_date: new Date(end_date),
        leave_status: "Applied",
        is_paid,
        is_halfday,
        attachments: attachment.url
    });

    return res.status(201).json(
        new ApiResponse(201, leave, "Leave application submitted successfully")
    );
});

const updateLeaveStatus = asyncHandler(async (req, res) => {
    const { leaveId } = req.params;
    const { leave_status } = req.body;

    if (!["Applied", "Under Process", "Approved", "Rejected"].includes(leave_status)) {
        throw new ApiError(400, "Invalid leave status");
    }

    const leave = await Leaves.findByIdAndUpdate(
        leaveId,
        {
            $set: { leave_status }
        },
        { new: true }
    );

    if (!leave) {
        throw new ApiError(404, "Leave application not found");
    }

    return res.status(200).json(
        new ApiResponse(200, leave, "Leave status updated successfully")
    );
});

const getLeaveById = asyncHandler(async (req, res) => {
    const { leaveId } = req.params;

    const leave = await Leaves.findById(leaveId)
        .populate("emp_id", "emp_name email")
        .populate("emp_name", "emp_name");

    if (!leave) {
        throw new ApiError(404, "Leave application not found");
    }

    return res.status(200).json(
        new ApiResponse(200, leave, "Leave details fetched successfully")
    );
});

const getAllLeaves = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, type } = req.query;

    const filter = {};
    if (status) filter.leave_status = status;
    if (type) filter.leave_type = type;

    const leaves = await Leaves.aggregate([
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
        new ApiResponse(200, leaves, "Leaves fetched successfully")
    );
});

const getEmployeeLeaves = asyncHandler(async (req, res) => {
    const empId = req.employee?._id;
    const { year, month } = req.query;

    const filter = { emp_id: empId };
    
    if (year && month) {
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        filter.start_date = { $gte: startDate, $lte: endDate };
    }

    const leaves = await Leaves.find(filter)
        .sort({ start_date: -1 });

    return res.status(200).json(
        new ApiResponse(200, leaves, "Employee leaves fetched successfully")
    );
});

const cancelLeave = asyncHandler(async (req, res) => {
    const { leaveId } = req.params;

    const leave = await Leaves.findById(leaveId);

    if (!leave) {
        throw new ApiError(404, "Leave application not found");
    }

    if (leave.leave_status === "Approved") {
        throw new ApiError(400, "Cannot cancel approved leave");
    }

    const cancelledLeave = await Leaves.findByIdAndDelete(leaveId);

    return res.status(200).json(
        new ApiResponse(200, {}, "Leave cancelled successfully")
    );
});

export {
    applyForLeave,
    updateLeaveStatus,
    getLeaveById,
    getAllLeaves,
    getEmployeeLeaves,
    cancelLeave
};
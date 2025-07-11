import { asyncHandler } from "../utils/asyncHandler.js";


 const registerEmpl = asyncHandler( async (req, res) => {
    res.status(200).json({
        message: "The employee has been registered successfully"
    })
 })

 export { registerEmpl }
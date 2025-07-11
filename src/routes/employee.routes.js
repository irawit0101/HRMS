import {Router} from "express" ;
import { registerEmpl } from "../controllers/employee.controllers.js" ;

const router = Router()


router.route("/register").post(registerEmpl)


export default router
import express from "express"
import { contact, getAdminDashboardStats } from "../controllers/otherController";
import {isAuthenticated,isAuthorizedAdmin} from "../middlewares/isAuthenticated.js"

const router = express.Router()

// Contact form
router
    .route("/contact")
    .post(contact)

// Request form
router
    .route('/courserequest')
    .post(courseRequest)

// Admin dashboard
router
    .route("/admin/stats")
    .get(isAuthenticated, isAuthorizedAdmin, getAdminDashboardStats)

    
export default router;
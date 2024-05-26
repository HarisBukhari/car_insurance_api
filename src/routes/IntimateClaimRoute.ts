import express from "express"
import { createClaimModel, deleteClaimModel, getClaimModelById, getUserClaimModels, } from "../controllers"
import { Authenticate } from "../middlewares"

const router = express.Router()

/* ------------------- Authentication Section --------------------- */
router.use(Authenticate)

// /* ------------------- Profile Section --------------------- */
router.post('/createClaimModel', createClaimModel)
router.get('/:id', getClaimModelById)
router.get('/getUserClaimModels', getUserClaimModels)
router.delete('/:id', deleteClaimModel)


export { router as IntimateClaimRoute }
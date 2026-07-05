import express from "express";

import { getLeadStatuses } from "../controllers/leadStatus.controller.js";

const router = express.Router();

router.get("/", getLeadStatuses);

export default router;
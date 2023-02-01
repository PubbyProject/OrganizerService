import express from "express";
import controller from "../controllers/organizer_controller";

const router = express.Router();

router.get('/organizers', controller.getAllOrganizers);
router.get('/organizers/:id/details', controller.getOrganizerById);
router.post('/organizers', controller.createOrganizer);

export = router;
import { PrismaClient } from "@prisma/client";
import { Request, Response} from 'express';
import OrganizerRepository from "../data/organizer_repository";
import ErrorResponse from "../entities/errors/error_response";
import Organizer from "../entities/models/organizer";
import OrganizerService from "../services/organizer_service";
import RabbitMQProducerService from "../services/messaging/producer_service";
import createMQProducer from "../services/messaging/producer_service";
import ProducerMessage from "../entities/models/producer_message";

const repository = new OrganizerRepository(new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
}));

const service = new OrganizerService(repository);

const getAllOrganizers = async (req: Request, res: Response) => {
    const organizers = await service.fetchAllOrganizers();
    return res.status(200).json({
        body: organizers
    });
}

const getOrganizerById = async (req: Request, res: Response) => {
    const id = req.params.id;
    const organizer = await service.fetchOrganizerById(id);
    if (organizer instanceof ErrorResponse) {
        return res.status(404).json({
            body: organizer.getError()
        });
    }

    const message: ProducerMessage = {
        organizerId: id
    };
    
    const rabbitProducer = createMQProducer(String(process.env.RABBITMQ_URL), "fetch-organizer-events-request-queue");
    console.log(`Message controller: ${message.organizerId}`)
    rabbitProducer(JSON.stringify(message));

    return res.status(200).json({
        body: organizer
    });
}

const createOrganizer = async (req: Request, res: Response) => {
    const newOrganizer = req.body as Organizer;
    const result = await service.createOrganizer(newOrganizer);
    if(result instanceof ErrorResponse) {
        return res.status(400).json({
            body: result.getError()
        });
    }

    return res.status(201).json({
        body: result
    });
}

export default {getAllOrganizers, getOrganizerById, createOrganizer}
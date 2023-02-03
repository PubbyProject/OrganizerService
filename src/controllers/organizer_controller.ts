import { PrismaClient } from "@prisma/client";
import { Request, Response} from 'express';
import OrganizerRepository from "../data/organizer_repository";
import ErrorResponse from "../entities/errors/error_response";
import MalformedIdError from "../entities/errors/malformed_id";
import OrganizerNotFoundError from "../entities/errors/not_found";
import Organizer from "../entities/models/organizer";
import OrganizerService from "../services/organizer_service";
import RequestMessage from "../entities/models/request_message";
import RabbitMQProducer from "../services/messaging/producer_service";

const repository = new OrganizerRepository(new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
}));

const service = new OrganizerService(repository);

const producer = new RabbitMQProducer(String(process.env.RABBITMQ_URL), 'fetch-organizer-events-request-queue');

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

    const message: RequestMessage = {
        organizerId: id
    };

    let connection = producer.CreateConnection();
    producer.ProduceMessage(connection, message);

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

const deleteOrganizer = async(req: Request, res: Response) => {
    const organizerId = req.params.id;
    const result = await service.deleteOrganizer(organizerId);
    if (result instanceof MalformedIdError) {
        return res.status(400).json({
            body: result.getError()
        });
    } 
    else if (result instanceof OrganizerNotFoundError) {
        return res.status(404).json({
            body: result.getError()
        })
    }

    return res.status(200).json({
        body: 'Successfully deleted the organizer.'
    });
}

const updateOrganizer = async(req: Request, res: Response) => {
    const organizerId = req.params.id;
    const updatedOrganizerInfo = req.body as Organizer;
    const result = await service.updateOrganizer(organizerId, updatedOrganizerInfo);
    if (result instanceof MalformedIdError) {
        return res.status(400).json({
            body: result.getError()
        });
    } 
    else if (result instanceof OrganizerNotFoundError) {
        return res.status(404).json({
            body: result.getError()
        })
    }

    return res.status(200).json({
        body: result
    });
}

export default {getAllOrganizers, getOrganizerById, createOrganizer, deleteOrganizer, updateOrganizer}
import { PrismaClient } from "@prisma/client";
import { Request, Response} from 'express';
import OrganizerRepository from "../data/organizer_repository";
import ErrorResponse from "../entities/errors/error_response";
import MalformedIdError from "../entities/errors/malformed_id";
import OrganizerNotFoundError from "../entities/errors/not_found";
import Organizer from "../entities/models/organizer";
import OrganizerService from "../services/organizer_service";
import RequestMessage from "../entities/models/request_message";
import RabbitMQService from "../services/messaging/rabbitmq_service";
import OrganizerViewModel from "../entities/view_models/organizer_view_model";
import EventInfoViewModel from "../entities/view_models/event_info_viewmodel";

const repository = new OrganizerRepository(new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL
        }
    }
}));

const service = new OrganizerService(repository);

const producer = new RabbitMQService(String(process.env.RABBITMQ_URL));

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
    let events = await producer.ProduceMessage(connection, message);
    let eventList: EventInfoViewModel[] = new Array();
    events.forEach(event => {
        let viewModel: EventInfoViewModel = {
            id: event.id,
            name: event.name,
            startTime: event.startTime,
            endTime: event.endTime,
            entryPrice: event.entryPrice
        };
        eventList.push(viewModel)
    });
    let organizerViewModel: OrganizerViewModel = {
        id: organizer.id,
        name: organizer.name,
        address: organizer.address,
        email: organizer.email,
        hostType: organizer.hostType,
        bio: organizer.bio,
        events: eventList
    };

    return res.status(200).json({
        body: organizerViewModel
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
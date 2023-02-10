import { PrismaClientKnownRequestError } from "@prisma/client/runtime";
import { Inject } from "typedi";
import { Service } from "typedi";
import OrganizerRepository from "../data/organizer_repository";
import ErrorResponse from "../entities/errors/error_response";
import MalformedIdError from "../entities/errors/malformed_id";
import OrganizerNotFoundError from "../entities/errors/not_found";
import Organizer from "../entities/models/organizer";
import validateProperties from "../helpers/prop_validator";

@Service()
export default class OrganizerService {
    private repository: OrganizerRepository;

    constructor(@Inject() repository: OrganizerRepository) {
        this.repository = repository;
    }

    public async fetchAllOrganizers() {
        const organizers = await this.repository.getAllOrganizers();
        return organizers;
    }

    public async fetchOrganizerById(organizerId: string) {
      const organizer = await this.repository.getOrganizerById(organizerId).catch(async (e: PrismaClientKnownRequestError) => {
        return new MalformedIdError('Malformed request ID. Please use a valid ID');
      });
      if (organizer === null) {
        return new OrganizerNotFoundError('Organizer with this ID not found');
      }

      return organizer;
    }

    public async createOrganizer(organizer: Organizer) {
        const hasEmptyProperties = await validateProperties(organizer);
      
      if (hasEmptyProperties) {
        return new ErrorResponse('This event has one or more empty fields. Please fill in all fields.');
      }

      const newOrganizer = await this.repository.createOrganizer(organizer);
      if (newOrganizer instanceof Error) {
        return new ErrorResponse(newOrganizer.message);
      }

      return newOrganizer;
    }

    public async deleteOrganizer(organizerId: string) {
      const existingOrganizer = await this.fetchOrganizerById(organizerId);
      if (existingOrganizer instanceof MalformedIdError || existingOrganizer instanceof OrganizerNotFoundError) {
        return existingOrganizer;
      }

      const result = this.repository.deleteOrganizer(organizerId);
      if (result instanceof Error) {
        return new ErrorResponse(result.message);
      }

      return result;
    }

    public async updateOrganizer(organizerId: string, organizer: Organizer) {
      const existingOrganizer = await this.fetchOrganizerById(organizerId);
      if (existingOrganizer instanceof MalformedIdError || existingOrganizer instanceof OrganizerNotFoundError) {
        return existingOrganizer;
      }

      const updatedOrganizer = await this.repository.updateOrganizer(organizerId, organizer);
      if (updatedOrganizer instanceof Error) {
        return new ErrorResponse(updatedOrganizer.message)
      }

      return updatedOrganizer;
    }
}
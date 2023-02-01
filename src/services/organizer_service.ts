import OrganizerRepository from "../data/organizer_repository";
import ErrorResponse from "../entities/errors/error_response";
import Organizer from "../entities/models/organizer";
import validateProperties from "../helpers/prop_validator";

export default class OrganizerService {
    private repository: OrganizerRepository;

    constructor(repository: OrganizerRepository) {
        this.repository = repository;
    }

    public async fetchAllOrganizers() {
        const organizers = await this.repository.getAllOrganizers();
        return organizers;
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
}
import Organizer from "../entities/models/organizer";

const validateProperties = async (organizer: Organizer) => {
    return Object.entries(organizer)
    .filter(([key, value]) => key !== 'id' && key !== 'events' && key !== 'bio' && (value === null || value === ''))
    .length > 0;
}

export default validateProperties;
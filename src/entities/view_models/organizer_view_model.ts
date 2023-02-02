import EventInfo from "../models/event_info"

interface OrganizerViewModel {
    id: string
    name: string
    address: string
    email: string
    hostType: string
    bio: string
    events: EventInfo[]
}

export default OrganizerViewModel;
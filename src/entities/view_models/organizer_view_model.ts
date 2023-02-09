import EventInfoViewModel from "./event_info_viewmodel"

interface OrganizerViewModel {
    id: string
    name: string
    address: string
    email: string
    hostType: string
    bio: string
    events?: EventInfoViewModel[]
}

export default OrganizerViewModel;
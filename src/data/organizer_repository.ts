import { PrismaClient } from "@prisma/client";
import Organizer from "../entities/models/organizer";

export default class OrganizerRepository {
    private prisma: PrismaClient

    constructor(prisma: PrismaClient) {
        this.prisma =  prisma
    }

    public async getAllOrganizers() {
        await this.prisma.$connect();
        const organizers = await this.prisma.organizer.findMany() as Organizer[];
        await this.prisma.$disconnect();

        return organizers;
    }

    public async getOrganizerById(organizerId: string) {
        await this.prisma.$connect();
        const organizer = await this.prisma.organizer.findUnique({
            where: {
                id: organizerId
            }
        });

        await this.prisma.$disconnect();
        return organizer;
    }

    public async createOrganizer(organizer: Organizer) {
        await this.prisma.$connect();
        const result = await this.prisma.organizer.create({
            data: organizer
        })
        .then(async () => {
            await this.prisma.$disconnect();
            return organizer;
        })
        .catch(async (error: Error) => {
            await this.prisma.$disconnect();
            return error;
        });

        return result;
    }
}
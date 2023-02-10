import { PrismaClient } from "@prisma/client";
import { Inject } from "typedi";
import { Service } from "typedi";
import Organizer from "../entities/models/organizer";

@Service()
export default class OrganizerRepository {
    private prisma: PrismaClient

    constructor(@Inject() prisma: PrismaClient) {
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

    public async deleteOrganizer(organizerId: string) {
        await this.prisma.$connect();
        const result = await this.prisma.organizer.delete({
            where: {
                id: organizerId
            }
        })
        .then(async () => {
            await this.prisma.$disconnect();
            return organizerId;
        })
        .catch(async (e: Error) => {
            await this.prisma.$disconnect();
            return e;
        });

        return result;
    }

    public async updateOrganizer(organizerId: string, organizer: Organizer) {
        await this.prisma.$connect();

        const result = await this.prisma.organizer.update({
            where: {
                id: organizerId
            },
            data: {
                name: organizer.name || undefined,
                address: organizer.address || undefined,
                email: organizer.email || undefined,
                hostType: organizer.hostType || undefined,
                bio: organizer.bio || undefined
            }
        })
        .then(async() => {
            await this.prisma.$disconnect();
            return organizer;
        })
        .catch(async (e: Error) => {
            return e;
        });

        return result;
    }
}
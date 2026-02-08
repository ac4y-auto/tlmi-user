var { PrismaClient } = require('@prisma/client');

var prisma = new PrismaClient();

class TranslateUserPrismaAdapter {

    async getAll() {
        return await prisma.translateUser.findMany();
    }

    async getById(id) {
        return await prisma.translateUser.findUnique({ where: { id: parseInt(id) } });
    }

    async getByName(name) {
        return await prisma.translateUser.findFirst({ where: { name: name } });
    }

    async existsById(id) {
        var result = await prisma.translateUser.findUnique({ where: { id: parseInt(id) } });
        return result != null;
    }

    async existsByName(name) {
        var result = await prisma.translateUser.findFirst({ where: { name: name } });
        return result != null;
    }

    async insert(data) {
        return await prisma.translateUser.create({ data: data });
    }

    async update(id, data) {
        return await prisma.translateUser.update({
            where: { id: parseInt(id) },
            data: data
        });
    }

    async deleteById(id) {
        return await prisma.translateUser.delete({ where: { id: parseInt(id) } });
    }

    async disconnect() {
        await prisma.$disconnect();
    }

} // TranslateUserPrismaAdapter

module.exports = TranslateUserPrismaAdapter;

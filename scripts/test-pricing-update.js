const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function test() {
    try {
        console.log("Testing pricing update...");
        const result = await prisma.pricing.update({
            where: { id: "singleton" },
            data: {
                inrNormal40: 1000,
                inrUrgent40: 2000,
            }
        });
        console.log("Update successful:", result);
    } catch (error) {
        console.error("Update failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

test();

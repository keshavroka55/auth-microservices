import prisma from "../../prisma.js";

const ROLES = ["food_lover", "chef", "admin"];

// NEVER return password, tokens, or reset fields, even to another service.
const safeUserSelect = {
    id: true,
    name: true,
    email: true,
    role: true,
    avatar: true,
    emailVerified: true,
    createdAt: true,
};

export const listUsers = async (req, res) => {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const { search, role } = req.query;

    if (role && !ROLES.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
    }

    const where = {
        ...(role && { role }),
        ...(search && {
            OR: [
                { name: { contains: String(search), mode: "insensitive" } },
                { email: { contains: String(search), mode: "insensitive" } },
            ],
        }),
    };

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: safeUserSelect,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.user.count({ where }),
    ]);

    res.json({ users, page, limit, total });
};

export const getUser = async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: safeUserSelect,
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
};

export const updateUserRole = async (req, res) => {
    const { role } = req.body ?? {};
    if (!ROLES.includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
    }

    const existing = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: { role: true },
    });
    if (!existing) return res.status(404).json({ message: "User not found" });

    // One transaction: change the role AND kill every refresh token for that user.
    // Their current access token still carries the old role for up to 15 minutes,
    // but they cannot get a new one without logging in again.
    const [user] = await prisma.$transaction([
        prisma.user.update({
            where: { id: req.params.id },
            data: { role },
            select: safeUserSelect,
        }),
        prisma.refreshToken.deleteMany({ where: { userId: req.params.id } }),
    ]);

    res.json({ user, previousRole: existing.role });
};

export const revokeSessions = async (req, res) => {
    const exists = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: { id: true },
    });
    if (!exists) return res.status(404).json({ message: "User not found" });

    const { count } = await prisma.refreshToken.deleteMany({ where: { userId: req.params.id } });
    res.json({ revokedCount: count });
};

import { createUser, getUser, getAll, deleteUser, getUserMoney } from "../../db/prisma.js";

export const getUsers_handler = async (req, res) => {
    try {
        await getAll(req, res);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getUserById_handler = async (req, res) => {
    try {
        const { id } = req.params;
        await getUser(req, res, id);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const insertUser_handler = async (req, res) => {
    try {
        const { id } = req.params;
        await createUser(req, res, id);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const deleteUserById_handler = async (req, res) => {
    try {
        const { id } = req.params;
        await deleteUser(req, res, id);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

export const getUserMoney_handler = async (req, res) => {
    try {
        const { id } = req.params;
        await getUserMoney(req, res, id)
    } catch {
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

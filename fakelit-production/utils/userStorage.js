// Shared in-memory user storage for testing (replace with database in production)
const users = new Map();
let nextUserId = 1;

// JWT secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// User storage functions
const createUser = (userData) => {
    const userId = nextUserId++;
    const user = {
        id: userId,
        ...userData,
        status: 'active',
        emailVerified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLogin: null
    };
    users.set(userId, user);
    return user;
};

const findUserByEmail = (email) => {
    for (const user of users.values()) {
        if (user.email === email) {
            return user;
        }
    }
    return null;
};

const findUserById = (id) => {
    return users.get(id) || null;
};

const updateUser = (id, updates) => {
    const user = users.get(id);
    if (user) {
        Object.assign(user, updates, { updatedAt: new Date().toISOString() });
        users.set(id, user);
        return user;
    }
    return null;
};

const getAllUsers = () => {
    return Array.from(users.values());
};

const deleteUser = (id) => {
    return users.delete(id);
};

module.exports = {
    users,
    JWT_SECRET,
    createUser,
    findUserByEmail,
    findUserById,
    updateUser,
    getAllUsers,
    deleteUser
}; 
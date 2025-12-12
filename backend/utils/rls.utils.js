import { sequelize } from '../config/db.js';

/**
 * Executes a callback within a transaction that has RLS context set.
 * @param {number} userId - The ID of the user to impersonate.
 * @param {function} callback - The function to execute. Receives the transaction object.
 * @returns {Promise<any>} - The result of the callback.
 */
export async function withRLS(userId, callback) {
    return await sequelize.transaction(async (t) => {
        // Switch to the restricted role
        await sequelize.query(`SET LOCAL ROLE app_rls_user`, { transaction: t });

        // Set the current user ID session variable
        await sequelize.query(`SET LOCAL app.current_user_id = '${userId}'`, { transaction: t });

        // Execute the business logic
        return await callback(t);
    });
}

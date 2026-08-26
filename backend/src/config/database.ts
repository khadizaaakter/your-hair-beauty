import mysql from 'mysql2/promise';
import { config } from './index';

// Create connection pool
export const pool = mysql.createPool({
    host: config.db.host,
    port: config.db.port,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

// Test connection
export async function testConnection(): Promise<boolean> {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}

// Execute query helper
export async function query<T>(sql: string, params?: any[]): Promise<T> {
    const [rows] = await pool.execute(sql, params);
    return rows as T;
}

export default pool;

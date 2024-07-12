import mongoose from 'mongoose';

type ConnectionObject = {
    isConnected?: number;
};
//isConnected is optional, but if it is there it should be in number format


const connection: ConnectionObject = {};

//void means I dont care about what type of data is returning from function 
async function dbConnect(): Promise<void> {
    // Check if we have a connection to the database or if it's currently connecting
    if (connection.isConnected) {
        console.log('Already connected to the database');
        return;
    }

    try {
        // Attempt to connect to the database
        const db = await mongoose.connect(process.env.MONGODB_URI || '', {});

        connection.isConnected = db.connections[0].readyState;

        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);

        // Graceful exit in case of a connection error
        process.exit(1);
    }
}

export default dbConnect;

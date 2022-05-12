import { connect } from 'mongoose';

const connectDatabase = async () => {
    try {
        await connect(process.env.DATABASE_URI ?? '');
    } catch (err) {
        console.error(err);
    }
}

export default connectDatabase

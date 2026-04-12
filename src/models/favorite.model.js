import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }, 
    movieId: {
        type: Number,
        required: true
    }, 
    title: String,
    poster_path: String,
    vote_average: Number,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

favoriteSchema.index(
    { userId: 1, movieId: 1 },
    { unique: true }
);

export default mongoose.model('Favorite', favoriteSchema);
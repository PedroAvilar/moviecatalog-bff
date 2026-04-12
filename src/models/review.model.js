import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    movieId: {
        type: Number,
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 10
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    }
}, { timestamps: true });

reviewSchema.index(
    { movieId: 1, userId: 1 }, 
    { unique: true }
);

reviewSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
    }
});

export default mongoose.model('Review', reviewSchema);
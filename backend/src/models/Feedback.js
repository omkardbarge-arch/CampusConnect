import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  category: { type: String, required: true, enum: ['Academics', 'Campus Facilities', 'Events', 'Technology', 'Other'] },
  rating: { type: Number, required: true, min: 1, max: 5 },
  message: { type: String, required: true, trim: true, minlength: 10, maxlength: 1000 }
}, { timestamps: true, versionKey: false });

export default mongoose.model('Feedback', feedbackSchema);

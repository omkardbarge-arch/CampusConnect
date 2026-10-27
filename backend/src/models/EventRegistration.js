import mongoose from 'mongoose';

const eventRegistrationSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  rollNumber: { type: String, required: true, trim: true, uppercase: true, minlength: 3, maxlength: 20 },
  eventName: { type: String, required: true, enum: ['Tech Talk', 'Web Development Workshop', 'Campus Hackathon', 'Cultural Fest'] },
  participationType: { type: String, required: true, enum: ['Participant', 'Volunteer'] }
}, { timestamps: true, versionKey: false });

eventRegistrationSchema.index({ email: 1, eventName: 1 }, { unique: true });

export default mongoose.model('EventRegistration', eventRegistrationSchema);

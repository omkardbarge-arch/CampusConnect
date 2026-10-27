import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254, unique: true },
  rollNumber: { type: String, required: true, trim: true, uppercase: true, minlength: 3, maxlength: 20, unique: true },
  department: { type: String, required: true, enum: ['Computer Engineering', 'Information Technology', 'Electronics and Telecommunication', 'Mechanical Engineering', 'Civil Engineering', 'Other'] },
  year: { type: Number, required: true, min: 1, max: 4 },
  phone: { type: String, required: true, match: /^[6-9]\d{9}$/ }
}, { timestamps: true, versionKey: false });

export default mongoose.model('Student', studentSchema);

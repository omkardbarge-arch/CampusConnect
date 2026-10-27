import { Router } from 'express';
import Student from '../models/Student.js';
import EventRegistration from '../models/EventRegistration.js';
import Feedback from '../models/Feedback.js';

const router = Router();

const departments = new Set([
  'Computer Engineering',
  'Information Technology',
  'Electronics and Telecommunication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Other'
]);
const events = new Set(['Tech Talk', 'Web Development Workshop', 'Campus Hackathon', 'Cultural Fest']);
const categories = new Set(['Academics', 'Campus Facilities', 'Events', 'Technology', 'Other']);
const participationTypes = new Set(['Participant', 'Volunteer']);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const rollPattern = /^[a-zA-Z0-9/-]{3,20}$/;
const phonePattern = /^[6-9]\d{9}$/;
const namePattern = /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]{1,79}$/u;

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function validateCommon(body, withPhone = false) {
  const fullName = text(body.fullName);
  const email = text(body.email).toLowerCase();
  const rollNumber = text(body.rollNumber).toUpperCase();
  const errors = {};

  if (!namePattern.test(fullName)) errors.fullName = 'Enter a valid name (2–80 characters).';
  if (email.length > 254 || !emailPattern.test(email)) errors.email = 'Enter a valid email address.';
  if (!rollPattern.test(rollNumber)) errors.rollNumber = 'Roll number must be 3–20 letters, numbers, / or -.';

  const result = { fullName, email, rollNumber, errors };
  if (withPhone) {
    const phone = text(body.phone);
    if (!phonePattern.test(phone)) errors.phone = 'Enter a valid 10-digit Indian mobile number.';
    result.phone = phone;
  }
  return result;
}

router.post('/students', async (req, res, next) => {
  try {
    const data = validateCommon(req.body, true);
    const department = text(req.body.department);
    const year = Number(req.body.year);

    if (!departments.has(department)) data.errors.department = 'Choose a valid department.';
    if (![1, 2, 3, 4].includes(year)) data.errors.year = 'Choose a valid academic year.';
    if (Object.keys(data.errors).length) {
      return res.status(400).json({ message: 'Please correct the highlighted fields.', errors: data.errors });
    }

    const student = await Student.create({
      fullName: data.fullName,
      email: data.email,
      rollNumber: data.rollNumber,
      phone: data.phone,
      department,
      year
    });
    return res.status(201).json({ message: 'Student registration completed successfully.', id: student.id });
  } catch (error) {
    if (error?.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0];
      const message = field === 'rollNumber'
        ? 'That roll number is already registered.'
        : 'That email address is already registered.';
      return res.status(409).json({ message });
    }
    next(error);
  }
});

router.post('/events', async (req, res, next) => {
  try {
    const data = validateCommon(req.body);
    const eventName = text(req.body.eventName);
    const participationType = text(req.body.participationType);

    if (!events.has(eventName)) data.errors.eventName = 'Choose a valid event.';
    if (!participationTypes.has(participationType)) data.errors.participationType = 'Choose participant or volunteer.';
    if (Object.keys(data.errors).length) {
      return res.status(400).json({ message: 'Please correct the highlighted fields.', errors: data.errors });
    }

    const registration = await EventRegistration.create({
      fullName: data.fullName,
      email: data.email,
      rollNumber: data.rollNumber,
      eventName,
      participationType
    });
    return res.status(201).json({ message: `You're registered for ${eventName}.`, id: registration.id });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'This email is already registered for that event.' });
    }
    next(error);
  }
});

router.post('/feedback', async (req, res, next) => {
  try {
    const fullName = text(req.body.fullName);
    const email = text(req.body.email).toLowerCase();
    const category = text(req.body.category);
    const rating = Number(req.body.rating);
    const message = text(req.body.message);
    const errors = {};

    if (!namePattern.test(fullName)) errors.fullName = 'Enter a valid name (2–80 characters).';
    if (email.length > 254 || !emailPattern.test(email)) errors.email = 'Enter a valid email address.';
    if (!categories.has(category)) errors.category = 'Choose a feedback category.';
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.rating = 'Choose a rating from 1 to 5.';
    if (message.length < 10 || message.length > 1000) errors.message = 'Message must be 10–1000 characters.';

    if (Object.keys(errors).length) {
      return res.status(400).json({ message: 'Please correct the highlighted fields.', errors });
    }

    const feedback = await Feedback.create({ fullName, email, category, rating, message });
    return res.status(201).json({ message: 'Thank you. Your feedback has been submitted.', id: feedback.id });
  } catch (error) {
    next(error);
  }
});

export default router;

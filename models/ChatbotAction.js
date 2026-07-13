const mongoose = require('mongoose');

const FavoriteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String },
  ngoId: { type: String, required: true },
  ngoName: { type: String },
  date: { type: Date, default: Date.now }
});

const VisitSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String },
  ngoId: { type: String, required: true },
  ngoName: { type: String },
  date: { type: String },
  status: { type: String, default: 'Pending' }
});

const PledgeSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String },
  ngoId: { type: String, required: true },
  ngoName: { type: String },
  itemsDescription: { type: String },
  date: { type: Date, default: Date.now }
});

const CallbackSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String },
  ngoId: { type: String, required: true },
  ngoName: { type: String },
  phoneNumber: { type: String },
  date: { type: Date, default: Date.now }
});

const Favorite = mongoose.model('Favorite', FavoriteSchema);
const Visit = mongoose.model('Visit', VisitSchema);
const Pledge = mongoose.model('Pledge', PledgeSchema);
const Callback = mongoose.model('Callback', CallbackSchema);

module.exports = { Favorite, Visit, Pledge, Callback };

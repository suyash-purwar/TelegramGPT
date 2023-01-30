import mongoose from 'mongoose';

const Users = mongoose.model('Users', new mongoose.Schema({
  telegram_id: {
    type: Number,
    required: true,
  },
  is_active: {
    type: Boolean,
    default: true,
    required: true,
  },
  account_type: {
    type: String,
    enum: ['basic', 'premium'],
    default: 'basic',
    required: true,
  },
  basic_quota: {
    text: {
      type: Number,
      default: 15,
    },
    image: {
      type: Number,
      default: 5
    },
  },
  openai_api_token: {
    type: String,
    trim: true,
  },
  account_type_update_time: {
    type: Date
  },
  account_deactivation_time: {
    type: Date
  }
}, {
  versionKey: false,
}));

export default Users;
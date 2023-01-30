import mongoose from 'mongoose';

const Analytics = mongoose.model('Analytics', new mongoose.Schema({
  telegram_id: {
    type: Number,
    required: true,
  },
  records: [
    {
      sentAt: {
        type: Date,
        required: true
      },
      msg_type: {
        type: String,
        enum: ['text', 'image'],
        required: true
      },
      api_tokens_used: Number,
      account_type: {
        type: String,
        enum: ['basic', 'premium'],
        required: true
      }
    }
  ],
  avg_msg_day: Number,
  total_tokens_used: Number,
  total_msgs_sent: Number
}));

export default Analytics;
import { io, userSockets } from '../server';
import { User } from '../models/User';

export const sendUserUpdate = async (userId: string) => {
  const socketId = userSockets.get(userId);
  console.log(socketId);
  if (!socketId) return;

  const user = await User.findById(userId);
  if (!user) return;

  io.to(socketId).emit('user:update', {
    type: 'EMAIL_VERIFIED',
    data: {
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      email_verified: user.email_verified,
      profile_picture: user.profile_picture,
      preferences: user.preferences,
      educational_level: user.educational_level,
      created_at: user.created_at,
    },
  });
};

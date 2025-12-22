const Profile = require('../models/Profile');
const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/profile/me
// @access  Private
const getProfile = async (req, res) => {
  try {
    console.log('📍 getProfile - req.user:', req.user?._id || 'NO USER');
    const profile = await Profile.findOne({ user: req.user._id }).populate('user', ['role']);
    if (!profile) {
      console.log('❌ Profile not found for user:', req.user._id);
      return res.status(404).json({ msg: 'Profile not found' });
    }
    console.log('✅ Profile found:', profile);
    res.json(profile);
  } catch (err) {
    console.error('❌ getProfile error:', err.message);
    res.status(500).send('Server Error');
  }
};

// @desc    Create or update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
  const { name, email, bio, skills, goals, socialLinks, profilePic } = req.body;

  const profileFields = {};
  if (name) profileFields.name = name;
  if (email) profileFields.email = email;
  if (bio) profileFields.bio = bio;
  if (skills) {
    if (typeof skills === 'string') {
      profileFields.skills = skills.split(',').map(skill => skill.trim());
    } else {
      profileFields.skills = skills;
    }
  }
  if (goals) profileFields.goals = goals;
  if (socialLinks) profileFields.socialLinks = socialLinks;
  if (profilePic) profileFields.profilePic = profilePic;

  try {
    let profile = await Profile.findOne({ user: req.user._id });
    const user = await User.findById(req.user._id);

    if (profile) {
      // Update
      profile = await Profile.findOneAndUpdate(
        { user: req.user._id },
        { $set: profileFields },
        { new: true }
      );
      return res.json(profile);
    }

    // Create
    profile = new Profile({
      user: req.user._id,
      role: user.role,
      ...profileFields
    });

    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getProfile,
  updateProfile,
};

const Profile = require('../models/Profile');
const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/profile/me
// @access  Private
const getProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', ['role']);
    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
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
    let profile = await Profile.findOne({ user: req.user.id });
    const user = await User.findById(req.user.id);

    if (profile) {
      // Update
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: profileFields },
        { new: true }
      );
      return res.json(profile);
    }

    // Create
    profile = new Profile({
      user: req.user.id,
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

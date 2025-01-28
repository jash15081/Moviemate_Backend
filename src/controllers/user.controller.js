import {User} from "../models/user.model.js";

// Register or Login a User (via email or Google)
const registerOrLoginUser = async (req, res) => {
  try {
    console.log(req.body);

    
    const { google_id, email, username, password, profile_url, role } = req.body;

    let user;
    if (google_id) {
      // If the user is logging in with Google
      user = await User.findOne({ google_id });
      if (!user) {
        // If the user does not exist, create a new one
        user = new User({
          google_id,
          email,
          username,
          profile_url,
          password: null, // No password for Google login
          role, // Add role if provided
        });
        await user.save();
      }
    } else if (email) {
      // If the user is logging in with email and password
      user = await User.findOne({ email });
      if (!user) {
        // If the user doesn't exist, create a new one
        user = new User({
          email,
          username,
          profile_url,
          password,
          role, // Add role if provided
        });
        await user.save();
      } else {
        // Validate password (only for email login)
        const isPasswordValid = await user.isValidPassword(password);
        if (!isPasswordValid) {
          return res.status(401).json({ error: "Invalid password" });
        }
      }
    }

    // Send a response with the user data
    res.status(200).json({
      user: {
        username: user.username,
        email: user.email,
        profile_url: user.profile_url,
        role: user.role, // Include role in the response
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get User details
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update User details
const updateUser = async (req, res) => {
  try {
    const { username, email, profile_url, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, profile_url, role },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Change User password
const changeCurrentPassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await user.isValidPassword(current_password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    user.password = new_password; // Hash the new password before saving
    await user.save();
    
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export {
  registerOrLoginUser,
  getUser,
  updateUser,
  deleteUser,
  changeCurrentPassword,
};

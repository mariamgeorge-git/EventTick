const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters long"],
    maxlength: [50, "Name cannot exceed 50 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    index: true
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters long"],
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'standard_user', 'event_organizer'],
    default: 'standard_user'
  },
  age: {
    type: Number,
    min: [18, "Age must be at least 18"],
    max: [100, "Age must be less than 100"],
    required: [true, "Age is required"]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // MFA fields
  mfaEnabled: {
    type: Boolean,
    default: false,
    index: true
  },
  mfaSecret: {
    type: String,
    select: false
  },
  mfaCode: {
    type: String,
    default: null
  },
  mfaCodeExpires: {
    type: Date,
    default: null
  },
  mfaSetupCode: {
    type: String,
    default: null
  },
  mfaSetupCodeExpires: {
    type: Date,
    default: null
  },
  verificationCode: {
    code: String,
    expiresAt: Date
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add index for MFA fields
userSchema.index({ mfaCode: 1, mfaCodeExpires: 1 });

userSchema.pre("save", async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  this.updatedAt = Date.now();
  next();
});

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verificationCode;
  delete obj.mfaCode;
  delete obj.mfaCodeExpires;
  delete obj.mfaSecret;
  return obj;
};

userSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) {
    throw new Error('Password field not selected');
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

// Add method to validate MFA code
userSchema.methods.validateMfaCode = function (code) {
  console.log('Validating MFA code:', {
    providedCode: code,
    storedCode: this.mfaCode,
    expires: this.mfaCodeExpires,
    now: new Date()
  });
  
  if (!this.mfaCode || !this.mfaCodeExpires) {
    console.log('No MFA code or expiry found');
    return false;
  }

  if (new Date() > this.mfaCodeExpires) {
    console.log('MFA code has expired');
    return false;
  }

  return this.mfaCode === code;
};

module.exports = mongoose.model('User', userSchema);
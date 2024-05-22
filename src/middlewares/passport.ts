import passport from 'passport'
import GoogleStrategy from 'passport-google-oauth2'
import { User } from '../models'
import FacebookStrategy from 'passport-facebook'
import AppleStrategy from 'passport-apple'
import { BadRequestError, CustomError } from '../error'
import { generateOtop, generateRandomPassword, generateSalt, hashPassword } from '../utilities'

function SD() {
  passport.serializeUser(function (user, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user, done) {
    done(null, user);
  })
}

const createUser = async (body: any) => {
  try {
    const salt = await generateSalt()
    const password = await hashPassword(generateRandomPassword(), salt)
    const { otp, otp_expiry } = generateOtop()
    const newUser = new User({
      email: body.email || '',
      password: password,
      salt: salt,
      phone: "",
      otp: otp,
      otp_expiry: otp_expiry,
      firstName: body.firstName || '',
      lastName: body.lastName || '',
      address: "",
      verified: false,
      provider: body.provider || '',
      facebookId: body.id || '',
      lat: 0,
      lng: 0
    })
    await newUser.save()
    return newUser
  } catch (err) {
    if (err instanceof BadRequestError) {
        throw err
    }
    throw new CustomError('An unexpected error occurred', 'Middlewares/Passport/createUser')
}
}

// Configure Google OAuth
passport.use(new GoogleStrategy.Strategy({
  clientID: process.env.clientID,
  clientSecret: process.env.clientSecret,
  callbackURL: '/auth/google/callback',
  scope: ['profile', 'email']
},
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check for existing user or create new
      const existingUser = await User.findOne({ email: profile.emails[0].value })
      if (existingUser) {
        SD()
        return done(null, existingUser);
      }
      console.log(profile)
      const body = {
        email: profile.emails[0].value,
        firstName: profile.given_name,
        lastName: profile.family_name,
        provider: profile.provider
      }
      const newUser = await createUser(body)
      SD()
      return done(null, newUser)
    } catch (error) {
      console.error('Error during Google authentication:', error);
      return done(error);
    }
  })
)

// Configure Facebook OAuth
passport.use(
  new FacebookStrategy.Strategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'emails', 'photos'], // Request User profile details
  },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check for existing user or create new
        console.log(profile)
        const existingUser = await User.findOne({ facebookId: profile.id })
        if (existingUser) {
          SD()
          return done(null, existingUser);
        }
        const body = {
          facebookId: profile.id,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          provider: profile.provider
        }
        const newUser = await createUser(body)
        SD()
        return done(null, newUser)
      } catch (error) {
        console.error('Error during Facebook OAuth:', error)
        return done(error, false) // Handle errors appropriately
      }
    })
)

// Configure Apple OAuth
// passport.use(
//     new AppleStrategy({
//       clientID: process.env.APPLE_CLIENT_ID,
//       teamID: process.env.APPLE_CLIENT_TEAM_ID,
//       callbackURL: '/auth/apple/callback',
//       keyID: process.env.APPLE_PUBLIC_KEY_ID, // Assuming using public key
//       privateKeyLocation: '', // Only needed for private key flow (optional)
//       passReqToCallback: true, // Allow passing request object to verify callback
//     },
//     async (req, accessToken, refreshToken, idToken, profile, done) => {
//       try {
//         // Server-side Validation (Required for Apple Sign In)
//         if (!idToken) {
//           return done(new Error('Missing idToken from Apple Sign In'), null)
//         }

//         // Decode idToken using your Apple public key (recommended approach)
//         const decodedIdToken = jwt.decode(idToken, process.env.APPLE_PUBLIC_KEY, { algorithms: ['RS256'] })


//         // Extract User data from decoded idToken
//         const UserId = decodedIdToken.sub // User ID from Apple
//         const email = decodedIdToken.email || '' // Use email or empty string

//         // Check for existing User in your database (replace with your logic)
//         const existingUser = await User.findOne({ provider: 'apple', providerId: UserId })

//         if (existingUser) {
//           return done(null, existingUser) // User already exists
//         }

//         // Create new User if not found (replace with your User model)
//         const newUser = new User({
//           email,
//           provider: 'apple',
//           providerId: UserId,
//           // Add other relevant User details (optional)
//         })

//         await newUser.save()
//         return done(null, newUser) // Login successful
//       } catch (error) {
//         console.error('Error during Apple Sign In:', error)
//         return done(error, null) // Handle errors appropriately
//       }
//     })
//   )



export default passport

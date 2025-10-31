import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider, appleProvider } from '../config/firebase';

/**
 * Sign in with Google
 * @returns {Promise} User credentials
 */
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Get the ID token
    const token = await user.getIdToken();
    
    return {
      token,
      user: {
        id: user.uid,
        email: user.email,
        username: user.displayName,
        avatar: user.photoURL,
        provider: 'google'
      }
    };
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw new Error(error.message || 'Failed to sign in with Google');
  }
};

/**
 * Sign in with Apple
 * @returns {Promise} User credentials
 */
export const signInWithApple = async () => {
  try {
    const result = await signInWithPopup(auth, appleProvider);
    const user = result.user;
    
    // Get the ID token
    const token = await user.getIdToken();
    
    return {
      token,
      user: {
        id: user.uid,
        email: user.email,
        username: user.displayName || user.email?.split('@')[0],
        avatar: user.photoURL,
        provider: 'apple'
      }
    };
  } catch (error) {
    console.error('Apple sign-in error:', error);
    throw new Error(error.message || 'Failed to sign in with Apple');
  }
};

/**
 * Sign in with Google (Redirect method - better for mobile)
 */
export const signInWithGoogleRedirect = async () => {
  try {
    await signInWithRedirect(auth, googleProvider);
  } catch (error) {
    console.error('Google redirect error:', error);
    throw error;
  }
};

/**
 * Sign in with Apple (Redirect method - better for mobile)
 */
export const signInWithAppleRedirect = async () => {
  try {
    await signInWithRedirect(auth, appleProvider);
  } catch (error) {
    console.error('Apple redirect error:', error);
    throw error;
  }
};

/**
 * Handle redirect result after OAuth redirect
 */
export const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const user = result.user;
      const token = await user.getIdToken();
      
      return {
        token,
        user: {
          id: user.uid,
          email: user.email,
          username: user.displayName || user.email?.split('@')[0],
          avatar: user.photoURL,
          provider: result.providerId
        }
      };
    }
    return null;
  } catch (error) {
    console.error('Redirect result error:', error);
    throw error;
  }
};


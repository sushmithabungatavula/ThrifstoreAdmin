
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Dimensions,
  TextInput as NativeTextInput,
  Animated,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useLogin } from '../../context/LoginContext';
import * as Location from 'expo-location';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import i18n from '../i18n';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { Video } from 'expo-av';


import SmsRetriever from 'react-native-sms-retriever'; 

// --- Define window dimensions ---
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const { width } = Dimensions.get('window');

export default function LoginPage() {
  const theme = useTheme();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState({ lat: null, long: null });
  const [ischeckingPhoneNumber, setIscheckingPhoneNumber] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const codeInputRefs = useRef([]);
  const videoRef = useRef(null);

  const router = useRouter();
  const { login, language, isLanguageLoaded } = useLogin();

  // Message state: { type: 'error' | 'success', text: string }
  const [message, setMessage] = useState(null);

  // Loading states
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [isConfirmingLogin, setIsConfirmingLogin] = useState(false);
  const [isConfirmingSignUp, setIsConfirmingSignUp] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

 usePreventScreenCapture();

  // Animation values
  const loginSlideAnim = useRef(new Animated.Value(0)).current;
  const signupSlideAnim = useRef(new Animated.Value(width)).current;

  // Function to render local video background
  const getVideoBySerial = () => {
    return (
      <Video
        ref={videoRef}
        source={require('../../assets/video/backgroundVideo.mp4')}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
        shouldPlay
        isLooping
        onLoad={() => setVideoLoaded(true)}
        onError={(error) => {
          console.error("Error loading video:", error);
          setVideoLoaded(false);
        }}
      />
    );
  };

  // Ensure language is loaded before displaying content
  if (!isLanguageLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }


  const isValidPhoneNumber = (number) => {
    return /^[0-9]{10}$/.test(number);
  };

  /**
   * Send OTP via Twilio - calls your backend route that initiates Twilio Verify
   */
  const startVerify = async (phoneNumber) => {
    try {
      const response = await axios.post('https://kissan-backend-c9c4.onrender.com/twilio/start-verify', {
        to: `+91${phoneNumber}`,
        channel: 'sms',
      });
      return response.data; 
    } catch (error) {
      throw error;
    }
  };

  /**
   * Check OTP via Twilio - calls your backend route that checks Twilio Verify
   */
  const checkVerify = async (phoneNumber, otpCode) => {
    try {
      const response = await axios.post('https://kissan-backend-c9c4.onrender.com/twilio/check-verify', {
        to: `+91${phoneNumber}`,
        code: otpCode,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const handleSignUp = () => {
    router.replace('/auth/SignUpPage');
  };


  // useEffect(() => {
  //   if (otpRequested) {
  
  //     // Start listening for incoming SMS with OTP
  //     const startListeningForSms = async () => {
  //       try {
  //         const sms = await SmsRetriever.startSmsRetriever();
  
  //         // Ensure sms is a valid string before trying to match
  //         if (typeof sms === 'string') {
  //           console.log('sms....',sms);
  //           const otp = extractOtpFromSms(sms);
  //           console.log('Extracted OTP:', otp);
  //           if (otp && otp.length === 6) {
  //             fillOtp(otp);  // Function to fill OTP automatically
  //             handleConfirmCode();  // Automatically trigger OTP confirmation
  //           }
  //         } else {
  //           console.log('No SMS or invalid response format');
  //         }
  //       } catch (error) {
  //         console.error('Failed to retrieve SMS OTP', error);
  //       }
  //     };
  
  //     startListeningForSms();
  //   }
  // }, [otpRequested]);
  

  const extractOtpFromSms = (sms) => {
    if (!sms || typeof sms !== 'string') {
      return ''; 
    }
  
    const otpRegex = /(\d{6})/;  
    const match = sms.match(otpRegex);
  
    if (match) {
      return match[0]; 
    } else {
      return ''; 
    }
  };

  const fillOtp = (otp) => {
    const newCode = otp.split('');
    setCode(newCode);  

    codeInputRefs.current[5].focus();
  };



  const handleLogin = async () => {
    if (!isValidPhoneNumber(phoneNumber)) {
      setMessage({
        type: 'error',
        text: i18n.t('invalidPhoneNumber'),
      });
      return;
    }
    setMessage(null);
    setIscheckingPhoneNumber(true);
    try {
      const checkResponse = await axios.post(
        'https://kissan-backend-c9c4.onrender.com/api/check-phone',
        { phoneNumber }
      );
      console.log('checkResponse.data', checkResponse.data, checkResponse);
      if (checkResponse.data.exists) {
        // Existing user, proceed with OTP verification
        const result = await startVerify(phoneNumber);
        console.log('startVerify....', result);
        if (result.success) {
          setOtpRequested(true);
          setMessage({ type: 'success', text: i18n.t('otpSent') });
        } else {
          setMessage({ type: 'error', text: result.error || i18n.t('failedToSendOTP') });
        }
      } else {
        setIscheckingPhoneNumber(false);
        handleSignUp();
        return;
      }
    } catch (error) {
      setMessage({ type: 'error', text: i18n.t('couldNotSendOTP') });
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle OTP Confirmation for Login
  const handleConfirmCode = async () => {
    const otpCode = code.join('');
    if (otpCode.length !== 6) {
      setMessage({
        type: 'error',
        text: i18n.t('invalidOTP'),
      });
      return;
    }

    setIsConfirmingLogin(true);
    setMessage(null);

    try {
      const verifyResult = await checkVerify(phoneNumber, otpCode);
      console.log('checkVerify....', verifyResult);
      if (!verifyResult.success) {
        setMessage({ type: 'error', text: verifyResult.message || i18n.t('incorrectOTP') });
        return;
      }
      
      setIsLoggingIn(true);
      const response = await axios.post('https://kissan-backend-c9c4.onrender.com/farmers/login', {
        phoneNumber,
      });

      if (response.data.farmer) {
        const farmerData = response.data.farmer;
        login(farmerData);
        router.replace('/protected/tabs');
      } else {
        setMessage({
          type: 'error',
          text: response.data.message || i18n.t('unableToFetchUserData'),
        });
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        setMessage({ type: 'error', text: error.response.data.message });
      } else {
        setMessage({ type: 'error', text: i18n.t('unableToFetchUserData') });
      }
    } finally {
      setIsConfirmingLogin(false);
    }
  };


  // Clear messages when phone number or full name changes
  useEffect(() => {
    if (message) {
      setMessage(null);
    }
  }, [phoneNumber, fullName]);

  // Clear success messages after 3 seconds
  useEffect(() => {
    let timer;
    if (message?.type === 'success') {
      timer = setTimeout(() => {
        setMessage(null);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [message]);

  // Function to handle Back Button Press in OTP Section
  const handleBackToPhoneNumber = () => {
    setOtpRequested(false);
    setCode(['', '', '', '', '', '']);
    setMessage(null);
  };



  // Handle OTP Input Change
  const handleOtpChange = (text, index) => {
    if (/^\d$/.test(text) || text === '') {
      const newCode = [...code];
      newCode[index] = text;
      setCode(newCode);

      if (message) {
        setMessage(null);
      }

      if (text !== '') {
        if (index < 5) {
          codeInputRefs.current[index + 1].focus();
        }
      } else {
        if (index > 0) {
          codeInputRefs.current[index - 1].focus();
        }
      }
    }
  };

  return (
    <View style={{ flex: 1, width: windowWidth }}>
      {/* Video Background Container */}
      <View style={{ position: 'absolute', top: 0, left: 0, width: windowWidth, height: windowHeight }}>
        {getVideoBySerial()}
        <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill}>
          {!videoLoaded && (
            <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="large" color="#fff" />
            </View>
          )}
        </BlurView>
      </View>

      {/* Main Content Rendered only after video is loaded */}
      {videoLoaded && (
        <View style={StyleSheet.absoluteFill}>
          <LinearGradient colors={['rgba(0,0,0,0.8)', 'transparent']} style={styles.backgroundOverlay} />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardView}
          >
            <ScrollView contentContainerStyle={styles.scrollView}>
              {/* Animated Login Card */}
              <Animated.View
                style={[
                  styles.animatedView,
                  { transform: [{ translateX: loginSlideAnim }] },
                ]}
              >
                <Image
                  source={{uri:'https://i.ibb.co/gMRqbt5Q/kissansmartlogo.png'}}
                  style={[{ height: 85 }, styles.kissansmartlogoImage]}
                />
                <BlurView intensity={120} tint="light" style={styles.blurContainer}>
                  <View style={styles.cardGradient}>
                    <View style={styles.cardContent}>
                      {!otpRequested && (
                        <TextInput
                        label={i18n.t('phoneNumber')}
                        mode="outlined"
                        keyboardType="phone-pad"
                        value={phoneNumber}
                        onChangeText={(text) => {
                          if (/^\d{0,10}$/.test(text)) {
                            setPhoneNumber(text);
                          }
                        }}
                        style={styles.input}
                        left={
                          <View style={styles.iconContainer}>
                            <Text style={styles.countryCode}>+91</Text>
                            <Image
                              source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Flag_of_India.svg/2560px-Flag_of_India.svg.png' }}
                              style={styles.flagIcon}
                            />
                          </View>
                        }
                        theme={{ colors: { text: 'black', primary: '#097969' } }}
                        disabled={isLoggingIn || isConfirmingLogin || isSigningUp || isConfirmingSignUp}
                      />
                      )}

                      {otpRequested ? (
                        <>
                          <View style={styles.otpHeader}>
                            <TouchableOpacity
                              onPress={handleBackToPhoneNumber}
                              style={styles.backButton}
                            >
                              <MaterialIcons name="arrow-back" size={24} color="#333" />
                            </TouchableOpacity>
                            <Text style={styles.otpLabel}>{i18n.t('enterOTP')}</Text>
                          </View>
                          <View style={styles.otpContainer}>
                            {code.map((digit, index) => (
                              <NativeTextInput
                                key={index}
                                ref={(ref) => (codeInputRefs.current[index] = ref)}
                                value={digit}
                                onChangeText={(text) => handleOtpChange(text, index)}
                                keyboardType="numeric"
                                maxLength={1}
                                style={styles.otpInput}
                                autoFocus={index === 0}
                                editable={!isConfirmingLogin && !isConfirmingSignUp}
                              />
                            ))}
                          </View>
                          <Button
                            mode="contained"
                            onPress={handleConfirmCode}
                            style={styles.button}
                            contentStyle={styles.buttonContent}
                            disabled={isConfirmingLogin || isConfirmingSignUp}
                          >
                            {isConfirmingLogin || isConfirmingSignUp ? (
                              <ActivityIndicator color="#fff" />
                            ) : (
                              i18n.t('verifyOTP')
                            )}
                          </Button>
                        </>
                      ) : (
                        <Button
                          mode="contained"
                          onPress={handleLogin}
                          style={styles.button}
                          contentStyle={styles.buttonContent}
                          disabled={isLoggingIn || isConfirmingLogin || isSigningUp || isConfirmingSignUp}
                        >
                          {(isLoggingIn || otpRequested || ischeckingPhoneNumber) ? (
                            <ActivityIndicator color="#fff" />
                          ) : i18n.t('sendOTP')}
                        </Button>
                      )}
                      {!otpRequested && (
                        <TouchableOpacity
                          onPress={handleSignUp}
                          disabled={isLoggingIn || isConfirmingLogin || isSigningUp || isConfirmingSignUp}
                        >
                          <Text style={[styles.signupText, { color: '#333' }]}>
                            {i18n.t('dontHaveAccount')}
                          </Text>
                        </TouchableOpacity>
                      )}

                      <Button onPress={() => router.replace('/auth/InitialLanguageSelectionPage')}>
                        <Text>Set language</Text>
                      </Button>

                    </View>
                  </View>
                </BlurView>
              </Animated.View>

              {/* Message Display */}
              {message && (
                <View
                  style={[
                    styles.messageContainer,
                    message.type === 'error' ? styles.errorMessage : styles.successMessage,
                  ]}
                >
                  <Text style={styles.messageText}>{message.text}</Text>
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  kissansmartlogoImage: {
    top: -80,
    resizeMode: 'contain',
    width: 300,
    alignItems: 'center',
    left: '3%',
  },
  keyboardView: {
    flex: 1,
    width: '100%',
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    },
  animatedView: {
    width: '90%',
    maxWidth: 400,
    position: 'absolute',
    top: '32%',
    left: '5%',
  },
  blurContainer: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 20,
  },
  cardContent: {
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  arrowIcon: {
    marginRight: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 20,
    width: '100%',
  },
  button: {
    marginBottom: 10,
    borderRadius: 30,
    width: '75%',
    backgroundColor: '#FFA500',
  },
  buttonContent: {
    paddingVertical: 7,
  },
  signupText: {
    marginTop: 5,
    textAlign: 'center',
    fontWeight: '500',
    textDecorationLine: 'underline',
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    width: '100%',
  },
  getLocationButton: {
    marginBottom: 20,
    borderRadius: 10,
    elevation: 3,
    paddingVertical: 8,
  },
  otpLabel: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
  },
  otpInput: {
    width: '14%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    textAlign: 'center',
    fontSize: 18,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  messageContainer: {
    position: 'absolute',
    width: '80%',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    alignSelf: 'center',
    elevation: 5,
  },
  errorMessage: {
    backgroundColor: 'rgba(255,0,0,0.9)',
    top: 60,
  },
  successMessage: {
    backgroundColor: 'rgba(0,128,0,1)',
    bottom: 50,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
  },
  otpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  backButton: {
    marginRight: 10,
  },

  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCode: {
    fontSize: 18,
    color: 'black',
    marginRight: 5,
  },
  flagIcon: {
    width: 20,
    height: 15,
    resizeMode: 'contain',
  },
});
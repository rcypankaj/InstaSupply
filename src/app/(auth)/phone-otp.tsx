import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../hooks/useAuth';

type Step = 'phone' | 'otp';

export default function PhoneOTPScreen() {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const { sendPhoneOTP, verifyOTP, loading, error, clearError } = useAuth();

  const handleSendOTP = async () => {
    console.log("CL");
    clearError();
    await sendPhoneOTP(phone.trim());
    if (!error) setStep('otp');
  };

  const handleVerify = () => {
    clearError();
    verifyOTP(otp.trim());
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>📱</Text>
          <Text style={styles.title}>Verify Your Number</Text>
          <Text style={styles.subtitle}>
            {step === 'phone'
              ? 'Enter your mobile number to receive an OTP'
              : `OTP sent to ${phone}`}
          </Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {step === 'phone' ? (
            <>
              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                placeholder="+1 555 000 0000"
                placeholderTextColor="#9CA3AF"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!loading}
              />
              <Text style={styles.hint}>Include country code (e.g. +1 for US)</Text>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendOTP}
                disabled={loading || phone.length < 7}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>Enter 6-digit OTP</Text>
              <TextInput
                style={[styles.input, styles.otpInput]}
                placeholder="000000"
                placeholderTextColor="#9CA3AF"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
                maxLength={6}
                editable={!loading}
                onSubmitEditing={handleVerify}
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerify}
                disabled={loading || otp.length < 6}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.buttonText}>Verify OTP</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.resendLink}
                onPress={() => {
                  setStep('phone');
                  setOtp('');
                  clearError();
                }}
              >
                <Text style={styles.resendText}>Change number or resend</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#1A73E8' },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: { fontSize: 56, marginBottom: 12 },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#BFDBFE',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: '#DC2626', fontSize: 13, fontWeight: '500' },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 28,
    letterSpacing: 12,
    fontWeight: '700',
  },
  hint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#1A73E8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  resendLink: { alignItems: 'center', marginTop: 16 },
  resendText: { color: '#1A73E8', fontSize: 14, fontWeight: '600' },
});

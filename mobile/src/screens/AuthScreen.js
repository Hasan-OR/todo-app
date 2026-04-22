import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { supabase } from '../supabaseClient';
import { colors, radius } from '../theme';

export default function AuthScreen() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setMsg(null);
    if (!email.trim() || !password) {
      setMsg({ type: 'error', text: 'E-posta ve şifre gerekli.' });
      return;
    }
    if (password.length < 6) {
      setMsg({ type: 'error', text: 'Şifre en az 6 karakter olmalı.' });
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) setMsg({ type: 'error', text: error.message });
      } else {
        const { error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) {
          setMsg({ type: 'error', text: error.message });
        } else {
          setMsg({
            type: 'success',
            text: 'Kayıt başarılı! E-postana gelen onay linkine tıkla, ardından buradan giriş yap.',
          });
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Todo Uygulaması</Text>
        <Text style={styles.subtitle}>Devam etmek için giriş yapın veya kayıt olun.</Text>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, mode === 'login' && styles.tabActive]}
            onPress={() => { setMode('login'); setMsg(null); }}
          >
            <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
              Giriş Yap
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, mode === 'register' && styles.tabActive]}
            onPress={() => { setMode('register'); setMsg(null); }}
          >
            <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>
              Kayıt Ol
            </Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          placeholder="E-posta"
          placeholderTextColor={colors.muted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TextInput
          style={styles.input}
          placeholder="Şifre"
          placeholderTextColor={colors.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
        />

        {msg && (
          <View style={[styles.msgBox, msg.type === 'error' ? styles.msgError : styles.msgSuccess]}>
            <Text style={[styles.msgText, msg.type === 'error' ? styles.msgTextError : styles.msgTextSuccess]}>
              {msg.text}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>{mode === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: colors.inputBg,
    borderRadius: radius.md,
    marginBottom: 16,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  tabTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  msgBox: {
    borderRadius: radius.sm,
    padding: 10,
    marginBottom: 12,
  },
  msgError: {
    backgroundColor: colors.dangerBg,
    borderLeftWidth: 3,
    borderLeftColor: colors.danger,
  },
  msgSuccess: {
    backgroundColor: colors.successBg,
    borderLeftWidth: 3,
    borderLeftColor: colors.success,
  },
  msgText: {
    fontSize: 13,
    lineHeight: 18,
  },
  msgTextError: {
    color: colors.danger,
  },
  msgTextSuccess: {
    color: colors.success,
  },
});

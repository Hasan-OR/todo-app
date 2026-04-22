import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { supabase } from '../supabaseClient';
import { colors, radius } from '../theme';
import TodoItem from '../components/TodoItem';

const FILTERS = [
  { key: 'all', label: 'Tümü' },
  { key: 'active', label: 'Bekleyen' },
  { key: 'completed', label: 'Tamamlanan' },
];

export default function TodoScreen({ session }) {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState('all');
  const [newText, setNewText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adding, setAdding] = useState(false);

  const loadTodos = useCallback(async () => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: true });
    if (!error) setTodos(data || []);
    setLoading(false);
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await loadTodos();
    setRefreshing(false);
  }

  useEffect(() => { loadTodos(); }, [loadTodos]);

  useEffect(() => {
    const channel = supabase
      .channel('todos-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos' }, (payload) => {
        const { eventType, new: n, old: o } = payload;
        if (eventType === 'INSERT' && n?.id) {
          setTodos(prev => prev.some(t => t.id === n.id) ? prev : [...prev, n]);
        } else if (eventType === 'UPDATE' && n?.id) {
          setTodos(prev => prev.map(t => t.id === n.id ? n : t));
        } else if (eventType === 'DELETE' && o?.id) {
          setTodos(prev => prev.filter(t => t.id !== o.id));
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  async function addTodo() {
    const text = newText.trim();
    if (!text) return;
    setAdding(true);
    const { data, error } = await supabase
      .from('todos')
      .insert({ text, done: false, user_id: session.user.id })
      .select()
      .single();
    if (!error && data) {
      setTodos(prev => [...prev, data]);
      setNewText('');
    }
    setAdding(false);
  }

  async function toggleTodo(item) {
    const { error } = await supabase
      .from('todos')
      .update({ done: !item.done })
      .eq('id', item.id);
    if (!error) {
      setTodos(prev => prev.map(t => t.id === item.id ? { ...t, done: !t.done } : t));
    }
  }

  async function deleteTodo(id) {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (!error) setTodos(prev => prev.filter(t => t.id !== id));
  }

  async function saveTodo(id, text) {
    const { error } = await supabase.from('todos').update({ text }).eq('id', id);
    if (!error) setTodos(prev => prev.map(t => t.id === id ? { ...t, text } : t));
  }

  async function clearCompleted() {
    const { error } = await supabase.from('todos').delete().eq('done', true);
    if (!error) setTodos(prev => prev.filter(t => !t.done));
  }

  function handleLogout() {
    Alert.alert('Çıkış', 'Çıkış yapmak istiyor musun?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Çıkış Yap', style: 'destructive', onPress: () => supabase.auth.signOut() },
    ]);
  }

  const filtered = todos.filter(t => {
    if (filter === 'active') return !t.done;
    if (filter === 'completed') return t.done;
    return true;
  });

  const pendingCount = todos.filter(t => !t.done).length;
  const hasCompleted = todos.some(t => t.done);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Yapılacaklar</Text>
        <View style={styles.headerRight}>
          <Text style={styles.emailText} numberOfLines={1}>{session.user.email}</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Çıkış</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Yeni görev ekle…"
            placeholderTextColor={colors.muted}
            value={newText}
            onChangeText={setNewText}
            maxLength={200}
            returnKeyType="done"
            onSubmitEditing={addTodo}
          />
          <TouchableOpacity
            style={[styles.addBtn, (adding || !newText.trim()) && styles.addBtnDisabled]}
            onPress={addTodo}
            disabled={adding || !newText.trim()}
          >
            {adding
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.addBtnText}>+</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 32 }} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => (
              <TodoItem
                item={item}
                onToggle={toggleTodo}
                onDelete={deleteTodo}
                onSave={saveTodo}
              />
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {filter === 'all' ? 'Henüz görev yok.' : 'Bu filtrede görev yok.'}
              </Text>
            }
            style={styles.list}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
            }
          />
        )}

        <View style={styles.footer}>
          <Text style={styles.countText}>{pendingCount} görev kaldı</Text>
          {hasCompleted && (
            <TouchableOpacity onPress={clearCompleted}>
              <Text style={styles.clearText}>Tamamlananları sil</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  emailText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    maxWidth: 140,
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  logoutText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
  },
  addBtn: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: {
    opacity: 0.5,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '300',
    lineHeight: 28,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: radius.pill,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  filterBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  filterTextActive: {
    color: '#fff',
  },
  list: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.muted,
    paddingVertical: 32,
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  countText: {
    fontSize: 13,
    color: '#888',
  },
  clearText: {
    fontSize: 13,
    color: colors.danger,
    fontWeight: '600',
  },
});

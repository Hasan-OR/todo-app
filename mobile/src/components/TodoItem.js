import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius } from '../theme';

export default function TodoItem({ item, onToggle, onDelete, onSave }) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);

  function saveEdit() {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== item.text) {
      onSave(item.id, trimmed);
    }
    setEditing(false);
  }

  function cancelEdit() {
    setEditText(item.text);
    setEditing(false);
  }

  return (
    <View style={styles.row}>
      <Pressable onPress={() => onToggle(item)} style={styles.checkbox} hitSlop={8}>
        <View style={[styles.checkboxBox, item.done && styles.checkboxChecked]}>
          {item.done && <Ionicons name="checkmark" size={13} color="#fff" />}
        </View>
      </Pressable>

      <View style={styles.textWrap}>
        {editing ? (
          <TextInput
            style={styles.editInput}
            value={editText}
            onChangeText={setEditText}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={saveEdit}
            onBlur={cancelEdit}
            selectTextOnFocus
          />
        ) : (
          <Text
            style={[styles.text, item.done && styles.textDone]}
            numberOfLines={2}
            onLongPress={() => !item.done && setEditing(true)}
          >
            {item.text}
          </Text>
        )}
      </View>

      {editing ? (
        <TouchableOpacity onPress={saveEdit} style={styles.iconBtn} hitSlop={8}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => { setEditText(item.text); setEditing(true); }}
          style={styles.iconBtn}
          hitSlop={8}
        >
          <Ionicons name="pencil-outline" size={18} color={colors.muted} />
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.iconBtn} hitSlop={8}>
        <Ionicons name="close" size={20} color={colors.muted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  checkbox: {
    marginRight: 10,
  },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  textWrap: {
    flex: 1,
    marginRight: 4,
  },
  text: {
    fontSize: 15,
    color: colors.text,
  },
  textDone: {
    textDecorationLine: 'line-through',
    color: colors.muted,
  },
  editInput: {
    fontSize: 15,
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
    paddingVertical: 2,
  },
  iconBtn: {
    padding: 4,
    marginLeft: 2,
  },
});

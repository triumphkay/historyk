import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

const AnswerModal = ({ visible, answer, onClose, onNext }) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.body}>
          <Text style={styles.answer}>{answer}</Text>
          <View style={styles.buttonRow}>
            <Pressable style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>닫기</Text>
            </Pressable>
            <Pressable style={[styles.button, styles.primary]} onPress={onNext}>
              <Text style={[styles.buttonText, styles.primaryText]}>다음 문제로 넘어가기</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  body: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center'
  },
  answer: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24
  },
  buttonRow: {
    width: '100%',
    gap: 12
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center'
  },
  buttonText: {
    fontSize: 16
  },
  primary: {
    backgroundColor: '#111',
    borderColor: '#111'
  },
  primaryText: {
    color: '#fff'
  }
});

export default AnswerModal;

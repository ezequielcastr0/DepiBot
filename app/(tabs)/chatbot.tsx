import { GoogleGenAI } from '@google/genai';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import promptData from '../assets/data/isft.json';
export default function DepilifeChatbot() {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<{ role: string; text: string; }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const listRef = useRef<FlatList>(null);
  const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
 

  // ✅ Optimización para evitar renderizados innecesarios
  const quickReplies = useMemo(() => [
    "¿Cuales son las carreras?",
    "¿Cuál es el horario de atención?",
    "¿Cuánto tiempo dura carrerra?",
    "¿Horario de la cursada?"
  ], []);

  const handleQuickReply = (text: string) => {
    setHistory(prevHistory => [...prevHistory, { role: 'user', text }]);
    generateResponse(text);
  };

 const generateResponse = async (inputText: string) => {
  if (!GEMINI_API_KEY) {
    setHistory(prev => [...prev, { role: 'bot', text: 'Error: Clave de API no encontrada.' }]);
    return;
  }

  if (!inputText.trim()) {
    console.error("Intento de generar respuesta con texto vacío.");
    return;
  }

  setIsTyping(true);

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const recentMessages = history.slice(-6)
      .map(msg => `${msg.role === 'user' ? 'Usuario' : 'IA'}: ${msg.text}`)
      .join('\n');

    const fullPrompt = `${promptData.prompt}\n\n${recentMessages}\nUsuario: ${inputText}`;

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ role: 'user', parts: [{ text: fullPrompt }] }]
    });

    const responseText = response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'No se obtuvo una respuesta del modelo.';
    setHistory(prev => [...prev, { role: 'bot', text: responseText }]);

  } catch (err) {
    console.error('Error al generar la respuesta:', err);
    setHistory(prev => [...prev, { role: 'bot', text: 'Hubo un problema al generar la respuesta.' }]);
  }

  setIsTyping(false);
};


  // ✅ Corrección del desplazamiento automático
  useEffect(() => {
    if (listRef.current) {
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  }, [history]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Asitente ISFT 220</Text>

      <FlatList
        ref={listRef}
        data={history}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ flexGrow: 1 }}
        renderItem={({ item }) => (
          <View style={item.role === 'user' ? styles.userMessageContainer : styles.botMessageContainer}>
            <Image 
              source={item.role === 'user' ? require('../assets/user.png') : require('../assets/bot.png')} 
              style={styles.avatar}
            />
            <View style={item.role === 'user' ? styles.userMessageBox : styles.botMessageBox}>
              <Text style={item.role === 'user' ? styles.userMessage : styles.botMessage}>{item.text}</Text>
            </View>
          </View>
        )}
      />

      {isTyping && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color="#d81b60" />
          <Text style={styles.typingText}>Escribiendo...</Text>
        </View>
      )}

      {/* ✅ Lista de respuestas rápidas optimizada */}
      <FlatList
        data={quickReplies}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickRepliesContainer}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.quickReplyButton} onPress={() => handleQuickReply(item)}>
            <Text style={styles.quickReplyText}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      <View style={styles.inputContainer}>
        <TextInput
  style={styles.input}
  placeholder="Escribe tu mensaje..."
  value={question}
  onChangeText={setQuestion}
  onSubmitEditing={() => {
    if (question.trim()) {
      setHistory(prev => [...prev, { role: 'user', text: question }]);
      generateResponse(question);
      setQuestion('');
    }
  }}
  blurOnSubmit={false}
/>
        <Button
  title="Enviar"
  onPress={() => {
    if (question.trim()) {
      setHistory(prev => [...prev, { role: 'user', text: question }]);
      generateResponse(question);
      setQuestion('');
    }
  }}
/>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#0b1f35', // azul muy oscuro
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#a3dcff', // celeste claro del logo
    textAlign: 'center',
  },
  userMessageContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  botMessageContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
  },
  avatar: {
    width: 30,
    height: 30,
    marginRight: 8,
  },
  userMessageBox: {
    backgroundColor: '#1a4f86', // azul intermedio institucional
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  botMessageBox: {
    backgroundColor: '#1c2e45', // azul grisáceo oscuro
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  userMessage: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  botMessage: {
    color: '#e0f2ff',
    fontSize: 16,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    padding: 5,
  },
  typingText: {
    color: '#a3dcff',
    marginLeft: 5,
    fontStyle: 'italic',
  },
  quickRepliesContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  quickReplyButton: {
    backgroundColor: '#1a4f86',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    margin: 5,
    flexShrink: 1,
  },
  quickReplyText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  inputContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#a3dcff',
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#132b42',
    color: '#ffffff',
  },
});

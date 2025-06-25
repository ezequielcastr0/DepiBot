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
    "¿Cuáles son los tratamientos disponibles?",
    "¿Cuál es el horario de atención?",
    "¿Cuánto tiempo dura una sesión?",
    "¿Ofrecen promociones?"
  ], []);

  const handleQuickReply = (text: string) => {
    setHistory(prevHistory => [...prevHistory, { role: 'user', text }]);
    generateResponse(text);
  };

  const generateResponse = async (inputText: string) => {
    if (!GEMINI_API_KEY) {
      setHistory(prevHistory => [...prevHistory, { role: 'bot', text: 'Error: Clave de API no encontrada.' }]);
      return;
    }

    if (!inputText.trim()) {
      console.error("Intento de generar respuesta con texto vacío.");
      return;
    }

    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const config = { responseMimeType: 'text/plain' };
      const model = 'gemini-2.0-flash';
      const prompt = "";
       const systemPrompt = promptData.prompt;
     // Solo agregás el prompt cuando history.length === 0
const contents = [
  ...(history.length === 0
    ? [{ role: 'user', parts: [{ text: promptData.prompt }] }]
    : []
  ),
  ...history.map(item => ({
    role: item.role === 'user' ? 'user' : 'model',
    parts: [{ text: item.text }]
  })),
  { role: 'user', parts: [{ text: inputText }] }
];




      const response = await ai.models.generateContent({ model, config, contents });
      const responseText = response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || 'No se obtuvo una respuesta del modelo.';

      setHistory(prevHistory => [...prevHistory, { role: 'bot', text: responseText }]);
    } catch (error) {
      console.error('Error al generar respuesta:', error);
      setHistory(prevHistory => [...prevHistory, { role: 'bot', text: 'Hubo un problema al generar la respuesta.' }]);
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
      <Text style={styles.title}>Asistente IA - Depilife</Text>

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
    backgroundColor: '#fff5f8',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#d81b60',
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
    backgroundColor: '#d81b60',
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  botMessageBox: {
    backgroundColor: '#ffe3ed',
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
  userMessage: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  botMessage: {
    color: '#333',
    fontSize: 16,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    padding: 5,
  },
  typingText: {
    color: '#d81b60',
    marginLeft: 5,
    fontStyle: 'italic',
  },
   quickRepliesContainer: {
  position: 'absolute',
  bottom: 10, // ✅ Ubica los botones cerca de la parte inferior
  left: 0,
  right: 0,
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  paddingVertical: 10,
  paddingHorizontal: 5,
},
  quickReplyButton: {
  backgroundColor: '#d81b60',
  paddingVertical: 8,
  paddingHorizontal: 15,
  borderRadius: 20,
  margin: 5,
  flexShrink: 1, // ✅ Permite que el texto se ajuste sin que el botón se haga gigante
},
quickReplyText: {
  color: 'white',
  fontWeight: 'bold',
  fontSize: 14,
  textAlign: 'center',
  flexWrap: 'wrap', // ✅ Hace que el texto se divida en líneas
},
  inputContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: '#d81b60',
    borderRadius: 8,
    marginRight: 10,
  },
  
});

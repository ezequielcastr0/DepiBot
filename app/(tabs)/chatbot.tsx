import { GoogleGenAI } from '@google/genai';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Button, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import flows from '../assets/data/flows.json';
import promptData from '../assets/data/isft.json';

export default function DepilifeChatbot() {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<{ role: string; text: string; type?: string }[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef<FlatList>(null);
  const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  


 useEffect(() => {
  setHistory([
    { role: 'bot', text: '¡Hola! Soy DepiBot, tu asistente virtual de Depilife 💬 ¿En qué puedo ayudarte hoy?' },
    { role: 'bot', text: 'Elegí una opción para comenzar 👇' },
    { role: 'bot', text: '', type: 'mainMenu' }
  ]);
}, []);


  const mainOptions = useMemo(() => [
    { label: 'Registro', intent: 'registro' },
    { label: 'Turnos', intent: 'turnos' },
    { label: 'Consultas', intent: 'consultas' },
    { label: 'Actualizar datos', intent: 'actualizar' },
    { label: 'Tienda Online', intent: 'tienda' },
    { label: 'Hablar con alguien real', intent: 'humano' }
  ], []);

  const detectIntent = (text: string): string | null => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('tratamiento')) return 'tratamientos';
    if (lowerText.includes('horario')) return 'horarios';
    if (lowerText.includes('ubicación') || lowerText.includes('dónde')) return 'ubicacion';
    if (lowerText.includes('turno')) return 'turnos';
    if (lowerText.includes('precio')) return 'precios';
    return null;
  };

  const handleMenuSelection = (intent: string) => {
    setHistory(prev => [...prev, { role: 'user', text: intent }]);

    if (intent in flows) {
      const flujo = flows[intent as keyof typeof flows];
      setHistory(prev => [...prev, { role: 'bot', text: flujo.inicio }]);
    } else {
      setHistory(prev => [...prev, { role: 'bot', text: 'No encontré esa opción, pero podés preguntarme lo que necesites 😊' }]);
    }
  };

  const generateResponse = async (inputText: string) => {
    if (!inputText.trim()) {
      console.error("Intento de generar respuesta con texto vacío.");
      return;
    }

    setIsTyping(true);
    const intent = detectIntent(inputText);

    if (intent && intent in flows) {
      const flujo = flows[intent as keyof typeof flows];
      setHistory(prev => [...prev, { role: 'bot', text: flujo.inicio }]);
      setIsTyping(false);
      return;
    }

    if (!GEMINI_API_KEY) {
      setHistory(prev => [...prev, { role: 'bot', text: 'Error: Clave de API no encontrada.' }]);
      setIsTyping(false);
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      const recentMessages = history.slice(-6)
        .map(msg => `${msg.role === 'user' ? 'Usuario' : 'IA'}: ${msg.text}`)
        .join('\n');

      const fullPrompt = `${promptData.prompt}\n\n${recentMessages}\nUsuario: ${inputText}`;

      const response = await ai.models.generateContent({
        model: 'models/gemini-2.0-flash-lite',
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DepiBot</Text>
      

      <FlatList
        ref={listRef}
        data={history}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ flexGrow: 1 }}
        renderItem={({ item }) => {
  if (item.type === 'mainMenu') {
    return (
      <View style={styles.botMessageContainer}>
        <Image source={require('../assets/bot.jpg')} style={styles.avatar} />
        <View style={styles.botMessageBox}>
          {mainOptions.map(option => (
            <TouchableOpacity
              key={option.intent}
              style={styles.menuButton}
              onPress={() => handleMenuSelection(option.intent)}
            >
              <Text style={styles.menuButtonText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={item.role === 'user' ? styles.userMessageContainer : styles.botMessageContainer}>
      <Image 
        source={item.role === 'user' ? require('../assets/user.png') : require('../assets/bot.jpg')} 
        style={styles.avatar}
      />
      <View style={item.role === 'user' ? styles.userMessageBox : styles.botMessageBox}>
        <Text style={item.role === 'user' ? styles.userMessage : styles.botMessage}>{item.text}</Text>
      </View>
    </View>
  );
}}
      />

      {isTyping && (
        <View style={styles.typingIndicator}>
          <ActivityIndicator size="small" color="#d81b60" />
          <Text style={styles.typingText}>Escribiendo...</Text>
        </View>
      )}

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
    backgroundColor: '#0b1f35',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#a3dcff',
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
    backgroundColor: '#1a4f86',
    padding: 12,
    borderRadius: 12,
    maxWidth: '80%',
  },
    botMessageBox: {
    backgroundColor: '#1c2e45',
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
    marginVertical: 10,
    paddingHorizontal: 5,
    justifyContent: 'center',
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
  menuContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
    paddingHorizontal: 10,
  },
  menuButton: {
  backgroundColor: '#1a4f86',
  paddingVertical: 10,
  paddingHorizontal: 15,
  borderRadius: 10,
  marginVertical: 5,
},
menuButtonText: {
  color: '#ffffff',
  fontSize: 15,
  fontWeight: 'bold',
  textAlign: 'center',
},

});
import { Image } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import DepilifeChatbot from './chatbot'; // ✅ ajustá la ruta si está en otra carpeta

const { width, height } = Dimensions.get('window');

const images = [
  require('@/assets/images/image1.png'),
  require('@/assets/images/image2.png'),
  require('@/assets/images/image3.png')
];

export default function CustomCarousel() {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showGreeting, setShowGreeting] = useState(true);
  const [showChat, setShowChat] = useState(false); // ✅ nuevo estado

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % images.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 6000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  useEffect(() => {
    const timer = setTimeout(() => setShowGreeting(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Header estilo DepiLife */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/icons/depilife-logo.png')}
            style={styles.logoImage}
          />
        </View>

        <View style={styles.nav}>
          <TouchableOpacity><Text style={styles.link}>Tienda online</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.link}>Depilación láser</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.link}>Modelado corporal</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.link}>Centros</Text></TouchableOpacity>
          <TouchableOpacity><Text style={styles.link}>Más</Text></TouchableOpacity>
        </View>

        <View style={styles.rightActions}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>MiDepiLife</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.extraIcon}>
            <Image
              source={require('@/assets/icons/shop_icon.png')}
              style={styles.iconImage}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Carrusel */}
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Image source={item} style={styles.image} />
          </View>
        )}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index
        })}
      />

      {/* Botón flotante DepiBot */}
      <TouchableOpacity style={styles.chatbotButton} onPress={() => setShowChat(true)}>
        <Image
          source={require('@/assets/icons/iconobot.png')}
          style={styles.chatbotIcon}
        />
      </TouchableOpacity>

      {/* Burbuja de saludo */}
      {showGreeting && (
        <View style={styles.chatbotGreeting}>
          <View style={styles.greetingBox}>
            <Text style={styles.greetingText}>¡Hola! ¿Necesitás ayuda?</Text>
          </View>
        </View>
      )}

      {/* Panel flotante del chatbot */}
      {showChat && (
        <View style={styles.chatPanel}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>DepiBot</Text>
            <TouchableOpacity onPress={() => setShowChat(false)}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.chatBody}>
            <DepilifeChatbot />
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    position: 'relative',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 140,
    height: 38,
    resizeMode: 'contain',
    marginLeft: 10,
  },
  nav: {
    flexDirection: 'row',
    gap: 12,
  },
  link: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  button: {
    backgroundColor: '#00c48c',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  extraIcon: {
    padding: 6,
  },
  iconImage: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },

  // Carrusel
  slide: {
    width,
    height,
  },
  image: {
    width,
    height,
    resizeMode: 'cover',
  },

  // Botón flotante DepiBot
  chatbotIcon: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  chatbotButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'transparent',
    padding: 0,
    borderRadius: 30,
    zIndex: 10,
  },

  // Burbuja de saludo
  chatbotGreeting: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1bb01dff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    zIndex: 9,
  },
  greetingBox: {
    maxWidth: 180,
  },
  greetingText: {
    color: '#e0f2ff',
    fontSize: 14,
    fontWeight: '500',
  },

  // Panel flotante del chatbot
  chatPanel: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 340,
    height: 480,
    backgroundColor: '#0b1f35',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 20,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#132b42',
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#a3dcff',
  },
  closeText: {
    fontSize: 18,
    color: '#a3dcff',
  },
  chatBody: {
    flex: 1,
  },
});

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

const { width, height } = Dimensions.get('window');

const images = [
  require('@/assets/images/image1.png'),
  require('@/assets/images/image2.png'),
  require('@/assets/images/image3.png')
];

export default function CustomCarousel() {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % images.length;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 6000);

    return () => clearInterval(interval);
  }, [currentIndex]);

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
      <TouchableOpacity style={styles.chatbotButton}>
        <Image
          source={require('@/assets/icons/chatbot-icon.png')}
          style={styles.chatbotIcon}
        />
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
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
  chatbotButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#00c48c',
    padding: 12,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  chatbotIcon: {
    width: 28,
    height: 28,
    resizeMode: 'contain',
  },
});

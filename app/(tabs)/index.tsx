import { Image } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, View } from 'react-native';
import { Header } from 'react-native-elements';

const { width } = Dimensions.get('window');
const images = [
  require('@/assets/images/image1.png'),
  require('@/assets/images/image2.png'),
  require('@/assets/images/image3.png'),
  require('@/assets/images/image4.png'),
];

export default function CustomCarousel() {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % images.length;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        return nextIndex;
      });
    }, 4000); // Cambio cada 4 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <Header
        centerComponent={{ text: 'DepiLife', style: styles.headerText }}
        containerStyle={styles.header}
      />

      <View style={styles.carouselContainer}>
        <FlatList
          ref={flatListRef}
          data={images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <Image source={item} style={styles.image} />
          )}
          getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { backgroundColor: 'white'},
  headerText: { color: 'black', fontSize: 24, fontWeight: 'bold' },
  carouselContainer: { flex: 1, justifyContent: 'center' },
  image: { width, height: 500, borderRadius: 10 },
});

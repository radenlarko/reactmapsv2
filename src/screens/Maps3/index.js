import React, {useState, useCallback, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Dimensions,
} from 'react-native';
import GetLocation from 'react-native-get-location';
import Geocoder from 'react-native-geocoder-reborn';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps';

const wait = timeout => {
  return new Promise(resolve => setTimeout(resolve, timeout));
};

const Maps3 = () => {
  const [coordinate, setCoordinate] = useState({
    latitude: null,
    longitude: null,
    latitudeDelta: 0.0055,
    longitudeDelta: 0.0055,
  });
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const onRefresh = useCallback(() => {
    setLoading(true);
    wait(2000).then(() => {
      getMyLocation();
      setLoading(false);
    });
  }, [getMyLocation, setLoading]);

  const getMyLocation = useCallback(async () => {
    setLoading(true);
    try {
      const response = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });

      if (response.code === 'CANCELLED') {
        return Promise.reject(response);
      }

      if (response.code === 'UNAVAILABLE') {
        return Promise.reject(response);
      }

      if (response.code === 'TIMEOUT') {
        return Promise.reject(response);
      }

      if (response.code === 'UNAUTHORIZED') {
        return Promise.reject(response);
      }

      console.log('response: ', response);
      setCoordinate({
        ...coordinate,
        latitude: response.latitude,
        longitude: response.longitude,
      });
      setLoading(false);

      return Promise.resolve(response);
    } catch (error) {
      const {code, message} = error;
      console.warn(code, message);
      if (code === 'CANCELLED') {
        Alert.alert(
          'CANCELLED',
          'Location cancelled by user or by another request',
        );
      }
      if (code === 'UNAVAILABLE') {
        Alert.alert(
          'UNAVAILABLE',
          'Location service is disabled or unavailable',
          [{text: 'Ok', onPress: () => GetLocation.openGpsSettings()}],
        );
      }
      if (code === 'TIMEOUT') {
        Alert.alert('TIMEOUT', 'Location request timed out');
      }
      if (code === 'UNAUTHORIZED') {
        Alert.alert(
          'UNAUTHORIZED',
          'Authorization denied, please enable location permission',
          [{text: 'Ok', onPress: () => GetLocation.openAppSettings()}],
        );
      }
      setLoading(false);
    }
  }, [setLoading, setCoordinate]);

  const getAddress = useCallback(async () => {
    try {
      const lat = coordinate.latitude;
      const lng = coordinate.longitude;
      const response = await Geocoder.geocodePosition({lat, lng});

      if (coordinate.latitude === null || coordinate.longitude === null) {
        return Promise.reject(response);
      }

      console.log(response[0].formattedAddress);
      setAddress(response[0].formattedAddress);

      return Promise.resolve(response);
    } catch (error) {
      console.log(error);
    }
  }, [coordinate.latitude, coordinate.longitude, setAddress]);

  useEffect(() => {
    getMyLocation();
    getAddress();
  }, [getMyLocation, getAddress]);

  return coordinate.latitude === null ? (
    <View
      style={[
        styles.container,
        {flex: 1, justifyContent: 'center', alignItems: 'center'},
      ]}>
      <TouchableOpacity onPress={getMyLocation} disabled={loading}>
        {loading ? (
          <View style={[styles.button, {backgroundColor: 'grey'}]}>
            <ActivityIndicator size="small" color="white" />
          </View>
        ) : (
          <View style={styles.button}>
            <Text style={{color: 'white'}}>Get Location</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  ) : (
    <>
      <MapView
        provider={PROVIDER_GOOGLE} // remove if not using Google Maps
        style={styles.map}
        region={coordinate}>
        <Marker
          coordinate={{
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
          }}
        />
      </MapView>
      <View style={styles.containerFocusMap}>
        <TouchableOpacity
          onPress={() =>
            setCoordinate({
              ...coordinate,
              latitude: coordinate.latitude,
              longitude: coordinate.longitude,
            })
          }
          style={styles.focusMap}>
          <Text style={{color: 'white'}}>[ ]</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} />
          }>
          <Text style={styles.title}>My Location</Text>
          <View style={{alignItems: 'center', marginTop: 30}}>
            <Text>Latitude: {coordinate.latitude}</Text>
            <Text>Longitude: {coordinate.longitude}</Text>
          </View>
          <View View style={{alignItems: 'center', marginTop: 30}}>
            <Text>Adress :</Text>
            <Text style={styles.address}>{address}</Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

export default Maps3;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 36,
  },
  button: {
    padding: 10,
    minWidth: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'tomato',
  },
  title: {
    textAlign: 'center',
    fontSize: 22,
    color: 'grey',
    marginTop: 50,
  },
  address: {
    textAlign: 'center',
    color: 'grey',
    fontSize: 11,
  },
  map: {
    width: Dimensions.get('window').width,
    height: 260,
  },
  containerFocusMap: {
    alignItems: 'flex-end',
    marginHorizontal: 16,
    marginTop: -50,
  },
  focusMap: {
    width: 30,
    height: 30,
    backgroundColor: '#19aed4',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

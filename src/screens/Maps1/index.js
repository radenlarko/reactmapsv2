import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import GetLocation from 'react-native-get-location';
import Geocoder from 'react-native-geocoder-reborn';

const Maps1 = () => {
  const [coordinate, setCoordinate] = useState({
    latitude: null,
    longitude: null,
  });
  const [address, setAddress] = useState('');
  const [loadingCoordinate, setLoadingCoordinate] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);

  const getMyLocation = async () => {
    setLoadingCoordinate(true);
    await GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    })
      .then(location => {
        console.log(location);
        setCoordinate({
          ...coordinate,
          latitude: location.latitude,
          longitude: location.longitude,
        });
        setLoadingCoordinate(false);
      })
      .catch(error => {
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
          Alert.alert('UNAUTHORIZED', 'Authorization denied, please enable location permission', [
            {text: 'Ok', onPress: () => GetLocation.openAppSettings()},
          ]);
        }
        setCoordinate({
          ...coordinate,
          latitude: null,
          longitude: null,
        });
        setLoadingCoordinate(false);
      });
  };

  const getAddress = async () => {
    setLoadingAddress(true);
    const lat = coordinate.latitude;
    const lng = coordinate.longitude;

    await Geocoder.geocodePosition({lat, lng})
      .then(res => {
        console.log(res[0].formattedAddress);
        setAddress(res[0].formattedAddress);
        setLoadingAddress(false);
      })
      .catch(err => {
        console.log(err);
        Alert.alert('Error!!', String(err));
        setLoadingAddress(false);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Location</Text>
      <TouchableOpacity onPress={getMyLocation} disabled={loadingCoordinate}>
        <View style={styles.button}>
          {loadingCoordinate ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={{color: 'white'}}>Get Location</Text>
          )}
        </View>
      </TouchableOpacity>
      <View style={{alignItems: 'center'}}>
        <Text>Latitude: {coordinate.latitude}</Text>
        <Text>Longitude: {coordinate.longitude}</Text>
      </View>
      {coordinate.latitude === null ? null : (
        <>
          <TouchableOpacity onPress={getAddress} disabled={loadingAddress}>
            <View style={styles.button}>
              {loadingAddress ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={{color: 'white'}}>Get Address</Text>
              )}
            </View>
          </TouchableOpacity>
          <View View style={{alignItems: 'center'}}>
            <Text>Adress :</Text>
            <Text style={styles.address}>{address}</Text>
          </View>
        </>
      )}
    </View>
  );
};

export default Maps1;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 36,
  },
  button: {
    padding: 10,
    minWidth: 120,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'tomato',
    marginTop: 30,
  },
  title: {
    fontSize: 22,
    color: 'grey',
  },
  address: {
    textAlign: 'center',
    color: 'grey',
    fontSize: 11,
  },
});

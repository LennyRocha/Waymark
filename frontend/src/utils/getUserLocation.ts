export const getUserLocation = () => {
  return new Promise<{ lat: number; lng: number }>(
    (resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation not supported");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        reject,
        {
          enableHighAccuracy: true,
          timeout: 5000,
        }
      );
    }
  );
};
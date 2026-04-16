export const getUserLocation = () => {
  return new Promise<{ lat: number; lng: number }>(
    (resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      /**
       * Geolocation is required to obtain the approximate location
       * of the property being registered.
       * This is triggered only after explicit user interaction.
       */
      // NOSONAR

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error(error.message));
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
        },
      );
    },
  );
};

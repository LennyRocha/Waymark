declare module '@mapbox/mapbox-sdk/services/geocoding' {
  const mbxGeocoding: (options: { accessToken: string }) => {
    reverseGeocode: (args: {
      query: [number, number];
      language?: string[];
      countries?: string[];
      limit?: number;
    }) => {
      send: () => Promise<any>;
    };
  };

  export default mbxGeocoding;
}
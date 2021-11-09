import { createSlice } from '@reduxjs/toolkit';

export const simdataSlice = createSlice({
  name: 'simdata',
  initialState: {
    position: undefined,
    altitude: 0,
    heading: 0,
    airspeed: 0,
    vertical_speed: 0,
    airspeed_true: 0,
    flaps: 0,
    trim: 0,
    rudder_trim: 0
  },
  reducers: {
    updateData: (state, action) => {
      const msg = action.payload;
      state.position = [msg.latitude, msg.longitude];
      state.altitude = msg.altitude;
      state.heading = msg.heading;
      state.airspeed = msg.airspeed;
      state.vertical_speed = msg.vertical_speed;
      state.airspeed_true = msg.airspeed_true;
      state.flaps = msg.flaps;
      state.trim = msg.trim;
      state.rudder_trim = msg.rudder_trim;
    }
  }
});

export const {
  updateData
} = simdataSlice.actions;

export const selectSimdata = state => state.simdata;

export default simdataSlice.reducer;

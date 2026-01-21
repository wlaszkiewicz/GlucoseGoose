// Nightscout entry
export interface NightscoutEntry {
  _id: string;
  sgv: number;
  date: number;
  dateString?: string;
  direction?: string;
  device?: string;
  type?: string;
  delta?: number;
  [key: string]: any;

  //
  //       "_id": "692ca490bba05cd97dd03efa",
  //       "device": "xDrip-DexcomG5",
  //       "date": 1764533380858,
  //       "dateString": "2025-11-30T20:09:40.858Z",
  //       "sgv": 108,
  //       "delta": 2.997,
  //       "direction": "Flat",
  //       "type": "sgv",
  //       "filtered": 0,
  //       "unfiltered": 0,
  //       "rssi": 100,
  //       "noise": 1,
  //       "sysTime": "2025-11-30T20:09:40.858Z",
  //       "utcOffset": 60
  //
}

// Nightscout treatment / activity
export interface NightscoutTreatment {
  _id?: string;
  eventType: string; // e.g., "Meal: Breakfast", "Insulin: Bolus", "Activity: Yoga"
  created_at: string;
  notes?: string;
  enteredBy?: string;

  // food
  carbs?: number;
  fat?: number;
  protein?: number;
  sugar?: number;
  fiber?: number;
  calories?: number;

  // insulin
  insulin?: number;

  // activity
  duration?: number;

  // extras
  [key: string]: any;

  // {
  //     "_id": "692b01f9bba05cd97dd03d93",
  //     "eventType": "Meal: Breakfast",
  //     "enteredBy": "Postman",
  //     "notes": "Breakfast: 2 eggs, toast with butter",
  //     "carbs": 45,
  //     "protein": 20,
  //     "fat": 15,
  //     "fiber": 3,
  //     "calories": 350,
  //     "created_at": "2025-11-29T14:23:00.000Z",
  //     "utcOffset": 0,
  //     "insulin": null
  // },

  // {
  //       "_id": "69297f47bba05cd97dd03c35",
  //       "enteredBy": "GlucoseGoose App",
  //       "eventType": "Exercise",
  //       "duration": 22,
  //       "notes": "walking",
  //       "created_at": "2025-11-27T15:10:10.000Z",
  //       "utcOffset": 0,
  //       "carbs": 33,
  //       "insulin": null
  //   },
}

// What we return to the app
export interface NightscoutBundleResponse {
  timestamp: number;
  entries: NightscoutEntry[];
  otherTreatments: NightscoutTreatment[];
  meals: NightscoutTreatment[];
  activities?: NightscoutTreatment[];
}

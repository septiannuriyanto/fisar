// reducers/index.ts
import { combineReducers } from 'redux';
import whatsappReducer from './whatsappReducers';

const rootReducer = combineReducers({
  whatsapp: whatsappReducer,
});

export default rootReducer;

export type AppState = ReturnType<typeof rootReducer>;

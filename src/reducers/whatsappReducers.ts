// reducers/whatsappReducer.ts
import { WASocket } from '@whiskeysockets/baileys';

export interface WhatsAppState {
  sock: WASocket | null;
}
// reducers/whatsappReducer.ts
const initialState = {
    sock: null,
  };
  
  const whatsappReducer = (state = initialState, action: any) => {
    switch (action.type) {
      case 'SET_SOCK_INSTANCE':
        console.log('[REDUCER] Sock instance masuk');
        return {
          ...state,
          sock: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default whatsappReducer;
  
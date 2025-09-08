import io from 'socket.io-client';
import { API_URL } from '../config/api';

class FinancialWebSocket {
  constructor(token, baseURL = API_URL) {
    this.token = token;
    this.baseURL = baseURL;
    this.socket = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.isConnected = false;
    
    // Event callbacks
    this.onFinancialUpdate = null;
    this.onHouseFinancialUpdate = null;
    this.onBillUpdate = null;
    this.onChargeUpdate = null;
    this.onConnectionChange = null;
  }

  connect() {
    if (this.socket && this.isConnected) {
      console.log('🔌 WebSocket already connected');
      return;
    }

    console.log('🚀 Connecting to financial WebSocket...');
    
    this.socket = io(this.baseURL, {
      auth: { 
        token: this.token 
      },
      transports: ['websocket', 'polling'],
      timeout: 10000,
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: this.maxReconnectAttempts
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Financial WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      if (this.onConnectionChange) {
        this.onConnectionChange(true);
      }
    });

    this.socket.on('connected', (data) => {
      console.log('✅ Real-time financial updates enabled:', data);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('🔌 Financial WebSocket disconnected:', reason);
      this.isConnected = false;
      if (this.onConnectionChange) {
        this.onConnectionChange(false);
      }
      
      // Don't auto-reconnect if disconnected by server
      if (reason === 'io server disconnect') {
        console.log('🚫 Server disconnected us - not reconnecting automatically');
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Financial WebSocket connection error:', error);
      this.isConnected = false;
      if (this.onConnectionChange) {
        this.onConnectionChange(false);
      }
    });

    // Financial update events
    this.socket.on('financial_update', (data) => {
      console.log('💰 User financial update received:', data);
      if (this.onFinancialUpdate) {
        this.onFinancialUpdate(data);
      }
    });

    this.socket.on('house_financial_update', (data) => {
      console.log('🏠 House financial update received:', data);
      if (this.onHouseFinancialUpdate) {
        this.onHouseFinancialUpdate(data);
      }
    });

    this.socket.on('bill_update', (data) => {
      console.log('📄 Bill update received:', data);
      if (this.onBillUpdate) {
        this.onBillUpdate(data);
      }
    });

    this.socket.on('charge_update', (data) => {
      console.log('💳 Charge update received:', data);
      if (this.onChargeUpdate) {
        this.onChargeUpdate(data);
      }
    });

    this.socket.on('house_charge_update', (data) => {
      console.log('🏠💳 House charge update received:', data);
      if (this.onHouseFinancialUpdate) {
        this.onHouseFinancialUpdate(data);
      }
    });
  }

  // Set event handlers
  setFinancialUpdateHandler(callback) {
    this.onFinancialUpdate = callback;
  }

  setHouseFinancialUpdateHandler(callback) {
    this.onHouseFinancialUpdate = callback;
  }

  setBillUpdateHandler(callback) {
    this.onBillUpdate = callback;
  }

  setChargeUpdateHandler(callback) {
    this.onChargeUpdate = callback;
  }

  setConnectionChangeHandler(callback) {
    this.onConnectionChange = callback;
  }

  // Connection management
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting financial WebSocket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  reconnect() {
    this.disconnect();
    setTimeout(() => {
      this.connect();
    }, 1000);
  }

  // Status
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }

  // Update token (for auth refresh)
  updateToken(newToken) {
    this.token = newToken;
    if (this.socket && this.isConnected) {
      // Reconnect with new token
      this.reconnect();
    }
  }
}

export default FinancialWebSocket;

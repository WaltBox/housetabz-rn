// Simple event emitter for React Native
class EventEmitter {
  constructor() {
    this.events = {};
    // Track the current dashboard scroll position
    this.dashboardScrollPosition = 0;
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event, data) {
    // Store dashboard scroll position when it changes
    if (event === 'dashboardScroll') {
      this.dashboardScrollPosition = data;
    }
    
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }

  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }

  // Get the current dashboard scroll position
  getDashboardScrollPosition() {
    return this.dashboardScrollPosition;
  }

  // Reset scroll position (useful for testing or manual reset)
  resetDashboardScrollPosition() {
    this.dashboardScrollPosition = 0;
  }
}

export const scrollEmitter = new EventEmitter();


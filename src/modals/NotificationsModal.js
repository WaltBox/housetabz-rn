import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import axios from 'axios';

const NotificationsModal = () => {
  const userId = 1; // Hardcoded user ID for now
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('unread'); // 'unread' or 'read'
  const [toastMessage, setToastMessage] = useState(null);
  const [toastOpacity] = useState(new Animated.Value(0)); // Animation for toast message

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `https://566d-2605-a601-a0c6-4f00-f5b9-89d9-ed7b-1de.ngrok-free.app/api/users/${userId}/notifications`
        );
        console.log('Notifications fetched:', response.data); // Debugging
        setNotifications(
          response.data.map((notification) => ({
            ...notification,
            justRead: false, // Add local flag
          }))
        );
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    };

    fetchNotifications();
  }, [userId]);

  // Show a temporary toast message
  const showToast = (message) => {
    setToastMessage(message);
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setToastMessage(null));
      }, 5000);
    });
  };

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(
        `https://566d-2605-a601-a0c6-4f00-f5b9-89d9-ed7b-1de.ngrok-free.app/api/users/${userId}/notifications/${notificationId}`
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true, justRead: true } : n
        )
      );
      showToast('Message marked as read');
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  // Filter notifications based on isRead status
  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') {
      return !n.isRead || n.justRead; // Include justRead for the current session
    }
    return n.isRead && !n.justRead; // Exclude justRead for "Read" filter
  });

  // Render each notification
  const renderNotification = ({ item }) => (
    <View style={styles.notificationItem}>
      <TouchableOpacity
        style={[
          styles.circle,
          item.isRead && styles.circleRead, // Green filled circle if read
        ]}
        onPress={() => !item.isRead && markAsRead(item.id)}
      />
      <View style={styles.notificationContent}>
        <Text style={styles.notificationText}>{item.message}</Text>
        <Text style={styles.notificationDate}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Text style={styles.title}>Notifications</Text>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'unread' && styles.activeFilterButton,
          ]}
          onPress={() => setFilter('unread')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'unread' && styles.activeFilterText,
            ]}
          >
            Unread
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'read' && styles.activeFilterButton,
          ]}
          onPress={() => setFilter('read')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'read' && styles.activeFilterText,
            ]}
          >
            Read
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notifications */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNotification}
        contentContainerStyle={styles.notificationsList}
        ListEmptyComponent={
          <Text style={styles.noNotifications}>
            No {filter} notifications right now!
          </Text>
        }
      />

      {/* Toast Message */}
      {toastMessage && (
        <Animated.View
          style={[styles.toast, { opacity: toastOpacity }]}
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  activeFilterButton: {
    backgroundColor: '#45B7D1',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  activeFilterText: {
    color: '#fff',
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#45B7D1',
    marginRight: 15,
  },
  circleRead: {
    backgroundColor: '#45B7D1',
    borderColor: '#45B7D1',
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  notificationDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  noNotifications: {
    fontSize: 18,
    textAlign: 'center',
    color: '#888',
    marginTop: 30,
  },
  notificationsList: {
    marginTop: 10,
  },
  toast: {
    position: 'absolute',
    bottom: 20,
    left: '10%',
    right: '10%',
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default NotificationsModal;

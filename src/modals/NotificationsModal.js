import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from '../context/AuthContext';
// Import apiClient instead of axios
import apiClient from '../config/api';

const { width } = Dimensions.get('window');

const NotificationsModal = ({ onClose }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [toastMessage, setToastMessage] = useState(null);
  const [toastOpacity] = useState(new Animated.Value(0));

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
    }
  }, [user?.id]);

  const fetchNotifications = async () => {
    try {
      if (!user?.id) return;
      
      // Use apiClient with relative path
      const response = await apiClient.get(
        `/api/users/${user.id}/notifications`
      );
      
      setNotifications(response.data.map(notification => ({
        ...notification,
        justRead: false,
      })));
    } catch (err) {
      // Check if this is the specific "no notifications" error
      if (err.response && 
          err.response.status === 404 && 
          err.response.data && 
          err.response.data.message === "No notifications found for this user.") {
        console.log('User has no notifications');
        // Set empty notifications array
        setNotifications([]);
      } else {
        // This is an actual error with the API
        console.error('Failed to fetch notifications:', err);
        setNotifications([]);
      }
    }
  };

  const showToast = (message) => {
    setToastMessage(message);
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setToastMessage(null));
  };

  const markAsRead = async (notificationId) => {
    try {
      if (!user?.id) return;
      // Use apiClient with relative path
      await apiClient.patch(
        `/api/users/${user.id}/notifications/${notificationId}`
      );
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true, justRead: true } : n
        )
      );
      showToast('Marked as read');
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={styles.notificationItem}
      onPress={() => !item.isRead && markAsRead(item.id)}
      activeOpacity={0.6}
    >
      <View style={styles.notificationRow}>
        {/* Unread indicator */}
        {!item.isRead && (
          <View style={styles.unreadIndicator} />
        )}
        
        {/* Content */}
        <View style={styles.notificationContent}>
          <Text style={[
            styles.notificationText,
            item.isRead && styles.notificationTextRead
          ]}>
            {item.message}
          </Text>
          
          <View style={styles.metaContainer}>
            <MaterialIcons 
              name="access-time" 
              size={12} 
              color="#94a3b8"
              style={styles.timeIcon}
            />
            <Text style={styles.timeText}>
              {new Date(item.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              })}
            </Text>
          </View>
        </View>

        {/* Chevron for unread */}
        {!item.isRead && (
          <MaterialIcons 
            name="chevron-right" 
            size={20} 
            color="#94a3b8"
            style={styles.chevron}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.listHeaderText}>
        {filter === 'unread' 
          ? 'New Notifications' 
          : filter === 'read' 
            ? 'Past Notifications'
            : 'All Notifications'
        }
      </Text>
    </View>
  );

  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons 
        name={filter === 'unread' ? "notifications-none" : "history"} 
        size={48} 
        color="#e2e8f0"
      />
      <Text style={styles.emptyTitle}>
        {filter === 'unread' ? 'All Caught Up!' : 'No notifications yet'}
      </Text>
      <Text style={styles.emptyText}>
        {filter === 'unread' 
          ? "You're all up to date" 
          : "Your past notifications will appear here"}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Inbox</Text>
          {/* <TouchableOpacity 
            onPress={onClose}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <MaterialIcons name="close" size={24} color="#64748b" />
          </TouchableOpacity> */}
        </View>

        {/* Filters */}
        <View style={styles.filterContainer}>
          {['all', 'unread', 'read'].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterTab,
                filter === f && styles.filterTabActive
              ]}
            >
              <Text style={[
                styles.filterText,
                filter === f && styles.filterTextActive
              ]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.list}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />

      {/* Toast */}
      {toastMessage && (
        <Animated.View 
          style={[styles.toast, { opacity: toastOpacity }]}
        >
          <MaterialIcons name="check" size={16} color="white" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingTop: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    fontFamily: 'Quicksand-Bold',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  filterTab: {
    marginRight: 24,
    paddingVertical: 12,
  },
  filterTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#10b981',
  },
  filterText: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#34d399',
    fontWeight: '600',
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
  },
  listHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  list: {
    flexGrow: 1,
  },
  notificationItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
    marginRight: 16,
  },
  notificationText: {
    fontSize: 15,
    color: 'black',
    lineHeight: 20,
    marginBottom: 4,
  },
  notificationTextRead: {
    color: '#64748b',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    marginRight: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  chevron: {
    marginLeft: 'auto',
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  toast: {
    position: 'absolute',
    bottom: 24,
    left: width * 0.1,
    right: width * 0.1,
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  toastText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default NotificationsModal;
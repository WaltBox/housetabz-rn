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
import axios from 'axios';

const { width } = Dimensions.get('window');

const NotificationsModal = ({ onClose }) => {
  const userId = 1;
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('unread');
  const [toastMessage, setToastMessage] = useState(null);
  const [toastOpacity] = useState(new Animated.Value(0));

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3004/api/users/${userId}/notifications`
      );
      setNotifications(
        response.data.map((notification) => ({
          ...notification,
          justRead: false,
        }))
      );
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
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
      await axios.patch(
        `http://localhost:3004/api/users/${userId}/notifications/${notificationId}`
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true, justRead: true } : n
        )
      );
      showToast('Notification marked as read');
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const filteredNotifications = notifications.filter((n) =>
    filter === 'unread' ? !n.isRead || n.justRead : n.isRead && !n.justRead
  );

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.isRead && styles.notificationItemUnread
      ]}
      onPress={() => !item.isRead && markAsRead(item.id)}
      activeOpacity={0.8}
    >
      <View style={styles.notificationStatus}>
        {!item.isRead && <View style={styles.unreadDot} />}
      </View>
      
      <View style={styles.notificationContent}>
        <Text style={styles.notificationText}>{item.message}</Text>
        <View style={styles.notificationMeta}>
          <MaterialIcons 
            name="access-time" 
            size={14} 
            color="#94a3b8"
            style={styles.timeIcon}
          />
          <Text style={styles.notificationTime}>
            {new Date(item.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </View>
      
      {!item.isRead && (
        <MaterialIcons 
          name="chevron-right" 
          size={20} 
          color="#94a3b8"
          style={styles.chevron}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Notifications</Text>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={onClose}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialIcons name="close" size={22} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          <TouchableOpacity
            style={[styles.tab, filter === 'unread' && styles.activeTab]}
            onPress={() => setFilter('unread')}
          >
            <Text style={[styles.tabText, filter === 'unread' && styles.activeTabText]}>
              Unread
            </Text>
            {filteredNotifications.length > 0 && filter === 'unread' && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{filteredNotifications.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, filter === 'read' && styles.activeTab]}
            onPress={() => setFilter('read')}
          >
            <Text style={[styles.tabText, filter === 'read' && styles.activeTabText]}>
              History
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderNotification}
        contentContainerStyle={styles.notificationsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons 
              name={filter === 'unread' ? "notifications-none" : "inventory"} 
              size={48} 
              color="#e2e8f0"
            />
            <Text style={styles.emptyTitle}>
              {filter === 'unread' ? 'All Caught Up!' : 'No Past Notifications'}
            </Text>
            <Text style={styles.emptyText}>
              {filter === 'unread' 
                ? 'Youre up to date with all your notifications' 
                : 'Previously read notifications will appear here'}
            </Text>
          </View>
        }
      />

      {/* Toast Message */}
      {toastMessage && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
          <MaterialIcons name="check-circle" size={20} color="white" />
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
    paddingTop: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 24,
  },
  tab: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#22c55e',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#64748b',
  },
  activeTabText: {
    color: '#22c55e',
  },
  badge: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  notificationsList: {
    padding: 24,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  notificationItemUnread: {
    backgroundColor: '#f8fafc',
    borderColor: '#e2e8f0',
  },
  notificationStatus: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22c55e',
  },
  notificationContent: {
    flex: 1,
    marginLeft: 12,
  },
  notificationText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1e293b',
    marginBottom: 6,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    marginRight: 4,
  },
  notificationTime: {
    fontSize: 13,
    color: '#94a3b8',
  },
  chevron: {
    marginLeft: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: '80%',
  },
  toast: {
    position: 'absolute',
    bottom: 32,
    left: '50%',
    transform: [{ translateX: -width * 0.4 }],
    width: width * 0.8,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  toastText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default NotificationsModal;
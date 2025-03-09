import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
  Platform,
  StatusBar
} from 'react-native';
import { MaterialIcons } from "@expo/vector-icons";
import { useAuth } from '../context/AuthContext';
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
      
      const response = await apiClient.get(
        `/api/users/${user.id}/notifications`
      );
      
      setNotifications(response.data.map(notification => ({
        ...notification,
        justRead: false,
      })));
    } catch (err) {
      if (err.response?.status === 404) {
        setNotifications([]);
      } else {
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
        {!item.isRead && (
          <View style={styles.unreadIndicator} />
        )}
        
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

        {!item.isRead && (
          <MaterialIcons 
            name="chevron-right" 
            size={20} 
            color="#cbd5e1"
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
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#dff6f0" />
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
              hitSlop={{ top: 15, right: 15, bottom: 15, left: 15 }}
            >
              <MaterialIcons name="close" size={28} color="#64748b" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Inbox</Text>
            <View style={styles.headerPlaceholder} />
          </View>

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

        {toastMessage && (
          <Animated.View 
            style={[styles.toast, { opacity: toastOpacity }]}
          >
            <MaterialIcons name="check" size={16} color="white" />
            <Text style={styles.toastText}>{toastMessage}</Text>
          </Animated.View>
        )}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#dff6f0",
  },
  headerContainer: {
    backgroundColor: "#dff6f0",
    borderBottomWidth: 0.5,
    borderBottomColor: '#d1d5db',
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    fontFamily: 'Quicksand-Bold',
  },
  closeButton: {
    padding: 5,
  },
  headerPlaceholder: {
    width: 28,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 10,
  },
  filterTab: {
    marginRight: 24,
    paddingVertical: 12,
  },
  filterTabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#34d399',
  },
  filterText: {
    fontSize: 15,
    color: '#64748b',
    fontWeight: '500',
    fontFamily: 'Quicksand-Medium',
  },
  filterTextActive: {
    color: '#34d399',
    fontWeight: '600',
  },
  listHeader: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#dff6f0',
  },
  listHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Quicksand-SemiBold',
  },
  list: {
    flexGrow: 1,
  },
  notificationItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34d399',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
    marginRight: 16,
  },
  notificationText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
    marginBottom: 4,
    fontFamily: 'Quicksand-Medium',
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
    fontFamily: 'Quicksand-Regular',
  },
  chevron: {
    marginLeft: 'auto',
  },
  separator: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginLeft: 20,
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
    fontFamily: 'Quicksand-SemiBold',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    fontFamily: 'Quicksand-Regular',
  },
  toast: {
    position: 'absolute',
    bottom: 24,
    left: width * 0.1,
    right: width * 0.1,
    backgroundColor: '#34d399',
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
    fontFamily: 'Quicksand-Medium',
  },
});

export default NotificationsModal;
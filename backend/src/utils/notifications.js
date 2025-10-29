const { Expo } = require('expo-server-sdk');

// Create a new Expo SDK client
const expo = new Expo();

/**
 * Send push notification to a single user
 * @param {string} pushToken - Expo push token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data
 * @returns {Promise<object>} - Result of sending notification
 */
const sendPushNotification = async (pushToken, title, body, data = {}) => {
  try {
    // Check that token is valid Expo push token
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      return { success: false, error: 'Invalid push token' };
    }

    // Create the message
    const message = {
      to: pushToken,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
      channelId: 'kambio-nudges'
    };

    // Send notification
    const chunks = expo.chunkPushNotifications([message]);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending notification chunk:', error);
      }
    }

    return { success: true, tickets };
  } catch (error) {
    console.error('Error in sendPushNotification:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send push notifications to multiple users
 * @param {Array} notifications - Array of {pushToken, title, body, data}
 * @returns {Promise<object>} - Result of sending notifications
 */
const sendBulkPushNotifications = async (notifications) => {
  try {
    const messages = [];

    for (const notif of notifications) {
      const { pushToken, title, body, data = {} } = notif;

      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
        continue;
      }

      messages.push({
        to: pushToken,
        sound: 'default',
        title,
        body,
        data,
        priority: 'high',
        channelId: 'kambio-nudges'
      });
    }

    // Send notifications in chunks
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error sending notification chunk:', error);
      }
    }

    return { success: true, tickets, sent: messages.length };
  } catch (error) {
    console.error('Error in sendBulkPushNotifications:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check receipt status of sent notifications
 * @param {Array} receiptIds - Array of receipt IDs
 * @returns {Promise<object>} - Receipt status
 */
const checkReceiptStatus = async (receiptIds) => {
  try {
    const receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
    const receipts = [];

    for (const chunk of receiptIdChunks) {
      try {
        const receiptChunk = await expo.getPushNotificationReceiptsAsync(chunk);
        receipts.push(receiptChunk);
      } catch (error) {
        console.error('Error checking receipts:', error);
      }
    }

    return { success: true, receipts };
  } catch (error) {
    console.error('Error in checkReceiptStatus:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPushNotification,
  sendBulkPushNotifications,
  checkReceiptStatus
};

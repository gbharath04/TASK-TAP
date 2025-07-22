import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase-config';

export const chatService = {
  // Create a new chat
  async createChat(jobId, participants) {
    try {
      const chatRef = await addDoc(collection(db, 'chats'), {
        jobId,
        participants,
        createdAt: serverTimestamp(),
        lastMessage: null,
        lastMessageTime: null
      });
      return chatRef.id;
    } catch (error) {
      throw error;
    }
  },

  // Send a message
  async sendMessage(chatId, senderId, content) {
    try {
      const messageRef = await addDoc(collection(db, `chats/${chatId}/messages`), {
        senderId,
        content,
        createdAt: serverTimestamp()
      });

      // Update chat's last message
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        lastMessage: content,
        lastMessageTime: serverTimestamp()
      });

      return messageRef.id;
    } catch (error) {
      throw error;
    }
  },

  // Subscribe to chat messages
  subscribeToChat(chatId, callback) {
    const messagesQuery = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(messagesQuery, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(messages);
    });
  },

  // Get user's chats
  async getUserChats(userId) {
    try {
      const chatsQuery = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', userId),
        orderBy('lastMessageTime', 'desc')
      );
      
      const snapshot = await getDocs(chatsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      throw error;
    }
  }
}; 
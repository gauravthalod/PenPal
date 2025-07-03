import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc,
  updateDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  Timestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { COLLECTIONS } from './database';

// Chat interface
export interface Chat {
  id?: string;
  participants: string[]; // Array of user IDs
  participantNames: string[]; // Array of user names
  gigId: string;
  gigTitle: string;
  offerId: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Message interface
export interface Message {
  id?: string;
  chatId: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'file';
  createdAt: Date;
  readBy: string[]; // Array of user IDs who have read the message
}

// Chat operations
export const chatService = {
  // Create a new chat when offer is accepted
  async createChat(chatData: Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const chatsRef = collection(db, COLLECTIONS.CHATS);
      
      // Check if chat already exists for this offer
      const existingChatQuery = query(
        chatsRef,
        where('offerId', '==', chatData.offerId)
      );
      const existingChats = await getDocs(existingChatQuery);
      
      if (!existingChats.empty) {
        // Return existing chat
        const existingChat = existingChats.docs[0];
        return {
          id: existingChat.id,
          ...existingChat.data(),
          createdAt: existingChat.data().createdAt?.toDate() || new Date(),
          updatedAt: existingChat.data().updatedAt?.toDate() || new Date(),
          lastMessageTime: existingChat.data().lastMessageTime?.toDate()
        } as Chat;
      }
      
      const chatDoc = {
        ...chatData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      const docRef = doc(chatsRef);
      await setDoc(docRef, chatDoc);
      
      return { 
        id: docRef.id, 
        ...chatData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error("Error creating chat:", error);
      throw error;
    }
  },

  // Get chats for a user
  async getChatsForUser(userId: string) {
    try {
      const chatsRef = collection(db, COLLECTIONS.CHATS);
      const q = query(
        chatsRef,
        where('participants', 'array-contains', userId),
        orderBy('updatedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        lastMessageTime: doc.data().lastMessageTime?.toDate()
      })) as Chat[];
    } catch (error) {
      console.error("Error getting chats for user:", error);
      throw error;
    }
  },

  // Send a message
  async sendMessage(messageData: Omit<Message, 'id' | 'createdAt' | 'readBy'>) {
    try {
      const messagesRef = collection(db, COLLECTIONS.MESSAGES);
      const messageDoc = {
        ...messageData,
        createdAt: Timestamp.now(),
        readBy: [messageData.senderId] // Sender has read the message
      };
      
      const docRef = await addDoc(messagesRef, messageDoc);
      
      // Update chat's last message info
      const chatRef = doc(db, COLLECTIONS.CHATS, messageData.chatId);
      await updateDoc(chatRef, {
        lastMessage: messageData.content,
        lastMessageTime: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      
      return { 
        id: docRef.id, 
        ...messageData,
        createdAt: new Date(),
        readBy: [messageData.senderId]
      };
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  // Get messages for a chat
  async getMessagesForChat(chatId: string, limitCount = 50) {
    try {
      const messagesRef = collection(db, COLLECTIONS.MESSAGES);
      const q = query(
        messagesRef,
        where('chatId', '==', chatId),
        orderBy('createdAt', 'asc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Message[];
    } catch (error) {
      console.error("Error getting messages for chat:", error);
      throw error;
    }
  },

  // Listen to real-time messages for a chat
  subscribeToMessages(chatId: string, callback: (messages: Message[]) => void): Unsubscribe {
    const messagesRef = collection(db, COLLECTIONS.MESSAGES);
    const q = query(
      messagesRef,
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Message[];
      
      callback(messages);
    });
  },

  // Mark messages as read
  async markMessagesAsRead(chatId: string, userId: string) {
    try {
      const messagesRef = collection(db, COLLECTIONS.MESSAGES);
      const q = query(
        messagesRef,
        where('chatId', '==', chatId),
        where('readBy', 'not-in', [[userId]]) // Messages not read by this user
      );
      
      const querySnapshot = await getDocs(q);
      const updatePromises = querySnapshot.docs.map(doc => {
        const currentReadBy = doc.data().readBy || [];
        if (!currentReadBy.includes(userId)) {
          return updateDoc(doc.ref, {
            readBy: [...currentReadBy, userId]
          });
        }
        return Promise.resolve();
      });
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error marking messages as read:", error);
      throw error;
    }
  },

  // Get unread message count for a user
  async getUnreadCount(userId: string) {
    try {
      const chats = await this.getChatsForUser(userId);
      let totalUnread = 0;
      
      for (const chat of chats) {
        if (chat.id) {
          const messagesRef = collection(db, COLLECTIONS.MESSAGES);
          const q = query(
            messagesRef,
            where('chatId', '==', chat.id),
            where('senderId', '!=', userId), // Not sent by current user
            where('readBy', 'not-in', [[userId]]) // Not read by current user
          );
          
          const querySnapshot = await getDocs(q);
          totalUnread += querySnapshot.size;
        }
      }
      
      return totalUnread;
    } catch (error) {
      console.error("Error getting unread count:", error);
      return 0;
    }
  }
};

export default chatService;

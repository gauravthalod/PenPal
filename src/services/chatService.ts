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
      console.log("💬 Creating chat for offer:", chatData.offerId);
      console.log("💬 Chat participants:", chatData.participants);
      console.log("💬 Chat gig:", chatData.gigTitle);

      const chatsRef = collection(db, COLLECTIONS.CHATS);

      // Check if chat already exists for this offer
      console.log("🔍 Checking for existing chat...");
      const existingChatQuery = query(
        chatsRef,
        where('offerId', '==', chatData.offerId)
      );
      const existingChats = await getDocs(existingChatQuery);

      if (!existingChats.empty) {
        // Return existing chat
        console.log("✅ Found existing chat, returning it");
        const existingChat = existingChats.docs[0];
        return {
          id: existingChat.id,
          ...existingChat.data(),
          createdAt: existingChat.data().createdAt?.toDate() || new Date(),
          updatedAt: existingChat.data().updatedAt?.toDate() || new Date(),
          lastMessageTime: existingChat.data().lastMessageTime?.toDate()
        } as Chat;
      }

      console.log("🆕 Creating new chat...");
      const chatDoc = {
        ...chatData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = doc(chatsRef);
      await setDoc(docRef, chatDoc);

      console.log("✅ Chat created successfully with ID:", docRef.id);

      return {
        id: docRef.id,
        ...chatData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      console.error("❌ Error creating chat:", error);
      throw error;
    }
  },

  // Get chats for a user
  async getChatsForUser(userId: string) {
    try {
      console.log("💬 Getting chats for user:", userId);
      const chatsRef = collection(db, COLLECTIONS.CHATS);
      // Simplified query without orderBy to avoid index requirement
      const q = query(
        chatsRef,
        where('participants', 'array-contains', userId)
      );

      const querySnapshot = await getDocs(q);
      const chats = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        lastMessageTime: doc.data().lastMessageTime?.toDate()
      })) as Chat[];

      // Sort client-side to avoid index requirement
      chats.sort((a, b) => {
        const aTime = a.lastMessageTime || a.updatedAt;
        const bTime = b.lastMessageTime || b.updatedAt;
        return bTime.getTime() - aTime.getTime();
      });

      console.log(`💬 Found ${chats.length} chats for user ${userId}`);
      return chats;
    } catch (error) {
      console.error("❌ Error getting chats for user:", error);
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
      console.log("📨 Getting messages for chat:", chatId);
      const messagesRef = collection(db, COLLECTIONS.MESSAGES);
      // Simplified query without orderBy to avoid index requirement
      const q = query(
        messagesRef,
        where('chatId', '==', chatId)
      );

      const querySnapshot = await getDocs(q);
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Message[];

      // Sort client-side and limit
      messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
      const limitedMessages = messages.slice(-limitCount); // Get last N messages

      console.log(`📨 Found ${limitedMessages.length} messages for chat ${chatId}`);
      return limitedMessages;
    } catch (error) {
      console.error("❌ Error getting messages for chat:", error);
      throw error;
    }
  },

  // Listen to real-time messages for a chat
  subscribeToMessages(chatId: string, callback: (messages: Message[]) => void): Unsubscribe {
    const messagesRef = collection(db, COLLECTIONS.MESSAGES);
    // Simplified query without orderBy to avoid index requirement
    const q = query(
      messagesRef,
      where('chatId', '==', chatId)
    );

    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as Message[];

      // Sort client-side
      messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

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

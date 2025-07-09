import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
  Unsubscribe,
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL,
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

// Global chat message interface
export interface GlobalMessage {
  id?: string;
  senderId: string;
  senderName: string;
  senderLocation?: string;
  content: string;
  type: 'text' | 'image' | 'video' | 'document';
  mediaUrl?: string;
  mediaName?: string;
  mediaSize?: number;
  videoDuration?: number; // For videos, in seconds
  createdAt: Date;
}

// File upload interface
export interface FileUpload {
  file: File;
  type: 'image' | 'video' | 'document';
  preview?: string;
}

const COLLECTIONS = {
  GLOBAL_MESSAGES: 'globalMessages'
};

// Global chat service
export const globalChatService = {
  // Send a text message
  async sendTextMessage(senderId: string, senderName: string, content: string, senderLocation?: string) {
    try {
      console.log("📤 Sending text message to global chat");
      
      const messagesRef = collection(db, COLLECTIONS.GLOBAL_MESSAGES);
      const messageData = {
        senderId,
        senderName,
        senderLocation: senderLocation || '',
        content: content.trim(),
        type: 'text' as const,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(messagesRef, messageData);
      console.log("✅ Text message sent successfully:", docRef.id);
      
      return {
        id: docRef.id,
        ...messageData,
        createdAt: new Date()
      };
    } catch (error) {
      console.error("❌ Error sending text message:", error);
      throw error;
    }
  },

  // Convert file to base64 data URL (for images) or handle other files
  async processFile(file: File, senderId: string): Promise<{ url: string; name: string; size: number }> {
    try {
      console.log("📤 Processing file:", file.name, file.size);

      // Validate file size (max 10MB for images, 5MB for others)
      const maxSize = file.type.startsWith('image/') ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
      if (file.size > maxSize) {
        const maxSizeMB = file.type.startsWith('image/') ? '10MB' : '5MB';
        throw new Error(`File size must be less than ${maxSizeMB}`);
      }

      // Validate file type
      const allowedTypes = {
        image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        video: ['video/mp4', 'video/webm', 'video/quicktime'],
        document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
      };

      const fileType = Object.keys(allowedTypes).find(type =>
        allowedTypes[type as keyof typeof allowedTypes].includes(file.type)
      );

      if (!fileType) {
        throw new Error('File type not supported. Please upload images, videos (MP4), or documents (PDF, DOC, TXT).');
      }

      // For images, convert to base64 data URL for immediate display
      if (file.type.startsWith('image/')) {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            console.log("✅ Image converted to base64 successfully");
            resolve({
              url: dataUrl,
              name: file.name,
              size: file.size
            });
          };
          reader.onerror = () => {
            reject(new Error('Failed to process image file'));
          };
          reader.readAsDataURL(file);
        });
      }

      // For other file types, we'll need Firebase Storage (fallback to error for now)
      throw new Error('Video and document uploads require Firebase Storage configuration. Images are supported.');

    } catch (error) {
      console.error("❌ Error processing file:", error);
      throw error;
    }
  },

  // Send a media message (image, video, document)
  async sendMediaMessage(
    senderId: string,
    senderName: string,
    file: File,
    senderLocation?: string,
    videoDuration?: number
  ) {
    try {
      console.log("📤 Sending media message:", file.type);

      // Process file first
      const { url, name, size } = await this.processFile(file, senderId);
      
      // Determine message type
      let messageType: 'image' | 'video' | 'document' = 'document';
      if (file.type.startsWith('image/')) messageType = 'image';
      else if (file.type.startsWith('video/')) messageType = 'video';
      
      // Send message with media
      const messagesRef = collection(db, COLLECTIONS.GLOBAL_MESSAGES);
      const messageData = {
        senderId,
        senderName,
        senderLocation: senderLocation || '',
        content: `Shared ${messageType}: ${name}`,
        type: messageType,
        mediaUrl: url,
        mediaName: name,
        mediaSize: size,
        videoDuration: messageType === 'video' ? videoDuration : undefined,
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(messagesRef, messageData);
      console.log("✅ Media message sent successfully:", docRef.id);
      
      return {
        id: docRef.id,
        ...messageData,
        createdAt: new Date()
      };
    } catch (error) {
      console.error("❌ Error sending media message:", error);
      throw error;
    }
  },

  // Get recent messages (for initial load)
  async getRecentMessages(limitCount: number = 50): Promise<GlobalMessage[]> {
    try {
      console.log("📥 Fetching recent global messages");
      
      const messagesRef = collection(db, COLLECTIONS.GLOBAL_MESSAGES);
      const q = query(
        messagesRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      })) as GlobalMessage[];

      // Reverse to show oldest first
      messages.reverse();
      
      console.log("✅ Fetched", messages.length, "recent messages");
      return messages;
    } catch (error) {
      console.error("❌ Error fetching recent messages:", error);
      throw error;
    }
  },

  // Subscribe to real-time messages
  subscribeToMessages(callback: (messages: GlobalMessage[]) => void, limitCount: number = 100): Unsubscribe {
    try {
      console.log("🔄 Subscribing to real-time global messages");
      
      const messagesRef = collection(db, COLLECTIONS.GLOBAL_MESSAGES);
      const q = query(
        messagesRef,
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        })) as GlobalMessage[];

        // Reverse to show oldest first
        messages.reverse();
        
        console.log("🔄 Real-time update:", messages.length, "messages");
        callback(messages);
      });
    } catch (error) {
      console.error("❌ Error subscribing to messages:", error);
      throw error;
    }
  },

  // Validate video duration (max 15 seconds)
  validateVideo(file: File): Promise<number> {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith('video/')) {
        reject(new Error('File is not a video'));
        return;
      }

      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        const duration = video.duration;
        
        if (duration > 15) {
          reject(new Error('Video must be 15 seconds or less'));
        } else {
          resolve(duration);
        }
        
        // Clean up
        URL.revokeObjectURL(video.src);
      };
      
      video.onerror = () => {
        reject(new Error('Invalid video file'));
        URL.revokeObjectURL(video.src);
      };
      
      video.src = URL.createObjectURL(file);
    });
  },

  // Get file type category
  getFileTypeCategory(file: File): 'image' | 'video' | 'document' {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    return 'document';
  },

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};

export default globalChatService;

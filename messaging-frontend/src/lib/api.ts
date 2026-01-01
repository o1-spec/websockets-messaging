import axios, { AxiosInstance, AxiosError } from "axios";
import { API_URL } from "@/config/constants";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth APIs
  async register(username: string, email: string, password: string) {
    const response = await this.client.post("/api/auth/register", {
      username,
      email,
      password,
    });
    return response.data;
  }

  async login(email: string, password: string) {
    const response = await this.client.post("/api/auth/login", {
      email,
      password,
    });
    return response.data;
  }

  async logout() {
    const response = await this.client.post("/api/auth/logout");
    return response.data;
  }

  async getMe() {
    const response = await this.client.get("/api/auth/me");
    return response.data;
  }

  // User APIs
  async getUsers() {
    const response = await this.client.get("/api/users");
    return response.data;
  }

  async searchUsers(query: string) {
    const response = await this.client.get("/api/users/search", {
      params: { query },
    });
    return response.data;
  }

  async getOnlineUsers() {
    const response = await this.client.get("/api/users/online");
    return response.data;
  }

  async updateProfile(data: { username?: string; avatar?: string }) {
    const response = await this.client.patch("/api/users/profile", data);
    return response.data;
  }

  // Message APIs
  async sendMessage(data: {
    conversationId: string;
    content: string;
    messageType?: string;
    fileUrl?: string;
  }) {
    const response = await this.client.post("/api/messages/send", data);
    return response.data;
  }

  async getMessages(conversationId: string, limit = 50, skip = 0) {
    const response = await this.client.get(
      `/api/messages/conversation/${conversationId}`,
      {
        params: { limit, skip },
      }
    );
    return response.data;
  }

  async markMessageAsRead(messageId: string) {
    const response = await this.client.patch(`/api/messages/${messageId}/read`);
    return response.data;
  }

  // Notification APIs
  async getNotifications(limit = 20, skip = 0) {
    const response = await this.client.get("/api/notifications", {
      params: { limit, skip },
    });
    return response.data;
  }

  async markNotificationAsRead(notificationId: string) {
    const response = await this.client.patch(
      `/api/notifications/${notificationId}/read`
    );
    return response.data;
  }

  async markAllNotificationsAsRead() {
    const response = await this.client.patch("/api/notifications/read-all");
    return response.data;
  }

  async deleteNotification(notificationId: string) {
    const response = await this.client.delete(
      `/api/notifications/${notificationId}`
    );
    return response.data;
  }

  async deleteAllNotifications() {
    const response = await this.client.delete("/api/notifications");
    return response.data;
  }

  // Conversation APIs
  async getConversations() {
    const response = await this.client.get("/api/conversations");
    return response.data;
  }

  async createConversation(participantIds: string[]) {
    console.log(
      "API: Creating conversation with participants:",
      participantIds
    );
    const response = await this.client.post("/api/conversations", {
      participantIds,
    });
    return response.data;
  }

  async getConversationById(conversationId: string) {
    const response = await this.client.get(
      `/api/conversations/${conversationId}`
    );
    return response.data;
  }
}

export const apiClient = new ApiClient();
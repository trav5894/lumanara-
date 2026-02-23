// API Service for communicating with LUMANARA backend

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class APIService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  /**
   * Set authentication token
   */
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  /**
   * Clear authentication token
   */
  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  /**
   * Make HTTP request with auth header
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ============ Authentication ============

  async register(userData: {
    name: string;
    handle: string;
    email: string;
    password: string;
  }) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    this.setToken(data.access_token);
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.access_token);
    return data;
  }

  // ============ Posts ============

  async createPost(text: string) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  async getPosts(skip = 0, limit = 20) {
    return this.request(`/posts?skip=${skip}&limit=${limit}`);
  }

  async getPost(postId: string) {
    return this.request(`/posts/${postId}`);
  }

  async likePost(postId: string) {
    return this.request(`/posts/${postId}/like`, {
      method: 'POST',
    });
  }

  async unlikePost(postId: string) {
    return this.request(`/posts/${postId}/unlike`, {
      method: 'POST',
    });
  }

  // ============ Users ============

  async getCurrentUser() {
    return this.request('/users/me');
  }

  async getUser(userId: string) {
    return this.request(`/users/${userId}`);
  }

  async searchUsers(handle: string) {
    return this.request(`/users?handle=${encodeURIComponent(handle)}`);
  }

  async sendFriendRequest(userId: string) {
    return this.request(`/users/${userId}/friend-request`, {
      method: 'POST',
    });
  }

  async acceptFriendRequest(requestId: string) {
    return this.request(`/users/friend-requests/${requestId}/accept`, {
      method: 'POST',
    });
  }

  async blockUser(userId: string) {
    return this.request(`/users/${userId}/block`, {
      method: 'POST',
    });
  }

  async unblockUser(userId: string) {
    return this.request(`/users/${userId}/unblock`, {
      method: 'POST',
    });
  }

  // ============ Messages ============

  async sendMessage(toUserId: string, encryptedText: string) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify({
        to_user_id: toUserId,
        encrypted_text: encryptedText,
      }),
    });
  }

  async getMessageThread(userId: string) {
    return this.request(`/messages/thread/${userId}`);
  }

  async markMessageAsRead(messageId: string) {
    return this.request(`/messages/${messageId}/read`, {
      method: 'POST',
    });
  }

  // ============ Health Check ============

  async health() {
    return this.request('/health');
  }
}

// Export singleton instance
export const apiService = new APIService();

export default APIService;

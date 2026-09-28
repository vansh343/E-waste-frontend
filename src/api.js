import { API_PREFIX, CROSS_ORIGIN } from './config';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, form } = {}) {
  let res;
  try {
    res = await fetch(API_PREFIX + path, {
      method,
      // 'include' is required when the backend is a different origin,
      // otherwise the JWT cookie is never sent and every call 401s.
      credentials: CROSS_ORIGIN ? 'include' : 'same-origin',
      headers: form ? undefined : body ? { 'Content-Type': 'application/json' } : undefined,
      body: form ? form : body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Server tak pahunch nahi paaye. Backend chalu hai?', 0);
  }

  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg =
      (data && typeof data === 'object' && (data.message || data.error)) ||
      (typeof data === 'string' && data.length < 300 ? data : null) ||
      'Kuch galat ho gaya. Dobara try karein.';
    throw new ApiError(msg, res.status);
  }
  return data;
}

function formData(images) {
  const fd = new FormData();
  for (const img of images) fd.append('images', img);
  return fd;
}

// ---------------- AUTH ----------------
export const auth = {
  signup: (payload) => request('/auth/signup', { method: 'POST', body: payload }),
  verifyOtp: (phone, code) => request('/auth/verify-otp', { method: 'POST', body: { phone, code } }),
  resendOtp: (phone) => request(`/auth/resend-otp?phone=${encodeURIComponent(phone)}`, { method: 'POST' }),
  requestLoginOtp: (phone) => request('/auth/request-login-otp', { method: 'POST', body: { phone } }),
  login: (phone) => request('/auth/login', { method: 'POST', body: { phone } }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  me: () => request('/auth/me'),
};

// ---------------- SELLER ----------------
export const seller = {
  processImages: (images) =>
    request('/seller/process-images', { method: 'POST', form: formData(images) }),
  detect: (images) => request('/seller/detect', { method: 'POST', form: formData(images) }),
  search: (items) => request('/seller/search', { method: 'POST', body: items }),
  createChatRequest: (receiverId, productId, quantity) =>
    request('/seller/chat/request', { method: 'POST', body: { receiverId, productId, quantity } }),
  myRequests: () => request('/seller/chat/requests'),
};

// ---------------- COMPANY ----------------
export const company = {
  profile: () => request('/company/profile'),
  ledger: () => request('/company/ledger'),
  products: () => request('/company/products'),
  addProduct: (payload) => request('/company/product', { method: 'POST', body: payload }),
  removeProduct: (id) => request(`/company/product/${id}`, { method: 'DELETE' }),
  distributors: () => request('/company/distributors'),
  addDistributor: (payload) => request('/company/distributor', { method: 'POST', body: payload }),
  removeDistributor: (id) => request(`/company/distributor/${id}`, { method: 'DELETE' }),
  productSearch: (name) => request(`/company/product/search?name=${encodeURIComponent(name)}`),
  requests: () => request('/company/chat/requests'),
  acceptRequest: (id) => request(`/company/chat/request/${id}/accept`, { method: 'POST' }),
  rejectRequest: (id) => request(`/company/chat/request/${id}/reject`, { method: 'POST' }),
  conversation: (otherId) => request(`/company/chat/with/${otherId}`),
  sendMessage: (receiverId, message) =>
    request('/company/chat/send', { method: 'POST', body: { receiverId, message } }),
};

// ---------------- DISTRIBUTOR ----------------
export const distributor = {
  me: () => request('/distributor/me'),
  myCompany: () => request('/distributor/company'),
  deals: () => request('/distributor/deals'),
  propose: (payload) => request('/distributor/deal/propose', { method: 'POST', body: payload }),
  myQr: (ledgerId) => request(`/distributor/deal/${ledgerId}/qr/me`),
  scan: (ledgerId, qrToken) =>
    request(`/distributor/deal/${ledgerId}/scan`, { method: 'POST', body: { qrToken } }),
  accept: (ledgerId) => request(`/distributor/deal/${ledgerId}/accept`, { method: 'POST' }),
  requests: () => request('/distributor/chat/requests'),
  acceptRequest: (id) => request(`/distributor/chat/request/${id}/accept`, { method: 'POST' }),
  rejectRequest: (id) => request(`/distributor/chat/request/${id}/reject`, { method: 'POST' }),
  conversation: (otherId) => request(`/distributor/chat/with/${otherId}`),
  sendMessage: (receiverId, message) =>
    request('/distributor/chat/send', { method: 'POST', body: { receiverId, message } }),
};

// ---------------- DEAL ----------------
export const deal = {
  propose: (payload) => request('/deal/propose', { method: 'POST', body: payload }),
  my: () => request('/deal/my'),
  get: (ledgerId) => request(`/deal/${ledgerId}`),
  myQr: (ledgerId) => request(`/deal/${ledgerId}/qr/me`),
  scan: (ledgerId, qrToken) =>
    request(`/deal/${ledgerId}/scan`, { method: 'POST', body: { qrToken } }),
  accept: (ledgerId) => request(`/deal/${ledgerId}/accept`, { method: 'POST' }),
};

// ---------------- ADMIN ----------------
export const admin = {
  allUsers: () => request('/user/allUser'),
  userByPhone: (phone) => request(`/user/byPhone/${encodeURIComponent(phone)}`),
  deleteUser: (phone) => request(`/user/deleteUser/${encodeURIComponent(phone)}`, { method: 'DELETE' }),
  assignRole: (phone, role) =>
    request('/admin/assign-role', { method: 'POST', body: { phone, role } }),
  approveCompany: (phone) =>
    request(`/admin/approve-company/${encodeURIComponent(phone)}`, { method: 'POST' }),
  rejectCompany: (phone) =>
    request(`/admin/reject-company/${encodeURIComponent(phone)}`, { method: 'POST' }),
  suspend: (phone) => request(`/admin/suspend/${encodeURIComponent(phone)}`, { method: 'POST' }),
  promoteAdmin: (phone) =>
    request(`/admin/promote-admin/${encodeURIComponent(phone)}`, { method: 'POST' }),
  allCompanies: () => request('/company/all'),
  allDeals: () => request('/admin/deals'),
  pendingCompanies: () => request('/admin/pending-companies'),
  bye: () => request('/admin/hello'),
};

export const HIN = {
  status: (s) =>
    ({
      ACTIVE: 'Sakaal',
      PENDING: 'Deal lock ho gayi — QR scan baaki',
      PENDING_APPROVAL: 'Admin approval pending hai',
      SUSPENDED: 'Suspend',
      REJECTED: 'Reject kar diya gaya',
      ACCOUNT_LOCKED: 'Locked',
      LOCKED: 'Lock ho gayi',
      ACCEPTED: 'Sweekar ho gaya',
    }[s] || s || '—'),
  dealState: (s) =>
    ({
      PENDING: 'Sanction / QR penphase',
      DONE: 'Poora ho gaya',
      READY_FOR_ACCEPT: 'Accept window khul gayi',
    }[s] || s || '—'),
};

export function timeAgo(iso) {
  if (!iso) return '';
  const t = new Date(iso);
  if (Number.isNaN(t.getTime())) return '';
  const diff = (Date.now() - t.getTime()) / 1000;
  if (diff < 60) return 'abhi';
  if (diff < 3600) return `${Math.floor(diff / 60)} min pehle`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ghante pehle`;
  return `${Math.floor(diff / 86400)} din pehle`;
}
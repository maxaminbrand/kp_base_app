export function topicAll() {
  return "all";
}

export function topicRole(role: string) {
  return `role_${role}`;
}

export function topicBusiness(businessId: string) {
  return `business_${businessId}`;
}

export function topicUser(uid: string) {
  return `user_${uid}`;
}
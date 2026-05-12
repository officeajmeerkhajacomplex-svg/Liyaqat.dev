# DeenFlow Firestore Security Specification

## Data Invariants
- Every user has a unique profile at `/users/{userId}`.
- Every chat session belongs to a specific user.
- Every message belongs to a specific chat session belonging to the user.
- Every bookmark belongs to a specific user.
- Users can only read and write their own data.

## The Dirty Dozen Payloads (Rejection Tests)

1. **Identity Theft**: User A tries to create a profile for User B.
2. **Chat Hijacking**: User A tries to read User B's chats.
3. **Message Injection**: User A tries to post a message in User B's chat.
4. **Bookmark Exposure**: User A tries to read User B's bookmarks.
5. **Path Poisoning**: Injecting massive strings as `userId` or `chatId`.
6. **Immutable Tampering**: User tries to change `createdAt` on a chat.
7. **Role Escalation**: User tries to add an `isAdmin` field to their profile (if we had admins).
8. **Shadow Fields**: Adding undocumented fields like `isVerified: true` to a profile.
9. **Zero-Byte Attack**: Submitting empty content in a message.
10. **Type Mismatch**: Sending a number for `title` in a chat.
11. **Spoofed Ownership**: Creating a chat with `userId` set to someone else.
12. **Unverified Email**: Writing data while `email_verified` is false (if required).

## Test Runner Logic (Mock)
The `firestore.rules.test.ts` (not implemented here due to environment limits but planned for) would assert `PERMISSION_DENIED` for all the above.

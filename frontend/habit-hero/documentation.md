# 📘 HabitHero Notification System - Full Developer Documentation (Hinglish)

Yeh document notification module ke har ek file, function, aur logic ko **deep detail** mein explain karta hai. Agar koi interview mein ya code review mein pooche ki "Yeh line kyun likhi hai?", toh yahan answer milega.

---

## 📂 1. `src/services/notificationService.js`

**Role:** Yeh hamara **API Manager** hai. Frontend aur Backend ke beech ka bridge.

### Imports
- `axios`: HTTP requests (GET, POST, PUT, DELETE) bhejne ke liye use kiya hai.
- `BASE_URL`: Backend server ka address (e.g., `http://localhost:8080`).

### Functions (Detailed Breakdown)

1.  **`getNotifications()`**
    -   **Method:** `GET`
    -   **Endpoint:** `/api/notifications`
    -   **Kyun chahiye?** Jab user login karta hai ya refresh karta hai, toh purana data lene ke liye. Hum iska response directly `setNotifications` state mein dalte hain.

2.  **`getUnreadCount()`**
    -   **Method:** `GET`
    -   **Endpoint:** `/api/notifications/unread-count`
    -   **Kyun chahiye?** Navbar ke bell icon par wo chhota sa red badge number dikhane ke liye. Poori list fetch karne se fast hai sirf count mangwana.

3.  **`markAsRead(id)`**
    -   **Method:** `PUT`
    -   **Endpoint:** `/api/notifications/{id}/read`
    -   **Process:** User ne notification pe click kiya -> Humne yeh API call ki -> Backend database mein `isRead = true` set kar dega.

4.  **`markAllAsRead()`**
    -   **Method:** `PUT`
    -   **Endpoint:** `/api/notifications/read-all`
    -   **Automation:** Jaise hi user bell icon pe click karta hai, yeh call chala jata hai. Backend saari notifications ko read mark kar deta hai.

5.  **`deleteNotification(id)`**
    -   **Method:** `DELETE`
    -   **Endpoint:** `/api/notifications/{id}`
    -   **Action:** Notification table se uss row ko permanent uda ne ke liye.

---

## 📂 2. `src/context/NotificationContext.jsx`

**Role:** Yeh **Notification ka dimag (Brain)** hai.
1.  **State Management**: notifications list aur unread count ko sambhalta hai.
2.  **WebSocket Manager**: Real-time connection banata hai.
3.  **Broadcaster**: `App.jsx` ke through saare components ko data provide karta hai.

### Key Logic & Variables

-   **`processedIds` (useRef)**:
    -   **Problem:** React Strict Mode mein ya network glitches ki wajah se kabhi-kabhi same notification 2 baar aa jati hai.
    -   **Solution:** Yeh ek `Set` hai. Jab bhi nayi notification aati hai, hum check karte hain `processedIds.has(id)`. Agar pehle se hai, toh hum duplicate ko ignore kar dete hain.

-   **`stompClientRef` (useRef)**:
    -   **Problem:** Agar hum client ko `useState` mein rakhte, toh har render pe component re-render hota.
    -   **Solution:** WebSocket object ko `ref` mein rakha taaki connection persist kare bina re-renders ke.

### Important Functions

#### 1. `connectWebSocket()`
Yeh sabse complex function hai. Iska flow samjho:
1.  **SockJS Intitialization:** `new SockJS('http://localhost:8080/ws')` - Yeh HTTP handshake karta hai.
2.  **Stomp Wrapper:** `Stomp.over(socket)` - Yeh text messages ko structured frame banata hai.
3.  **Connect & Subscribe:**
    -   Server se judte hi hum `/topic/user/1` (User ID filhal hardcoded hai) pe subscribe karte hain.
    -   Ab backend jab bhi `convertAndSend` karega, humein yahan msg milega.
4.  **REFRESH_COMMAND Logic:**
    -   Agar message ka body sirf `'REFRESH_COMMAND'` hai, toh hum samjh jate hain ki backend pe kuch bada update hua hai (jaise kisi ne comment delete kiya). Hum turant `fetchInitialData()` call karke poora data refresh kar lete hain.

#### 2. `handleNewNotification(notification)`
Jab real-time msg aata hai:
1.  **Duplicate Check:** `processedIds` se check kiya.
2.  **State Update:** `setNotifications(prev => [new, ...prev])`. Nayi notification ko list ke **top** pe add karte hain.
3.  **Sound:** `new Audio(...)` se 'ting' sound play karte hain.

#### 3. `removeNotification(id)` (Optimistic Update)
1.  **API Call:** Backend ko delete request bhejte hain.
2.  **UI Update:** Response ka wait **nahi** karte. Turant `filter` use karke UI se uda dete hain. Isse app fast lagti hai. Agar API fail hui, toh error handle karte hain (lekin user exp smooth rehta hai).

---

## 📂 3. `src/components/Notification/NotificationDropdown.jsx`

**Role:** Yeh woh **UI Component** hai jo user ko dikhta hai.

### Features & Implementation Details

#### 1. Grouping (Notification Categories)
Humne notifications ko 2 buckets mein baanta hai:
```javascript
const groupedNotifications = {
    'Friends': [],         // FRIEND_REQUEST, FRIEND_ACCEPTED
    'Streak Related': []   // STREAK_BREAK, HABIT_MISSED, COMMENT, etc. (Baaki sab kuch)
};
```
*Logic:* Hamara code array ko loop (`forEach`) karta hai aur type check karke sahi bucket mein daal deta hai.

#### 2. Tabbed UI (Tabs kaise banaye?)
Humne `activeTab` state banayi (`'Friends'` ya `'Streak Related'`).
-   JSX mein hum map karte hain: `groupedNotifications[activeTab]`.
-   Matlab agar user ne 'Friends' select kiya hai, toh map function sirf 'Friends' array ko render karega.

#### 3. Automatic Actions (Smart Feature)
Jab user bell icon dabata hai (`toggleDropdown`):
1.  **Sync:** `refreshNotifications()` call hota hai. Agar user ne backend se kuch undo kiya tha, toh list update ho jayegi.
2.  **Mark Read:** `markAllRead()` call hota hai. Saari unread notifications read ho jati hain.

#### 4. The CSS Fix (Clipping Issue)
Pehle dropdown navbar ke andar dab raha tha. Humne yeh style lagaya:
```javascript
style={{
    position: 'absolute',  // Apne parent (div) ke relative position lega
    top: '100%',           // Button ke theek neeche
    right: 0,             // Right side align
    zIndex: 1050,         // Sabse upar dikhega (Navbar ke upar)
    display: isOpen ? 'flex' : 'none' // Conditional rendering
}}
```
Isse dropdown hawa mein float karta hai aur kisi container se cut nahi hota.

#### 5. Click Handling (Strict Mode)
Client ki requirement: "Sirf Friend request pe click ho."
```javascript
const isClickable = (type) => ['FRIEND_REQUEST', 'FRIEND_ACCEPTED'].includes(type);
```
-   Agar clickable hai: Cursor pointer banega, aur click karne pe profile page khulega.
-   Agar nahi (Streak, etc.): Cursor default rahega, click ignore hoga.

---

## 📂 4. `src/components/Navbar.jsx`

**Role:** Sirf `NotificationDropdown` ko hold karta hai. Yeh ensure karta hai ki bell icon header ke right side mein sahi jagah par rahe.

---

## Summary for Developers

| Feature | Kahan Dhundhein? | Kyun? |
| :--- | :--- | :--- |
| **Backend API Calls** | `notificationService.js` | Code clean rakhne ke liye API logic alag rakha. |
| **Real-time / WebSocket** | `NotificationContext.jsx` | Connection global hona chahiye taaki page change hone pe toote nahi. |
| **Duplicate Prevention** | `processedIds` (Context) | React Strict Mode aur network retries se bachne ke liye. |
| **UI Rendering / Tabs** | `NotificationDropdown.jsx` | User interaction yahan hota hai. |
| **Click Outside to Close** | `useEffect` inside Dropdown | Bootstrap ka JS remove kar diya taaki full control hamare paas ho. |

---
Yeh documentation code ke har critical hisse ko cover karti hai. Isse padh kar koi bhi naya developer project samajh sakta hai.

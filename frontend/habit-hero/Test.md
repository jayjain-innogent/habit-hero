# Manual Test Cases: Habit Hero Frontend

**Project:** Habit Hero
**Module:** Frontend (React/Vite)
**Date:** 2025-12-01

## 1. Pre-requisites
- Backend server running at `http://localhost:8080`.
- Frontend server running at `http://localhost:5173`.
- Browser (Chrome/Firefox/Edge) installed.

## 2. Test Suites

### Suite A: Habit Management (CRUD)

| Test ID | Test Case Name | Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **TC-001** | **Create New Habit** | 1. Navigate to `/habits`.<br>2. Click "+ Create Habit".<br>3. Enter Title: "Drink Water".<br>4. Enter Description: "8 glasses daily".<br>5. Select Category: "HEALTH".<br>6. Click "Create Habit". | User is redirected to `/habits`. New habit "Drink Water" appears in the list. | |
| **TC-002** | **Create Habit Validation** | 1. Navigate to `/habits/create`.<br>2. Leave Title empty.<br>3. Click "Create Habit". | Form is not submitted. "Title is required" error message appears. | |
| **TC-003** | **View Habit List** | 1. Navigate to `/habits`. | List of active habits is displayed. Each card shows Title, Description, and Progress. | |
| **TC-004** | **Edit Habit** | 1. Click "Edit" on an existing habit.<br>2. Change Title to "Updated Title".<br>3. Click "Update Habit". | User is redirected to `/habits`. The habit title is updated in the list. | |
| **TC-005** | **Delete Habit** | 1. Navigate to `/habits`.<br>2. Look for a "Delete" or "Trash" icon on a habit card.<br>3. If found, click it and confirm. | **Known Issue:** Delete button may be missing. If present, habit should be removed from list. | |

### Suite B: Habit Tracking

| Test ID | Test Case Name | Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **TC-006** | **Mark Habit Complete** | 1. Find an incomplete habit.<br>2. Click "Mark Complete". | Button changes to "Done" (or disappears). "Done" badge appears. Progress ring updates. | |
| **TC-007** | **Log Progress (Goal)** | 1. Find a habit with a goal (e.g., "Read 10 pages").<br>2. Use the slider/input to set value to 5.<br>3. Verify progress bar updates. | Progress bar reflects 50% (if target is 10). | |
| **TC-008** | **Today's Status** | 1. Complete 1 habit.<br>2. Check "Today's Progress" at the top of the page. | Count increments (e.g., "1 of 5 habits completed"). | |

### Suite C: Navigation & UI

| Test ID | Test Case Name | Steps | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- |
| **TC-009** | **Root Redirection** | 1. Navigate to `http://localhost:5173/`. | URL automatically changes to `/habits`. | |
| **TC-010** | **Responsive Layout** | 1. Resize browser window to mobile width (approx 375px). | Habit cards stack vertically. Navigation remains accessible. | |
| **TC-011** | **Loading State** | 1. Refresh the page. | Loading spinner appears briefly before data loads. | |

## 3. Defect Log

Use this section to record any bugs found during testing.

| Defect ID | Related TC | Description | Severity | Status |
| :--- | :--- | :--- | :--- | :--- |
| **BUG-001** | TC-005 | Delete button is missing from UI. | High | Open |
| **BUG-002** | TC-001 | Created habit title sometimes defaults to placeholder. | Medium | Open |

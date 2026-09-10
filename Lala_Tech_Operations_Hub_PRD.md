# Lala Tech Operations Hub — Product Requirements Document

**Version:** 1.0 (MVP)
**Date:** September 10, 2026
**Status:** Draft — ready for build
**Prepared for:** Lala Tech LLC
**Prepared as:** A build-ready specification for an AI coding agent or engineering team

---

## Table of Contents

1. Executive Summary
2. Problem Statement
3. Problem Discovery Assumptions
4. Target Users
5. User Personas
6. User Pain Points
7. Product Vision
8. Goals
9. Non-Goals
10. User Stories
11. User Journeys
12. Functional Requirements
13. Feature Specifications
14. Information Architecture
15. Page-by-Page Requirements
16. Database Schema
17. API Requirements
18. Authentication & Authorization
19. AI Integration
20. Notification System
21. UX/UI Requirements
22. Technical Architecture
23. Error Handling
24. Security Requirements
25. Performance Requirements
26. Demo Data
27. Acceptance Criteria
28. Success Metrics
29. MVP Scope
30. Future Scope
31. Demo Scenario
32. Implementation Roadmap

---

## 1. Executive Summary

Lala Tech Operations Hub is a centralized internal web application that replaces the spreadsheets, WhatsApp threads, emails, and verbal handoffs currently used to run Lala Tech's day-to-day operations. Every operational request — however it arrives — becomes a structured **task** with an owner, a priority, a due date, a status, and a visible history. Managers get one dashboard that answers "what's happening right now"; employees get one place that tells them exactly what they owe and when; and an AI-assisted capture tool turns a pasted message ("Rahul, send the invoice for order #4532 by tomorrow evening, urgent") into a structured task draft that a human reviews and confirms before anything is saved.

The MVP is deliberately narrow. It does not attempt to become an ERP, a CRM, or an HR system. Its only job is to make operational work **capturable, assignable, trackable, and visible** — the single highest-leverage fix for Lala Tech's current operational problems. Every feature in this document is justified by one of six problems: lost information, forgotten tasks, poor visibility, repetitive manual work, difficult progress tracking, or manual follow-ups. Anything that doesn't map to one of those six is Future Scope (Section 30), not MVP.

This PRD is written to be built directly from — page layouts, data models, API contracts, and acceptance criteria are specified concretely so that an engineering team (human or AI) can implement the product without needing to make product decisions along the way.

## 2. Problem Statement

Lala Tech's operations currently run on a patchwork of spreadsheets, WhatsApp, email, and verbal requests. Because there is no single system of record:

- **Information gets lost** — requests live in whichever chat thread they arrived in, with no consistent place they're recorded.
- **Tasks are forgotten** — once a request leaves the original conversation, nothing resurfaces it.
- **Managers have poor visibility** — the only way to know the state of ongoing work is to ask.
- **Employees do repetitive manual work** — the same information is retyped from a chat into a spreadsheet, and often again into a status update.
- **Progress is hard to track** — spreadsheet cells don't show a history of what changed, when, or why.
- **Follow-ups are manual** — someone has to remember to check in on every open item; nothing reminds anyone automatically.
- **Deadlines get missed** — there's no mechanism that proactively flags a task as approaching or past due.
- **Duplicate data entry** — the same request may be logged in a chat, a spreadsheet, and later repeated verbally to confirm status.

The Operations Hub exists to solve one problem well: **give every operational request a structured, trackable home from the moment it's captured to the moment it's completed**, and give managers a single dashboard to see the state of that work without asking anyone.

## 3. Problem Discovery Assumptions

No formal user research was conducted ahead of this MVP; the following assumptions drive the design and should be validated during and after the pilot rollout:

- Most operational requests originate from WhatsApp, email, or verbal conversation and are currently transcribed by hand into a spreadsheet.
- Employees do not currently have any single place that shows "everything assigned to me, in order of urgency."
- Managers currently learn about overdue or stuck work by asking, not by seeing it surfaced automatically.
- The team is small enough (roughly 5–30 people) that a two-role permission model (Manager / Employee) is sufficient; no departmental hierarchy or multi-level approval chain is needed for MVP.
- Employees are comfortable using ordinary web apps (forms, buttons, dropdowns) without training beyond a short walkthrough.
- A responsive web application, used on desktop primarily and mobile secondarily, is sufficient; a native mobile app is not required for MVP.
- Gemini (or an equivalent LLM API) is an acceptable dependency for the AI Task Capture feature, with the explicit requirement that the product works fully without it.

## 4. Target Users

The MVP defines exactly two roles. Permissions are intentionally simple — see Section 18 for the full matrix.

| Role | Summary |
|---|---|
| **Admin / Manager** | Sees all tasks across the company, creates and assigns/reassigns tasks, monitors workload and overdue work, has access to Team and company-wide Activity. |
| **Employee** | Sees and manages only their own assigned tasks, updates status, comments, marks tasks complete, uses AI Task Capture to submit new requests for themselves or (if permitted) for others. |

## 5. User Personas

### 5.1 Priya Sharma — Operations Manager
- **Context:** Runs day-to-day operations for Lala Tech. Not a technical user, but fluent with spreadsheets and WhatsApp Business.
- **Goals:** Know what's late, who's overloaded, and whether requests are actually getting handled — without chasing people for status.
- **Frustrations today:** Spends 30–45 minutes most days reconstructing status from WhatsApp threads and direct check-ins. Frequently finds out about a missed deadline from the customer instead of from her own systems.
- **Needs from the Hub:** One dashboard that shows the whole operational picture at a glance; a fast way to turn a pasted message into an assigned task; a quick way to reassign work when someone is overloaded.

### 5.2 Rahul Verma — Operations Executive (Employee)
- **Context:** Handles order-related and customer-facing operational requests.
- **Goals:** Know exactly what's expected of him today and avoid being blindsided by a request he forgot wasn't "someday" work.
- **Frustrations today:** Instructions arrive across several chats and get buried under newer messages; deadlines are easy to lose track of.
- **Needs from the Hub:** A single "My Tasks" view sorted by urgency; one-tap status updates; a place to leave context so he doesn't have to repeat himself verbally to his manager.

### 5.3 Aman Gupta — Field / Delivery Coordinator (Employee)
- **Context:** Juggles several simultaneous requests, often blocked waiting on suppliers or customers.
- **Goals:** Make blockers visible so delays outside his control aren't mistaken for inaction.
- **Frustrations today:** In a spreadsheet, "blocked" work looks identical to "ignored" work — there's no way to flag "I'm stuck" without a direct conversation.
- **Needs from the Hub:** A distinct "Blocked" status paired with a comment explaining why, visible to his manager without him having to raise it separately.

## 6. User Pain Points

| Pain Point | Where It Shows Up Today | How the Hub Solves It |
|---|---|---|
| Lost information | Requests scattered across WhatsApp, email, verbal conversation | Every request becomes one task record with a title, description, and source — searchable in one place |
| Forgotten tasks | Nothing resurfaces a request once the chat moves on | Tasks persist with status until explicitly completed; dashboard surfaces anything open |
| Poor visibility | Manager must ask each employee for status | Manager Dashboard shows real-time counts, overdue items, and today's work without asking anyone |
| Repetitive manual work | Same info retyped from chat → spreadsheet → status update | AI Task Capture extracts structured fields directly from a pasted message; status updates happen once, in one place |
| Difficult progress tracking | Spreadsheet cells don't show history | Task Details page shows a full activity timeline (created, assigned, status changes, comments, completion) |
| Manual follow-ups | Someone has to remember to check on open items | Automatic notifications on assignment, approaching deadline, and overdue status |
| Missed deadlines | No proactive flag when a due date is near or passed | Overdue Tasks section on the dashboard and deadline/overdue notifications |
| Duplicate data entry | Request logged in chat, then spreadsheet, then repeated verbally to confirm | Single task record is the source of truth; comments capture context without re-entry |

## 7. Product Vision

Lala Tech Operations Hub is **not** "another task management app." It is a lightweight operations system that turns scattered requests into structured, trackable work — connecting unstructured communication to a structured task, an assignment, tracked progress, real-time visibility, and completion, in one continuous flow. The product replaces the fragmented Before workflow (WhatsApp → manual copying → spreadsheet → manual assignment → manual follow-up → poor visibility) with a single After workflow (Request → AI or manual capture → central task system → automatic assignment → status updates → reminders → manager dashboard).

## 8. Goals

- Give every operational request a single structured record from the moment it's captured.
- Let a manager answer "what's happening right now" from one dashboard, with zero follow-up messages to employees.
- Reduce the time to convert an unstructured request into an assigned, trackable task to under one minute using AI Task Capture.
- Make overdue and at-risk work impossible to miss, both for the assignee and for the manager.
- Eliminate duplicate data entry between "where the request came from" and "where the work is tracked."
- Keep the system simple enough that a non-technical employee can use it with no training beyond a short walkthrough.
- Ship a **working, persistent, demo-able MVP** — not a mockup — that Lala Tech can pilot with a real team immediately.

## 9. Non-Goals

The following are explicitly **out of scope** for this MVP (see Section 30, Future Scope, for anything here that may be revisited later):

- Full CRM or customer-relationship tracking
- Payroll or accounting functionality
- HR management (leave, attendance, performance reviews)
- Complex project management (Gantt charts, dependencies, multi-level subtasks, sprints)
- Advanced analytics or BI dashboards
- Video calls or real-time chat between users
- Full WhatsApp Business API integration (two-way messaging)
- Full email client or inbox integration
- Complex enterprise permissions (custom roles, departments, approval chains)
- Billing or subscription management
- Multi-company / multi-tenant management

If a requested feature does not directly reduce lost information, forgotten tasks, poor visibility, repetitive manual work, difficult progress tracking, or manual follow-ups, it does not belong in this MVP.

## 10. User Stories

**Task Capture**
- As a Manager, I want to paste a raw WhatsApp-style message and get a structured task draft, so I don't have to manually fill out every field.
- As a Manager, I want to create a task manually with a form, so I can capture requests that didn't arrive as a pastable message.
- As an Employee, I want to submit a request I received directly (e.g., a customer called me), so it gets tracked even if my manager wasn't involved.

**Assignment**
- As a Manager, I want to assign a task to a specific employee at creation time, so ownership is clear from the start.
- As a Manager, I want to reassign a task when someone is overloaded or unavailable, so work doesn't stall.
- As an Employee, I want to be notified the moment a task is assigned to me, so I don't find out late.

**Tracking Progress**
- As an Employee, I want to change a task's status (Pending → In Progress → Blocked/Completed), so my manager always sees current reality without asking me.
- As an Employee, I want to add a comment explaining a blocker, so my manager understands why something hasn't moved.
- As a Manager, I want to see a task's full history (who did what, when), so I don't have to reconstruct it from memory or chat.

**Visibility**
- As a Manager, I want a dashboard with KPI counts (total, pending, in progress, overdue, completed), so I can gauge the operational state in seconds.
- As a Manager, I want a dedicated, highly visible list of overdue tasks, so nothing slips through unnoticed.
- As a Manager, I want to see each employee's active and overdue task counts, so I can spot overload before it becomes a problem.
- As an Employee, I want a personal view of what's due today, upcoming, and overdue, so I know what to prioritize.

**Follow-ups & Reminders**
- As an Employee, I want to be notified as a deadline approaches, so I'm not caught off guard.
- As a Manager, I want overdue tasks to be automatically and visibly flagged, so I don't have to track deadlines manually.
- As any user, I want a notification center that shows assignments, reminders, overdue alerts, comments, and completions, so I have one place to catch up.

**AI-Assisted Capture**
- As a Manager, I want the AI to extract task title, assignee, priority, deadline, description, and source from a pasted message, so I skip manual data entry.
- As a Manager, I want to review and edit the AI's extraction before anything is saved, so I stay in control and mistakes don't become tasks.
- As a Manager, I want the AI to leave a field blank rather than guess when it isn't confident (e.g., an ambiguous deadline), so nothing incorrect is silently created.
- As any user, I want manual task creation to keep working even if the AI service is down, so a bad day for the AI never blocks operations.

**Team Oversight**
- As a Manager, I want a Team page showing each employee's active, overdue, and completed task counts, so I can understand workload distribution at a glance.

## 11. User Journeys

### Journey A — Manager captures a request with AI and assigns it
1. Priya receives a WhatsApp message: *"Rahul, please send the invoice for order #4532 to the customer by tomorrow evening. This is urgent."*
2. She opens **AI Task Capture** and pastes the message.
3. She clicks **Extract Task**. The system calls the AI extraction endpoint and returns a structured draft (title, description, assignee, priority, due date, source) within a few seconds.
4. Priya reviews the draft in an editable form, confirms the assignee is Rahul, and clicks **Confirm & Create Task**.
5. The task is created with status **Pending**, an activity-log entry ("Task created by Priya") is written, and a notification is sent to Rahul.
6. The task now appears on the Dashboard's KPI counts, in the Tasks list, and in Rahul's My Tasks view.

### Journey B — Employee works a task end-to-end
1. Rahul logs in and sees a notification badge; he opens **Notifications** and sees "New task assigned: Send invoice for order #4532."
2. He opens the task from the notification, reads the description and due date, and changes status from **Pending** to **In Progress**.
3. While waiting on internal approval, he adds a comment: *"Waiting for final invoice approval."*
4. Once approval comes through, he sends the invoice and marks the task **Completed**.
5. Every transition (status changes, the comment, completion) is written to the task's activity timeline and to the global activity log, and a completion notification is sent to Priya (the creator).

### Journey C — Manager's daily visibility check
1. Priya logs in each morning and lands on the **Dashboard**.
2. She scans the KPI cards (Total / Pending / In Progress / Overdue / Completed) and the **Overdue Tasks** section, which is sorted to the top and visually distinct (red accent).
3. She clicks into an overdue task, sees it's been sitting in "Blocked" with a comment from Aman explaining a supplier delay, and reassigns a portion of Aman's other work to Rahul via the **Team** page's workload view.
4. She checks **Today's Tasks** to see what's due before end of day, and skims **Recent Activity** to see what happened since yesterday.

## 12. Functional Requirements

**Authentication & Session**
- FR-1: The system must support email/password login for two demo accounts (manager and employee) at minimum, with the ability to add more users.
- FR-2: The system must maintain a session across page reloads until the user explicitly logs out or the session expires.
- FR-3: The system must redirect unauthenticated users to the login page for any protected route.

**Task Lifecycle**
- FR-4: Users must be able to create a task with title, description, assignee, priority, due date, category, and source.
- FR-5: Tasks must persist in a real database and survive page refresh and server restart.
- FR-6: Tasks must support four statuses: Pending, In Progress, Blocked, Completed.
- FR-7: Tasks must support three priorities: High, Medium, Low.
- FR-8: Managers must be able to edit, reassign, and delete any task. Employees must be able to edit status and add comments only on tasks assigned to them.
- FR-9: Every task must retain a chronological activity history of everything that happened to it.

**Dashboard & Visibility**
- FR-10: The dashboard must display KPI counts computed from live task data, not hardcoded values.
- FR-11: The dashboard must display a distinct, visually prioritized list of overdue tasks (due date in the past and status not Completed).
- FR-12: The dashboard must display tasks due today.
- FR-13: The dashboard must display a feed of recent operational activity across the company (manager) or the user's own tasks (employee).
- FR-14: The dashboard must display a breakdown of tasks by status and by priority.

**Comments**
- FR-15: Users must be able to add a comment to any task they can view.
- FR-16: Comments must display author, body, and timestamp, in chronological order.

**Search, Filter, Sort**
- FR-17: The Tasks page must support text search across title, task ID, and description.
- FR-18: The Tasks page must support filtering by status, priority, assignee, due date, category, and source, combinable and applied without a full page reload.
- FR-19: The Tasks page must support sorting by due date, priority, created date, and status.

**Notifications**
- FR-20: The system must generate an in-app notification when a task is assigned, reassigned, approaching its deadline, becomes overdue, receives a comment, or is completed.
- FR-21: Users must be able to view their notifications and mark them as read individually or all at once.

**AI Task Capture**
- FR-22: The system must provide an interface to paste unstructured text and receive an extracted, structured task draft.
- FR-23: The extracted draft must be editable and must require explicit user confirmation before a task is created.
- FR-24: If the AI service fails or is unavailable, the system must show a clear error and allow the user to create the task manually instead.
- FR-25: The AI must never silently invent a deadline or assignee it isn't confident about; low-confidence fields must be left blank for the user to fill in.

**Team & Workload**
- FR-26: Managers must be able to view a list of employees with their active, overdue, and completed task counts.
- FR-27: Clicking an employee must show that employee's current task list (read-only from the manager's side).

**Non-functional**
- FR-28: Every list, form submission, and AI call must show a loading state.
- FR-29: Every error condition listed in Section 23 must be handled with a friendly message, never a raw stack trace or technical error code.
- FR-30: Every major list/section must have a defined empty state (Section 21).
- FR-31: The application must be usable on desktop, tablet, and mobile screen widths.

## 13. Feature Specifications

Each feature below follows the same structure: Purpose, Primary User(s), User Story, Inputs, Outputs, UI Behavior, Backend Behavior, Data Requirements, Edge Cases, and Acceptance Criteria.

### 13.1 Authentication & Session

- **Purpose:** Gate the application behind a login and establish who is acting, so role-based visibility and permissions work correctly.
- **Primary User:** All users.
- **User Story:** As a user, I want to log in with my email and password so I can access only the tasks and views appropriate to my role.
- **Inputs:** Email, password (login form).
- **Outputs:** Authenticated session (cookie or token), redirect to role-appropriate dashboard.
- **UI Behavior:** Login page with email and password fields, a "Sign In" button, inline validation errors, and a visible hint block listing the two demo accounts (manager@lalatech.demo / demo123, employee@lalatech.demo / demo123) so anyone evaluating the product can log in immediately. A "Logout" action is available from the top navigation user menu on every authenticated page.
- **Backend Behavior:** On submit, call `POST /api/auth/login`. Verify credentials against the `users` table (password compared against a bcrypt hash). On success, issue a session (Supabase Auth session, or a signed HTTP-only cookie if using a custom lightweight auth layer). On failure, return a generic "Invalid email or password" error — never reveal whether the email exists. All protected API routes verify the session server-side before executing.
- **Data Requirements:** `users` table (Section 16) with `email`, `password_hash`, `role`.
- **Edge Cases:** Wrong password → generic error, no account enumeration. Empty fields → inline "required" validation before any network call. Expired session mid-use → any API call returns 401, client redirects to login with a "Your session expired, please log in again" message. Already-logged-in user visiting `/login` → redirect straight to their dashboard.
- **Acceptance Criteria:** A user can log in with either demo account and lands on the correct role's dashboard; logging out clears the session and returns to `/login`; visiting any protected route while logged out redirects to `/login`; invalid credentials show a clear, non-technical error.

### 13.2 Create Task

- **Purpose:** Turn a request into a structured, trackable record — the core unit of the entire product.
- **Primary User:** Manager (any task); Employee (tasks they submit for themselves or, if permitted, on behalf of a request they received).
- **User Story:** As a Manager, I want to fill out a short form to create a task so that a request is captured and assigned immediately.
- **Inputs:** Title (required), description, assignee (required, dropdown of active users), priority (required, default Medium), due date (required), category (free text or predefined list: Sales, Logistics, Support, Finance, Other), source (required: WhatsApp, Email, Phone, Manual, Other).
- **Outputs:** New task record; success toast; activity-log entry; notification to the assignee.
- **UI Behavior:** "Create Task" button (top-right of Tasks page and Dashboard) opens a modal/dialog form. Required fields are marked and validated inline before submission is allowed. On submit, a loading spinner replaces the submit button; on success, the modal closes, a toast reads "Task created successfully," and the new task appears at the top of the relevant list without a full page reload.
- **Backend Behavior:** `POST /api/tasks` validates required fields server-side (not just client-side), generates a human-readable `display_id` (e.g., `TASK-0231`), inserts the row with status defaulted to `pending`, writes an `activity_log` row (`task_created`), and writes a `notifications` row for the assignee (`task_assigned`).
- **Data Requirements:** `tasks` table; reads `users` table to populate the assignee dropdown.
- **Edge Cases:** Missing required field → inline error, no network call. Due date in the past → allowed but flagged with a warning ("This date is in the past") rather than blocked, since backfilling overdue historical requests is a legitimate use case. Network/database failure on submit → toast reads "Couldn't create the task — please try again," form data is preserved (not cleared). Assignee list empty (no other users) → assignee defaults to self with a note.
- **Acceptance Criteria:** A task created via the form appears immediately in the Tasks list, the Dashboard KPI counts, and the assignee's My Tasks list; an activity entry and a notification are created in the same transaction as the task.

### 13.3 Edit / Reassign Task

- **Purpose:** Keep task details accurate as circumstances change and let managers rebalance workload.
- **Primary User:** Manager (full edit on any task); Employee (limited — see Section 18 permission matrix).
- **User Story:** As a Manager, I want to reassign a task from an overloaded employee to someone else so the work doesn't stall.
- **Inputs:** Any editable field (title, description, priority, due date, category, assignee).
- **Outputs:** Updated task record; activity-log entries per changed field; notification to new assignee if reassigned.
- **UI Behavior:** "Edit" action on the Task Details page opens the same form used for creation, pre-filled. Reassignment is also available as a quick action directly from the Tasks table row (assignee avatar/dropdown) without opening the full edit form.
- **Backend Behavior:** `PATCH /api/tasks/:id` accepts a partial update, diffs the incoming fields against the current row, writes one `activity_log` row per meaningfully changed field (e.g., `task_reassigned` with `metadata: {from, to}`, `priority_changed`), updates `updated_at`, and — if the assignee changed — writes a `task_reassigned` notification to the new assignee.
- **Data Requirements:** `tasks`, `activity_log`, `notifications`.
- **Edge Cases:** Employee attempts to edit a task not assigned to them → 403 from the API, UI hides/disables edit controls for tasks they don't own. Reassigning to the same person → no-op, no duplicate activity entry. Editing a Completed task → allowed for managers (e.g., fixing a typo) but does not reset status or `completed_at`.
- **Acceptance Criteria:** Any field change is reflected immediately in the UI and produces a correctly worded activity-log entry; reassignment always notifies the new assignee; employees cannot edit tasks that aren't theirs.

### 13.4 Update Task Status

- **Purpose:** Give managers real-time visibility into progress without asking for updates.
- **Primary User:** Employee (own tasks); Manager (any task).
- **User Story:** As an Employee, I want to change a task's status as I work on it so my manager sees current progress automatically.
- **Inputs:** New status (Pending, In Progress, Blocked, Completed), optional comment (encouraged, required when moving to Blocked).
- **Outputs:** Updated status; activity-log entry; notification to the task creator/manager when a task becomes Completed or Blocked.
- **UI Behavior:** A status dropdown/segmented control on both the Tasks table row and the Task Details page. Selecting "Blocked" prompts the user to add a short comment explaining the blocker before the change is saved. Selecting "Completed" shows a brief confirmation ("Mark this task as completed?") since it's a terminal state.
- **Backend Behavior:** `PATCH /api/tasks/:id` with `{status}`. On transition to `completed`, sets `completed_at = now()`. Writes an activity-log row (`status_changed`, `metadata: {from, to}`) and a notification to the creator (`task_completed`). Recomputes dashboard KPI counts on next fetch (not cached beyond request scope for MVP).
- **Data Requirements:** `tasks`, `activity_log`, `notifications`.
- **Edge Cases:** Marking Completed then reopening → allowed by setting status back to Pending/In Progress; `completed_at` is cleared. Rapid repeated status changes → each is logged individually to preserve an honest history. Status changed by someone without permission → 403.
- **Acceptance Criteria:** Any status change is visible on the Dashboard and Tasks list within the same session without a manual refresh; a Blocked status without an accompanying comment is disallowed by the UI; completing a task stamps `completed_at` and notifies the creator.

### 13.5 Comments

- **Purpose:** Capture context and follow-up conversation on a task without leaving the system or re-explaining status verbally.
- **Primary User:** Employee and Manager, on any task they can view.
- **User Story:** As an Employee, I want to leave a comment like "Waiting for customer confirmation" so my manager understands the current blocker without me repeating it out loud.
- **Inputs:** Comment text (required, non-empty).
- **Outputs:** New comment row, displayed immediately; activity-log entry; notification to the other party (creator ↔ assignee, excluding the comment's own author).
- **UI Behavior:** A comment box at the bottom of the Task Details page's activity/comments section, with existing comments listed above it in chronological order (oldest first), each showing the author's name, avatar/initials, comment body, and a relative timestamp (e.g., "2h ago").
- **Backend Behavior:** `POST /api/tasks/:id/comments` inserts into `comments`, writes an `activity_log` row (`comment_added`), and writes a `notifications` row (`comment_added`) to whichever of {creator, assignee} did not author the comment.
- **Data Requirements:** `comments`, `activity_log`, `notifications`.
- **Edge Cases:** Empty comment → submit button disabled/inline validation, no network call. Very long comment → allowed, text area auto-grows, no hard character cap for MVP. Comment on a task the user can't view → 403.
- **Acceptance Criteria:** A submitted comment appears instantly at the bottom of the list with correct author and timestamp; it also appears in the task's activity timeline; the non-authoring party (creator or assignee) receives a notification.

### 13.6 AI Task Capture

- **Purpose:** Solve the specific, high-value problem of converting an unstructured message into a structured task, without becoming a general chatbot.
- **Primary User:** Manager (primary); Employee (secondary, for requests they receive directly).
- **User Story:** As a Manager, I want to paste a message I received and have the system propose a structured task, so I don't retype what's already been said.
- **Inputs:** Raw pasted text (free-form, e.g., a WhatsApp message).
- **Outputs:** An editable draft with title, description, assignee (matched against existing users where possible), priority, due date, category, and source, shown before any task is created.
- **UI Behavior:** Dedicated "AI Task Capture" page with a large text area, an "Extract Task" button, and a loading state while the request is in flight. Once returned, the extracted fields populate a form identical in shape to the manual Create Task form — every field remains editable. Fields the AI could not confidently determine are left blank and visually marked ("Couldn't determine — please fill in") rather than guessed. Three actions are available: **Confirm & Create Task**, **Edit** (just keep editing inline), and **Cancel** (discard the draft, no task created).
- **Backend Behavior:** `POST /api/ai/extract-task` receives `{rawText}`, calls the Gemini API from the server only (API key stored server-side in an environment variable, never sent to the client), using a system prompt that instructs the model to return strict JSON matching the schema in Section 19, and to omit (not guess) any field it isn't confident about. The response is validated server-side against the expected schema before being returned to the client; malformed AI output is rejected and surfaced as a graceful error, not stored. No task is created by this endpoint — creation only happens when the user explicitly confirms, via the normal `POST /api/tasks` call.
- **Data Requirements:** No new tables beyond `tasks` (created only on confirm); reads `users` for name-matching the extracted assignee against real accounts.
- **Edge Cases:** AI service unavailable/errors out → user sees "AI extraction is temporarily unavailable — you can still create this task manually," with a button that opens the standard manual Create Task form (optionally pre-filled with the pasted text as the description). Extracted assignee name doesn't match any real user → field is left for manual selection via dropdown, not auto-created as a new user. Ambiguous deadline ("soon," "when you can") → left blank rather than guessed. Empty or nonsense input → "Couldn't extract a task from that text — try including who it's for and what needs to be done."
- **Acceptance Criteria:** Pasting the example message ("Rahul, please send the invoice for order #4532 to the customer by tomorrow evening. This is urgent.") produces a draft with title referencing the invoice/order, assignee matched to Rahul, priority High, and a due date; no task exists in the database until the user clicks Confirm; the manual path works identically well whether or not the AI call succeeds.

### 13.7 Notifications

- **Purpose:** Replace manual, memory-driven follow-ups with automatic, timely alerts.
- **Primary User:** All users, scoped to their own notifications.
- **User Story:** As an Employee, I want to be notified when a task is assigned to me or a deadline is approaching, so I don't have to keep checking manually.
- **Inputs:** System-generated (assignment, reassignment, approaching deadline, overdue, comment, completion) — no direct user input beyond marking read.
- **Outputs:** A notification list with unread badge count; read/unread state per notification.
- **UI Behavior:** A bell icon in the top navigation with an unread-count badge, visible on every authenticated page. Clicking it opens a dropdown/panel listing recent notifications (newest first), each with an icon indicating type, a short message, a relative timestamp, and a subtle unread indicator (dot or bold text). Clicking a notification marks it read and navigates to the related task. A "Mark all as read" action is available. A dedicated Notifications page (for full history, not just the dropdown's recent slice) is reachable from the sidebar.
- **Backend Behavior:** Notifications are written by the relevant feature's backend logic at the moment the triggering event occurs (task assigned/reassigned → Section 13.2/13.3; comment → Section 13.5; completion → Section 13.4). Deadline-approaching and overdue notifications are produced by a scheduled check (see Section 20) that scans tasks with a due date within a configurable threshold (e.g., 24 hours) or past due, and generates at most one "approaching" and one "overdue" notification per task per assignee to avoid spam. `GET /api/notifications` returns the current user's notifications; `PATCH /api/notifications/:id/read` and `PATCH /api/notifications/read-all` update `is_read`.
- **Data Requirements:** `notifications` table (Section 16).
- **Edge Cases:** Notification for a task that was later deleted → cascades/removed via foreign key or filtered out at query time. User with zero notifications → empty state ("No notifications."). Duplicate triggers within a short window (e.g., two rapid status changes) → each still logged individually; the badge count reflects unread total, not deduplicated.
- **Acceptance Criteria:** Assigning a task generates exactly one notification for the assignee; the bell badge count matches the number of unread notifications; marking a notification read updates its state without a page reload; deadline and overdue notifications are generated without requiring any user action.

### 13.8 Dashboard KPIs & Overdue Detection

- **Purpose:** Give a manager (or employee, for their own scope) an at-a-glance answer to "what's the current state of operational work."
- **Primary User:** Manager (company-wide); Employee (own tasks).
- **User Story:** As a Manager, I want to see live counts of total, pending, in-progress, overdue, and completed tasks, so I know the operational state without asking anyone.
- **Inputs:** None (read-only, computed).
- **Outputs:** KPI cards, status breakdown, priority breakdown, overdue list, today's tasks, recent activity feed.
- **UI Behavior:** See full layout in Section 15.2/15.3. All numbers update on page load and after any task mutation performed from within the same session (no separate manual refresh required for actions taken in-app).
- **Backend Behavior:** `GET /api/tasks/dashboard-summary` computes counts with a single set of efficient, indexed database queries (grouped counts by status; a count where `due_date < now() AND status != 'completed'` for overdue; a count where `due_date` falls within today's date range for "due today"). Results are scoped by role: managers get company-wide counts, employees get counts filtered to `assigned_to = current_user`.
- **Data Requirements:** `tasks` table with `due_date` and `status` indexed.
- **Edge Cases:** No tasks in the system yet → all cards show 0 with friendly empty states below ("No overdue tasks 🎉", "No tasks found."). A task with no due date → excluded from overdue/today calculations, included in total/status/priority counts. Clock/timezone edge cases for "due today" → compare in a single consistent timezone (server/business timezone) rather than each client's local time, to avoid a task appearing "due today" for one viewer and not another.
- **Acceptance Criteria:** KPI numbers always match a direct count of the underlying task data (never hardcoded); creating, completing, or reassigning a task updates the relevant KPI on next dashboard load; a task past its due date and not completed always appears in Overdue Tasks.

### 13.9 Search, Filter, and Sort (Tasks Page)

- **Purpose:** Let managers and employees find specific work quickly as the task list grows, instead of scrolling a spreadsheet.
- **Primary User:** Manager (all tasks); Employee (own tasks, on My Tasks).
- **User Story:** As a Manager, I want to filter tasks by status and assignee so I can quickly see everything currently blocked for a specific employee.
- **Inputs:** Search text; filter selections (status, priority, assignee, due date range, category, source); sort field and direction.
- **Outputs:** Filtered, sorted task list.
- **UI Behavior:** A search box and a row of filter dropdowns/chips above the Tasks table; a sort control on the table header (clicking a column header like "Due Date" toggles sort direction). Filters apply immediately as they're changed — no "Apply" button and no full page reload. Active filters are shown as removable chips with a "Clear all" action.
- **Backend Behavior:** `GET /api/tasks` accepts query parameters for search, each filter, sort field/direction, and pagination, and applies them server-side as indexed WHERE/ORDER BY clauses rather than filtering a full result set client-side (so the approach scales as task volume grows).
- **Data Requirements:** `tasks` table with indexes on `status`, `priority`, `assigned_to`, `due_date`.
- **Edge Cases:** Filter combination with zero matches → empty state ("No tasks found." plus a "Clear filters" shortcut). Search text with no matches → same empty state. Filters persist across a page refresh via URL query parameters, so a filtered view can be bookmarked/shared.
- **Acceptance Criteria:** Combining two or more filters returns only tasks matching all of them; changing a filter never triggers a full page reload; sorting by Due Date correctly orders tasks with no due date at the end of the list, not the start.

### 13.10 Employee Workload View

- **Purpose:** Let a manager spot overload and bottlenecks without manually tallying a spreadsheet.
- **Primary User:** Manager.
- **User Story:** As a Manager, I want to see each employee's active and overdue task counts side by side, so I can identify who's overloaded and rebalance work.
- **Inputs:** None (read-only, computed); optional click-through to an employee's task list.
- **Outputs:** A table of employees with Active Tasks and Overdue counts.
- **UI Behavior:** On the Team page, a table with one row per employee: name, role, active task count, overdue count, completed count. Rows are clickable and open a read-only filtered view of that employee's tasks (reusing the Tasks page filtered by assignee).
- **Backend Behavior:** `GET /api/team/workload` (manager-only) aggregates per-user counts with a single grouped query rather than one query per employee.
- **Data Requirements:** `users`, `tasks`.
- **Edge Cases:** Employee with zero tasks → row still shown with 0s, not omitted. Non-manager attempting to access this endpoint/page → 403 and hidden from navigation entirely.
- **Acceptance Criteria:** Counts match what's shown when manually filtering the Tasks page by that assignee; the page is inaccessible to employee-role accounts.

### 13.11 Activity Log

- **Purpose:** Provide a trustworthy, chronological record of what happened to any task or across the company, without relying on memory.
- **Primary User:** Manager (company-wide feed); Employee (their own tasks' history).
- **User Story:** As a Manager, I want to see a feed of recent operational activity, so I can understand what's changed since I last checked.
- **Inputs:** None (read-only, system-generated by every other feature).
- **Outputs:** Chronological list of activity entries, globally (Activity page, Dashboard's Recent Activity) and per-task (Task Details timeline).
- **UI Behavior:** Each entry reads as a short human sentence (e.g., "Priya reassigned Task #452 to Rahul," "Aman completed Order #1023 follow-up") with a relative timestamp and, where relevant, a link to the task.
- **Backend Behavior:** `GET /api/activity` supports an optional `taskId` filter (per-task timeline) and a `limit`/pagination for the global feed; scoped by role (employees only see activity on their own tasks). Every mutating action elsewhere in the system (Sections 13.2–13.6) is responsible for writing its own `activity_log` row at the time it occurs — the log is never backfilled or reconstructed after the fact.
- **Data Requirements:** `activity_log` table (Section 16).
- **Edge Cases:** No activity yet → empty state ("No recent activity."). Task later deleted → its activity entries are removed via cascading delete rather than left as dangling references.
- **Acceptance Criteria:** Every task mutation described in this document (create, edit, assign/reassign, status change, priority change, comment, completion) produces exactly one corresponding activity-log entry with an accurate, human-readable description.

### 13.12 Delete Task

- **Purpose:** Allow correction of mistakes (e.g., a duplicate or test task) without cluttering the system.
- **Primary User:** Manager only.
- **User Story:** As a Manager, I want to delete a task created in error, so it doesn't skew counts or clutter the task list.
- **Inputs:** Confirmation of intent.
- **Outputs:** Task and its related comments/activity/notifications removed (or archived — see Edge Cases).
- **UI Behavior:** "Delete" action available from the Task Details page (manager view only), behind a confirmation dialog ("This will permanently delete this task and its history. This can't be undone.").
- **Backend Behavior:** `DELETE /api/tasks/:id` (manager-only, enforced server-side regardless of what the UI shows) removes the task; `comments`, `notifications`, and `activity_log` rows referencing it cascade-delete via foreign key constraints.
- **Data Requirements:** Cascading foreign keys from `comments`, `notifications`, `activity_log` to `tasks.id`.
- **Edge Cases:** Employee attempts delete via direct API call → 403, since only the UI hides the button but the server is the real enforcement point. Deleting a task that has notifications pending for other users → those notifications are removed along with it rather than left pointing at nothing.
- **Acceptance Criteria:** After deletion, the task no longer appears anywhere (Tasks list, Dashboard, My Tasks, Activity); dashboard KPI counts immediately reflect the removal; the action is unavailable to employee-role accounts both in the UI and at the API layer.

## 14. Information Architecture

```
Lala Tech Operations Hub
│
├── /login                         (public)
│
├── /dashboard                     (Manager: company-wide | Employee: personal)
├── /tasks                         (Manager only — all tasks)
├── /my-tasks                      (Employee only — own tasks; Manager can also view via Team drill-down)
├── /tasks/:id                     (Task Details — shared, permission-gated)
├── /ai-capture                    (AI Task Capture — both roles)
├── /notifications                 (both roles, own notifications)
├── /activity                      (Manager: company-wide | Employee: own tasks only)
├── /team                          (Manager only)
├── /team/:userId                  (Manager only — single employee workload drill-down)
└── /settings                      (both roles — profile + basic preferences)
```

**Sidebar navigation — Manager:**
```
Lala Tech
Dashboard
Tasks
AI Task Capture
Notifications
Activity
Team
Settings
```

**Sidebar navigation — Employee:**
```
Lala Tech
Dashboard
My Tasks
AI Task Capture
Notifications
Settings
```
*(Activity is reachable for employees only as a per-task timeline on the Task Details page, not as a standalone company-wide sidebar item, per the role-scoped access defined in Section 4/18.)*

**Top navigation (both roles):** App/company name (left), search shortcut, notification bell with unread badge, user avatar/menu (Profile, Logout) — persistent across all authenticated pages.

## 15. Page-by-Page Requirements

### 15.1 Login Page (`/login`)
- **Access:** Public.
- **Layout:** Centered card: logo/wordmark "Lala Tech," email field, password field, "Sign In" button, error message region above the button (hidden until an error occurs), and a small helper block listing both demo accounts and their passwords.
- **Data:** None on load. On submit, calls `POST /api/auth/login`.
- **Interactions:** Submit → loading spinner on button → success redirects to `/dashboard`; failure shows an inline error and re-enables the form. Pressing Enter in either field submits the form.
- **States:** Loading (spinner, disabled inputs), error (red inline message, fields retain entered values except password), empty-field validation (inline, before network call).

### 15.2 Dashboard — Manager (`/dashboard`)
- **Access:** Manager.
- **Layout (top to bottom):**
  1. Page header: "Dashboard" + "Create Task" button (top-right).
  2. KPI card row: Total Tasks, Pending, In Progress, Overdue, Completed — each a count with a label and a subtle icon; the Overdue card uses a red/warning accent.
  3. Two side-by-side panels: **Task Status Overview** (simple bar or donut breakdown of Pending/In Progress/Blocked/Completed) and **Priority Overview** (High/Medium/Low breakdown).
  4. **Overdue Tasks** section — full-width, visually prominent (red left border or header accent), a table/list of overdue tasks (task name, assignee, due date, priority badge, status badge), each row clickable to `/tasks/:id`.
  5. **Today's Tasks** section — table/list of tasks due today (task, assignee, priority, status, deadline time).
  6. **Recent Activity** feed — most recent ~10 entries across the company, each a one-line human-readable description with a relative timestamp.
- **Data Source:** `GET /api/tasks/dashboard-summary`, `GET /api/tasks/overdue`, `GET /api/tasks/today`, `GET /api/activity?limit=10`.
- **Interactions:** "Create Task" opens the Create Task modal (Section 15.7). Any row in Overdue Tasks or Today's Tasks opens `/tasks/:id`. KPI cards are informational (not clickable) for MVP.
- **States:** Loading → skeleton cards/rows. Empty Overdue → "No overdue tasks 🎉". Empty Today's Tasks → "Nothing due today." Empty Recent Activity → "No recent activity."

### 15.3 Dashboard — Employee ("My Dashboard," `/dashboard`)
- **Access:** Employee.
- **Layout:** Same visual pattern as the Manager dashboard, scoped to the employee's own tasks only:
  1. KPI cards: My Total, Pending, In Progress, Overdue, Completed (all scoped to `assigned_to = self`).
  2. My Tasks status breakdown.
  3. **My Overdue** section.
  4. **Due Today** section.
  5. **Upcoming** section (next 7 days, excluding today/overdue).
  6. **My Recent Activity** (activity on the employee's own tasks only).
- **Data Source:** Same endpoints as 15.2, automatically scoped server-side by the authenticated user's role.
- **Interactions/States:** Same patterns as 15.2, scoped to self; "Create Task" still available (employee-submitted requests, Section 13.2).

### 15.4 Tasks (`/tasks`, Manager only)
- **Access:** Manager.
- **Layout:** Header with "Create Task" button; search bar + filter row (Status, Priority, Assignee, Due Date, Category, Source) with active-filter chips; a data table (Task ID, Title, Assignee avatar, Priority badge, Status badge, Due Date, Category) with sortable column headers; pagination controls at the bottom.
- **Data Source:** `GET /api/tasks` with query params for search/filter/sort/page.
- **Interactions:** Row click → `/tasks/:id`. Inline quick-actions per row (change status via dropdown, reassign via avatar dropdown) without opening the full details page. Filters/search/sort update the table in place.
- **States:** Loading → skeleton rows. No results for current filters → "No tasks found." + "Clear filters" link. Table converts to stacked cards below the tablet breakpoint (Section 30).

### 15.5 My Tasks (`/my-tasks`, Employee only)
- **Access:** Employee.
- **Layout:** Tabbed or segmented view: **Pending / In Progress / Blocked / Completed**, plus quick filters for **Due Today**, **Upcoming**, **Overdue**. Each task shown as a card or row with title, priority badge, status badge, and due date.
- **Data Source:** `GET /api/tasks?assignedTo=self&...`.
- **Interactions:** Tap/click a task → `/tasks/:id`. Status can also be updated directly from a card via a quick dropdown.
- **States:** Empty per tab → "No tasks in this category." Overdue quick filter empty → "No overdue tasks 🎉".

### 15.6 Task Details (`/tasks/:id`, shared, permission-gated)
- **Access:** Manager (any task, full edit); Employee (only if creator or assignee; status/comment only, no reassignment/delete).
- **Layout:**
  1. Header: Task title, Task ID, Status badge, Priority badge, and (Manager only) Edit / Reassign / Delete actions.
  2. **Task Information** panel: Description, Assignee, Creator, Due Date, Created Date, Source, Category.
  3. **Activity Timeline**: chronological list of all activity-log entries for this task (created, assigned, status changes, priority changes, comments, completion), each with actor, description, and timestamp.
  4. **Comments** section: existing comments in chronological order + a comment input box at the bottom.
  5. Status-change control and (employee, own task) Mark Completed action, prominently placed.
- **Data Source:** `GET /api/tasks/:id` (returns task + comments + activity in one payload for MVP simplicity).
- **Interactions:** Status dropdown → `PATCH /api/tasks/:id`. Comment submit → `POST /api/tasks/:id/comments`. Edit (manager) → opens the same form as Create Task, pre-filled. Delete (manager) → confirmation dialog → `DELETE /api/tasks/:id`, redirect to `/tasks`.
- **States:** Loading → skeleton layout. Invalid/nonexistent task ID → friendly "This task couldn't be found" page with a link back to Tasks. Unauthorized access (employee viewing a task not theirs) → friendly "You don't have access to this task" message, not a raw 403.

### 15.7 Create/Edit Task Modal
- **Access:** Manager (create/edit any); Employee (create for self; edit limited fields on own tasks per 13.3).
- **Layout:** Modal/dialog overlay with fields: Title*, Description, Assignee* (dropdown of active users), Priority* (High/Medium/Low, default Medium), Due Date* (date picker), Category (dropdown: Sales, Logistics, Support, Finance, Other, or free text), Source* (WhatsApp, Email, Phone, Manual, Other). Required fields marked with *.
- **Interactions:** "Create Task" / "Save Changes" submits; "Cancel" discards and closes without saving. Inline validation on required fields before submit is enabled.
- **States:** Submitting → spinner on the primary button, fields disabled. Success → toast + modal closes + list updates in place. Failure → inline error banner inside the modal, form values preserved.

### 15.8 AI Task Capture (`/ai-capture`)
- **Access:** Manager and Employee.
- **Layout:** Large text area with placeholder text ("Paste a message, e.g. a WhatsApp request..."), "Extract Task" button below it. Below that, once extraction runs, an editable draft panel mirroring the Create Task form fields, each pre-filled where the AI was confident and clearly marked where it wasn't. Three actions: **Confirm & Create Task**, edit-in-place, **Cancel**.
- **Data Source:** `POST /api/ai/extract-task` on Extract; `POST /api/tasks` on Confirm.
- **Interactions:** See Section 13.6 in full.
- **States:** Extracting → loading state on the button + subtle skeleton on the draft area. AI unavailable → inline error with a "Create manually instead" fallback link that opens the standard Create Task modal. Draft confirmed → success toast, form clears, ready for the next capture.

### 15.9 Notifications (`/notifications`)
- **Access:** Both roles, own notifications only.
- **Layout:** List of notifications (newest first), each with a type icon, message, relative timestamp, read/unread indicator, and a "Mark all as read" action at the top.
- **Data Source:** `GET /api/notifications`.
- **Interactions:** Click a notification → marks it read (`PATCH /api/notifications/:id/read`) and navigates to the related task. "Mark all as read" → `PATCH /api/notifications/read-all`.
- **States:** Empty → "No notifications." Loading → skeleton rows.

### 15.10 Activity (`/activity`, Manager: company-wide | Employee: own-task history)
- **Access:** Manager (all activity); Employee (activity limited to their own tasks — reachable via per-task timelines rather than a standalone sidebar page, per Section 14).
- **Layout:** Reverse-chronological feed of activity entries, each with actor, description, and timestamp; optional filter by task or by type.
- **Data Source:** `GET /api/activity`.
- **States:** Empty → "No recent activity."

### 15.11 Team (`/team`, Manager only)
- **Access:** Manager.
- **Layout:** Table of employees — Name, Role, Active Tasks, Overdue, Completed — sorted by Overdue descending by default so at-risk employees surface first.
- **Data Source:** `GET /api/team/workload`.
- **Interactions:** Row click → `/team/:userId`, a read-only filtered task list for that employee (reuses the Tasks table component filtered by assignee).
- **States:** Empty (no employees besides self) → "No team members yet."

### 15.12 Settings (`/settings`)
- **Access:** Both roles.
- **Layout:** Profile section (name, email — read-only for MVP or basic edit), password change form, and a simple notification preferences toggle (e.g., "Notify me by in-app alert for: assignments, deadlines, comments" — all on by default for MVP; no external channel toggles since only in-app notifications exist).
- **Interactions:** Save → confirmation toast. Kept intentionally minimal — this is not an admin console.

## 16. Database Schema

Relational schema (PostgreSQL/Supabase syntax; works equivalently in SQLite for local MVP development per Section 35's stack options).

```sql
-- USERS
create table users (
  id             uuid primary key default gen_random_uuid(),
  full_name      text not null,
  email          text not null unique,
  password_hash  text not null,             -- bcrypt; demo accounts seeded with a known hash
  role           text not null check (role in ('manager', 'employee')),
  avatar_color   text,                       -- for initials-badge UI
  created_at     timestamptz not null default now()
);

-- TASKS
create table tasks (
  id             uuid primary key default gen_random_uuid(),
  display_id     text not null unique,       -- human-friendly, e.g. 'TASK-0231'
  title          text not null,
  description    text,
  status         text not null default 'pending'
                   check (status in ('pending', 'in_progress', 'blocked', 'completed')),
  priority       text not null default 'medium'
                   check (priority in ('high', 'medium', 'low')),
  category       text,                       -- e.g. 'Sales','Logistics','Support','Finance','Other'
  source         text not null
                   check (source in ('whatsapp', 'email', 'phone', 'manual', 'other')),
  created_by     uuid not null references users(id),
  assigned_to    uuid references users(id),
  due_date       timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  completed_at   timestamptz
);

create index idx_tasks_assigned_to on tasks(assigned_to);
create index idx_tasks_status on tasks(status);
create index idx_tasks_due_date on tasks(due_date);
create index idx_tasks_priority on tasks(priority);

-- COMMENTS
create table comments (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid not null references tasks(id) on delete cascade,
  user_id     uuid not null references users(id),
  body        text not null,
  created_at  timestamptz not null default now()
);

create index idx_comments_task_id on comments(task_id);

-- ACTIVITY LOG
create table activity_log (
  id           uuid primary key default gen_random_uuid(),
  task_id      uuid references tasks(id) on delete cascade,
  user_id      uuid references users(id),
  action_type  text not null check (action_type in (
                 'task_created', 'task_edited', 'task_assigned', 'task_reassigned',
                 'status_changed', 'priority_changed', 'comment_added',
                 'task_completed', 'task_deleted'
               )),
  description  text not null,       -- human-readable, e.g. "Priya reassigned this task to Rahul"
  metadata     jsonb,               -- e.g. {"from": "pending", "to": "in_progress"}
  created_at   timestamptz not null default now()
);

create index idx_activity_task_id on activity_log(task_id);
create index idx_activity_created_at on activity_log(created_at desc);

-- NOTIFICATIONS
create table notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id),      -- recipient
  task_id     uuid references tasks(id) on delete cascade,
  type        text not null check (type in (
                'task_assigned', 'task_reassigned', 'deadline_approaching',
                'task_overdue', 'comment_added', 'task_completed'
              )),
  message     text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index idx_notifications_user_unread on notifications(user_id, is_read);
```

**Notes:**
- All destructive relationships (`comments`, `activity_log`, `notifications` → `tasks`) cascade on delete so removing a task leaves no orphaned records (Section 13.12).
- `activity_log.metadata` (jsonb) stores structured before/after values so the UI can render precise diffs (e.g., "Status changed from Pending to In Progress") without re-parsing the description string.
- `display_id` is generated server-side at creation (e.g., zero-padded incrementing counter or a short random suffix) and is what's shown to users in place of the raw UUID.

## 17. API Requirements

All routes are server-side (Next.js API routes/server actions or an equivalent lightweight backend), require an authenticated session except `/api/auth/login`, and enforce role-based authorization independently of what the UI exposes (Section 18).

**Auth**

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Verify email/password, issue session |
| POST | `/api/auth/logout` | Session | Invalidate current session |
| GET | `/api/auth/me` | Session | Return current user (id, name, role) |

**Users**

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/users` | Session | List active users (for assignee dropdowns) |
| GET | `/api/users/:id` | Manager, or self | Basic profile + task counts |

**Tasks**

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/tasks` | Session | List tasks (role-scoped), supports `search`, `status`, `priority`, `assignedTo`, `category`, `source`, `dueBefore`/`dueAfter`, `sort`, `page` |
| POST | `/api/tasks` | Session | Create task (Section 13.2) |
| GET | `/api/tasks/:id` | Session + ownership/role check | Full task detail incl. comments + activity |
| PATCH | `/api/tasks/:id` | Session + ownership/role check | Partial update (Section 13.3, 13.4) |
| DELETE | `/api/tasks/:id` | Manager only | Delete task (Section 13.12) |
| GET | `/api/tasks/dashboard-summary` | Session | Role-scoped KPI counts (Section 13.8) |
| GET | `/api/tasks/overdue` | Session | Role-scoped overdue list |
| GET | `/api/tasks/today` | Session | Role-scoped due-today list |

**Comments**

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/tasks/:id/comments` | Session + task access | List comments for a task |
| POST | `/api/tasks/:id/comments` | Session + task access | Add a comment (Section 13.5) |

**Notifications**

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/notifications` | Session | Current user's notifications, supports `unread=true` |
| PATCH | `/api/notifications/:id/read` | Session, own notification | Mark one as read |
| PATCH | `/api/notifications/read-all` | Session | Mark all of current user's notifications as read |

**Activity**

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/activity` | Session | Role-scoped feed; supports `taskId`, `limit`, `page` |

**AI**

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/ai/extract-task` | Session | Accepts `{rawText}`, returns structured draft (Section 19); never creates a task |

**Team**

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/api/team/workload` | Manager only | Per-employee active/overdue/completed counts (Section 13.10) |

**Standard error shape** (used by every endpoint, never a raw stack trace):
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Title is required." } }
```
Common `code` values: `VALIDATION_ERROR` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `AI_UNAVAILABLE` (502), `SERVER_ERROR` (500).

## 18. Authentication & Authorization

**Mechanism:** Email/password authentication. If using Supabase, Supabase Auth handles credential storage and session issuance directly. If implementing a lightweight custom layer instead, passwords are hashed with bcrypt and sessions are HTTP-only, signed cookies — never plain client-side tokens in localStorage.

**Demo accounts (seeded at setup):**

| Role | Email | Password |
|---|---|---|
| Manager | manager@lalatech.demo | demo123 |
| Employee | employee@lalatech.demo | demo123 |

**Permission matrix:**

| Action | Manager | Employee (own task) | Employee (other's task) |
|---|---|---|---|
| View task | ✅ | ✅ | ❌ |
| Create task | ✅ | ✅ (assigns to self or requests assignment) | — |
| Edit title/description/priority/due date/category | ✅ | ❌ | ❌ |
| Change status | ✅ | ✅ | ❌ |
| Reassign task | ✅ | ❌ | ❌ |
| Delete task | ✅ | ❌ | ❌ |
| Comment | ✅ | ✅ | ❌ |
| View all tasks / company dashboard | ✅ | ❌ | ❌ |
| View Team / workload page | ✅ | ❌ | ❌ |
| View own dashboard / My Tasks | ✅ (has both views) | ✅ | — |

Every rule above is enforced **server-side** in the API layer, not only hidden in the UI — a disabled button is a UX convenience, not a security boundary. Any request that violates the matrix returns `403 FORBIDDEN` with the standard error shape from Section 17.

**Route guards:** All routes under the authenticated shell (everything except `/login`) check for a valid session server-side (middleware or per-route check) and redirect to `/login` if absent. Manager-only routes (`/team`, `/team/:userId`) additionally check `role === 'manager'` and redirect employees to `/dashboard` if they attempt direct navigation.

## 19. AI Integration

**Purpose (restated):** Solve one specific problem — turning an unstructured message into a structured, reviewable task draft. This is not a general-purpose chatbot and has no open-ended conversational surface.

**Provider:** Gemini API (or an equivalent LLM API), called only from the server. The API key is stored in an environment variable (e.g., `GEMINI_API_KEY`) and is never sent to or accessible from the client bundle.

**Request contract** (`POST /api/ai/extract-task`):
```json
{ "rawText": "Rahul, please send the invoice for order #4532 to the customer by tomorrow evening. This is urgent." }
```

**System prompt instructions (summarized):**
- Extract only what is explicitly stated or strongly implied; do not invent information.
- Return strict JSON only, matching the schema below — no prose, no markdown fences.
- If the assignee's name doesn't clearly match a known team member, still return the name as free text; the server (not the model) is responsible for matching it against real user records.
- If a deadline is vague ("soon," "when possible") or absent, omit `dueDate` entirely rather than guessing a date.
- If urgency language is present ("urgent," "ASAP," "ignore this and it'll cost us the client") infer `priority: "high"`; otherwise default reasoning: explicit low-stakes language → `"low"`; anything else → `"medium"`, but the model is not required to be confident about priority and the endpoint response should reflect that with a per-field confidence flag.

**Response contract (model output, validated server-side before use):**
```json
{
  "title": "Send invoice for order #4532",
  "description": "Send the invoice for order #4532 to the customer.",
  "assignee": "Rahul",
  "priority": "high",
  "dueDate": "2026-09-11",
  "category": null,
  "source": "whatsapp",
  "confidence": {
    "title": "high",
    "assignee": "high",
    "priority": "high",
    "dueDate": "medium",
    "category": "low"
  }
}
```

**Server-side validation before returning to the client:**
- `priority` must be one of `high|medium|low`, else discard and leave blank.
- `dueDate`, if present, must parse to a valid future-or-present date; invalid or clearly nonsensical dates are dropped rather than passed through.
- `assignee` is cross-checked against the `users` table by name match; if no confident match is found, the field is still shown as free text but the assignee dropdown in the UI defaults to unselected rather than silently picking a user.
- Any field missing from the model's JSON, or explicitly null, is left blank in the draft — never defaulted to a guessed value.
- The endpoint never writes to the `tasks` table; task creation only happens through the normal, separately-confirmed `POST /api/tasks` call (Section 13.2), preserving the "review, edit, confirm, cancel" requirement.

**Failure handling:** Network errors, API timeouts, rate limits, or malformed responses from the model all resolve to the same client-facing behavior: a friendly error ("AI extraction is temporarily unavailable") plus an immediate path to manual task creation (Section 13.6, Edge Cases). The rest of the application has zero dependency on AI availability.

## 20. Notification System

**Trigger table:**

| Event | Recipient | Type | Example Message |
|---|---|---|---|
| Task created & assigned | Assignee | `task_assigned` | "You've been assigned: Send invoice for order #4532" |
| Task reassigned | New assignee | `task_reassigned` | "You've been assigned: Follow up on pending order" |
| Due date within 24 hours, not completed | Assignee | `deadline_approaching` | "Due soon: Send invoice for order #4532 (tomorrow)" |
| Due date passed, not completed | Assignee (and creator, if different) | `task_overdue` | "Overdue: Send invoice for order #4532" |
| Comment added | The other party (creator or assignee, excluding the commenter) | `comment_added` | "Priya commented on Send invoice for order #4532" |
| Task marked Completed | Creator (if different from the person completing it) | `task_completed` | "Rahul completed: Send invoice for order #4532" |

**Delivery:** In-app only for MVP (Section 18/21 of the source brief) — no email or WhatsApp delivery. Notifications are generated synchronously by the triggering action (assignment, comment, completion) and by a periodic check for deadline/overdue conditions (a scheduled job or a check performed on relevant page loads/API calls, run at most once per task per condition to avoid duplicate spam — enforced by checking for an existing unread notification of the same `type` + `task_id` before creating a new one).

**Read state:** Each notification is `is_read: false` until the user clicks it (auto-marks read) or uses "Mark all as read." The bell badge count is `count(*) where user_id = self and is_read = false`.

## 21. UX/UI Requirements

**Overall direction:** Clean, minimal, professional — this should read as a real internal business tool, not a marketing site. No excessive animation, no decorative gradients, no illustration-heavy empty states beyond a simple icon + short text.

**Layout shell:** Persistent left sidebar (collapsible on smaller screens, see Section 30) with the navigation defined in Section 14; persistent top bar with search shortcut, notification bell (badge count), and user menu.

**Core components:**
- **Status badges:** Pending (neutral/gray), In Progress (blue), Blocked (amber/orange), Completed (green) — consistent colors used everywhere a status appears (table rows, cards, task details, dashboard breakdowns).
- **Priority indicators:** High (red), Medium (amber), Low (gray/green) — shown as a small colored dot or pill, never relying on color alone (always paired with the text label, for accessibility).
- **Data tables:** Sortable headers, row hover state, inline quick-actions, pagination.
- **Modals/dialogs:** Used for Create/Edit Task and confirmation prompts (delete, mark completed); dismissible via an explicit Cancel/X, not just a background click, to avoid accidental data loss.
- **Toasts:** Brief, auto-dismissing confirmations for successful actions (task created, status updated, comment added); errors get a slightly longer-lived toast or an inline banner where context matters (e.g., inside a form).

**Empty states (exact copy to use verbatim where applicable):**
- Tasks list with no results: "No tasks found."
- Overdue Tasks, none: "No overdue tasks 🎉"
- Notifications, none: "No notifications."
- Recent Activity, none: "No recent activity."
- My Tasks tab with nothing in it: "No tasks in this category."
- Team page with no other employees: "No team members yet."

**Loading states:** Skeleton loaders (gray placeholder blocks matching the shape of the real content) for the Dashboard, Tasks table, Task Details, and Notifications list; inline spinners for button-triggered actions (form submits, AI extraction).

**Accessibility basics:** All interactive elements reachable by keyboard; color is never the sole indicator of status/priority (text labels always present); sufficient contrast on badges; form fields have visible labels, not placeholder-only labeling.

## 22. Technical Architecture

**Stack:**

| Layer | Choice | Rationale |
|---|---|---|
| Frontend | Next.js + React + TypeScript + Tailwind CSS | Single framework for both UI and API routes; strong ecosystem; fast to build a data-heavy internal tool |
| Backend | Next.js API routes / Server Actions | Avoids standing up a separate backend service for an MVP of this scope |
| Database | PostgreSQL via Supabase (or SQLite for local-only development) | Real persistence per Section 28's requirement; Supabase also bundles auth and row-level security if desired |
| Auth | Supabase Auth, or a lightweight bcrypt + signed-cookie session layer if Supabase isn't used | Meets the "real, functional auth" requirement without building a custom identity system from scratch |
| AI | Gemini API, called server-side only | Matches the source requirement; kept behind a single, swappable server route (`/api/ai/extract-task`) so the provider could change without touching the rest of the app |
| Icons | Lucide | Consistent, lightweight icon set matching a clean SaaS aesthetic |

**Guiding principle (per source brief):** Reliability > simplicity > speed of development > unnecessary architectural complexity. Concretely: prefer one well-tested Next.js app over a microservice split; prefer server-side validation everywhere over trusting the client; prefer straightforward SQL queries with proper indexes over premature caching layers.

**High-level data flow:**
```
Browser (React/Next.js pages)
        ↓  fetch()
Next.js API Routes / Server Actions   ← session check + role check on every call
        ↓
Business logic (task rules, notification triggers, activity logging)
        ↓
PostgreSQL (Supabase) — users / tasks / comments / activity_log / notifications
```

**AI Task Capture data flow:**
```
User pastes text (AI Task Capture page)
        ↓
POST /api/ai/extract-task  (server-side only)
        ↓
Gemini API call with structured-JSON system prompt
        ↓
Server validates response against schema (Section 19)
        ↓
Editable draft returned to client — nothing persisted yet
        ↓
User reviews / edits / confirms
        ↓
POST /api/tasks  (identical path to manual creation)
        ↓
Task persisted, activity logged, notification sent
```

**Suggested project structure (Next.js App Router):**
```
/app
  /login
  /dashboard
  /tasks
    /[id]
  /my-tasks
  /ai-capture
  /notifications
  /activity
  /team
    /[userId]
  /settings
  /api
    /auth/{login,logout,me}
    /tasks/{route.ts, [id]/route.ts, dashboard-summary, overdue, today}
    /tasks/[id]/comments
    /notifications/{route.ts, [id]/read, read-all}
    /activity
    /ai/extract-task
    /team/workload
/components  (TaskTable, TaskCard, StatusBadge, PriorityBadge, TaskModal, NotificationBell, ...)
/lib         (db client, auth helpers, permission checks, notification triggers, AI client)
/types       (shared TypeScript types for Task, User, Comment, Notification, ActivityEntry)
```

## 23. Error Handling

| Scenario | User-Facing Message | System Behavior |
|---|---|---|
| Failed login | "Invalid email or password." | Generic message regardless of whether the email exists; no account enumeration; field values retained except password |
| Invalid/incomplete form submission | Inline per-field messages (e.g., "Title is required.") | Blocked client-side before any network call; re-validated server-side regardless |
| Missing required field on server (bypassing client validation) | `VALIDATION_ERROR` (400) with the standard error shape | Request rejected, nothing written to the database |
| Database read/write failure | "Something went wrong on our end — please try again." | Logged server-side with detail; client sees only the generic message; form data preserved so the user doesn't retype |
| AI API failure/timeout/malformed response | "AI extraction is temporarily unavailable — you can still create this task manually." | Draft not populated; manual Create Task path remains fully available |
| Network failure (client offline / request never reaches server) | "Couldn't reach the server — check your connection and try again." | Retry affordance shown; no partial writes |
| Unauthorized action (role/ownership violation) | "You don't have permission to do that." | `FORBIDDEN` (403); enforced server-side independent of UI state |
| Invalid/nonexistent task ID in URL | "This task couldn't be found." with a link back to Tasks | `NOT_FOUND` (404); no stack trace or raw ID ever shown |
| Session expired mid-use | "Your session has expired — please log in again." | Redirect to `/login`; return path preserved so the user lands back where they were after re-authenticating |

No raw technical errors, stack traces, or database error codes are ever surfaced to the user; all are translated to one of the friendly messages above.

## 24. Security Requirements

- **Authentication:** Passwords hashed with bcrypt (or delegated entirely to Supabase Auth); never stored or logged in plain text.
- **Authorization:** Every API route independently re-checks the permission matrix in Section 18 — the frontend hiding a button is never treated as sufficient protection.
- **Input validation:** All request bodies validated server-side against an explicit schema (e.g., with Zod) before touching the database; reject unexpected fields rather than silently accepting them.
- **Protected routes:** All API routes except `/api/auth/login` require a valid session; manager-only routes additionally require `role = 'manager'`.
- **Secrets:** `GEMINI_API_KEY` and any database connection string live only in server-side environment variables; nothing sensitive is ever bundled into client-side JavaScript.
- **No sensitive data in client code:** No API keys, connection strings, or internal error detail in the browser bundle or in client-visible network responses.
- **Least-privilege data exposure:** Employee-facing API responses are filtered server-side (not just hidden client-side) to exclude tasks/activity/notifications that don't belong to them.
- **Rate limiting (AI endpoint):** `/api/ai/extract-task` should apply a basic per-user rate limit to avoid runaway API costs from repeated rapid submissions.

## 25. Performance Requirements

- Every list-rendering page (Dashboard, Tasks, My Tasks, Notifications, Activity, Team) shows a skeleton loading state within the first paint rather than a blank screen.
- The Tasks list is paginated (e.g., 25–50 rows per page) and filtered/sorted server-side rather than loading the entire table into the browser.
- Dashboard KPI queries use grouped/aggregate SQL (single query per metric group) rather than fetching all tasks client-side and counting in JavaScript.
- All foreign-key and frequently-filtered columns (`assigned_to`, `status`, `priority`, `due_date`) are indexed (Section 16).
- Avoid redundant API calls: a single Task Details fetch returns the task, its comments, and its activity together (Section 17) rather than three separate round trips triggered in sequence.
- AI extraction requests show a clear loading indicator, since LLM latency (potentially several seconds) is expected and should never look like a frozen UI.

## 26. Demo Data

Seed the database with realistic data so the product looks functional immediately after login — never rely on hardcoded UI numbers.

**Users:**

| Name | Email | Role |
|---|---|---|
| Priya Sharma | manager@lalatech.demo | Manager |
| Rahul Verma | employee@lalatech.demo | Employee |
| Aman Gupta | aman@lalatech.demo | Employee |
| Neha Kapoor | neha@lalatech.demo | Employee |

**Tasks (representative seed set — expand to ~20–25 total for a fuller demo, following this same pattern):**

| Title | Assignee | Priority | Status | Due Date | Source | Category |
|---|---|---|---|---|---|---|
| Send invoice for order #4532 | Rahul | High | In Progress | Tomorrow | WhatsApp | Finance |
| Follow up on pending order #3110 | Aman | Medium | Pending | +2 days | Email | Sales |
| Update inventory spreadsheet | Neha | Low | Pending | +5 days | Manual | Logistics |
| Prepare client report — Q3 | Priya (self-assigned) | High | In Progress | +1 day | Manual | Finance |
| Resolve customer complaint #221 | Rahul | High | Blocked | **Yesterday (overdue)** | Phone | Support |
| Confirm supplier delivery — Batch 17 | Aman | Medium | Blocked | **2 days ago (overdue)** | WhatsApp | Logistics |
| Review payment issue — Invoice #998 | Neha | High | **Overdue** | **3 days ago** | Email | Finance |
| Reconcile weekly sales figures | Rahul | Medium | Completed | Last week | Manual | Finance |
| Schedule courier pickup | Aman | Low | Completed | Yesterday | WhatsApp | Logistics |
| Draft response to vendor complaint | Neha | Medium | In Progress | Today | Email | Support |

At least three to four seeded tasks must have a past due date and a non-Completed status, so the Overdue Tasks section and dashboard KPIs are populated and demonstrable immediately after login, per the source requirement to show the problem the product solves.

**Comments:** Seed 1–3 comments on a handful of in-progress/blocked tasks (e.g., "Waiting for customer confirmation." on Resolve customer complaint #221).

**Activity log & notifications:** Generated automatically by the same logic that would fire in production — seed by running the normal create/assign/comment/status-change operations programmatically rather than hand-inserting log rows, so the seeded activity/notifications are guaranteed to be consistent with the seeded tasks.

## 27. Acceptance Criteria

The MVP is complete only when all of the following are true.

**Authentication**
- [ ] A user can log in with either demo account and reaches the correct role's dashboard.
- [ ] A user can log out, ending the session.
- [ ] Manager and Employee roles see different navigation and different data scope, enforced both in the UI and at the API layer.

**Tasks**
- [ ] Users can create tasks via the form.
- [ ] Tasks persist in the database and survive a page refresh.
- [ ] Tasks can be assigned and reassigned (manager).
- [ ] Tasks can be updated (title, description, priority, due date, category, status) subject to the permission matrix.
- [ ] Tasks support all four statuses and all three priorities.
- [ ] Tasks can be deleted by a manager, with cascading removal of related comments/activity/notifications.

**Dashboard**
- [ ] KPI numbers are computed from live task data, never hardcoded.
- [ ] Overdue tasks (due date passed, status ≠ Completed) are correctly identified and visually prominent.
- [ ] Recent activity is visible and accurate.
- [ ] Today's tasks are correctly identified.

**Employee workflow**
- [ ] Employees can see only their assigned tasks.
- [ ] Employees can update status on their own tasks.
- [ ] Employees can comment on their own tasks.
- [ ] Employees can mark their own tasks Completed.
- [ ] Employees cannot edit, reassign, or delete tasks belonging to others (enforced server-side).

**Manager workflow**
- [ ] Managers can see all tasks across the company.
- [ ] Managers can assign and reassign tasks.
- [ ] Managers can view employee workload (active/overdue/completed counts) on the Team page.

**AI**
- [ ] A user can paste unstructured text into AI Task Capture.
- [ ] The AI returns extracted task fields, with low-confidence fields left blank rather than guessed.
- [ ] The user can review and edit every extracted field before saving.
- [ ] No task is created until the user explicitly confirms.
- [ ] If the AI service fails, the application remains fully usable via manual task creation.

**Notifications**
- [ ] Assigning a task generates a notification for the assignee.
- [ ] Approaching-deadline and overdue notifications are generated without manual action.
- [ ] Notifications can be marked as read individually and in bulk.

**Persistence**
- [ ] All data (tasks, comments, notifications, activity) persists across page refresh and server restart, backed by a real database — not in-memory or hardcoded mock data.

**UX**
- [ ] Every list-rendering view has a loading state.
- [ ] Every error scenario in Section 23 is handled with a friendly message.
- [ ] Every major section has a defined empty state (Section 21).
- [ ] The application is usable at desktop, tablet, and mobile widths.

## 28. Success Metrics

| Metric | What It Measures | Target for MVP Pilot | How Measured |
|---|---|---|---|
| Task capture time | Time from receiving a request to it existing as an assigned, trackable task | Under 1 minute using AI Task Capture; under 3 minutes manually | Timestamp of source message (self-reported during pilot) vs. task `created_at` |
| Manager visibility | Can a manager answer "what's the current state of operations" without asking anyone | Manager can answer from the Dashboard alone, with zero follow-up messages, within a pilot week | Qualitative pilot feedback + Dashboard usage frequency |
| Overdue/forgotten task rate | Reduction in tasks that are missed or completed very late | Fewer tasks completed >24h past due date compared to the prior spreadsheet-based baseline | Compare `completed_at` vs. `due_date` distribution week over week |
| Manual/duplicate data entry | Reduction in retyping the same request across chat → spreadsheet → status update | Each request entered exactly once (via AI Capture or manual form) | Count of tasks created via AI Capture vs. manual, and absence of parallel spreadsheet use during pilot |
| Response time to assignment | Time between a request arriving and it having a clear, assigned owner | Reduced versus current ad hoc assignment | Task `created_at` → first `task_assigned` activity-log timestamp (should be the same event for AI/manual capture) |

## 29. MVP Scope

In scope for this build:
- Two-role authentication (Manager, Employee) with demo accounts.
- Full task lifecycle: create, view, edit, assign/reassign, delete, status changes, priority.
- Manager dashboard and personalized employee dashboard, both computed from live data.
- Dedicated Tasks page with search, filter, and sort.
- Task Details page with activity timeline and comments.
- In-app notifications for assignment, reassignment, approaching deadline, overdue, comments, and completion.
- AI Task Capture with mandatory human review/edit/confirm before any task is created, and full functionality without AI.
- Team page with per-employee workload counts.
- Activity log, company-wide (manager) and per-task (both roles).
- Real, persistent database with proper entities and realistic seed data.
- Responsive layout for desktop, tablet, and mobile.
- Defined loading, error, and empty states throughout.

## 30. Future Scope

Explicitly deferred — not because they lack value, but because they don't serve the single MVP goal of capture → assign → track → follow up → visibility. Revisit after the MVP has proven itself in pilot use:

- Full two-way WhatsApp Business API integration (auto-capturing messages directly, not just pasting them).
- Full email inbox integration (auto-creating tasks from incoming email).
- Recurring/repeating tasks and task templates.
- SLA rules and automated escalation (e.g., auto-reassign if untouched for N hours).
- File attachments on tasks (noted as optional in the source data model; add once basic workflow is validated).
- Advanced analytics/reporting dashboards (trends over time, per-category breakdowns, exportable reports).
- Calendar/timeline view of tasks.
- Custom roles, departments, or multi-level approval chains.
- Native mobile app (the responsive web app covers mobile use for MVP).
- Multi-company/multi-tenant support.
- Billing/subscription management.
- Integrations with Slack/Microsoft Teams.
- A rules/automation engine (e.g., "if priority = High and unassigned for 1 hour, notify manager").
- Full CRM, payroll, accounting, or HR functionality (permanently out of scope for this product's mission, not just deferred).

## 31. Demo Scenario

A complete, working demonstration the MVP must support end-to-end, in under 3–5 minutes:

1. **Manager logs in** with `manager@lalatech.demo` and lands on the Dashboard.
2. **Manager sees live KPI counts** reflecting the seeded data (e.g., total tasks, pending, in progress, overdue, completed) — all computed from the database, not hardcoded.
3. **Manager opens AI Task Capture** from the sidebar.
4. **Manager pastes:** *"Rahul, please send the invoice for order #4532 to the customer by tomorrow evening. This is urgent."*
5. **AI extracts the task** — title, description, assignee (matched to Rahul), priority (High), and due date populate the draft form.
6. **Manager reviews and confirms** — clicking Confirm & Create Task.
7. **Task appears in Rahul's task list** immediately, and Rahul receives a `task_assigned` notification.
8. **Rahul logs in** with `employee@lalatech.demo` and opens the new task from his Dashboard or Notifications.
9. **Rahul changes status** from Pending to In Progress.
10. **Rahul adds a comment:** *"Waiting for final invoice approval."*
11. **Manager (in a separate session/tab) sees the updated status and comment** reflected on the Dashboard and Task Details page without any manual refresh needed beyond normal navigation.
12. **Rahul marks the task Completed.**
13. **Dashboard KPI counts update** (Completed increments, In Progress decrements) and Priya receives a `task_completed` notification.
14. **Activity log shows the full history:** created → assigned → status changed to In Progress → comment added → status changed to Completed, each with actor and timestamp.

This scenario must work exactly as described using real data operations (no scripted/fake UI states) — it is the primary acceptance test for the MVP as a whole.

## 32. Implementation Roadmap

Sequenced by dependency, not calendar time — each phase should be fully working and demonstrable before moving to the next.

**Phase 0 — Foundation**
Set up the Next.js + TypeScript + Tailwind project; provision the database (Supabase/PostgreSQL or SQLite); create the schema from Section 16; establish the shared layout shell (sidebar, top bar) and role-aware route guards.

**Phase 1 — Authentication**
Implement login/logout, session handling, and the two seeded demo accounts; confirm role-based redirect and route protection work end-to-end before building anything else on top.

**Phase 2 — Core Task CRUD**
Build `tasks` API routes (create, read, update, delete, list with basic filters) and the Create/Edit Task modal, Tasks page (table), and Task Details page. Confirm the full manual task lifecycle works before adding automation on top of it.

**Phase 3 — Dashboard**
Build the KPI summary, overdue/today endpoints, and both Manager and Employee dashboard views, all computed from real task data seeded in Phase 0/1.

**Phase 4 — Comments & Activity Log**
Wire every mutation from Phase 2/3 to write an `activity_log` entry; build the comments feature and the Task Details activity timeline; build the standalone Activity page.

**Phase 5 — Notifications**
Implement notification generation on assignment/reassignment/comment/completion; add the deadline-approaching/overdue check; build the notification bell, dropdown, and full Notifications page.

**Phase 6 — Search, Filter, Sort & Team/Workload**
Add server-side search/filter/sort to the Tasks page; build the Team page and `/api/team/workload` endpoint.

**Phase 7 — AI Task Capture**
Build the `/api/ai/extract-task` server route with schema validation and graceful failure handling; build the AI Task Capture page with the review/edit/confirm flow, wired to the existing `POST /api/tasks` from Phase 2.

**Phase 8 — Polish & Hardening**
Add loading skeletons, empty states, and the friendly error messages from Section 23 across every page; verify responsive behavior at desktop/tablet/mobile breakpoints; load full seed data (Section 26); run through the full Acceptance Criteria checklist (Section 27) and the Demo Scenario (Section 31) end-to-end before calling the MVP done.

---

*End of PRD. This document is intended to be sufficient, on its own, for an engineering team or AI coding agent to build the complete Lala Tech Operations Hub MVP without further product clarification. Any ambiguity encountered during implementation should be resolved in favor of the stated MVP principle: Impact > Features.*






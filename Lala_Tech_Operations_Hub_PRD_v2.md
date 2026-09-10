# Lala Tech Operations Hub — Product Requirements Document

**Version:** 2.0 (MVP) — **supersedes v1.0**
**Date:** September 10, 2026
**Status:** Draft — ready for build
**Prepared for:** Lala Tech LLC
**Prepared as:** A build-ready specification for an AI coding agent or engineering team

---

## What Changed From v1.0

The original PRD modeled every incoming request as an immediately assignable **task** with four statuses (Pending, In Progress, Blocked, Completed). Lala Tech's team identified this as incorrect: not every request is ready for internal work the moment it arrives — some need clarification from the client, some are missing information, and work is often blocked waiting on the client rather than blocked internally.

This version replaces the task model with a **request lifecycle model**. The primary object is now a **Request** (not a Task), and it moves through six statuses — **New Request → Needs Clarification → Ready to Assign → In Progress → Waiting on Client → Done** — with defined, non-linear transitions (a request can return to Needs Clarification, and can move back and forth between In Progress and Waiting on Client). The single most important new rule: **a request Waiting on Client is never counted as overdue**, because the company isn't the one holding it up. This PRD replaces the Database Schema, API, dashboard, feature specs, and acceptance criteria accordingly. AI-assisted capture is retained but demoted from a headline feature to a P2 (nice-to-have) convenience layer over the same request-creation flow.

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
28. Success Metrics & Analytics
29. MVP Scope (by Priority)
30. Future Scope
31. Demo Scenario
32. Implementation Roadmap

---

## 1. Executive Summary

Lala Tech Operations Hub is a centralized system for managing the full lifecycle of a client request — from the moment it arrives to the moment it's done. Its core insight is that a request is not binary (open or closed); it passes through distinct states that mean fundamentally different things: it might not have been reviewed yet, it might be missing information the client hasn't supplied, it might be ready for someone to pick up, it might be actively being worked, or it might be stalled waiting on the client rather than on Lala Tech. Treating all of these the same — as the original spreadsheet-and-chat workflow does — causes real damage: requests get assigned before they're ready, client-caused delays get misread as internal failures, and unassigned work goes unnoticed.

The product's entire value proposition is captured in one sentence: **know what is waiting, who owns it, and why.** A manager should be able to open the dashboard and immediately see four numbers — what Lala Tech owes action on (Waiting for Us), what's stalled on the client (Waiting for Client), what has no owner yet (Unassigned), and what is genuinely, internally overdue (Overdue) — with total confidence that a request blocked by the client is never miscounted as an internal failure. This document specifies the request lifecycle, the data model, the exact overdue logic, every page, every API contract, and the acceptance criteria required to build that experience as a real, persistent, working MVP.

## 2. Problem Statement

Lala Tech does not have a reliable way to distinguish where a client request currently stands or who/what it is waiting for. As a direct result:

- Requests get assigned to employees before they're actually ready to be worked.
- Requests waiting on a client can look identical to requests Lala Tech is neglecting, so client-side delays get incorrectly read as internal failures — and vice versa.
- Unassigned, ready-to-work requests can sit unnoticed with no employee attached.
- Clarification requests (missing information, ambiguous scope) get buried in WhatsApp/email threads instead of being tracked as a distinct, visible state.
- Managers have no single source of truth for "where does this request actually stand right now."

The product must solve this distinction — reliably, visibly, and before any advanced automation is layered on top.

## 3. Problem Discovery Assumptions

- Most requests arrive from a client via WhatsApp, email, phone, or the company website, and a meaningful fraction of them are missing information needed to start work (an order number, a document, a confirmed scope).
- The team currently has no consistent way to mark a request as "not our fault it's late" versus "we haven't gotten to it," and this ambiguity causes friction between managers and employees.
- A request can legitimately move backward in its lifecycle (e.g., from In Progress back to Needs Clarification, or from Waiting on Client back to In Progress) — the workflow is not strictly linear, and the product must not force it to be.
- The team is small enough (roughly 5–30 people) that a two-role model (Manager/Employee) plus a lightweight Client record is sufficient; no multi-department routing or client self-service portal is needed for MVP.
- AI-assisted request capture is a convenience, not a dependency — the product must be fully usable through manual forms alone.

## 4. Target Users

| Role | Summary |
|---|---|
| **Admin / Manager** | Reviews and triages every new request, decides whether it needs clarification or is ready to assign, assigns/reassigns to employees, and is the primary consumer of the four operational queues (Waiting for Us / Waiting for Client / Unassigned / Overdue). |
| **Employee** | Works assigned requests, moves them through In Progress ↔ Waiting on Client ↔ Needs Clarification as reality dictates, and marks them Done. |

**Client** is a data entity, not a system user — clients do not log in. A lightweight Client record exists so requests can be grouped, searched, and reported on by client (Section 10 of the source brief), without building a CRM or client portal.

## 5. User Personas

### 5.1 Priya Sharma — Operations Manager
- **Goals:** Know, at a glance, what Lala Tech owes action on right now, what's genuinely overdue versus stalled on a client, and what has no owner yet.
- **Frustrations today:** A request that's actually waiting on the client looks exactly like a request her team dropped — she can't tell the difference without reading the whole WhatsApp thread.
- **Needs from the Hub:** The four-card dashboard (Waiting for Us / Waiting for Client / Unassigned / Overdue), a fast triage action on every new request (Needs Clarification vs. Ready to Assign), and confidence that "Overdue" only ever means Lala Tech's fault.

### 5.2 Rahul Verma — Operations Executive (Employee)
- **Goals:** Work only on requests that are genuinely ready, and have a legitimate, visible way to say "I'm blocked on the client" without it counting against him.
- **Frustrations today:** He's occasionally handed a request that isn't actually ready to start, and he currently has no clean way to signal "I'm waiting on the client" that's distinguishable from "I haven't started."
- **Needs from the Hub:** A clear My Active Requests / Waiting on Client / Completed split, and a one-click "move to Waiting on Client" action that requires (and preserves) a reason.

### 5.3 Aman Gupta — Operations Executive (Employee)
- **Goals:** Make sure clarification requests he raises with a client don't get lost, and resume work cleanly the moment the client responds.
- **Frustrations today:** Once he asks a client for missing information, there's no tracked record of what he asked for or how long it's been outstanding.
- **Needs from the Hub:** A structured clarification record (what's missing, requested when, from whom) and a visible waiting-duration counter so he — and his manager — can see exactly how long a request has been stalled and why.

## 6. User Pain Points

| Pain Point | Where It Shows Up Today | How the Hub Solves It |
|---|---|---|
| Requests assigned too early | A vague or incomplete request gets handed to an employee, who then has to chase the client themselves | Manager triage step (New Request → Needs Clarification or Ready to Assign) gates assignment until a request is actually ready |
| Client delays read as internal failure | Nothing distinguishes "we're late" from "we're waiting on them" | Waiting on Client is a distinct status, structurally excluded from Overdue everywhere in the product |
| Unassigned work goes unnoticed | No list of "ready but nobody owns this yet" | Dedicated, highly visible Unassigned queue with inline assignment |
| Clarification requests get buried | Missing-info follow-ups live in chat threads with no tracking | Structured clarification record (what's missing, requested when, resolved when) attached to the request itself |
| No single source of truth for status | Manager has to ask, or dig through chat, to know where a request stands | Request Detail page shows a visual status timeline and full activity history for every request |
| Waiting time is invisible | Nobody can say how long a request has actually been stalled on a client vs. on Lala Tech | Waiting-time tracking records duration in Needs Clarification and Waiting on Client separately from internal working time |

## 7. Product Vision

Lala Tech Operations Hub is not a task management application. It is a **centralized request operations system that makes it clear what Lala Tech is waiting for, who is responsible, and what needs to happen next.** Its core value proposition, in one line: **know what is waiting, who owns it, and why.** Every screen in the product should let a manager or employee understand a request's current state — and who is responsible for the next move — within seconds, without reading a chat history.

## 8. Goals

- Give every incoming request an explicit lifecycle state from the moment it's received, before it's ever assigned to an employee.
- Make the distinction between "we're waiting" and "the client is holding this up" impossible to miss, anywhere it appears in the product.
- Give a manager a single dashboard that answers, at a glance: what needs our action, what's stalled on the client, what's unassigned, and what's genuinely overdue.
- Ensure overdue calculations are correct by construction — a request Waiting on Client or Done can never appear in the Overdue queue.
- Make clarification and client-waiting time visible and measurable, laying the groundwork for lifecycle analytics (Section 28) even if the analytics UI itself is deferred.
- Ship a working, persistent, demo-able MVP that proves the full lifecycle end-to-end, prioritizing the P0 request-lifecycle workflow over any secondary feature, including AI capture.

## 9. Non-Goals

Explicitly out of scope for this MVP:

- Full ERP or full CRM (the Client entity is intentionally minimal — see Section 10 of the source brief)
- Payroll or accounting functionality
- HR management
- A full project management platform (no subtasks, dependencies between requests, Gantt charts, or sprints)
- Full WhatsApp Business API integration (two-way messaging)
- Full email client / inbox integration
- A complex workflow automation/rules engine
- Billing or subscription management
- An advanced AI chatbot (AI is limited to structured request extraction — Section 19)
- Complex enterprise permissions (custom roles, departments, multi-level approval)
- Advanced analytics dashboards (the underlying timestamps are captured in the MVP; the reporting UI is Future Scope — Section 30)

<!-- CONTINUE -->

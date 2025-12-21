# UML Diagrams (Mermaid)

## 1) Class Diagram — Data models

```mermaid
classDiagram
    class User {
      +String _id
      +String username
      +String email
      +String password
      +Boolean isStaff
      +comparePassword(candidate) Promise~Boolean~
    }

    class Ticket {
      +String _id
      +String title
      +String description
      +String status
      +String user
      +String type
      +String priority
      +String[] image
      +String assignedTo
    }

    class Comment {
      +String _id
      +String ticket
      +String author
      +String text
      +Date createdAt
    }

    User "1" --> "*" Ticket : creates/owns
    User "0..1" <-- "*" Ticket : assignedTo
    Ticket "1" <-- "*" Comment : has
```

## 2) Component Diagram — Frontend ↔ API

This maps key React components to the API endpoints they use.

```mermaid
flowchart TB
  subgraph Frontend
    A[App]
    B[CustomerView]
    C[StaffView]
    D[CreateTicketForm]
    E[TicketList]
    F[TicketDetailsDialog]
    G[CommentsSection]
    H[KanbanBoard]
    I[KanbanTicket]
    J[EditTicketForm]
    K[CreateUser / LoginForm]
  end

  subgraph Backend
    API["API (Express + Mongoose)"]
  end

  A --> K
  A --> B
  A --> C

  B --> D
  B --> E
  E --> F
  F --> G

  C --> H
  H --> I
  C --> J

  D -->|POST /api/tickets| API
  E -->|GET /api/tickets| API
  J -->|PUT /api/tickets/:id| API
  G -->|GET/POST /api/tickets/:id/comments| API
  K -->|POST /api/users, POST /api/users/login| API
```

---

## 3) API Endpoints Reference (summary)

- Users:
  - `POST /api/users` — create user (returns token + user)
  - `POST /api/users/login` — login (returns token + user)
  - `GET /api/users` — get current user (requires Bearer token)
  - `GET /api/users/:id` — get public user info
  - `GET /api/users/staff/list` — list staff users
  - `DELETE /api/users/:id` — delete user

- Tickets:
  - `GET /api/tickets` — list tickets (staff: all, customer: own)
  - `POST /api/tickets` — create ticket (multipart images)
  - `PUT /api/tickets/:id` — update ticket (assign, edit, images)
  - `DELETE /api/tickets/:id` — delete ticket

- Comments:
  - `GET /api/tickets/:ticketId/comments` — list comments for ticket
  - `POST /api/tickets/:ticketId/comments` — add comment (auth required)

---

## 4) Sequence Diagram — Create Ticket (Customer)

```mermaid
sequenceDiagram
  participant CustomerUI as CustomerView
  participant API as API
  participant DB as MongoDB

  CustomerUI->>API: POST /api/tickets {title, description, user(token), type, priority, images}
  API-->>API: verify token (optional: staff check)
  API->>DB: save Ticket document (user -> ObjectId)
  DB-->>API: return created Ticket
  API-->>CustomerUI: 201 Created (ticket)
```

## 5) Sequence Diagram — Add Comment

```mermaid
sequenceDiagram
  participant UserUI as TicketDetailsDialog
  participant API as API
  participant DB as MongoDB

  UserUI->>API: POST /api/tickets/:id/comments {text} with Bearer token
  API-->>API: verify token -> extract username
  API->>DB: save Comment (ticket: ObjectId, author: username, text)
  DB-->>API: return comment
  API-->>UserUI: 201 Created (comment)
```
---
title: DumbPhobia#1 REST APIs
date: 2026-03-09
tags: [programming, fullstack]
---

REST (Representational State Transfer) APIs are widely used for communication between systems such as web applications, mobile apps, and backend services. While many APIs successfully return JSON responses, professional REST API design focuses on **consistency, scalability, predictability, and clear communication between systems**.

This article outlines 10 common REST API design issues and the corresponding best practices used in professional API development.

---

## 1. Resource-Based URL Design

REST APIs should represent **resources**, not actions.

🟥 **Incorrect Design**

```
GET /getUsers
POST /createUser
DELETE /deleteUser/5
```

These URLs include verbs that describe actions.

🟩 **Correct Design**

```
GET /users
POST /users
DELETE /users/5
```

In REST architecture, the **HTTP method defines the action**, while the URL identifies the resource.

| HTTP Method | Purpose                     |
| ----------- | --------------------------- |
| GET         | Retrieve resource data      |
| POST        | Create a new resource       |
| PUT / PATCH | Update an existing resource |
| DELETE      | Remove a resource           |

URLs should therefore represent **nouns (resources)** rather than verbs.

---

## 2. Proper Use of HTTP Status Codes

HTTP status codes communicate the result of a request at the protocol level.

🟥 **Incorrect Pattern**

Returning "200 OK" for all responses, including errors.

```
HTTP 200 OK
{
  "status": "error",
  "message": "User not found"
}
```

🟩 **Recommended Status Codes**

| Status Code               | Meaning                         |
| ------------------------- | ------------------------------- |
| 200 OK                    | Successful request              |
| 201 Created               | Resource successfully created   |
| 401 Unauthorized          | Authentication required         |
| 403 Forbidden             | Authenticated but not permitted |
| 404 Not Found             | Resource does not exist         |
| 422 Unprocessable Entity  | Validation error                |
| 500 Internal Server Error | Unexpected server error         |

Using appropriate status codes allows clients to determine request outcomes before parsing the response body.

---

## 3. Consistent JSON Structure

API responses should follow a **consistent naming convention**.

🟥 **Example of Inconsistent Naming**

Endpoint A:

```
{
  "userName": "john"
}
```

Endpoint B:

```
{
  "username": "john"
}
```

🟩 **Recommended Naming Standards**

Choose a consistent format such as:

**Snake case**

```
user_name
created_at
```

or

**Camel case**

```
userName
createdAt
```

Consistency should be maintained across all endpoints.

---

## 4. API Versioning

Versioning allows APIs to evolve without breaking existing clients.

🟥 **Non-versioned Endpoint**

```
/api/users
```

Changes to the response structure may break applications depending on the endpoint.

🟩 **Versioned Endpoint**

```
/api/v1/users
```

When updates are required:

```
/api/v2/users
```

Older clients can continue using previous versions while newer systems migrate to updated versions.

---

## 5. Pagination for Large Datasets

Endpoints returning large datasets should implement pagination.

🟥 **Non-paginated Request**

```
GET /users
```

Returning thousands of records in a single response can increase server load and response time.

🟩 **Paginated Request**

```
GET /users?page=1&limit=10
```

**Example Response**

```
{
  "data": [...],
  "meta": {
    "current_page": 1,
    "total": 1000
  }
}
```

Pagination improves performance and reduces bandwidth usage.

---

## 6. Separation of Authentication and Authorization

Authentication and authorization represent different security processes.

| Concept        | Purpose                |
| -------------- | ---------------------- |
| Authentication | Verifies identity      |
| Authorization  | Determines permissions |

Authentication methods may include:

* JSON Web Tokens (JWT)
* OAuth
* Token-based authentication systems

Authorization determines whether an authenticated user has permission to perform specific actions.

Both processes should be implemented independently and enforced on the server side.

---

## 7. Structured Error Responses

Error responses should follow a consistent and structured format.

🟥 **Unstructured Error Example**

```
{
  "message": "Something went wrong"
}
```

🟩 **Structured Error Example**

```
{
  "error": {
    "code": 404,
    "message": "User not found"
  }
}
```

Structured errors allow client applications to handle responses programmatically and display appropriate messages.

---

## 8. Filtering and Sorting Using Query Parameters

Filtering and sorting should be implemented through **query parameters** rather than creating multiple endpoints.

🟥 **Non-Scalable Endpoint Design**

```
GET /getActiveUsersSortedByName
```

🟩 **Flexible Endpoint Design**

```
GET /users?status=active&sort=name
```

Additional examples:

```
GET /users?role=admin
GET /users?sort=email
GET /users?status=inactive
```

Query parameters allow one endpoint to support multiple filtering and sorting combinations.

---

## 9. Security Best Practices

Security considerations should be included in API design.

🟥 **Common vulnerabilities arise from:**

* Lack of rate limiting
* Missing input validation
* Unencrypted connections
* Exposure of sensitive data

🟩 **Recommended practices include:**

* Enforcing HTTPS
* Validating all input fields
* Implementing rate limiting
* Avoiding exposure of sensitive information such as passwords or tokens

Security mechanisms should be implemented at the server level.

---

## 10. API Design Independent of Database Structure

API responses should not directly mirror database tables.

🟥 **Database-Centric Approach**

Designing API responses based on internal database schemas.

🟩 **Client-Centric Approach**

Designing responses based on client requirements, which may involve:

* Combining multiple fields
* Transforming data structures
* Hiding internal database columns

The database represents an **internal implementation**, while the API acts as a **public contract between systems**.

---

## Sum Up: Characteristics of Professional REST APIs

Professional REST APIs generally include:

1. Resource-based URL structures
2. Consistent naming conventions
3. Proper HTTP status codes
4. Versioned endpoints
5. Pagination for large datasets
6. Query parameter filtering and sorting
7. Authentication and authorization mechanisms
8. Structured error responses
9. Security controls
10. Client-oriented response design

These practices support scalable, predictable, and maintainable API systems.

## Acknowledgement

This blog is a learning note from StarCode Kh [video](https://www.youtube.com/watch?v=Z3uFzUCedpU&t=591s).

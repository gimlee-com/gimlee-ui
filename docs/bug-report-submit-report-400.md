# Bug Report: `POST /api/reports` — 400 "Failed to read request" (RESOLVED)

## Root Cause — Frontend Bug

The pre-existing Q&A report flow in `QuestionCard.tsx` used `UIkit.modal.prompt()` which collected free-text from the user and sent it as the `reason` field. However, the backend expects `reason` to be an **enum value** (e.g. `"SPAM"`, `"FRAUD"`), not free-text.

**Fix:** Replaced the `UIkit.modal.prompt` with the new `ReportFormModal` component which provides a proper dropdown for reason selection + a separate description textarea.

~~The below analysis was the initial investigation before the root cause was identified.~~

---

## Original Analysis

## Summary

Submitting a report from the frontend results in a `400 Bad Request` with the following response:

```json
{"type":"about:blank","title":"Bad Request","status":400,"detail":"Failed to read request","instance":"/api/reports"}
```

This is a **Spring Boot `HttpMessageNotReadableException`** — Jackson is failing to deserialize the JSON request body into `ReportRequestDto`.

---

## Frontend Payload (Verified Correct)

The frontend sends a well-formed JSON body via `POST /api/reports`:

```http
POST /api/reports HTTP/1.1
Content-Type: application/json
Authorization: Bearer <token>
Accept-Language: en-US

{
  "targetType": "AD",
  "targetId": "some-ad-id",
  "reason": "SPAM",
  "description": "This listing looks fraudulent."
}
```

### Verification against `api-docs.json` (`ReportRequestDto`)

| Field | Frontend Value | Schema Type | Schema Constraint | Match |
|-------|---------------|-------------|-------------------|-------|
| `targetType` | `"AD"` | `string`, enum | `AD \| USER \| MESSAGE \| QUESTION \| ANSWER` | ✅ |
| `targetId` | `"some-ad-id"` | `string` | `minLength: 1` | ✅ |
| `reason` | `"SPAM"` | `string`, enum | `SPAM \| FRAUD \| INAPPROPRIATE_CONTENT \| ...` | ✅ |
| `description` | `"This listing..."` | `string` | `minLength: 0, maxLength: 2000`, **optional** | ✅ |

- `Content-Type: application/json` header is set ✅
- Body is serialized via `JSON.stringify()` ✅
- No extra or unknown fields are sent ✅
- All required fields (`targetType`, `targetId`, `reason`) are present ✅

**Conclusion: The frontend payload is correct. The issue is in backend deserialization.**

---

## Likely Backend Causes

### 1. Java Record / Immutable DTO without `@JsonCreator`
If `ReportRequestDto` is a Java `record` or an immutable class without a no-arg constructor, Jackson may fail to construct it unless parameter names are preserved at compile time (`-parameters` flag) or an explicit `@JsonCreator` is provided.

### 2. Enum Deserialization Issue
The `ReportTargetType` or `ReportReason` enum may have a custom `@JsonCreator` or `@JsonValue` that expects a different format (e.g., lowercase). The frontend sends uppercase values exactly matching the OpenAPI spec.

### 3. Spec-Code Drift
The actual Java DTO field names or types may differ from what's generated in the OpenAPI spec. For example, a field might have been renamed in code but not regenerated in the spec.

---

## How to Reproduce

1. Log in as any authenticated user
2. Navigate to any ad detail page
3. Click the "Report" button
4. Select a reason (e.g., "Spam") and enter a description
5. Submit — observe the 400 error

---

## Suggested Investigation Steps

1. Check the `ReportRequestDto` Java class — verify it has a no-arg constructor or `@JsonCreator`
2. Try deserializing the sample JSON payload above manually in a unit test:
   ```java
   ObjectMapper mapper = new ObjectMapper();
   ReportRequestDto dto = mapper.readValue("""
     {"targetType":"AD","targetId":"test-id","reason":"SPAM","description":"test"}
   """, ReportRequestDto.class);
   ```
3. Check the full server-side stack trace in logs — the `HttpMessageNotReadableException` will contain the root cause (e.g., `InvalidDefinitionException`, `MismatchedInputException`, etc.)
4. Verify enum classes (`ReportTargetType`, `ReportReason`) can deserialize from uppercase string values

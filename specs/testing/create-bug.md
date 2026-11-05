# BuggyBoard Create Bug End-to-End Test Plan

## Application Overview

Plan end-to-end coverage for creating a bug from the authenticated BuggyBoard board. The Playwright MCP explored the running app at /board: New Bug opens a Create bug dialog; the owner defaults to the authenticated user (observed as `buggy`), severity defaults to MID, and options are HIGH/MID/LOW with matching terracotta/amber/sage styling. Blank title, description, and owner are rejected with inline alert messages; severity cannot be left blank through the UI because MID is preselected and there is no blank option. Cancel, the X button, Escape, and a backdrop click leave drafts unsaved (the backdrop probe preserved entered values). A successful save closed the dialog, assigned an ID, added the bug to the board, and preserved special characters in the description when reopened. The temporary probe record was deleted after exploration. Use unique titles and avoid assumptions about existing row counts or IDs.

## Test Scenarios

### 1. Create a bug

**Seed:** `tests/@seed.spec.ts`

#### 1.1. Open the create form and verify fields and defaults

**File:** `tests/create-bug/create-bug.spec.ts`

**Steps:**
  1. Use the existing authenticated seed, which logs in the first configured user from users.json and lands on /board.
    - expect: The board is displayed and the title bar contains the New Bug button.
  2. Click New Bug.
    - expect: A Create bug dialog opens with Title, Severity, Owner, and Description fields plus Save, Cancel, and an X close button.
    - expect: Owner is prefilled with the authenticated username.
    - expect: Severity defaults to MID, and the dropdown offers HIGH, MID, and LOW.

#### 1.2. Create a bug with HIGH severity and special characters

**File:** `tests/create-bug/create-bug.spec.ts`

**Steps:**
  1. Open New Bug and enter a unique title, the current user as owner, and a description containing characters such as <, >, &, and quotes.
    - expect: All entered values are present in their fields.
  2. Select HIGH and save.
    - expect: The dialog closes.
    - expect: A newly assigned numeric ID appears for the bug; its board row shows the entered title, HIGH severity, and owner.
    - expect: Reopening the created bug shows the exact description, including special characters.

#### 1.3. Create a bug with MID severity

**File:** `tests/create-bug/create-bug.spec.ts`

**Steps:**
  1. Open New Bug, enter a unique title, owner, and description, leave or select MID, then save.
    - expect: The dialog closes and the newly created board row shows the entered title, MID severity, and owner.
    - expect: The saved bug has a generated numeric ID.

#### 1.4. Create a bug with LOW severity

**File:** `tests/create-bug/create-bug.spec.ts`

**Steps:**
  1. Open New Bug, enter a unique title, owner, and description, select LOW, then save.
    - expect: The dialog closes and the newly created board row shows the entered title, LOW severity, and owner.
    - expect: The saved bug has a generated numeric ID.

#### 1.5. Severity selection updates the form styling

**File:** `tests/create-bug/create-bug.spec.ts`

**Steps:**
  1. Open New Bug and select each severity in turn: HIGH, MID, and LOW.
    - expect: The selected option label updates for each choice.
    - expect: The severity field uses the corresponding design token/color: HIGH #b84a2e, MID #a67c47, and LOW #4a6b5e, with a matching tinted background.

#### 1.6. Block save when each editable required field is blank

**File:** `tests/create-bug/create-bug.spec.ts`

**Steps:**
  1. For each subcase, open New Bug, fill all other fields with valid values, leave one of Title, Owner, or Description blank, and click Save.
    - expect: The dialog stays open and the bug is not created.
    - expect: An alert identifies the blank field as required.
    - expect: Values in the other fields remain available for correction.

#### 1.7. Cancel closes the form without saving

**File:** `tests/create-bug/create-bug.spec.ts`

**Steps:**
  1. Open New Bug, enter draft title and description, then click Cancel.
    - expect: The dialog closes.
    - expect: The draft title does not appear as a newly created bug on the board.

#### 1.8. X closes the form without saving

**File:** `tests/create-bug/create-bug.spec.ts`

**Steps:**
  1. Open New Bug, enter draft title and description, then click the X close control.
    - expect: The dialog closes.
    - expect: The draft title does not appear as a newly created bug on the board.

#### 1.9. Escape closes the form without saving

**File:** `tests/create-bug/create-bug.spec.ts`

**Steps:**
  1. Open New Bug, enter draft title and description, then press Escape.
    - expect: The dialog closes.
    - expect: The draft title does not appear as a newly created bug on the board.

#### 1.10. Backdrop click preserves the open draft

**File:** `tests/create-bug/create-bug.spec.ts`

**Steps:**
  1. Open New Bug, enter draft values, and click the dimmed backdrop outside the dialog card.
    - expect: The dialog remains open.
    - expect: Entered values are preserved.
    - expect: No bug is created.

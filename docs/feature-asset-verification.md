# Feature Deep Dive: Asset Verification

## 1. High-Level Goal

The **Asset Verification** feature is a mobile-first workflow designed for on-site auditing. Its primary purpose is to allow an authorized user (like an engineer or admin) to physically confirm the location, status, and condition of an asset in the inventory. This creates a historical record of the asset's physical state, complete with photographic evidence, which is crucial for inventory accuracy, audits, and tracking lost or damaged equipment.

## 2. User Workflow (Step-by-Step)

The entire workflow is managed within the `InventoryContent` component (`app/components/inventory-content.tsx`).

1.  **Navigate to Verification Tab**: The user goes to the "Inventory" page and selects the "Asset Verification" tab.

2.  **Select a Location**: The UI displays a list of all known locations (e.g., "Boys Hostel," "Training Residency," "Server Room"). The user taps the location they are currently auditing.

3.  **Identify the Asset**: A grid of all assets assigned to that location appears. The user finds the physical asset in the room and then taps its corresponding card on their device's screen.

4.  **Launch the Survey**: Tapping the asset card opens the `VerificationSurveyDialog`, which is the core of the workflow.

5.  **Complete the Guided Checklist**: The dialog presents a series of questions to guide the engineer:
    *   **Room Access**: Was the room open or locked?
    *   **Device Presence**: Was the device physically present?
    *   **Identity Check**: Do the Serial Number and MAC Address on the physical device match the database records?
    *   **Condition Assessment**: What is the physical condition of the device (Good, Fair, Poor)?

6.  **Capture Photo Evidence**:
    *   The dialog activates the device's camera, showing a live preview.
    *   The user is prompted to take a picture of the asset. This photo is **mandatory** if any issues are found (e.g., the device is damaged, missing, or the serial number doesn't match).
    *   The captured image is displayed in the dialog for confirmation.

7.  **Submit the Verification**: After filling out the checklist and taking a photo, the user clicks "Submit." This saves the verification record.

## 3. Technical Implementation Details

### a. Frontend Logic (`app/components/inventory-content.tsx`)

-   **State Management**: The component uses `useState` to manage the currently selected location and the specific asset being surveyed.
-   **Data Fetching**: It uses the `useSWR` hook to fetch all asset data from the `/api/inventory/assets` endpoint.
-   **Camera Interaction (`VerificationSurveyDialog`)**:
    -   It uses the browser's `navigator.mediaDevices.getUserMedia` API to request camera access and stream the video feed to a `<video>` element.
    -   When a picture is taken, it draws the current video frame onto a hidden `<canvas>` element.
    -   It then calls `canvas.toDataURL("image/jpeg")` to get a **Base64-encoded string** of the captured image. This string is what gets sent to the backend.

### b. Backend API (`app/api/inventory/assets/[id]/verify/route.ts`)

This is the endpoint that receives the submitted survey data.

1.  **Authorization**: It first checks if the user session belongs to an authorized role (engineer, admin, etc.).
2.  **Image Handling**:
    -   It receives the Base64 image string from the frontend.
    -   It converts this string back into a binary buffer.
    -   It uses Node.js's `fs` module to write this buffer to a file on the server's filesystem, specifically in the `public/asset-verification/` directory.
    -   It generates a public-facing URL for this new image (e.g., `/asset-verification/ASSET_ID-TIMESTAMP.jpg`).
3.  **Database Logging**:
    -   It creates a new document in the `assetlogs` collection using the `AssetLog` model.
    -   The `action` for this log is set to `'verification'`.
    -   The `details` field of the log is a flexible object that stores all the answers from the survey checklist (`roomStatus`, `deviceCondition`, etc.).
    -   Crucially, it saves the `photoUrl` (the path to the image on the server) in the log's details. **It does not save the large Base64 string to the database**, which would be highly inefficient.
4.  **Status Update (Optional)**: If the user is an admin and flagged an issue, the endpoint can also trigger a `PATCH` request to update the main `Asset` document's status (e.g., to "Damaged").

### c. Database Models

-   **`Asset` (`app/models/Asset.ts`)**: The primary document for each piece of hardware. The verification process reads from this model and can update its `status`.
-   **`AssetLog` (`app/models/AssetLog.ts`)**: The historical record. Each verification survey creates a new, immutable log entry linked to a specific asset, providing a complete audit trail.

## 4. Key Code Files

-   **UI & Workflow**: `app/components/inventory-content.tsx` (Specifically the `AssetVerificationTab` and `VerificationSurveyDialog` components).
-   **Backend API Endpoint**: `app/api/inventory/assets/[id]/verify/route.ts`
-   **Database Schemas**: `app/models/Asset.ts` and `app/models/AssetLog.ts`

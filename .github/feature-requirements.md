# Feature Requirements - File Storage System

## Project Context

Adding Google Drive-like file storage functionality to the lasverg.io social
platform. Users can upload, store, preview, and manage original-quality media
files (images/videos) alongside their existing profiles. The service includes
Google Drive sync capabilities.

Built with Node.js and Express.js, following the existing project architecture
patterns.

---

## Phase 1: Core File Upload (Priority: HIGH)

### Models Required

#### File Model (`src/api/file/file.model.ts`)

```typescript
interface IFile {
  _id: ObjectId
  userId: ObjectId // ref: User
  filename: string // unique storage filename
  originalName: string // user's original filename
  mimeType: string // e.g., 'image/jpeg', 'video/mp4'
  size: number // bytes
  storagePath: string // HDD path
  thumbnailPath?: string // SSD path for preview
  folderId?: ObjectId // ref: Folder (optional)
  metadata: {
    width?: number // for images/videos
    height?: number
    duration?: number // for videos (seconds)
    hash?: string // checksum for duplicate detection
  }
  isPublic: boolean // for future profile gallery feature
  createdAt: Date
  updatedAt: Date
}
```

#### Folder Model (`src/api/folder/folder.model.ts`)

```typescript
interface IFolder {
  _id: ObjectId
  userId: ObjectId // ref: User
  name: string
  parentId?: ObjectId // ref: Folder, for nested folders
  path: string // computed path like '/folder1/subfolder'
  createdAt: Date
  updatedAt: Date
}
```

### Endpoints

#### 1. Upload File

- **Route**: `POST /api/v1/files/upload`
- **Auth**: Protected (`IProtectedRequest` - requires authentication)
- **Content-Type**: `multipart/form-data`
- **Request Fields**:
  - `file` (File, required): The media file to upload
  - `folderId` (string, optional): Destination folder ID
  - `description` (string, optional): File description
  - `isPublic` (boolean, optional): Make file publicly accessible (default:
    false)
- **Response**:
  ```typescript
  {
    success: true,
    data: {
      _id: string,
      filename: string,
      originalName: string,
      mimeType: string,
      size: number,
      url: string,  // download URL
      thumbnailUrl?: string,
      createdAt: string
    }
  }
  ```
- **Validation Rules**:
  - Max file size: 100MB
  - Allowed MIME types: `image/*`, `video/*`
  - Check user storage quota before accepting upload
  - Folder must exist and belong to user (if folderId provided)
- **Business Logic**:
  - Generate unique filename to prevent collisions
  - Stream file directly to primary HDD path
  - Calculate file hash (MD5/SHA256) for duplicate detection
  - Create File document in MongoDB
  - Queue thumbnail generation job (background)
  - Update user's storage usage counter
- **Error Handling**:
  - 413 if file exceeds size limit
  - 415 if unsupported media type
  - 507 if user quota exceeded
  - 404 if folder not found
  - 500 for storage write failures
- **Exclude from auth?**: No (protected route)

#### 2. Get/Download File

- **Route**: `GET /api/v1/files/:fileId`
- **Auth**: Protected (must be file owner, or public file)
- **Path Params**: `fileId` (string, required)
- **Query Params**:
  - `download` (boolean, optional): Force download vs inline display
- **Response**: File stream with appropriate headers
- **Headers**:
  - `Content-Type`: File's MIME type
  - `Content-Length`: File size
  - `Content-Disposition`: `attachment` or `inline`
  - `ETag`: File hash for caching
- **Business Logic**:
  - Verify ownership (req.user.id matches file.userId) OR file.isPublic === true
  - Stream file from storage path
  - Track download count (optional analytics)
- **Error Handling**:
  - 404 if file not found
  - 403 if not owner and not public
  - 500 if file missing from storage

#### 3. Delete File

- **Route**: `DELETE /api/v1/files/:fileId`
- **Auth**: Protected (must be file owner)
- **Path Params**: `fileId` (string, required)
- **Response**:
  ```typescript
  {
    success: true,
    message: "File deleted successfully"
  }
  ```
- **Business Logic**:
  - Verify ownership
  - Delete file from storage (HDD)
  - Delete thumbnail from SSD (if exists)
  - Remove File document from MongoDB
  - Update user storage usage
- **Error Handling**:
  - 404 if file not found
  - 403 if not owner

#### 4. Get File Thumbnail

- **Route**: `GET /api/v1/files/:fileId/thumbnail`
- **Auth**: Protected (owner or public file)
- **Path Params**: `fileId` (string, required)
- **Response**: Thumbnail image stream (JPEG/PNG)
- **Business Logic**:
  - Check if thumbnail exists in SSD cache
  - If not, generate on-demand from original
  - Cache generated thumbnail to SSD
  - Stream thumbnail with appropriate caching headers
- **Error Handling**:
  - 404 if file not found or no thumbnail available
  - 403 if not owner and not public

#### 5. Preview File (Video Streaming)

- **Route**: `GET /api/v1/files/:fileId/preview`
- **Auth**: Protected (owner or public file)
- **Path Params**: `fileId` (string, required)
- **Headers Support**: `Range` header for video streaming
- **Response**: Partial file stream (206 Partial Content) or full stream
- **Business Logic**:
  - Support HTTP range requests for video seeking
  - Stream from SSD cache if available, fallback to HDD
  - Return appropriate `Content-Range` and `Accept-Ranges` headers
- **Error Handling**:
  - 404 if file not found
  - 403 if not authorized
  - 416 if range invalid

#### 6. List User Files

- **Route**: `GET /api/v1/files`
- **Auth**: Protected
- **Query Params**:
  - `page` (number, optional, default: 1)
  - `limit` (number, optional, default: 20, max: 100)
  - `folderId` (string, optional): Filter by folder (use 'root' for root folder)
  - `type` (string, optional): Filter by type ('image' | 'video')
  - `sort` (string, optional): Sort field ('createdAt' | 'name' | 'size',
    default: '-createdAt')
- **Response**:
  ```typescript
  {
    success: true,
    data: {
      files: IFile[],
      pagination: {
        page: number,
        limit: number,
        total: number,
        totalPages: number
      }
    }
  }
  ```
- **Business Logic**:
  - Return only files where userId matches req.user.id
  - Apply filters and sorting
  - Include thumbnail URLs in response
- **Validation**:
  - Limit max 100 items per page
  - Valid sort fields only

#### 7. Search Files

- **Route**: `GET /api/v1/files/search`
- **Auth**: Protected
- **Query Params**:
  - `q` (string, required): Search query
  - `page` (number, optional, default: 1)
  - `limit` (number, optional, default: 20)
  - `type` (string, optional): Filter by type
  - `startDate` (ISO string, optional): Filter by upload date range
  - `endDate` (ISO string, optional)
- **Response**: Same as List User Files
- **Business Logic**:
  - Search in originalName, filename, metadata
  - Text index on File collection for performance
  - Return only user's own files
- **Validation**:
  - Query string required, min 2 characters

---

## Phase 2: Folder Management (Priority: MEDIUM)

### Endpoints

#### 1. Create Folder

- **Route**: `POST /api/v1/folders`
- **Auth**: Protected
- **Request Body**:
  ```typescript
  {
    name: string,  // required, max 255 chars
    parentId?: string  // optional, ref to parent folder
  }
  ```
- **Response**:
  ```typescript
  {
    success: true,
    data: {
      _id: string,
      name: string,
      path: string,
      parentId?: string,
      createdAt: string
    }
  }
  ```
- **Validation**:
  - Name required, max 255 characters
  - No special characters: `/ \ : * ? " < > |`
  - Parent folder must exist and belong to user (if provided)
  - No duplicate folder names in same parent
- **Business Logic**:
  - Compute full path based on parent hierarchy
  - Create Folder document with userId = req.user.id
- **Error Handling**:
  - 400 if validation fails
  - 404 if parent folder not found
  - 409 if duplicate name in same parent

#### 2. Get Folder Contents

- **Route**: `GET /api/v1/folders/:folderId`
- **Auth**: Protected (must be folder owner)
- **Path Params**: `folderId` (string, required)
- **Query Params**:
  - `page` (number, optional)
  - `limit` (number, optional)
- **Response**:
  ```typescript
  {
    success: true,
    data: {
      folder: IFolder,
      subfolders: IFolder[],
      files: IFile[],
      pagination: { ... }
    }
  }
  ```
- **Business Logic**:
  - Return folder metadata
  - List immediate child folders
  - List files in this folder
  - Support pagination for files
- **Error Handling**:
  - 404 if folder not found
  - 403 if not owner

#### 3. Delete Folder

- **Route**: `DELETE /api/v1/folders/:folderId`
- **Auth**: Protected (must be folder owner)
- **Path Params**: `folderId` (string, required)
- **Query Params**:
  - `confirm` (boolean, required): Must be true to confirm deletion
- **Response**:
  ```typescript
  {
    success: true,
    message: "Folder and X files deleted"
  }
  ```
- **Business Logic**:
  - Verify ownership
  - Find all nested subfolders recursively
  - Delete all files in folder and subfolders (from storage + DB)
  - Delete all subfolder documents
  - Delete folder document
  - Update user storage usage
- **Validation**:
  - Require `confirm=true` query param
- **Error Handling**:
  - 400 if confirm not provided
  - 404 if folder not found
  - 403 if not owner

---

## Phase 3: Google Drive Sync Integration (Priority: LOW)

### Models Required

#### GoogleDriveSync Model (`src/api/sync/sync.model.ts`)

```typescript
interface IGoogleDriveSync {
  _id: ObjectId
  userId: ObjectId // ref: User
  googleAccessToken: string // encrypted
  googleRefreshToken: string // encrypted
  googleTokenExpiry: Date
  lastSyncAt?: Date
  syncStatus: 'idle' | 'in-progress' | 'failed' | 'completed'
  syncProgress: {
    totalFiles: number
    syncedFiles: number
    failedFiles: number
  }
  syncCursor?: string // Google Drive pageToken for incremental sync
  errors: Array<{
    fileId: string
    fileName: string
    error: string
    timestamp: Date
  }>
  createdAt: Date
  updatedAt: Date
}
```

### Endpoints

#### 1. Start Google OAuth Flow

- **Route**: `GET /api/v1/auth/google`
- **Auth**: Protected (user must be logged in)
- **Response**: Redirect to Google OAuth consent screen
- **Business Logic**:
  - Generate OAuth state parameter (CSRF protection)
  - Store state in session/DB
  - Redirect to Google with scopes: `drive.readonly`, `userinfo.profile`
  - Callback URL: `{BASE_URL}/api/v1/auth/google/callback`

#### 2. Google OAuth Callback

- **Route**: `GET /api/v1/auth/google/callback`
- **Auth**: Public (but validates state)
- **Query Params**:
  - `code` (string): Authorization code from Google
  - `state` (string): CSRF token to validate
- **Response**: Redirect to frontend success/error page
- **Business Logic**:
  - Validate state parameter
  - Exchange code for access/refresh tokens
  - Store encrypted tokens in GoogleDriveSync model
  - Link to current user (req.user.id)
  - Redirect to frontend with success message
- **Error Handling**:
  - Invalid state → redirect with error
  - Token exchange failure → redirect with error

#### 3. Start/Resume Sync

- **Route**: `POST /api/v1/sync/google-drive`
- **Auth**: Protected
- **Request Body**:
  ```typescript
  {
    fullSync?: boolean  // true for full resync, false for incremental
  }
  ```
- **Response**:
  ```typescript
  {
    success: true,
    message: "Sync job started",
    jobId: string
  }
  ```
- **Business Logic**:
  - Verify user has connected Google account
  - Check if sync already in progress (prevent duplicates)
  - Queue background sync job
  - Return job ID for status polling
- **Background Job Logic**:
  - Refresh access token if expired
  - Use Google Drive API to list files
  - Use `pageToken` for incremental sync (only new/updated files)
  - For each file:
    - Check if already synced (by hash/fileId)
    - Download file stream
    - Save to storage
    - Create File record
    - Generate thumbnail
  - Update sync progress continuously
  - Handle errors gracefully, log failures
- **Error Handling**:
  - 400 if Google account not connected
  - 409 if sync already in progress

#### 4. Get Sync Status

- **Route**: `GET /api/v1/sync/status`
- **Auth**: Protected
- **Response**:
  ```typescript
  {
    success: true,
    data: {
      status: 'idle' | 'in-progress' | 'failed' | 'completed',
      progress: {
        totalFiles: number,
        syncedFiles: number,
        failedFiles: number,
        percentage: number
      },
      lastSyncAt: string,
      errors: Array<{ fileName: string, error: string }>
    }
  }
  ```
- **Business Logic**:
  - Return user's GoogleDriveSync record
  - Calculate sync percentage
  - Include recent errors
- **Error Handling**:
  - 404 if no sync configuration found

---

## Storage Architecture

- **SSD (1 TB):**
  - Store frequently accessed files, thumbnails, previews, database/index files.
  - Ideal for hot cache, speeding up access for previews and uploads.
- **Primary HDD (8 TB):**
  - Main filesystem for user-uploaded originals (images, videos).
- **Backup HDD (8 TB):**
  - Dedicate for periodic snapshots/backups of primary.
  - Schedule using `rsync` or similar tool, ideally via the NAS’s built-in
    tooling.

---

## Processing & Efficiency

- All uploads/downloads via streaming APIs to ensure scalability.
- Thumbnail generation and video transcoding should be offloaded to
  worker/background jobs upon file upload or sync.
- API should support pagination and metadata filtering for efficient browsing.
- Sync endpoint must avoid redundant downloads by checking checksums/hashes and
  file metadata.
- All access control via JWT/user auth; ensure file and folder endpoints are
  protected.

---

## Additional Notes

- **No direct file sharing** endpoints at this stage.
- All file and folder actions scoped by authenticated user/owner.
- Monitor health and failures with logging and alerting.
- Handle all error and failure cases robustly; support rescue/restart of sync
  jobs.
- Ensure web APIs are documented for frontend and automated testing.

---

This file should be placed at your project root and referenced by all
contributors working on the service for coherent endpoint implementation and
structural best practices.

## Dependencies & Setup

### NPM Packages to Install

```bash
pnpm add multer @types/multer          # File upload handling
pnpm add sharp @types/sharp            # Image processing and thumbnails
pnpm add fluent-ffmpeg @types/fluent-ffmpeg  # Video thumbnails/metadata
pnpm add googleapis @types/googleapis  # Google Drive API (Phase 3)
```

### Environment Variables

Add to `.env`:

```env
# Storage Paths
STORAGE_SSD_PATH=/mnt/ssd/storage
STORAGE_PRIMARY_HDD=/mnt/hdd1/storage
STORAGE_BACKUP_HDD=/mnt/hdd2/backup

# File Upload Limits
MAX_FILE_SIZE=104857600  # 100MB in bytes
MAX_STORAGE_PER_USER=10737418240  # 10GB per user

# Google Drive Integration (Phase 3)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/v1/auth/google/callback

# Thumbnail Settings
THUMBNAIL_WIDTH=300
THUMBNAIL_HEIGHT=300
THUMBNAIL_QUALITY=80
```

### Background Jobs & Workers

Create in `src/jobs/`:

#### `generate-thumbnail.job.ts`

- Triggered after file upload
- Uses `sharp` for images, `fluent-ffmpeg` for videos
- Saves thumbnails to SSD path
- Updates File model with thumbnailPath
- Logs errors for failed generations

#### `google-drive-sync.job.ts` (Phase 3)

- Long-running background job
- Polls Google Drive API for changes
- Downloads new/updated files
- Uses pageToken for incremental sync
- Updates GoogleDriveSync progress

#### `calculate-storage-usage.job.ts`

- Periodic job to recalculate user storage quotas
- Aggregates file sizes per user
- Updates User model with current usage
- Can be triggered after file operations

### Directory Structure to Create

```
src/
  api/
    file/
      file.model.ts
      file.service.ts
      file.controller.ts
      file.router.ts
      file.middleware.ts  # validators, multer config
    folder/
      folder.model.ts
      folder.service.ts
      folder.controller.ts
      folder.router.ts
      folder.middleware.ts
    sync/
      sync.model.ts  # GoogleDriveSync
      sync.service.ts
      sync.controller.ts
      sync.router.ts
  jobs/
    generate-thumbnail.job.ts
    google-drive-sync.job.ts
    calculate-storage-usage.job.ts
  utils/
    storage.utils.ts  # file system operations
    thumbnail.utils.ts  # image/video thumbnail generation
    google-drive.utils.ts  # Google Drive API helpers (Phase 3)
```

---

## Integration with Existing Project

### Authentication

- **Existing endpoints** (`/signup`, `/login`, `/logout`, `/me`) already implemented in `src/api/authenticate/`
- No changes needed to authentication flow
- All file/folder endpoints use existing `authMiddleware` from `src/middlewares/auth.middleware.ts`

### Route Exclusions

- No exclusions needed - all file/folder routes require authentication
- Google OAuth callback is public but validates state internally

### User Model Extension

Add to `src/api/user/user.model.ts`:

```typescript
storageUsed: number  // bytes, default: 0
storageLimit: number  // bytes, default: 10737418240 (10GB)
```

---

## Implementation Strategy

### Phase 1 Order (Core File Upload)

1. **Setup**: Install dependencies, create directories, add env variables
2. **File Model**: Create `src/api/file/file.model.ts`
3. **File Service**: Implement upload, download, delete logic
4. **File Middleware**: Configure multer, validators
5. **File Controller**: Request/response handling
6. **File Router**: Define routes
7. **Thumbnail Job**: Background thumbnail generation
8. **Integration**: Update main router, test endpoints
9. **Storage Utils**: Helper functions for file system operations

### Phase 2 Order (Folder Management)

1. **Folder Model**: Create schema with path computation
2. **Folder Service**: CRUD operations, recursive delete
3. **Folder Controller**: Request handlers
4. **Folder Router**: Route definitions
5. **Integration**: Link files to folders, update file list endpoint

### Phase 3 Order (Google Drive Sync)

1. **Google Auth Setup**: OAuth flow configuration
2. **Sync Model**: GoogleDriveSync schema
3. **Google Drive Utils**: API interaction helpers
4. **Sync Service**: Incremental sync logic
5. **Sync Job**: Background worker
6. **Sync Controller**: Start/status endpoints
7. **Testing**: Manual testing with real Google account

---

## Processing & Efficiency Best Practices

- **Streaming**: All file uploads/downloads use Node.js streams (never load entire files into memory)
- **Background Jobs**: Thumbnail generation and video processing run asynchronously via job queue
- **Pagination**: All list endpoints support pagination (default 20, max 100 items)
- **Caching**: Use ETags and Cache-Control headers for file downloads
- **Duplicate Detection**: Check file hashes before storing to prevent duplicates
- **Incremental Sync**: Google Drive sync uses pageToken to only fetch new/changed files
- **Rate Limiting**: Consider adding rate limits to upload/search endpoints
- **Database Indexes**: Add indexes on userId, folderId, createdAt, mimeType for query performance

---

## Error Handling & Monitoring

### Custom Error Classes

Create in `src/errors/`:

- `StorageError` - For file system failures
- `QuotaExceededError` - When user exceeds storage limit
- `FileNotFoundError` - When file missing from storage
- `SyncError` - For Google Drive sync failures

### Logging Requirements

Use existing `@logger` for:

- File upload start/complete/failure
- Storage operations (write, delete)
- Thumbnail generation results
- Sync job progress and errors
- Quota violations
- File access (optional analytics)

### Health Checks

Add to existing health endpoint:

- Storage path accessibility (SSD, HDD1, HDD2)
- Available disk space warnings
- Google Drive API connectivity (Phase 3)

---

## Testing Checklist

### Unit Tests

- File model validations
- Service functions (upload, download, delete)
- Folder path computation
- Storage quota calculations
- Thumbnail generation

### Integration Tests

- Full upload flow (multipart → storage → DB)
- Download with range requests
- Folder creation and nested structure
- Recursive folder deletion
- File search functionality

### Manual Testing

- Upload large files (near 100MB limit)
- Video streaming in browser
- Concurrent uploads
- Storage quota enforcement
- Google OAuth flow and sync

---

## Security Considerations

1. **File Access Control**: Always verify ownership before serving files
2. **Path Traversal**: Sanitize filenames, never use user input directly in file paths
3. **MIME Type Validation**: Verify file type matches declared MIME type
4. **Storage Quota**: Enforce limits to prevent abuse
5. **Token Encryption**: Encrypt Google OAuth tokens in database
6. **Public Files**: Clearly distinguish public vs private file access
7. **Rate Limiting**: Prevent rapid upload abuse
8. **Virus Scanning**: Consider adding ClamAV integration for uploaded files (future)

---

## Performance Optimization

1. **Lazy Thumbnail Generation**: Generate on first access, not on upload
2. **CDN Integration**: Consider CloudFront/CDN for public file serving (future)
3. **Database Indexes**: 
   - `userId` + `createdAt` for user file lists
   - `userId` + `folderId` for folder contents
   - `hash` for duplicate detection
4. **Connection Pooling**: Reuse file streams and database connections
5. **Compression**: Enable gzip for API responses
6. **Batch Operations**: Support bulk uploads in future phases

---

## Future Enhancements (Out of Scope)

- File sharing with other users
- Public gallery links with expiration
- File versioning
- Trash/recycle bin (soft delete)
- Full-text search inside documents
- Video transcoding to multiple qualities
- Image optimization/compression options
- Collaborative folders
- WebSocket notifications for sync progress
- Mobile app integration

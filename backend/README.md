# TwelveLabs Video DeepResearch API Documentation


## Base URL
```
http://localhost:5000
```

## Table of Contents
- [Health Check](#health-check)
- [TwelveLabs Integration](#twelvelabs-integration)
- [Sonar Research](#sonar-research)
- [Workflow Endpoints](#workflow-endpoints)
- [Error Handling](#error-handling)

---

## Health Check

### Check API Health
**Endpoint:** `GET /health`

```bash
curl -X GET http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-08-07T23:31:56.968202",
  "message": "TwelveLabs Video DeepResearch API is running"
}
```

### Get API Information
**Endpoint:** `GET /`

```bash
curl -X GET http://localhost:5000/
```

**Expected Response:**
```json
{
  "status": "healthy",
  "message": "TwelveLabs Video DeepResearch API",
  "version": "1.0.0",
  "endpoints": {
    "indexes": "POST /api/indexes",
    "videos": "POST /api/videos",
    "video_details": "POST /api/video/<index_id>/<video_id>",
    "analyze": "POST /api/analyze/<video_id>",
    "sonar_research": "POST /api/sonar/research",
    "sonar_research_stream": "POST /api/sonar/research/stream",
    "workflow": "POST /api/workflow",
    "workflow_steps": "POST /api/workflow/steps",
    "auth": {
      "verify_token": "POST /api/auth/verify",
      "user_profile": "GET /api/auth/user",
      "logout": "POST /api/auth/logout"
    }
  }
}
```

---

## TwelveLabs Integration

### 1. Get Indexes
**Endpoint:** `POST /api/indexes`

```bash
curl -X POST http://localhost:5000/api/indexes \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "TwelveLabs_API_KEY"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "indexes": [
    {
      "id": "6893xxxxxxxxxxxxxxx",
      "name": "Sample1"
    },
    {
      "id": "6892xxxxxxxxxxxxxxx",
      "name": "Sample2"
    },
    {
      "id": "687abxxxxxxxxxxxxxxx",
      "name": "Sample3"
    }
  ]
}
```

### 2. Get Videos from Index
**Endpoint:** `POST /api/videos`

```bash
curl -X POST http://localhost:5000/api/videos \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "TwelveLabs_API_KEY",
    "index_id": "<Your Index ID>"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "videos": [
    {
      "duration": 43.189116,
      "id": "Video_ID",
      "name": "Video2Game | Video to Interactive Learning Game | TweveLabs | Sambanova.mp4"
    },
    {
      "duration": 120.000726,
      "id": "6893xxxxxxxxxxxxxxx",
      "name": "2-Minute Neuroscience: Electroencephalography (EEG).mp4"
    }
  ]
}
```

### 3. Get Video Details
**Endpoint:** `POST /api/video/<index_id>/<video_id>`

```bash
curl -X POST http://localhost:5000/api/video/<Provide_Index_ID>/Video_ID \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "TwelveLabs_API_KEY"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "video_details": {
    "_id": "Video_ID",
    "index_id": "6893xxxxxxxxxxxxxxx",
    "system_metadata": {
      "filename": "Sample.mp4",
      "duration": 43.189116,
      "width": 1920,
      "height": 1080,
      "fps": 30
    },
    "created_at": "2024-07-04T10:30:00Z",
    "updated_at": "2024-07-04T10:35:00Z"
  }
}
```

### 4. Analyze Video
**Endpoint:** `POST /api/analyze/<video_id>`

```bash
curl -X POST http://localhost:5000/api/analyze/Video_ID \
  -H "Content-Type: application/json" \
  -d '{
    "api_key": "TwelveLabs_API_KEY",
    "prompt": "Describe what happens in this video"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "analysis": "The video demonstrates the process of converting YouTube videos into interactive learning applications using the Video2Game platform. It begins with a YouTube video on the 4-7-8 breathing technique, which is then processed by Video2Game, generating an interactive app that includes features like a countdown timer and instructions for practicing the breathing technique."
}
```

---

## Sonar Research

### 1. Sonar Research (Non-streaming)
**Endpoint:** `POST /api/sonar/research`

```bash
curl -X POST http://localhost:5000/api/sonar/research \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are the latest trends in artificial intelligence?"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "research": {
    "choices": [
      {
        "message": {
          "content": "Artificial intelligence is experiencing rapid advancement across multiple domains...",
          "role": "assistant"
        },
        "finish_reason": "stop",
        "index": 0
      }
    ],
    "citations": [
      {
        "title": "AI Trends Report 2024",
        "url": "https://example.com/ai-trends-2024"
      }
    ],
    "created": 1691234567,
    "id": "research-id-123",
    "model": "sonar-deep-research",
    "usage": {
      "completion_tokens": 1500,
      "prompt_tokens": 50,
      "total_tokens": 1550
    }
  }
}
```

### 2. Sonar Research (Streaming)
**Endpoint:** `POST /api/sonar/research/stream`

```bash
curl -X POST http://localhost:5000/api/sonar/research/stream \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is machine learning?"
  }' \
  --no-buffer
```

**Expected Response (Streaming):**
```
data: {"content": "Machine learning is a subset of artificial intelligence"}

data: {"content": " that enables computers to learn and make decisions"}

data: {"content": " without being explicitly programmed for every task."}

data: {"done": true}
```

---

## Workflow Endpoints

### 1. Complete Workflow
**Endpoint:** `POST /api/workflow`

```bash
curl -X POST http://localhost:5000/api/workflow \
  -H "Content-Type: application/json" \
  -d '{
    "twelvelabs_api_key": "TwelveLabs_API_KEY",
    "index_id": "6893xxxxxxxxxxxxxxx",
    "video_id": "Video_ID",
    "analysis_prompt": "Describe what happens in this video",
    "research_query": "Based on this video analysis, research the latest trends in interactive learning"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "workflow": {
    "video_details": {
      "_id": "Video_ID",
      "system_metadata": {
        "filename": "Video2Game.mp4",
        "duration": 43.189116
      }
    },
    "analysis": "The video demonstrates the Video2Game platform...",
    "research": {
      "choices": [
        {
          "message": {
            "content": "Interactive learning and gamification trends...",
            "role": "assistant"
          }
        }
      ]
    }
  },
  "summary": {
    "video_id": "Video_ID",
    "index_id": "6893518408a37aa08793c4fe",
    "analysis_prompt": "Describe what happens in this video",
    "research_query": "Based on this video analysis, research the latest trends in interactive learning"
  }
}
```


### Error Codes by Endpoint

| Endpoint | Error Code | Possible Causes |
|----------|------------|-----------------|
| `/api/indexes` | 400 | Missing API key |
| `/api/indexes` | 401 | Invalid TwelveLabs API key |
| `/api/videos` | 400 | Missing API key or index_id |
| `/api/analyze/*` | 400 | Missing prompt or API key |
| `/api/auth/*` | 401 | Invalid Firebase token |
| `/api/sonar/*` | 400 | Missing query parameter |

---


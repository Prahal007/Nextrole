# PDFZen AI Resume Optimizer

Full-stack project: **Spring Boot** backend, **Next.js** frontend, **PostgreSQL**, and **Docker Compose**.

## Structure

```
pdfzen-ai/
├── backend/                 # Spring Boot 3.2 API
│   ├── src/main/java/ai/pdfzen/
│   │   ├── PdfzenApplication.java
│   │   ├── entity/           # User, Resume, OptimizationJob
│   │   ├── repository/
│   │   ├── service/          # PDF extraction, storage, AI optimization
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── security/
│   │   ├── exception/
│   │   └── config/
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── application-dev.yml
│   ├── pom.xml
│   └── Dockerfile
├── frontend/                 # Next.js 14 (App Router)
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── dashboard/
│   ├── lib/api.ts
│   ├── package.json
│   ├── next.config.js
│   └── Dockerfile
├── database/
│   ├── schema/01_init.sql    # Standalone schema
│   └── init/01_schema.sql    # Docker Postgres init
├── docker-compose.yml
└── README.md
```

## Quick start with Docker

```bash
docker compose up --build
```

- **Frontend:** http://localhost:3000  
- **Backend API:** http://localhost:8080/api  
- **Swagger UI:** http://localhost:8080/api/swagger-ui.html  
- **PostgreSQL:** localhost:5432 (user `pdfzen`, password `pdfzen`, db `pdfzen`)

Demo login: **user@pdfzen.ai** / **password** (Basic auth for API; demo user is created on first run).

## Local development (without Docker)

### Backend

- Java 21, Maven
- Start PostgreSQL (e.g. `docker run -d -p 5432:5432 -e POSTGRES_DB=pdfzen -e POSTGRES_USER=pdfzen -e POSTGRES_PASSWORD=pdfzen postgres:16-alpine`)
- Create DB and apply schema from `database/schema/01_init.sql` if not using `spring.jpa.hibernate.ddl-auto: update`
- Run: `cd backend && mvn spring-boot:run -Dspring-boot.run.profiles=dev`

### Frontend

- Node 20+
- `cd frontend && npm install && npm run dev`
- Set `API_URL=http://localhost:8080` if the API is not proxied (e.g. in `next.config.js` rewrites).

## Environment

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL JDBC URL | `jdbc:postgresql://localhost:5432/pdfzen` |
| `DATABASE_USERNAME` | DB user | `pdfzen` |
| `DATABASE_PASSWORD` | DB password | `pdfzen` |
| `APP_UPLOAD_DIR` | Directory for uploaded PDFs | `./uploads` |
| `AI_API_KEY` | OpenAI/API key for AI optimization | (optional) |
| `API_URL` | Backend URL (Next.js rewrite target) | `http://localhost:8080` |

## API overview

- `POST /api/resumes/upload` — upload PDF (multipart; Basic auth)
- `GET /api/resumes` — list resumes
- `GET /api/resumes/{id}` — get resume
- `POST /api/resumes/{id}/optimize` — run optimization (body: `jobType`, optional `targetRole`, `targetIndustry`)
- `GET /api/resumes/{id}/jobs` — list optimization jobs
- `GET /api/health` — health check

## Database schema

- **users** — id (UUID), email, display_name, created_at, updated_at  
- **resumes** — id, user_id, original_filename, stored_path, file_size_bytes, status, created_at  
- **optimization_jobs** — id, resume_id, job_type, status, extracted_text, optimized_text, suggestions (JSONB), error_message, created_at, completed_at  

See `database/schema/01_init.sql` and `database/init/01_schema.sql`.

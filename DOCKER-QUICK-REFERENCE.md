# Docker Quick Reference

Quick commands for running Audiogram with AssemblyAI transcription in Docker.

## Prerequisites

1. Docker installed
2. AssemblyAI API key from https://www.assemblyai.com/

## Quick Commands

### Build Image

```bash
docker build -t audiogram .
```

### Run with API Key (Option 1: Direct)

```bash
docker run -d \
  --name audiogram \
  -p 8888:8888 \
  -e ASSEMBLYAI_API_KEY=your_actual_api_key_here \
  audiogram
```

### Run with API Key (Option 2: .env File)

```bash
# Create .env file
cat > .env << 'EOF'
ASSEMBLYAI_API_KEY=your_actual_api_key_here
PORT=8888
EOF

# Run with env file
docker run -d \
  --name audiogram \
  -p 8888:8888 \
  --env-file .env \
  audiogram
```

### Run with Docker Compose

```bash
# Ensure .env exists with your API key
docker-compose up -d
```

## Common Commands

### View Logs

```bash
# All logs
docker logs audiogram

# Follow logs
docker logs -f audiogram

# Last 100 lines
docker logs --tail 100 audiogram
```

### Stop Container

```bash
docker stop audiogram
```

### Start Container

```bash
docker start audiogram
```

### Restart Container

```bash
docker restart audiogram
```

### Remove Container

```bash
docker stop audiogram
docker rm audiogram
```

### Shell Access

```bash
docker exec -it audiogram /bin/bash
```

### Check Environment Variables

```bash
# Verify API key is set (don't show value)
docker exec audiogram env | grep ASSEMBLYAI_API_KEY | sed 's/=.*/=***/'
```

## Docker Compose Commands

### Start

```bash
docker-compose up -d
```

### Stop

```bash
docker-compose down
```

### Restart

```bash
docker-compose restart
```

### View Logs

```bash
docker-compose logs -f
```

### Rebuild

```bash
docker-compose up -d --build
```

## Update API Key

### For docker run

```bash
# Stop and remove old container
docker stop audiogram
docker rm audiogram

# Run with new API key
docker run -d \
  --name audiogram \
  -p 8888:8888 \
  -e ASSEMBLYAI_API_KEY=new_api_key_here \
  audiogram
```

### For docker-compose

```bash
# Update .env file
nano .env  # Change ASSEMBLYAI_API_KEY value

# Restart
docker-compose restart
```

## Production Deployment

### With Restart Policy

```bash
docker run -d \
  --name audiogram \
  --restart unless-stopped \
  -p 8888:8888 \
  -e ASSEMBLYAI_API_KEY=your_key \
  audiogram
```

### With Resource Limits

```bash
docker run -d \
  --name audiogram \
  --restart unless-stopped \
  --memory=2g \
  --cpus=1.0 \
  -p 8888:8888 \
  -e ASSEMBLYAI_API_KEY=your_key \
  audiogram
```

### With Volume for Data Persistence

```bash
docker run -d \
  --name audiogram \
  --restart unless-stopped \
  -p 8888:8888 \
  -v audiogram-data:/home/audiogram/audiogram/.jobs \
  -e ASSEMBLYAI_API_KEY=your_key \
  audiogram
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker logs audiogram

# Check if port is in use
lsof -i :8888

# Run in foreground to see errors
docker run -p 8888:8888 -e ASSEMBLYAI_API_KEY=your_key audiogram
```

### Transcription Not Working

```bash
# Verify API key is set
docker exec audiogram env | grep ASSEMBLYAI_API_KEY

# Check logs for errors
docker logs audiogram | grep -i assemblyai

# Test network connectivity
docker exec audiogram curl -I https://api.assemblyai.com
```

### Container Using Too Much Space

```bash
# Clean up stopped containers
docker container prune

# Clean up unused images
docker image prune

# Clean up volumes
docker volume prune
```

## Multi-Container Setup

If running with Redis:

```bash
# docker-compose.yml
version: '3.8'
services:
  redis:
    image: redis:latest
    ports:
      - "6379:6379"
  
  audiogram:
    build: .
    ports:
      - "8888:8888"
    environment:
      - ASSEMBLYAI_API_KEY=${ASSEMBLYAI_API_KEY}
      - REDIS_HOST=redis
    depends_on:
      - redis
```

## Health Checks

### Check if Running

```bash
curl http://localhost:8888/
```

### Check Container Health

```bash
docker inspect audiogram | grep -A 10 "Health"
```

### Monitor Resources

```bash
docker stats audiogram
```

## Backup and Restore

### Backup Container Data

```bash
docker run --rm \
  -v audiogram-data:/data \
  -v $(pwd):/backup \
  busybox tar czf /backup/audiogram-backup.tar.gz /data
```

### Restore Container Data

```bash
docker run --rm \
  -v audiogram-data:/data \
  -v $(pwd):/backup \
  busybox tar xzf /backup/audiogram-backup.tar.gz -C /
```

## Security Best Practices

### Don't Expose Sensitive Info

```bash
# BAD - API key visible in process list
docker run -e ASSEMBLYAI_API_KEY=abc123 audiogram

# GOOD - Use env file
docker run --env-file .env audiogram
```

### Use Secrets in Swarm

```bash
# Create secret
echo "your_api_key" | docker secret create assemblyai_key -

# Use in service
docker service create \
  --name audiogram \
  --secret assemblyai_key \
  -p 8888:8888 \
  audiogram
```

### Scan for Vulnerabilities

```bash
docker scan audiogram
```

## Network Configuration

### Custom Network

```bash
# Create network
docker network create audiogram-net

# Run on custom network
docker run -d \
  --name audiogram \
  --network audiogram-net \
  -p 8888:8888 \
  -e ASSEMBLYAI_API_KEY=your_key \
  audiogram
```

### Behind Reverse Proxy

```bash
# nginx config
server {
    listen 80;
    server_name audiogram.example.com;
    
    location / {
        proxy_pass http://localhost:8888;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Cleanup

### Remove Everything

```bash
# Stop container
docker stop audiogram

# Remove container
docker rm audiogram

# Remove image
docker rmi audiogram

# Remove volumes
docker volume rm audiogram-data

# Clean up all
docker system prune -a --volumes
```

## CI/CD Integration

### GitHub Actions

```yaml
- name: Build Docker image
  run: docker build -t audiogram .

- name: Test container
  run: |
    docker run -d -p 8888:8888 \
      -e ASSEMBLYAI_API_KEY=${{ secrets.ASSEMBLYAI_API_KEY }} \
      audiogram
    sleep 10
    curl http://localhost:8888
```

### Push to Registry

```bash
# Tag for registry
docker tag audiogram your-registry.com/audiogram:latest

# Push
docker push your-registry.com/audiogram:latest
```

## Summary

Most common commands:

```bash
# Build
docker build -t audiogram .

# Run (with API key)
docker run -d --name audiogram -p 8888:8888 \
  -e ASSEMBLYAI_API_KEY=your_key audiogram

# Check logs
docker logs -f audiogram

# Stop
docker stop audiogram

# Start
docker start audiogram

# Remove
docker stop audiogram && docker rm audiogram
```

**Access at:** http://localhost:8888

**Full Documentation:** See `DOCKER-API-KEY-GUIDE.md`


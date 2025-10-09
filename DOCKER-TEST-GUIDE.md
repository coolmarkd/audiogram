# Docker Test Build Guide

This guide explains how to build and run Docker containers for testing local changes to the Audiogram codebase.

## Files Overview

- `Dockerfile.test` - Test Dockerfile that uses all local files instead of cloning from GitHub
- `build-test-docker.sh` - Script to build the test Docker image
- `docker-compose.test.yml` - Docker Compose configuration for test builds
- `DOCKER-TEST-GUIDE.md` - This documentation file

## Quick Start

### Method 1: Using the Build Script

1. Make sure you have your AssemblyAI API key ready
2. Run the build script:
   ```bash
   ./build-test-docker.sh
   ```
3. Run the container:
   ```bash
   docker run -p 8888:8888 -e ASSEMBLYAI_API_KEY=your-api-key-here audiogram-test:timestamp
   ```

### Method 2: Using Docker Compose

1. Set your API key in the environment:
   ```bash
   export ASSEMBLYAI_API_KEY=your-api-key-here
   ```
2. Build and run with Docker Compose:
   ```bash
   docker-compose -f docker-compose.test.yml up --build
   ```

### Method 3: Manual Docker Build

1. Build the image manually:
   ```bash
   docker build -f Dockerfile.test -t audiogram-test .
   ```
2. Run the container:
   ```bash
   docker run -p 8888:8888 -e ASSEMBLYAI_API_KEY=your-api-key-here audiogram-test
   ```

## Key Differences from Production Dockerfile

The test Dockerfile (`Dockerfile.test`) differs from the main `Dockerfile` in these ways:

1. **Local File Copy**: Uses `COPY . /home/audiogram/audiogram/` instead of cloning from GitHub
2. **Git Handling**: Gracefully handles cases where `.git` directory might not be present
3. **Development Focus**: Optimized for testing local changes and development

## Environment Variables

- `ASSEMBLYAI_API_KEY` - Required for transcription functionality
- `PORT` - Port number (default: 8888)
- `GIT_COMMIT_HASH` - Automatically detected from local git repository

## Accessing the Application

Once the container is running, access the application at:
- http://localhost:8888

## Development Workflow

1. Make changes to your local code
2. Build the test Docker image using one of the methods above
3. Test your changes in the containerized environment
4. Iterate as needed

## Troubleshooting

### Build Issues
- Ensure all dependencies are properly installed locally
- Check that the Docker daemon is running
- Verify you have sufficient disk space for the build

### Runtime Issues
- Make sure the AssemblyAI API key is correctly set
- Check that port 8888 is not already in use
- Review container logs: `docker logs <container-id>`

### Git Issues
- The test build will work even without a `.git` directory
- If git is not available, the commit hash will be set to "no-git"

## Cleanup

To clean up test images and containers:

```bash
# Remove test containers
docker ps -a | grep audiogram-test | awk '{print $1}' | xargs docker rm

# Remove test images
docker images | grep audiogram-test | awk '{print $3}' | xargs docker rmi
```

## Integration with CI/CD

The test Dockerfile can be used in CI/CD pipelines to test local changes before merging to the main branch. Simply use `Dockerfile.test` instead of `Dockerfile` in your build process.

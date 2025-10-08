FROM node:18.19.0-slim

# Install system dependencies for canvas compilation
RUN apt-get update --yes && apt-get upgrade --yes
RUN apt-get install -y \
    git \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    libpng-dev \
    build-essential \
    g++ \
    python3 \
    make \
    pkg-config \
    ffmpeg \
    redis-server \
    && rm -rf /var/lib/apt/lists/*

# Set Python3 as default python for node-gyp
RUN ln -sf /usr/bin/python3 /usr/bin/python

# Clone the repository from GitHub (as root)
ARG CACHEBUST=1 # Force rebuild
#RUN echo "Always Git!" &&  date && git clone https://github.com/coolmarkd/audiogram /tmp/audiogram
RUN echo "Always Git!" &&  date && git clone -b feature/autocaption https://github.com/coolmarkd/audiogram /tmp/audiogram

# Get git commit hash from the cloned repository
RUN cd /tmp/audiogram && git rev-parse HEAD > /tmp/git_commit_hash.txt

# Create user and set up working directory
RUN useradd -m audiogram
RUN mkdir -p /home/audiogram/audiogram
RUN chown -R audiogram:audiogram /home/audiogram

# Copy files to working directory (as root)
RUN cp -r /tmp/audiogram/* /home/audiogram/audiogram/

# Set proper ownership of copied files (as root)
RUN chown -R audiogram:audiogram /home/audiogram/audiogram

# Clean up temporary directory (as root)
RUN rm -rf /tmp/audiogram

# Switch to non-privileged user
USER audiogram
WORKDIR /home/audiogram/audiogram

# Set git commit hash as build argument
ARG GIT_COMMIT_HASH
RUN if [ -z "$GIT_COMMIT_HASH" ]; then \
      GIT_COMMIT_HASH=$(cat /tmp/git_commit_hash.txt); \
    fi && \
    echo "Git commit hash: $GIT_COMMIT_HASH" && \
    echo "GIT_COMMIT_HASH=$GIT_COMMIT_HASH" > /home/audiogram/audiogram/.env.git


# Set environment variables for canvas compilation
ENV PYTHON=/usr/bin/python3
ENV npm_config_python=/usr/bin/python3
ENV npm_config_canvas_binary_host_mirror=https://registry.npmjs.org/@mapbox/node-pre-gyp-github-releases/download/

# Install canvas separately first (with specific version)
RUN npm install canvas@3.2.0 --audit-level=moderate --fund=false

# Install remaining dependencies with audit suppression
RUN npm install --audit-level=moderate --fund=false

# Set the PORT environment variable
ENV PORT=8888

# Set git commit hash as environment variable
ENV GIT_COMMIT_HASH=${GIT_COMMIT_HASH}

# API key will be provided at runtime via -e flag
# DO NOT set ASSEMBLYAI_API_KEY here - pass it at runtime!

# Expose the port the app runs on
EXPOSE 8888

# Start the application
CMD ["npm", "start"]

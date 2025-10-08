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

# Non-privileged user
RUN useradd -m audiogram
USER audiogram
WORKDIR /home/audiogram/audiogram

# Clone the repository from GitHub
ARG CACHEBUST=1 # Force rebuild
#RUN echo "Always Git!" &&  date && git clone https://github.com/coolmarkd/audiogram /tmp/audiogram
RUN echo "Always Git!" &&  date && git clone -b feature/autocaption https://github.com/coolmarkd/audiogram /tmp/audiogram

RUN cp -r /tmp/audiogram/* ./
RUN rm -rf /tmp/audiogram


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

# API key will be provided at runtime via -e flag
# DO NOT set ASSEMBLYAI_API_KEY here - pass it at runtime!

# Expose the port the app runs on
EXPOSE 8888

# Start the application
CMD ["npm", "start"]

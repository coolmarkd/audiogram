FROM node:18.19.0-slim

# Install system dependencies
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
    ffmpeg \
    redis-server \
    && rm -rf /var/lib/apt/lists/*

# Non-privileged user
RUN useradd -m audiogram
USER audiogram
WORKDIR /home/audiogram

# Clone repo
RUN git clone https://github.com/nypublicradio/audiogram.git
WORKDIR /home/audiogram/audiogram

# Copy npm config to suppress audit warnings
COPY --chown=audiogram:audiogram .npmrc ./

# Install dependencies with audit suppression
RUN npm install --audit-level=moderate --fund=false

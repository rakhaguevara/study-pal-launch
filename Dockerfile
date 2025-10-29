# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Accept build arguments
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY
ARG VITE_OPENAI_API_KEY

# Set environment variables for build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY
ENV VITE_OPENAI_API_KEY=$VITE_OPENAI_API_KEY

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies needed for build and preview)
RUN npm ci

# Copy source code
COPY . .

# Debug: Print environment variables to verify they're set
RUN echo "Building with environment variables:" && \
    echo "VITE_SUPABASE_URL=$VITE_SUPABASE_URL" && \
    echo "VITE_SUPABASE_ANON_KEY=${VITE_SUPABASE_ANON_KEY:0:20}..." && \
    echo "VITE_OPENAI_API_KEY=${VITE_OPENAI_API_KEY:0:20}..."

# Build the application
RUN npm run build

# Note: We keep dev dependencies because vite preview requires them
# For a more production-ready setup, consider using nginx to serve the dist folder

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "preview"]


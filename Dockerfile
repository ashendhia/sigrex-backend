# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=21.6.1
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Node.js/Prisma"

# Node.js/Prisma app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV="production"


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update && apt-get install -y openssl && apt-get install -y ca-certificates

# Install node modules
COPY --link package-lock.json package.json ./
RUN npm ci

# Generate Prisma Client
COPY --link prisma .
RUN DATABASE_URL='mysql://dz7pje7aw9cbwfklzn5h:pscale_pw_12a68yRUg6x6n6dDUSPb0aTtGrTvB2HKAxu7Ee5p7zK@aws.connect.psdb.cloud/sigrexdb?sslaccept=strict' npx prisma db push 

# Copy application code
COPY --link . .


# Final stage for app image
FROM base

# Install packages needed for deployment
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y openssl && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Copy built application
COPY --from=build /app /app

# Start the server by default, this can be overwritten at runtime
EXPOSE 5000
CMD [ "npm", "run", "start" ]

# Use Node.js version 16 as the base image
FROM node:16

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies & clean cache
RUN npm install \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*


# Copy the rest of the files to the container
COPY . .

# Expose port
EXPOSE 3333

# Specify the command to run when the container starts
CMD ["npm", "run", "start"]
FROM python:3.11-alpine

# Copy the socat server into the Docker image
COPY src src/

# Install socat
RUN apk update && apk add socat

# Expose the socat port
EXPOSE 54321

# Run the socat server
ENTRYPOINT ["python", "src/socat_server.py"]

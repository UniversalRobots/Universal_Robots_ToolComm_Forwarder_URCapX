import subprocess
import json
import logging
import os
import sys

import flask
from flask import Flask, request
from waitress import serve

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

# Socat commands
PORT=54321
SOCAT_COMMAND = ["socat", f"tcp-l:{PORT},reuseaddr,fork", "file:/dev/ur-ttylink/ttyTool,nonblock,raw,waitlock=/tmp/lock_tty"]
STOP_SOCAT_COOMAND = "killall -9 socat 2> /dev/null"
IS_SOCAT_SERVER_RUNNING_COMMAND = f"socat /dev/null TCP:127.0.0.1:{PORT}"
STATUS_FILENAME = "/data/socat_server_status.json"

app = Flask(__name__)

def create_response(data: dict):
    """
    Creates a Flask response object with JSON data.

    Args:
        data (dict): The JSON data to include in the response body.

    Returns:
        flask.Response: A Flask response object with the specified JSON data.
    """
    resp = flask.make_response()
    resp.headers["Content-Type"] = "application/json"
    resp.data = json.dumps(data)
    return resp

@app.route("/socat_server", methods=["POST"])
def socat_server():
    """Starts or stops the socat server, depending on the action received
        
    Returns:
        flask.Response: A Flask response with a success key, telling whether the command was successful or not.
    """
    action = request.get_json()["action"]
    response = None
    if action == "start":
        result = subprocess.Popen(SOCAT_COMMAND, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        try:
            # wait 0.2 seconds for errors 
            _, stderr = result.communicate(timeout=0.2)
            if result.returncode != 0:
                logger.error(f"Failed to start socat server. Error message {stderr}")

                response = create_response({"success": False})
        except subprocess.TimeoutExpired: # If timeout expired the server is running
            logger.info("Started socat server")
            response = create_response({"success": True})

    elif action == "stop":
        result = subprocess.run(STOP_SOCAT_COOMAND, capture_output=True, shell=True)
        if result.returncode == 0:
            logger.info("Stopped socat server")
            response = create_response({"success": True})
        else:
            logger.error(f"Failed to stop socat server. Error message {result.stderr}")
            response = create_response({"success": False})

    else:
        logger.error(f"Unknown action received! Action received {action}")
        response = create_response({"success": False})

    with open(STATUS_FILENAME, "wb") as status_file:
        running_response = is_server_running()
        status_file.write(running_response.data)
    return response


@app.route("/is_server_running", methods=["GET"])
def is_server_running(): # handle a message
    """Checks whether the socat server is running

    Returns:
        flask.Response: A Flask response with a running key, telling whether the server is running or not.
    """
    result = subprocess.run(IS_SOCAT_SERVER_RUNNING_COMMAND, capture_output=True, shell=True)
    if result.returncode == 0:
        return create_response({"running": True})
    else:
        return create_response({"running": False})

def recover_from_state(running: bool):
    """Recovers the socat server to the given state

    Args:
        running (bool): Whether the server should be running or not
    """
    if running:
        result = subprocess.Popen(SOCAT_COMMAND, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        try:
            # wait 0.2 seconds for errors 
            _, stderr = result.communicate(timeout=0.2)
            if result.returncode != 0:
                logger.error(f"Failed to recover socat server. Error message {stderr}")
        except subprocess.TimeoutExpired: # If timeout expired the server is running
            logger.info("Recovered socat server to running state")
    else:
        result = subprocess.run(STOP_SOCAT_COOMAND, capture_output=True, shell=True)
        if result.returncode == 0:
            logger.info("Recovered socat server to stopped state")
        else:
            logger.error(f"Failed to stop socat server during recovery. Error message {result.stderr}")

if __name__ == '__main__':
    if os.path.exists(STATUS_FILENAME):
        logger.info("Loading socat state from file")
        with open(STATUS_FILENAME, "rb") as status_file:
            bytes_data = status_file.read()
            try:
                data = json.loads(bytes_data.decode("utf-8"))
                recover_from_state(data["running"])
            except Exception as e:
                logger.error(f"Failed to load socat server state from file. Error: {e}")
    serve(app, host='0.0.0.0', port=52762)

import subprocess

SOCAT_COMMAND = "socat tcp-l:54321,reuseaddr,fork file:/dev/ttyTool,nonblock,raw,waitlock=/var/run/tty"

def start_server():
    subprocess.call(SOCAT_COMMAND, shell=True) 
	
if __name__ == '__main__':
    start_server()
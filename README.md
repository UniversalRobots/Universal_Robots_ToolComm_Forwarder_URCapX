# Tool Communication forwarding URCapX

This URCapX allows forwarding the serial communication device from the robot's tool flange to a TCP
port. This way, external PCs can communicate with tools connected to the robot's tool flange as if
the device was connected directly to the remote PC.

For this to work, the external PC will have to run `socat` to map the TCP port to a local serial
device.

For example, a robot with IP address `192.168.56.101` could be accessed with the following `socat`
command:
```
socat pty,link=/tmp/ttyUR,raw,ignoreeof,waitslave tcp:192.168.56.101:54321
```

## Build and Deploy Sample

To build and deploy this sample, use the commands below. A rebuild of the project is required to see any changes made 
to the source code. If you are deploying the URCap to URSim, ensure that you have started the simulator.

### Dependencies

Run this command to install the dependencies of the project.

```shell
npm install
```

### Build

Run this command to build the contribution type.

```shell
npm run build
```

### Installation

Run this command to install the built URCap to the simulator.

```shell
npm run install-urcap
```

Run this command to install the built URCap to the robot.

```shell
npm run install-urcap -- --host <robot_ip_address>
````

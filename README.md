# InterMachine Communication

The idea here to allow differentiated horizontal scaled-deployed machines to be able to communicate with the control tower (admin machine) which would be reacting as a controller.

To help you get started, your machine should support Nodejs along side with `npm` to install all the dependencies reqired to spin up the process.

At the moment, we're started the REST API server on port `81`. Therefore, it needs to be considered that there is no other process running on the machined port.

## Setup Guide

The following guide is prepared considering the `Linux AMI Instance` under account. There would be a bit difference between each OS i.e `Ubuntu supports apt and not yum` for package management. So, you have to cater it accordingly.

### Update the System.

Nevertheless, its always healthy to update your system first. Please run:

```
yum update
```

If you're over ubuntu or debian, please run:
```
apt-get update
```

### Install Node.js

Once you'r done with previous step, its now time to install `Node.js`. Please remember that `nvm` is not supported on Windows https://nodejs.org/dist/v5.3.0/node-v5.3.0-linux-x64.tar.gzws so we have catered the help directly by compiling the node.js subsequently.

```
cd /tmp
curl -sL https://rpm.nodesource.com/setup_5.x | sudo -E bash
yum install -y nodejs
yum install -y gcc-c++ make
```

As if all steps gone fine above, try these commands to verify:

```
$ node -v
 v5.3.0
$ npm -v
 3.3.12
```

### Setup Code

Now, as if its ready, we have to deploy the code the run the `API Service.`
```
mkdir -p /code
```

Once you created the directory,its time to clone the code. I have the code on the given repo (you may have it differ at the time of read).

```
git clone https://github.com/ArkeologeN/intermachine-communication.git
```

Note: If the above command fails, it may be due to missing `git`. Please install `yum install git -y`

Once, it cloned, please change to the working directory and install dependency.
```
cd intermachine-communication
npm install
```

If it all went well, you're ready to spin up the server. Simply run:

```
node server.js
```
### Initiate Request

Your script needs to reside in `bin/` directory. It could be bat or bash script extended with `.sh` or `.bat`. The `Node.js` recognize the host platform / os and then either run `.sh` or `.bat` file respectively.

Here is the sample request how it should looks like:
```
GET http://172.17.0.1:81/command/say_hello
{
  "ok": true,
  "jobId": "b2259c2d-073a-4b3f-95a1-b20cfaea0391",
  "task": "say_hello",
  "host": "3bc662375d8e",
  "time": 1450546645820,
  "q": true
}
```

Please note that `say_hello` is a name of the script resides in `bin/` directory of the operand VM.

- OK : Check if it went well.
- JOBID : The unique ID of the task.
- TASK : The name of the bash script.
- HOST : Unique identifier of the instance.
- TIME : The time when it was executed.
- Q : Your job is `queued` well.

You will aparently also find the same response in the `app.log` file of the server.

# TUTORIAL: How to Run the æternity GPU Miner on Ubuntu 18.04

## Assumptions
 The instructions below assume that you [installed and configured your node](run-node-on-ubuntu-1804.md), have an NVIDIA GPU that is [compatible](https://developer.nvidia.com/cuda-gpus) and has more than 4GB of memory, ideally 8GB.

## 1. Installing the CUDA toolkit
```bash
cd ~
wget https://developer.nvidia.com/compute/cuda/10.0/Prod/local_installers/cuda-repo-ubuntu1804-10-0-local-10.0.130-410.48_1.0-1_amd64
sudo dpkg -i cuda-repo-ubuntu1804-10-0-local-10.0.130-410.48_1.0-1_amd64
sudo apt-key add /var/cuda-repo-10-0-local-10.0.130-410.48/7fa2af80.pub
sudo apt-get update
sudo apt-get install cuda
```

## 2. Installing the miner


The next step is to build the cuckoo CUDA miner. If the node has been installed (built) from source, the same source tree can be used. Otherwise if the binary package has been used for installation, **the same version** of the source code must be downloaded.

```bash
cd ~
git clone https://github.com/aeternity/epoch.git epoch && cd epoch
git checkout tags/v1.0.1
```

Add the CUDA compiler to the `PATH` environment variable:

```bash
export PATH=/usr/local/cuda-10.0/bin${PATH:+:${PATH}}
```

Compile the Cuckoo CUDA miner:

```bash
cd apps/aecuckoo && make cuda29
```

Copy the miner binary to your node (assuming the node is installed in `~/node`):

```bash
cp priv/bin/cuda29 ~/node/lib/aecuckoo-0.1.0/priv/bin
```

## 3. Configuring your node

The `mining` section of `~/node/epoch.yaml` should contain the following fragment in order to use the newly added miner:

```yaml
mining:
    cuckoo:
        miner:
            executable: cuda29
            extra_args: ""
            edge_bits: 29
            hex_encoded_header: true

```

Keep in mind that if your GPU has less than 8GB of memory, `-E 1` needs to be added to the `extra_args` field, if it has less than 6 - `-E 2`.

The node can now be started as usual with `./bin/epoch start`. If the miner is successfully running, the `log/epoch_mining.log` file shouldn't contain any `[error]` logs. The GPU status can be checked with `nvidia-smi`.

In case you experience any issues, please post your question in the [æternity Forum](https://forum.aeternity.com/c/mining). 